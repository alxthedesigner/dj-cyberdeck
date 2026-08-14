#!/usr/bin/env python3
"""
Generate Mixxx-compatible .stem.mp4 files from regular audio tracks.

Pipeline: Demucs (source separation) -> stempeg.NIStemsWriter (mux to .stem.mp4)

Accepts a single file, multiple files, or one or more folders (recursed into).

By default, output is written to a "Stems" folder created in the current
working directory (wherever you run this script from), e.g. running it from
/Volumes/Mysterion writes to /Volumes/Mysterion/Stems/song.stem.mp4. The
folder is created if it doesn't exist. Use -o to override this location.

Usage:
    cd /Volumes/Mysterion && python3 /path/to/generate_stem.py Music/song.mp3
    python3 generate_stem.py song1.mp3 song2.flac song3.wav
    python3 generate_stem.py /Volumes/Mysterion/Music
    python3 generate_stem.py /Volumes/Mysterion/Music -o /some/other/output --model htdemucs_ft
"""
import argparse
import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import stempeg
from mutagen import File as MutagenFile
from mutagen.mp4 import MP4, MP4Cover
from tqdm import tqdm

# Demucs prints per-model progress to stderr as it separates each stem,
# e.g. "...| 45/123 36%..." -- this pulls out the trailing percentage.
PROGRESS_PCT_RE = re.compile(r"(\d{1,3})%")

# Demucs' 4-stem models always output in this order.
STEM_ORDER = ["drums", "bass", "other", "vocals"]

STEM_COLORS = {
    "drums": "#009E73",
    "bass": "#D55E00",
    "other": "#CC79A7",
    "vocals": "#0072B2",
}

AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".aiff", ".aif", ".m4a", ".ogg", ".wma", ".opus"}


def check_dependencies():
    missing = []
    if shutil.which("ffmpeg") is None:
        missing.append("ffmpeg (brew install ffmpeg)")
    if shutil.which("MP4Box") is None:
        missing.append("MP4Box (brew install gpac)")
    try:
        import demucs  # noqa: F401
    except ImportError:
        missing.append("demucs (pip install demucs)")
    if missing:
        print("Missing dependencies:", file=sys.stderr)
        for m in missing:
            print(f"  - {m}", file=sys.stderr)
        sys.exit(1)


def file_hash(path: Path) -> str:
    """SHA-256 of file contents, used to detect duplicate tracks copied to multiple paths."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def collect_input_files(inputs: list[Path]) -> list[Path]:
    """Expand a mix of file and folder args into a flat, deduplicated file list.

    Dedupes both by resolved path (symlinks to the same target) and by content
    hash (independent copies of the same audio, e.g. the same track saved under
    multiple playlist folders), so each unique track is only processed once.
    """
    files = []
    seen_paths = set()
    seen_hashes = set()
    for item in inputs:
        if not item.exists():
            print(f"Warning: path not found, skipping: {item}", file=sys.stderr)
            continue
        if item.is_dir():
            candidates = sorted(p for p in item.rglob("*") if p.is_file())
        else:
            candidates = [item]
        for candidate in candidates:
            if candidate.name.startswith("._") or candidate.name == ".DS_Store":
                continue
            if candidate.suffix.lower() not in AUDIO_EXTENSIONS:
                continue
            resolved = candidate.resolve()
            if resolved in seen_paths:
                continue
            seen_paths.add(resolved)

            digest = file_hash(resolved)
            if digest in seen_hashes:
                continue
            seen_hashes.add(digest)

            files.append(candidate)
    return files


# mutagen exposes tags under different keys depending on format (ID3 vs.
# Vorbis/FLAC vs. MP4), so each container needs its own lookup per field.
def _read_source_metadata(path: Path):
    """Best-effort tag dict from embedded tags: artist, title, album,
    albumartist, genre, year, tracknumber (all str or None), plus raw
    cover art bytes/mime under "art" (or None). Never raises."""
    result = {
        "artist": None, "title": None, "album": None, "albumartist": None,
        "genre": None, "year": None, "tracknumber": None, "art": None,
    }
    try:
        easy = MutagenFile(path, easy=True)
    except Exception:
        easy = None
    if easy is not None and easy.tags is not None:
        def first(*keys):
            for key in keys:
                values = easy.tags.get(key)
                if values:
                    return str(values[0]).strip() or None
            return None

        result["artist"] = first("artist")
        result["title"] = first("title")
        result["album"] = first("album")
        result["albumartist"] = first("albumartist")
        result["genre"] = first("genre")
        date = first("date")
        result["year"] = (date or "")[:4] or None
        result["tracknumber"] = first("tracknumber")

    # Cover art isn't exposed via easy=True; re-open in raw mode to fetch it.
    try:
        raw = MutagenFile(path)
    except Exception:
        raw = None
    if raw is not None and raw.tags is not None:
        try:
            if hasattr(raw.tags, "getall"):  # ID3 (MP3)
                pics = raw.tags.getall("APIC")
                if pics:
                    result["art"] = (pics[0].data, pics[0].mime or "image/jpeg")
            elif "covr" in raw.tags:  # MP4/M4A
                covers = raw.tags["covr"]
                if covers:
                    fmt = covers[0].imageformat
                    mime = "image/png" if fmt == MP4Cover.FORMAT_PNG else "image/jpeg"
                    result["art"] = (bytes(covers[0]), mime)
        except Exception:
            pass  # cover art is a nice-to-have, never fatal
    return result


_UNSAFE_FILENAME_CHARS = re.compile(r'[\\/:*?"<>|]')


def build_output_stem(input_path: Path, metadata: dict) -> str:
    """Filename (without extension) for the .stem.mp4, preferring tagged
    "Artist - Title" over the source filename, since downloaded albums are
    often named by track number (e.g. "03.flac") even when their tags are
    correct."""
    artist, title = metadata.get("artist"), metadata.get("title")
    if artist and title:
        name = f"{artist} - {title}"
        name = _UNSAFE_FILENAME_CHARS.sub("_", name)
        return name
    return input_path.stem


def write_output_metadata(output_path: Path, metadata: dict):
    """Embed Artist/Title/Album/Genre/Year/Track#/cover art into the
    generated .stem.mp4 (an MP4 container) so Mixxx's library columns
    populate from real tags instead of relying on filename parsing."""
    try:
        mp4 = MP4(str(output_path))
    except Exception as e:
        tqdm.write(f"Warning: could not open {output_path} to write tags: {e}")
        return

    if metadata.get("artist"):
        mp4["\xa9ART"] = [metadata["artist"]]
    if metadata.get("title"):
        mp4["\xa9nam"] = [metadata["title"]]
    if metadata.get("album"):
        mp4["\xa9alb"] = [metadata["album"]]
    if metadata.get("albumartist"):
        mp4["aART"] = [metadata["albumartist"]]
    if metadata.get("genre"):
        mp4["\xa9gen"] = [metadata["genre"]]
    if metadata.get("year"):
        mp4["\xa9day"] = [metadata["year"]]
    if metadata.get("tracknumber"):
        try:
            track_str = str(metadata["tracknumber"]).split("/")[0].strip()
            mp4["trkn"] = [(int(track_str), 0)]
        except (ValueError, IndexError):
            pass
    if metadata.get("art"):
        data, mime = metadata["art"]
        fmt = MP4Cover.FORMAT_PNG if "png" in mime else MP4Cover.FORMAT_JPEG
        mp4["covr"] = [MP4Cover(data, imageformat=fmt)]

    try:
        mp4.save()
    except Exception as e:
        tqdm.write(f"Warning: could not save tags to {output_path}: {e}")


def run_demucs(input_path: Path, work_dir: Path, model: str, device: str) -> Path:
    """Run Demucs separation and return the directory containing the 4 stem wavs.

    Streams Demucs' own stderr progress output and mirrors it onto a local
    tqdm bar for this song, resetting each time Demucs starts a new pass
    (htdemucs_ft runs 4 internal model passes; htdemucs runs 1).
    """
    cmd = [
        sys.executable, "-m", "demucs",
        "-n", model,
        "-d", device,
        "-o", str(work_dir),
        str(input_path),
    ]
    with tqdm(total=100, desc=f"  {input_path.name}", unit="%", leave=False) as bar:
        proc = subprocess.Popen(
            cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1,
        )
        last_pct = 0
        for line in proc.stdout:
            match = PROGRESS_PCT_RE.search(line)
            if match:
                pct = int(match.group(1))
                if pct < last_pct:
                    # New model pass started (htdemucs_ft runs several); reset the bar.
                    bar.reset(total=100)
                    last_pct = 0
                bar.update(pct - last_pct)
                last_pct = pct
        proc.wait()

    if proc.returncode != 0:
        raise subprocess.CalledProcessError(proc.returncode, cmd)

    stem_dir = work_dir / model / input_path.stem
    if not stem_dir.exists():
        raise RuntimeError(f"Expected Demucs output at {stem_dir}, not found")
    return stem_dir


def load_stems(stem_dir: Path):
    """Load the 4 separated stems plus the mixture (sum) as float arrays."""
    import soundfile as sf

    stems = []
    sample_rate = None
    for name in STEM_ORDER:
        wav_path = stem_dir / f"{name}.wav"
        audio, sr = sf.read(str(wav_path), always_2d=True)
        if sample_rate is None:
            sample_rate = sr
        elif sr != sample_rate:
            raise RuntimeError(f"Sample rate mismatch in {wav_path}")
        stems.append(audio)

    max_len = max(s.shape[0] for s in stems)
    # NIStemsWriter requires the sample count to be a multiple of 1024.
    target_len = -(-max_len // 1024) * 1024
    padded = []
    for s in stems:
        if s.shape[0] < target_len:
            pad = np.zeros((target_len - s.shape[0], s.shape[1]))
            s = np.vstack([s, pad])
        padded.append(s)

    mixture = np.sum(padded, axis=0)
    mixture = np.clip(mixture, -1.0, 1.0)

    # stempeg/NIStemsWriter expects stream order: [mixture, drums, bass, other, vocals]
    all_streams = np.stack([mixture] + padded, axis=0)
    return all_streams, sample_rate


def write_stem_file(streams: np.ndarray, sample_rate: int, output_path: Path, bitrate: int):
    stems_metadata = [{"name": name, "color": STEM_COLORS[name]} for name in STEM_ORDER]

    writer = stempeg.NIStemsWriter(
        stems_metadata=stems_metadata,
        bitrate=bitrate,
        output_sample_rate=sample_rate,
    )
    stempeg.write_stems(
        path=str(output_path),
        data=streams,
        sample_rate=sample_rate,
        writer=writer,
    )


def process_one(input_path: Path, output_stem: str, metadata: dict, output_dir: Path,
                 model: str, device: str, bitrate: int, keep_stems: bool):
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{output_stem}.stem.mp4"

    with tempfile.TemporaryDirectory(prefix="stemgen_") as tmp:
        work_dir = Path(tmp)
        stem_dir = run_demucs(input_path, work_dir, model, device)

        if keep_stems:
            kept_dir = output_dir / f"{output_stem}_stems"
            shutil.copytree(stem_dir, kept_dir, dirs_exist_ok=True)
            tqdm.write(f"Kept intermediate stems at {kept_dir}")

        streams, sample_rate = load_stems(stem_dir)
        write_stem_file(streams, sample_rate, output_path, bitrate)
        write_output_metadata(output_path, metadata)

    tqdm.write(f"Done: {output_path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("inputs", type=Path, nargs="+",
                         help="One or more audio files and/or folders (folders are searched recursively)")
    parser.add_argument("-o", "--output-dir", type=Path, default=None,
                         help="Output directory (default: a 'Stems' folder created in the "
                              "current working directory, i.e. wherever you run this script from)")
    parser.add_argument("--model", default="htdemucs_ft",
                         help="Demucs model to use (default: htdemucs_ft, highest quality). "
                              "Use 'htdemucs' for faster/lighter separation.")
    parser.add_argument("--device", default="cpu", choices=["cpu", "cuda", "mps"],
                         help="Device to run Demucs on (default: cpu). Use 'mps' on Apple Silicon.")
    parser.add_argument("--bitrate", type=int, default=256000,
                         help="AAC bitrate per stem in bits/sec (default: 256000)")
    parser.add_argument("--keep-stems", action="store_true",
                         help="Keep the intermediate separated WAV files")
    args = parser.parse_args()

    check_dependencies()

    output_dir = args.output_dir or (Path.cwd() / "Stems")

    files = collect_input_files(args.inputs)
    if not files:
        print("No audio files found in the given input(s).", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(files)} audio file(s) to process.")
    print(f"Output folder: {output_dir}")
    failures = []
    skipped = 0
    overall = tqdm(files, desc="Overall progress", unit="song")
    for f in overall:
        overall.set_postfix_str(f.name[:40])
        metadata = _read_source_metadata(f)
        output_stem = build_output_stem(f, metadata)
        output_path = output_dir / f"{output_stem}.stem.mp4"
        if output_path.exists():
            tqdm.write(f"Skipping, output already exists: {output_path}")
            skipped += 1
            continue
        try:
            process_one(f, output_stem, metadata, output_dir, args.model, args.device,
                        args.bitrate, args.keep_stems)
        except Exception as e:
            tqdm.write(f"Failed to process {f}: {e}")
            failures.append(f)

    if skipped:
        tqdm.write(f"\nSkipped {skipped} file(s) with existing output.")

    if failures:
        print(f"\n{len(failures)} of {len(files)} file(s) failed:", file=sys.stderr)
        for f in failures:
            print(f"  - {f}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
