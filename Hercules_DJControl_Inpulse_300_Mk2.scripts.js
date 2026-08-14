/*
 * Hercules DJControl Inpulse 300 Mk2 â€” Mixxx 2.6 (beta) Mapping
 * ======================================================================
 * Basis: Offizielles Inpulse-300-Mapping v1.3 (Mai 2024) von DJ Phatso (+ BeitrÃ¤ge).
 * Diese Edition: Umschaltbare Pad-Bank 0x13 â†’ STEMS-Mode ODER Original-Toneplay,
 * Ã¼berarbeitete LED-Logik (Dark-Boot, Cache, gezielter Wipe), klarere Transport-
 * und Loop-Logik, Beatjump-Slicer und ein praxisnaher FX-/Beatloop-/Beatjump-Layer.
 *
 * KOMPATIBILITÃ„T
 * - Mixxx 2.6 (beta). Controller: Hercules DJControl Inpulse 300 Mk2.
 * - XML muss functionprefix="DJCi300" setzen (init()/shutdown() etc.).
 *
 * Ã„NDERUNGEN ggÃ¼. Upstream v1.3 (KurzÃ¼berblick)
 * - Pad-Bank 0x13 umschaltbar: STEMS oder Original-Toneplay (globaler Toggle).
 * - STEMS auf 0x13:
 *     Pads 1â€“4 â†’ [ChannelN_Stem1..4].mute (Toggle, 1 Pad pro Stem)
 *     Pads 5â€“8 â†’ SOLO (momentary, nur dieser Stem offen, Rest stumm)
 *     Shift+5â€“8 â†’ Hold-Mute (momentary, nur dieser Stem stumm, Rest offen)
 *   LED-Feedback direkt aus den Stem-Mute-Controls (keine XML-Outputs).
 * - Toneplay-Bank (0x13) im â€žtoneplayâ€œ-Modus: unverÃ¤ndertes Originalverhalten,
 *   Semitone-Auswahl (-4..+3) + LEDs in beiden Reihen gespiegelt.
 * - Beatloop / Beatjump / Slicer / FX:
 *     * BEATLOOP-Mode (ID 16): feste Loops 1/8..16 Beats; alle 8 Pads leuchten
 *       im Mode statisch, damit der Layer nicht â€žtotâ€œ aussieht.
 *     * BEATJUMP-Mode (ID 22): Â±1 / Â±2 / Â±4 / Â±32 Beats; alle Pads statisch an,
 *       Funktionen wie im XML (beatjump_1/2/4/32 forward/backward).
 *     * SLICER / SLICER LOOP (IDs 17 / 21): Beatjump-Slicer (8 Slices pro Domain),
 *       Slip-basiert, Loop-Respekt, LEDs werden komplett im Skript gemanagt
 *       (beide Reihen gespiegelt, Enter/Leave-Housekeeping).
 *     * FX-Mode (ID 20): FX-Pads schalten pro Deck Slots und Routing fÃ¼r
 *       mehrere Units (1â€“4); LEDs spiegeln Slot-enabled + Deck-Routing.
 *       Sobald ein Slot per Pad aktiviert ist und Unit/Routing noch aus sind,
 *       wird die Unit fÃ¼r dieses Deck automatisch â€žgearmedâ€œ (hÃ¶rbare Effekte,
 *       auch ohne vorherigen FX-Button).
 * - Sampler-Mode: Pads behalten die Upstream-Funktion, LEDs kÃ¶nnen den Sample-
 *   Zustand widerspiegeln (geladen vs. spielend â†’ An/Blink), zentral im Skript
 *   statt Ã¼ber XML-Outputs.
 * - Loop-/Transport:
 *     * Loop-IN/OUT-LEDs vollstÃ¤ndig skriptgesteuert, inkl. blinkender Adjust-Kante.
 *     * Loop-Adjust In/Out Ã¼ber separate Tasten: Jog verschiebt loop_start/end_
 *       position sample-basiert (Schrittweite aus BPM + loopAdjustStepBeats).
 *     * 4-Beat-Loop-Taste: kein Loop â†’ 4-Beat-Loop setzen; aktiver Loop â†’
 *       reloop_toggle. Loop-4-LED optional:
 *         - â€žtrackâ€œ    â†’ Track geladen = an, Loop aktiv = blinkt.
 *         - â€žloopOnlyâ€œ â†’ LED nur bei aktivem Loop.
 * - FX-Shortcut: DJCi300.fx123Toggle schaltet pro Deck die zugehÃ¶rige Unit +
 *   Slots 1..3 gemeinsam (all-on â†” all-off) und kÃ¼mmert sich auch um Deck-Routing.
 *   Die FX-Button-LED leuchtet, wenn Unit an UND mindestens ein Slot aktiv ist.
 * - EOT (Trackende): alternierendes CUEâ†”SYNC-Blink via [ChannelN].end_of_track
 *   (keine zusÃ¤tzliche Schwelle). EOT hat LED-Vorrang; temporÃ¤res SYNC-Tempo-Blink
 *   wird unterdrÃ¼ckt.
 * - â€žDark Bootâ€œ + LED-System:
 *     * komplette Hardware-LÃ¶schung beim Init, definierte Startup-LEDs.
 *     * zentraler LED-Cache (sendet nur Ã„nderungen), gezielter Wipe im Shutdown.
 *     * alle ehemals XML-gesteuerten LEDs laufen Ã¼ber JS (Top-Row, Pads, VU, FX).
 * - Saubere Disconnects aller engine.makeConnection-Handles im Shutdown
 *   (keine â€žGhostâ€œ-Updates nach Disconnect).
 * - Beatmatch-Guide (Tempo/Align) Ã¼ber dedizierte LEDs mit BPM-Toleranz (Tempo)
 *   und EMA + Hysterese + Rate-Limit (Align), damit nichts nervÃ¶s flackert.
 * - Browser/AutoDJ-LEDs: mehrfarbige Browser-LED (Library sichtbar / AutoDJ / beide
 *   Decks stehen / mindestens ein Deck spielt) + separate AutoDJ-LED.
 *
 * BENUTZEROPTIONEN (Auswahl)
 * - DJCi300.padBank13Mode = "stems" | "toneplay" (Default: "stems").
 * - Loop-Adjust: Feintuning der Loop-IN/OUT-Kante Ã¼ber den Jog:
 *   Jog-Drehung verschiebt loop_start_position/loop_end_position in Samples
 *   (Schrittweite aus loopAdjustStepBeats und Tempo errechnet).
 * - Brake/SoftStart-Verhalten: playBrakeOnVinyl (true = Brake/SoftStart auf PLAY
 *   im Vinyl-Mode).
 * - Beatmatch-Guide: tempoGuideEnabled / alignGuideEnabled (komplett abschaltbar).
 * - Loop-4-LED-Mode: loop4LEDMode = "track" | "loopOnly".
 *
 * KURZ-README (Einrichtung & Bedienung)
 * ----------------------------------------------------------------------
 * 1) Einrichtung in Mixxx
 *    - JS + XML laden; functionprefix="DJCi300".
 *
 * 2) Transport / Shift-Funktionen
 *    Optional (DJCi300.playBrakeOnVinyl = true, Vinyl-Mode):
 *      â€¢ Stehend â†’ Press: SoftStart + Start.
 *      â€¢ Spielt â†’ Press: Brake bis zum Stillstand (kein SoftStart auf Release).
 *      â€¢ Retap im Stand â†’ SoftStart aus dem Stand.
 *    Shift+PLAY (nur Vinyl-Mode): progressives, momentary Bend (kein Brake).
 *      Auf Release kleiner Gegen-Nudge; das Deck lÃ¤uft weiter (play bleibt 1).
 *    AuÃŸerhalb Vinyl: Shift+PLAY = Stutter (play_stutter/start_play, momentary).
 *    CUE: Standard â€žcue_defaultâ€œ (unshifted).
 *    Shift+CUE:
 *      â€¢ Vinyl-Mode: start_play (momentary).
 *      â€¢ AuÃŸerhalb Vinyl: cue_preview (halten = ab Cue spielen, Loslassen =
 *        Snapback & Stop).
 *    SYNC (Short/Long-Press via Software):
 *      â€¢ Short: Beat Sync (beatsync, One-Shot).
 *      â€¢ Long:  Soft-Sync toggeln (sync_enabled).
 *    Shift+SYNC: Tempo-Only-Sync (beatsync_tempo) mit kurzem SYNC-LED-Blink
 *      (deaktiviert, wenn EOT aktiv). Sync-Leader-LED spiegelt sync_leader
 *      (Shift-LED / oberer SYNC).
 *
 * 3) Jog / Vinyl / Scratch / Keylock
 *    - VINYL (Taste, LED auf Shift-SLIP): toggelt Scratch-Modus pro Deck.
 *    - SHIFT+LOOP_ON: toggelt keylock; LED in der Top-Row spiegelt Status.
 *    - Jog-Touch wÃ¤hlt abhÃ¤ngig von Play & Vinyl zwischen Scratch/Bend/Seek
 *      (Shift+Touch = Seek).
 *    - Automatik wechselt Scratchâ†’Bend, wenn Bewegung unter slipThreshold fÃ¤llt
 *      und kein Touch mehr anliegt. Optional ramped Scratch-Release Ã¼ber scratch2.
 *
 * 4) Loops & Adjust
 *    - Loop-LEDs (IN/OUT) vollstÃ¤ndig skriptgesteuert:
 *      aktiver Loop â†’ beide LEDs an; wÃ¤hrend Loop-Adjust blinkt nur die aktive
 *      Kante (IN/OUT).
 *    - Loop-Adjust In/Out: Toggles je Taste; Jog-Drehung verschiebt die jeweilige
 *      Kante Ã¼ber loop_start_position/loop_end_position in Samples (basierend
 *      auf BPM und loopAdjustStepBeats).
 *    - 4-Beat-Loop-Taste: kein Loop â†’ 4-Beat-Loop setzen; Loop aktiv â†’
 *      reloop_toggle. Loop-4-LED je nach loop4LEDMode.
 *
 * 5) EOT (End Of Track)
 *    - Wenn Mixxx [ChannelN].end_of_track setzt: CUE â†” SYNC alternierend blinken
 *      (Vorrang vor allen anderen SYNC-Blinkern).
 *    - Beim Verlassen von EOT werden CUE (cue_indicator) und SYNC (sync_enabled)
 *      sauber zurÃ¼ckgesetzt.
 *
 * 6) Pad-Modi (Deck-weit)
 *    - HOTCUE (15): Standard-Hotcues; LEDs spiegeln hotcue_1..8_status.
 *    - BEATLOOP (16): feste Loops 1/8..16 Beats (beatloop_0.125..16); alle
 *      8 Pads leuchten im Mode statisch.
 *    - SLICER (17) / SLICER LOOP (21): Beatjump-Slicer (8 Slices pro Domain,
 *      standardmÃ¤ÃŸig 4 Beats), LEDs verfolgen den aktiven Slice; Slip-Mode
 *      + Loop-Respekt, sauberes Enter/Leave-Housekeeping.
 *    - SAMPLER (18): wie Upstream, LEDs kÃ¶nnen geladen/spielend spiegeln
 *      (An/Blink), komplett Ã¼ber JS-LED-System.
 *    - FX (20): FX-Layer mit per-Pad Kontrolle fÃ¼r Slots und Routing:
 *         * Deck A: Pads 0x50â€“0x5F â†” Units 1/2/3/4 (Slots + Deck-Routing).
 *         * Deck B: analog, aber Units 2/1/4/3 laut XML-Belegung.
 *       Pads schalten Slots & Routing, LEDs spiegeln den Status; erste
 *       Aktivierung eines Slots â€žarmtâ€œ bei Bedarf automatisch Unit + Routing.
 *    - BEATJUMP (22): Â±1/2/4/32 Beats; alle 8 Pads leuchten im Mode statisch,
 *      Funktionen wie im XML (beatjump_1/2/4/32 forward/backward).
 *    - TONEPLAY/STEMS (19, Bank 0x13):
 *        * STEMS-Mode (empfohlen): siehe oben (Mute / SOLO / Hold-Mute).
 *          LEDs kommen direkt aus den Stem-Mute-States und werden per JS
 *          auf die Pad-Bank gemappt.
 *        * Toneplay-Original: obere Reihe wÃ¤hlt Halbton (-4..+3),
 *          untere Reihe spiegelt; Pad-Press â†’ zuletzt fokussierten Hotcue
 *          (Fallback: Cue) + Semitone setzen. LEDs markieren den gewÃ¤hlten Halbton.
 *      Umschalten des Bank-Modus (global): DJCi300.togglePadBank13Mode();
 *      Indikator-LED auf Shift+Q.
 *
 * 7) Library / Browser
 *    - BROWSE Short-Press: Fokus-Toggle (Decks/Library).
 *    - BROWSE Long-Press: Baum nach rechts aufklappen (MoveRight).
 *    - Browser-LED (farbig):
 *        WeiÃŸ  â†’ Library maximiert
 *        Gelb  â†’ AutoDJ aktiv
 *        GrÃ¼n  â†’ beide Decks stehen (sicher zum Laden)
 *        Blau  â†’ mindestens ein Deck spielt
 *      AutoDJ-LED zeigt explizit den AutoDJ-Status.
 *    - Waveform-Zoom Up/Down: triggert waveform_zoom_up/down auf beiden Decks.
 *
 * 8) VU-Meter / LEDs
 *    - Master/Deck-VU auf Controller-LEDs mit Kalibrierung (redGate, redStart,
 *      gamma, scale), damit Rot erst ganz oben anliegt.
 *    - VU-Debug-Probe (optional): per Shift+SYNC-Doppeltipp, wenn
 *      debugVUProbeShortcut=true (langsame CC-Rampe zum Ermitteln des
 *      â€žechtenâ€œ Rot-Beginns am Controller).
 *
 * 9) Effekte (Kurzzusammenfassung)
 *    - FX-Shortcut: DJCi300.fx123Toggle schaltet pro Deck die FX-Unit und
 *      Slots 1..3 gemeinsam (all-on â†” all-off) und kÃ¼mmert sich um das
 *      Routing zum Deck; FX-Button-LED leuchtet, wenn Unit an UND wenigstens
 *      ein Slot aktiv ist.
 *    - FX-Pads im FX-Mode: zeigen Slot-Status (an/aus) und Deck-Routing fÃ¼r
 *      die angebundenen Units; alle LEDs laufen Ã¼ber den LED-Cache.
 *
 * 10) Beatmatch-Guide
 *    - Tempo: vergleicht die aktuellen BPM beider Decks (Control â€žbpmâ€œ, inkl.
 *      Pitch-Fader). Unterhalb beatmatchTempoTolerance bleiben die Tempo-Pfeile aus.
 *    - Align/Phase: nutzt die Differenz der beat_distance-Werte beider Decks,
 *      sauber auf (-0.5..+0.5] gewrappt, mit EMA + Hysterese + Rate-Limit fÃ¼r
 *      eine ruhige Anzeige (keine Flacker-Orgie).
 *
 * TECHNIK / ROBUSTHEIT
 * - LED-Cache: sendet nur Ã„nderungen; Dark-Boot lÃ¶scht Hardware zuverlÃ¤ssig;
 *   gezielter Wipe im Shutdown (kein brutales â€žAll Notes Offâ€œ ohne Kontrolle).
 * - Verbindungs-Management: alle engine.makeConnection() werden persistiert
 *   und im Shutdown sauber getrennt.
 * - EOT hat Vorrang vor temporÃ¤ren LED-Blinkern (z. B. Tempo-Only-Sync).
 * - Track-Load/Unload-Observer: stellt Transport-LEDs sofort korrekt
 *   (PLAY/CUE/SYNC aus bei Unload, Top-Row-Refresh bei Load; Beatmatch-Guide
 *   wird neutralisiert, wenn Decks nicht spielen).
 *
 * BEKANNTE BESONDERHEITEN
 * - Library-â€žMoveFocusâ€œ ist ein Trigger, kein dauerhafter State â†’ Browser-LED
 *   kann â€žwackeligâ€œ wirken, wenn man viel in der Library springt.
 * - jogPPR muss je GerÃ¤t exakt kalibriert werden, wenn prÃ¤zises Scratch
 *   gewÃ¼nscht ist (debugPPR hilft beim Messen).
 *
 * DEBUG
 * - Mixxx starten mit:  mixxx --controllerDebug
 * - Optionaler PPR-ZÃ¤hler: debugPPR = true (zÃ¤hlt Ticks zwischen Touch down/up
 *   â†’ PPR kalibrieren).
 * - Optional: VU-Probe per Shift+SYNC-Doppeltipp (debugVUProbeShortcut = true).
 *
 * COPYRIGHT / DANK
 * - Auf Basis des offiziellen Mappings v1.3. Anpassungen: STEMS-Mode, LED-System
 *   (Dark-Boot + Cache), EOT-Vorrang, Slicer-Housekeeping, FX-Layer (Pads + Auto-Arm),
 *   Beatmatch-Guide, robustes Verbindungs-/Shutdown-Handling.
 */


var DJCi300 = {};

// Globale Helper-Konstante fÃ¼r alle 2-Deck-Schleifen.
// WICHTIG (EXPERIMENTAL Deck 3/4 Remap): CHANNEL_GROUPS bleibt bewusst bei
// genau diesen zwei EintrÃ¤gen. Es reprÃ¤sentiert die zwei PHYSISCHEN Strips
// (das, was die Hardware/XML fest verdrahtet als [Channel1]/[Channel2]
// anspricht) - NICHT die Menge aller aktiven Mixxx-Decks. Alle bestehenden
// Schleifen "for (g of CHANNEL_GROUPS)" sind damit weiterhin korrekt: sie
// iterieren "einmal pro physischem Strip" fÃ¼r LEDs/UI-State. Wo zusÃ¤tzlich
// Engine-State fÃ¼r Channel3/4 vorbereitet werden muss (Init-Dicts), wird das
// explizit Ã¼ber ALL_CHANNEL_GROUPS erledigt (siehe unten).
const CHANNEL_GROUPS = ["[Channel1]", "[Channel2]"];

// Alle vier logischen Decks - genutzt NUR dort, wo State-Dictionaries auch
// fÃ¼r Channel3/4 EintrÃ¤ge brauchen (die realen Ziel-Decks des Remaps).
const ALL_CHANNEL_GROUPS = ["[Channel1]", "[Channel2]", "[Channel3]", "[Channel4]"];

///////////////////////////////////////////////////////////////
// 0) EXPERIMENTAL: DECK 3/4 REMAP (physischer Strip -> logisches Deck)
///////////////////////////////////////////////////////////////
//
// Der Controller hat nur 2 physische Kanalzuege, aber Mixxx laeuft hier mit
// 4 Decks. SHIFT+LOAD A/B (physisch) togglen, welches LOGISCHE Deck der
// jeweilige physische Strip gerade steuert:
//   linker Strip  ("[Channel1]"-XML-Bindings) -> [Channel1] <-> [Channel3]
//   rechter Strip ("[Channel2]"-XML-Bindings) -> [Channel2] <-> [Channel4]
//
// DESIGN-ENTSCHEIDUNG (siehe Report):
//   Alle UI-/Modus-/Momentary-State-Dictionaries (Shift-Held, Pad-Mode,
//   Vinyl/Scratch-Buttonstatus, Loop-Adjust-Flags, Latch/Brake-Watcher,
//   Sync-Long-Press etc.) bleiben PRO PHYSISCHEM STRIP indiziert, also
//   weiterhin unter dem literalen Key "[Channel1]"/"[Channel2]" - dem Wert,
//   den die XML-Bindings tatsÃ¤chlich als `group`-Parameter hereinreichen.
//   Das ist beabsichtigt: SHIFT halten, welcher Pad-Bank-Modus aktiv ist,
//   ob gerade gescratcht wird etc. sind Eigenschaften der physischen Taste/
//   des physischen Jogwheels - sie sollen beim Umschalten NICHT zurÃ¼ckgesetzt
//   werden oder "mit dem Deck wandern".
//
//   Nur an der eigentlichen Engine-Grenze (engine.getValue/setValue,
//   script.triggerControl/toggleControl/deckFromGroup und alle daraus
//   abgeleiteten `[ChannelN_StemX]`-Gruppennamen) wird ÃŒber
//   DJCi300._resolveGroup(group) auf das jeweils AKTIVE logische Deck
//   aufgelÃ¶st. Konvention im Code: der XML-`group`-Parameter bleibt
//   unverÃ¤ndert "physicalGroup"; ein lokales `const rg = DJCi300._resolveGroup(group);`
//   wird nur dort verwendet, wo tatsÃ¤chlich mit der Engine gesprochen wird.
//
//   DJCi300.LED[group] (MIDI-Status-Bytes) bleibt IMMER Ã¼ber den physischen
//   Strip indiziert - das sind feste Hardware-Adressen, keine Deck-Eigenschaft.
DJCi300._activeDeck = {
    "[Channel1]": "[Channel1]",
    "[Channel2]": "[Channel2]",
};

// Alternatives Ziel-Deck je physischem Strip (fÃ¼r den Toggle).
DJCi300._altDeck = {
    "[Channel1]": "[Channel3]",
    "[Channel2]": "[Channel4]",
};

// Liefert das aktuell aktive LOGISCHE Deck fÃ¼r einen physischen Strip.
// Wird an jeder Engine-Grenze aufgerufen (engine.getValue/setValue,
// script.*, dynamisch gebaute [ChannelN_StemX]-Gruppen). Bei unbekanntem
// Input (z.B. bereits ein reales Ziel-Deck oder Non-Channel-Gruppen wie
// "[Library]") wird der Wert unverÃ¤ndert zurÃ¼ckgegeben (Safe-Fallback).
DJCi300._resolveGroup = function (group) {
    const mapped = DJCi300._activeDeck[group];
    return mapped || group;
};

///////////////////////////////////////////////////////////////
// 1) BENUTZEROPTIONEN
///////////////////////////////////////////////////////////////

// Scratch / Jog
DJCi300.slipThreshold = 0.1; // Umschalten Scratchâ†’Jog ab dieser Langsamkeit
DJCi300.scratchScale = 1.0;
DJCi300.scratchShiftMultiplier = 4; // Shift+Scratch schneller
DJCi300.bendScale = 1.0;
// Optional direkteres Ansprechverhalten (Danke an JosepMa):
DJCi300.scratchAlpha = 0.50; // grÃ¶ÃŸer = direkter
DJCi300.scratchBeta = DJCi300.scratchAlpha / 32;

// Transport / Brake-Option
// true: Im VINYL-Mode verhÃ¤lt sich der normale PLAY-Taster als Brake/SoftStart.
DJCi300.playBrakeOnVinyl = true;

// Watcher/Fallback-Optionen
// Wenn true, nutzt der Brake-Watcher zusÃ¤tzlich Playpositions-Heuristik.
// Default aus: wir verlassen uns auf native Mixxx-Flags.
DJCi300.useBrakePositionFallback = false;

// Jog-PPR (intervals per revolution) â€“ unbedingt kalibrieren
DJCi300.jogPPR = 508; // Startwert; echte Ticks/Umdrehung messen
DJCi300.debugPPR = false; // true: zÃ¤hlt Ticks zwischen Touch down/up

// Pad-Modes (IDs â€“ nur Ã¤ndern, wenn du genau weiÃŸt, was du tust)
DJCi300.padModeNone = 0;
DJCi300.padModeHotcue = 15;
DJCi300.padModeRoll = 16;
DJCi300.padModeSlicer = 17;
DJCi300.padModeSampler = 18;
DJCi300.padModeToneplay = 19; // <- per Option: STEMS-Ebene ODER Toneplay
DJCi300.padModeFX = 20;
DJCi300.padModeSlicerloop = 21;
DJCi300.padModeBeatjump = 22;

// Umschalter Pad-Bank 0x13: "stems" oder "toneplay"
DJCi300.padBank13Mode = "stems"; // <- auf "toneplay" setzen fÃ¼r Original-Toneplay

// Toneplay-Parameter
DJCi300.toneplayPitchControl = "pitch_adjust"; // Semitone-Offset -4..+3

// Slicer / Loop-Anzeige
// Domain-LÃ¤nge in Beats (SLICER & SLICER LOOP). 4 = 8 Slices Ã  1/2 Beat.
DJCi300.selectedSlicerDomainBeats = 4;

// Loop-4 LED-Verhalten:
// "track"    â†’ Track geladen = an, Loop aktiv = blinkt.
// "loopOnly" â†’ nur wÃ¤hrend aktivem Loop an, sonst aus.
DJCi300.loop4LEDMode = "track"; // oder "loopOnly"

///////////////////////////////////////////////////////////////
// 2) PERSISTENTE CONNECTION-HANDLES
///////////////////////////////////////////////////////////////

// Verhindert, dass GC die Connections entsorgt (sonst â€žmal gehtâ€™s, mal nichtâ€œ)
// Map: group â†’ Array von Connections
DJCi300._conns = {
    main: [],
    "[Channel1]": [],
    "[Channel2]": [],
};

// Einfache Mirror-Liste fÃ¼r Controlâ†’Handler-Mappings, die nur 1:1
// einen Control-Wert auf LEDs o.Ã„. spiegeln.
const MIRRORS = [{
        key: "loop_enabled",
        handler: "updateLoopLed"
    },
];

// Handler, die beim Init existieren mÃ¼ssen (reine Sanity-Checks).
// EnthÃ¤lt sowohl die MIRROR-Handler als auch â€žSonderfÃ¤lleâ€œ, die
// an mehrere Controls gebunden werden (Tempo-/Align-Guide etc.).
const REQUIRED_HANDLERS = [
    "updateLoopLed",
    "updateToneplayLED",
    "updateBeatmatchTempoLED",
    "updateBeatmatchAlignLED",
    "updateFxButtonLED",
];

///////////////////////////////////////////////////////////////
// 3) LED-UTILITIES
///////////////////////////////////////////////////////////////

// Zentrales LED-/CC-Mapping
DJCi300.LED = {
    "[Channel1]": {
        transport: 0x91,
        shift: 0x94,
        pads: 0x96,
        vu: 0xB1
    },
    "[Channel2]": {
        transport: 0x92,
        shift: 0x95,
        pads: 0x97,
        vu: 0xB2
    },
    // Globale LEDs (nicht deckgebunden)
    global: {
        // Browser-Taster-LED (Status 0x90, Note 0x05)
        browse: {
            status: 0x90,
            note: 0x05
        },
        // AutoDJ-LED (Status 0x90, Note 0x03)
        autoDJ: {
            status: 0x90,
            note: 0x03
        },
    },
    notes: {
        PLAY: 0x07,
        CUE: 0x06,
        SYNC: 0x05,
        LOOP_IN: 0x09,
        LOOP_OUT: 0x0A,
        ALIGN_L: 0x1C,
        ALIGN_R: 0x1D,
        TEMPO_L: 0x1E,
        TEMPO_R: 0x1F,
        VINYL: 0x01,
        SHIFT_Q: 0x02,
        PFL: 0x0C,
        QUANTIZE: 0x02,
        SLIP: 0x01,
        LOOP_ON: 0x03,
        FX: 0x00,
        // EXPERIMENTAL (Deck 3/4 Remap): LOAD-Taster-LED (Status 0x91/0x92,
        // Note 0x0D) - im WORKING-Mapping ungenutzt (kein Output darauf
        // definiert). Wird hier als Deck-3/4-Modusindikator zweckentfremdet:
        // an = Strip steuert aktuell Deck 3/4, aus = Strip steuert Deck 1/2.
        LOAD: 0x0D
    }
};

// Farben fÃ¼r RGB-LEDs (z.B. Browser)
DJCi300.COLORS = {
    OFF: 0x00,
    BLUE_DARK: 0x03,
    BLUE_MED: 0x0B,
    BLUE_LIGHT: 0x17,
    GREEN: 0x3C,
    RED: 0x60,
    ORANGE: 0x6C,
    YELLOW: 0x7C,
    WHITE: 0x7F,
};

// === Components-Container fÃ¼r die Top-Row pro Deck =========================
DJCi300._topRow = {
    "[Channel1]": null,
    "[Channel2]": null
};
// EXPERIMENTAL: `group` (Parameter) ist immer der PHYSISCHE Strip - LED-
// Adressen (led.transport/led.shift) UND der Ablage-Key in DJCi300._topRow
// bleiben darauf indiziert. Die eigentliche components.Button-Instanz wird
// aber gegen `rg` = DJCi300._resolveGroup(group) verbunden (Components bindet
// intern per engine.makeConnection(this.group, ...) - das muss also bereits
// das aufgelÃ¶ste Deck sein). Mixxx ruft output(value, g) mit dem TATSÃ„CHLICH
// verbundenen `g` (=rg) auf; die guard-Callbacks brauchen aber den physischen
// Strip fÃ¼r _eotActive/_syncTempoBlinkTicks - deshalb wird dort bewusst das
// geschlossene `group` (physisch) statt des gelieferten `g` verwendet.
DJCi300._buildTopRow = function (group) {
    const C = components;
    const led = DJCi300.LED[group];
    const rg = DJCi300._resolveGroup(group);
    const n = DJCi300.LED.notes;

    const spec = [{
            key: "play_indicator",
            note: n.PLAY,
            name: "play",
            guard: null
        }, {
            key: "cue_indicator",
            note: n.CUE,
            name: "cue",
            guard: () => DJCi300._eotActive(group)
        }, {
            key: "sync_enabled",
            note: n.SYNC,
            name: "sync",
            guard: () => DJCi300._eotActive(group) || (DJCi300._syncTempoBlinkTicks[group] > 0)
        }, {
            key: "sync_leader",
            note: n.SYNC,
            name: "syncLeader",
            shift: true
        }, {
            key: "pfl",
            note: n.PFL,
            name: "pfl"
        }, {
            key: "quantize",
            note: n.QUANTIZE,
            name: "quantize"
        }, {
            key: "slip_enabled",
            note: n.SLIP,
            name: "slip"
        }, {
            key: "keylock",
            note: n.LOOP_ON, // gleiche Note wie deine neue Keylock-LED
            name: "keylock",
            shift: true // auf den Shift-Channel legen (0x94/0x95)
        },
    ];

    const cont = new C.ComponentContainer();
    spec.forEach(({
            key,
            note,
            name,
            shift,
            guard
        }) => {
        cont[name] = new C.Button({
            group: rg,
            midi: [shift ? led.shift : led.transport, note],
            sendShifted: false,
            shiftChannel: true,
            shiftOffset: 0x03,
            outKey: key,
            input: function () {},
            output: function (value, _g) {
                if (guard && guard())
                    return;
                this.send(value > 0 ? 0x7F : 0x00);
            },
        });
    });
    Object.values(cont).forEach(c => c.connect && c.connect());
    DJCi300._topRow[group] = cont;
    return cont;
};

// --- HOTCUE-Row (Outputs only) --------------------------------------------
// EXPERIMENTAL: `group` = physischer Strip (LED-Adresse DJCi300.LED[group]
// bleibt darauf indiziert und wird VOR dem engine.makeConnection() in einer
// Closure eingefangen - Mixxx liefert im Callback sonst das tatsÃ¤chlich
// verbundene `g` (=rg) zurÃ¼ck, unter dem DJCi300.LED KEINEN Eintrag hat,
// sobald rg = "[Channel3]"/"[Channel4]" ist). Die Connection selbst zeigt
// auf `rg` = DJCi300._resolveGroup(group), wird aber unter dem physischen
// `group` in DJCi300._conns abgelegt, damit _rebindDeckConnections() sie
// beim Deck-Toggle findet.
DJCi300._buildHotcueRow = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const st = DJCi300.LED[group].pads;
    for (let i = 1; i <= 8; i++) {
        const note = 0x00 + (i - 1); // Hotcue-LEDs liegen 0x00..0x07 auf pads-Status
        const key = `hotcue_${i}_status`;
        const fn = (v) => {
            DJCi300.led.send(st, note, v > 0 ? 0x7F : 0x00);
        };
        const c = engine.makeConnection(rg, key, fn);
        DJCi300._conns[group].push(c);
        try {
            fn(engine.getValue(rg, key));
        } catch (e) {}
    }
};

DJCi300._refreshHotcueRow = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const st = DJCi300.LED[group].pads;
    for (let i = 1; i <= 8; i++) {
        const v = engine.getValue(rg, `hotcue_${i}_status`);
        DJCi300.led.send(st, 0x00 + (i - 1), v > 0 ? 0x7F : 0x00);
    }
};

// --- Top-Row State sofort neu ausgeben (ohne AbhÃ¤ngigkeit von GUI-Pushes) --
// EXPERIMENTAL: `group` = physischer Strip (LED-Adressen + EOT/Blink-State
// bleiben darauf indiziert); alle engine.getValue()-Reads laufen Ã¼ber `rg`
// = DJCi300._resolveGroup(group), damit die Top-Row nach einem Deck-Toggle
// korrekt den Status des NEU aktiven logischen Decks zeigt.
DJCi300._triggerTopRowState = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const st = DJCi300._st(group);
    const sh = DJCi300._stShift(group);
    const n = DJCi300.LED.notes;

    // PLAY
    DJCi300.led.send(st, n.PLAY, engine.getValue(rg, "play_indicator") ? 0x7F : 0x00);

    // CUE (EOT hat Vorrang; hier nur Basis setzen)
    if (!DJCi300._eotActive(group)) {
        DJCi300.led.send(st, n.CUE, engine.getValue(rg, "cue_indicator") ? 0x7F : 0x00);
    }

    // SYNC (kein Tempo-Blink & kein EOT â†’ echter Zustand)
    if (!DJCi300._eotActive(group) && (DJCi300._syncTempoBlinkTicks[group] | 0) === 0) {
        DJCi300.led.send(st, n.SYNC, engine.getValue(rg, "sync_enabled") ? 0x7F : 0x00);
    }

    // SYNC-LEADER auf Shift-Kanal
    DJCi300.led.send(sh, n.SYNC, engine.getValue(rg, "sync_leader") ? 0x7F : 0x00);

    // PFL / QUANTIZE / SLIP
    DJCi300.led.send(st, n.PFL, engine.getValue(rg, "pfl") ? 0x7F : 0x00);
    DJCi300.led.send(st, n.QUANTIZE, engine.getValue(rg, "quantize") ? 0x7F : 0x00);
    DJCi300.led.send(st, n.SLIP, engine.getValue(rg, "slip_enabled") ? 0x7F : 0x00);
    DJCi300.led.send(sh, n.LOOP_ON, engine.getValue(rg, "keylock") ? 0x7F : 0x00);
};

DJCi300._triggerTopRows = () => {
    CHANNEL_GROUPS.forEach(group => DJCi300._triggerTopRowState(group));
};

// WÃ¤hrend des Shutdowns werden **alle** LED-Sends unterdrÃ¼ckt â€“ auch "force".
DJCi300._shutdownInProgress = false;
// Globale LED-Drossel (z. B. fÃ¼r Shutdown/Disconnect)
DJCi300._suppressLEDs = false;

// LED-Subsystem (Cache, Helfer)
DJCi300.led = {
    cache: Object.create(null),
    send(status, note, value, force = false) {
        if (DJCi300._shutdownInProgress)
            return;
        if (DJCi300._suppressLEDs && !force)
            return;
        const k = (status << 8) | note;
        if (!force && this.cache[k] === value)
            return;
        this.cache[k] = value;
        midi.sendShortMsg(status, note, value);
    },
    noteKillRange(statusOn, startNote, endNote) {
        const statusOff = statusOn - 0x10;
        for (let n = startNote; n <= endNote; n++) {
            this.send(statusOff, n, 0x00, true);
            this.send(statusOn, n, 0x00, true);
            this.cache[(statusOn << 8) | n] = 0x00;
        }
    },
    targetedWipeFromCache() {
        try {
            for (const k in this.cache) {
                const v = this.cache[k] | 0;
                if (!v)
                    continue;
                const key = parseInt(k, 10);
                const status = (key >> 8) & 0xFF;
                const note = key & 0xFF;
                const hi = status & 0xF0;
                if (hi === 0x90) {
                    midi.sendShortMsg(status - 0x10, note, 0x00);
                    midi.sendShortMsg(status, note, 0x00);
                } else if (hi === 0xB0) {
                    midi.sendShortMsg(status, note, 0x00);
                }
                this.cache[k] = 0x00;
            }
        } catch (e) {}
    },
    clearAll() {
        try {
            for (let st = 0x90; st <= 0x95; st++)
                this.noteKillRange(st, 0x00, 0x1F);
            this.noteKillRange(0x96, 0x00, 0x7F);
            this.noteKillRange(0x97, 0x00, 0x7F);
            this.send(0xB0, 0x40, 0x00);
            this.send(0xB0, 0x41, 0x00);
            this.send(0xB0, 0x03, 0x00);
            this.send(0xB0, 0x04, 0x00);
            this.send(0xB1, 0x40, 0x00);
            this.send(0xB2, 0x40, 0x00);
            engine.beginTimer(120, () => {
                for (let st = 0x90; st <= 0x95; st++) {
                    for (let n = 0x00; n <= 0x1F; n++) {
                        this.send(st, n, 0x00);
                        this.cache[(st << 8) | n] = 0x00;
                    }
                }
                for (const st of[0x96, 0x97]) {
                    for (let n = 0x00; n <= 0x7F; n++) {
                        this.send(st, n, 0x00);
                        this.cache[(st << 8) | n] = 0x00;
                    }
                }
            }, true);
        } catch (e) {}
    },
    setFixedStartupLEDs() {
        this.send(0x90, 0x04, 0x05);
    },
};

// ===== Verbindungen in init() aufbauen =====
// (Alle ehemals per XML gesteuerten LEDs laufen jetzt hier durch den Cache.)
const _connect = (group, key, fn) => {
    if (typeof fn !== "function") {
        print(`[Inpulse300] _connect(): handler for ${group}.${key} is ${typeof fn} â€“ skipped`);
        return null;
    }

    const cb = (v, g, k) => fn(v, g || group, k || key);
    const c = engine.makeConnection(group, key, cb);

    if (!DJCi300._conns[group]) {
        DJCi300._conns[group] = [];
    }
    DJCi300._conns[group].push(c);

    try {
        cb(engine.getValue(group, key), group, key);
    } catch (e) {
        print(`[Inpulse300] _connect() init ${group}.${key} threw: ${e}`);
    }
    return c;
};

// EXPERIMENTAL (Deck 3/4 Remap): wie _connect(), aber die Connection wird
// unter `trackGroup` (dem PHYSISCHEN Strip) statt unter `engineGroup` (dem
// tatsÃ¤chlich verbundenen, ggf. resolved-en Deck) in DJCi300._conns
// abgelegt. Dadurch kann DJCi300._rebindDeckConnections() spÃ¤ter ALLE
// Connections eines physischen Strips zuverlÃ¤ssig finden und trennen -
// unabhÃ¤ngig davon, ob sie gerade an [Channel1] oder [Channel3] hÃ¤ngen.
//
// WICHTIG: Mixxx ruft den makeConnection()-Callback mit dem TATSÃ„CHLICH
// verbundenen Control-Group auf (also ggf. "[Channel3]"), NICHT mit dem
// physischen Strip. Alle Handler in diesem Skript erwarten aber `group` =
// physischer Strip (fÃ¼r LED-/State-Lookups) und lÃ¶sen selbst intern Ã¼ber
// _resolveGroup() auf. Deshalb wird hier IMMER `trackGroup` an fn()
// durchgereicht, das von Mixxx gelieferte `g` wird bewusst ignoriert.
const _connectAs = (trackGroup, engineGroup, key, fn) => {
    if (typeof fn !== "function") {
        print(`[Inpulse300] _connectAs(): handler for ${engineGroup}.${key} is ${typeof fn} â€“ skipped`);
        return null;
    }

    const cb = (v, _g, k) => fn(v, trackGroup, k || key);
    const c = engine.makeConnection(engineGroup, key, cb);

    if (!DJCi300._conns[trackGroup]) {
        DJCi300._conns[trackGroup] = [];
    }
    DJCi300._conns[trackGroup].push(c);

    try {
        cb(engine.getValue(engineGroup, key), trackGroup, key);
    } catch (e) {
        print(`[Inpulse300] _connectAs() init ${engineGroup}.${key} threw: ${e}`);
    }
    return c;
};
// LÃ¶scht ALLE Pad-LEDs (beide Decks, beide Reihen 0x40..0x4F)
DJCi300._wipePadRows = function (group) {
    const status = DJCi300.LED[group].pads;
    for (let n = 0x40; n <= 0x4F; n++)
        DJCi300.led.send(status, n, 0x00, true);
};

// Allgemeiner Helfer: setzt einen zusammenhÃ¤ngenden Pad-Bereich statisch AN/AUS.
// Kann fÃ¼r beliebige Modi wiederverwendet werden (startNote/endNote inkl.).
DJCi300._setPadRangeStatic = function (group, startNote, endNote, on) {
    const status = DJCi300.LED[group].pads; // 0x96 (Deck A) / 0x97 (Deck B)
    const val = on ? 0x7F : 0x00;
    for (let n = startNote; n <= endNote; n++) {
        DJCi300.led.send(status, n, val);
    }
};

// EXPERIMENTAL: Loop-Mode-Pads (0x10-0x17) - nur der Pad des AKTIVEN Loops
// soll leuchten (nicht mehr alle 8 statisch). Note-Offset <-> beatloop_size,
// gleiche Reihenfolge wie die physischen Pads 1-8.
DJCi300._loopPadSizes = [1, 2, 4, 8, 16, 0.125, 0.25, 0.5];
DJCi300._loopPadBase = 0x10;

// Liest den echten Mixxx-Loop-Status (nicht nur die letzte Pad-Betaetigung)
// und zuendet genau das dazu passende Pad; alle anderen bleiben/werden aus.
// So bleibt die LED auch dann korrekt, wenn der Loop z.B. aus der Mixxx-GUI
// oder ueber IN/OUT statt ueber ein Pad veraendert wurde.
DJCi300._refreshLoopPadLEDs = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const status = DJCi300.LED[group].pads;
    const loopOn = engine.getValue(rg, "loop_enabled") > 0;
    const size = loopOn ? engine.getValue(rg, "beatloop_size") : -1;
    const activeIdx = DJCi300._loopPadSizes.findIndex((s) => Math.abs(s - size) < 1e-6);

    for (let i = 0; i < DJCi300._loopPadSizes.length; i++) {
        DJCi300.led.send(status, DJCi300._loopPadBase + i, (i === activeIdx) ? 0x7F : 0x00);
    }
};

///////////////////////////////////////////////////////////////
// 4) LOOP-LED BLINK-HELFER
///////////////////////////////////////////////////////////////

// Status-Bytes & Noten fÃ¼r Loop-LEDs
DJCi300._loopLEDStatus = function (group) {
    return DJCi300.LED[group].transport;
};
DJCi300._loopLEDNotes = {
    in: 0x09,
    out: 0x0A
};

// LEDs bequem setzen
DJCi300._setLoopLEDs = function (group, inVal, outVal) {
    const st = DJCi300._loopLEDStatus(group);
    DJCi300.led.send(st, DJCi300._loopLEDNotes.in, inVal);
    DJCi300.led.send(st, DJCi300._loopLEDNotes.out, outVal);
};

// Blink stoppen + LEDs aus
DJCi300._stopLoopBlink = function (group) {
    DJCi300._loopBlinkActive[group] = false;
    // Konsistenter finaler Zustand:
    if (engine.getValue(DJCi300._resolveGroup(group), "loop_enabled") > 0) {
        DJCi300._setLoopLEDs(group, 0x7F, 0x7F);
    } else {
        DJCi300._setLoopLEDs(group, 0x00, 0x00);
    }
};

// Blink-Start: wÃ¤hrend Adjust blinkt nur die aktive Kante; ohne Adjust beide LEDs solid
DJCi300._startLoopBlink = function (group) {
    const adj = DJCi300.loopAdjust[group] || {
        in: false,
        out: false
    };
    DJCi300._loopBlinkActive[group] = !!(adj.in || adj.out);
    if (!DJCi300._loopBlinkActive[group]) {
        DJCi300._setLoopLEDs(group, 0x7F, 0x7F);
    }
};

// Loop-Adjust Flags je Deck
DJCi300.loopAdjust = {
    "[Channel1]": {
        in: false,
        out: false
    },
    "[Channel2]": {
        in: false,
        out: false
    },
};

///////////////////////////////////////////////////////////////
// 5) EOT / Play-/Cue-Blink
///////////////////////////////////////////////////////////////

// === Heartbeat-gestÃ¼tzte Blink-ZustÃ¤nde =====================================
// Wir nutzen [App]indicator_250ms / _500ms statt eigener engine.beginTimer()-Loops.
DJCi300._eotPhase = {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

// Blinkphase fÃ¼r Sampler-Pads (500ms-Heartbeat)
DJCi300._samplerBlinkPhase = 0;

DJCi300._loopBlinkActive = {
    "[Channel1]": false,
    "[Channel2]": false,
};
DJCi300._syncTempoBlinkTicks = {
    "[Channel1]": 0,
    "[Channel2]": 0, // in 250ms-Schritten
};

DJCi300._eotBlinkActive = {
    "[Channel1]": false,
    "[Channel2]": false
};

// === EOT Blink: alternating CUE <-> SYNC (statt Beatmatch) ==================
DJCi300._startEOTBlink = function (group) {
    if (!DJCi300._isTrackLoaded(DJCi300._resolveGroup(group)))
        return;
    if (DJCi300._eotBlinkActive[group])
        return;
    DJCi300._eotBlinkActive[group] = true;
    // Vorrang: Tempo-Blink sofort beenden
    if (DJCi300._stopSyncTempoBlink)
        DJCi300._stopSyncTempoBlink(group);
};

DJCi300._stopEOTBlink = function (group) {
    DJCi300._eotBlinkActive[group] = false;

    // ggf. temporÃ¤res SYNC-Blinken beenden
    if (DJCi300._stopSyncTempoBlink)
        DJCi300._stopSyncTempoBlink(group);

    // Top-Row neu triggern (CUE/SYNC werden wieder normal gespiegelt)
    DJCi300._triggerTopRowState(group);
};

///////////////////////////////////////////////////////////////
// 6) LED-SPIEGELUNGEN
///////////////////////////////////////////////////////////////

// LoopLED: steuert das Blinken der IN/OUT-LEDs (0x09/0x0A) je nach loop_enabled
DJCi300.updateLoopLed = function (value, group) {
    if (value) {
        const adj = DJCi300.loopAdjust[group] || {
            in: false,
            out: false
        };
        if (adj.in || adj.out) {
            // Nur wÃ¤hrend Adjust blinken
            DJCi300._startLoopBlink(group);
        } else {
            // Aktiver Loop, kein Adjust â†’ beide LEDs dauerhaft an
            DJCi300._stopLoopBlink(group);
            DJCi300._setLoopLEDs(group, 0x7F, 0x7F);
        }
    } else {
        // Loop aus â†’ Flags zurÃ¼cksetzen, LEDs aus
        DJCi300.loopAdjust[group] = {
            in: false,
            out: false
        };
        DJCi300._stopLoopBlink(group);
        DJCi300._setLoopLEDs(group, 0x00, 0x00);
    }
};

// Spiegelt den Vinyl/Scratch-Status auf die LED (SHIFT + SLIP)
DJCi300.updateVinylLED = function (group) {
    const on = !!DJCi300.scratchButtonState[group];
    DJCi300.led.send(DJCi300.LED[group].shift, DJCi300.LED.notes.VINYL, on ? 0x7F : 0x00);
};

// Helper fÃ¼r Pad-Bank 0x13: globaler Umschalter STEMS/Toneplay
DJCi300.isStemsMode = function () {
    return DJCi300.padBank13Mode === "stems";
};

// Shift+Q LED: zeigt an, ob Pad-Bank 0x13 im STEMS-Modus ist
// Deck A (Shift-Topreihe) = 0x94/0x02, Deck B = 0x95/0x02
DJCi300.updateStemsModeIndicator = function () {
    for (const g of CHANNEL_GROUPS) {
        const on = DJCi300.isStemsMode() && (DJCi300.padMode[g] === DJCi300.padModeToneplay);
        DJCi300.led.send(DJCi300.LED[g].shift, DJCi300.LED.notes.SHIFT_Q, on ? 0x7F : 0x00);
    }
};

// ===== Mapping-Helfer fÃ¼r Status-KanÃ¤le =====
DJCi300._st = (group) => DJCi300.LED[group].transport;
DJCi300._stShift = (group) => DJCi300.LED[group].shift;
DJCi300._eotActive = (group) => !!(DJCi300._eotBlinkActive && DJCi300._eotBlinkActive[group]);

DJCi300._wipeHotcueRow = function (group) {
    const st = DJCi300.LED[group].pads;
    for (let n = 0x00; n <= 0x07; n++)
        DJCi300.led.send(st, n, 0x00);
};

DJCi300._updateLoop4LED = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const st = DJCi300._st(group);
    const n = DJCi300.LED.notes.LOOP_ON;
    const mode = DJCi300.loop4LEDMode || "track";
    let val = 0x00;

    if (mode === "loopOnly") {
        // Variante 2:
        // LED nur an, solange der Loop aktiv ist â€“ sonst aus.
        if (engine.getValue(rg, "loop_enabled") > 0) {
            val = 0x7F; // dauerhaft an bei aktivem Loop
        } else {
            val = 0x00; // sonst aus
        }
    } else {
        // Variante 1 (aktuelles Verhalten):
        // - kein Track: aus
        // - Track ohne Loop: an
        // - Track mit Loop: blinkt
        if (!DJCi300._isTrackLoaded(rg)) {
            val = 0x00; // komplett aus wenn nichts geladen ist
        } else if (engine.getValue(rg, "loop_enabled") > 0) {
            // Blinkwert kommt aus der 500ms-Heartbeat-Phase
            val = DJCi300._eotPhase[group] ? 0x7F : 0x00;
        } else {
            // Track geladen, kein Loop â†’ dauerhaft an
            val = 0x7F;
        }
    }

    DJCi300.led.send(st, n, val);
};

// --- Sampler-Pad-LEDs (Mode: SAMPLER) --------------------------------------
//  - Pad an, wenn ein Track im zugehÃ¶rigen Sampler geladen ist.
//  - Pad blinkt, solange der Sampler spielt.
//  - Nutzt die Note-Range 0x30â€“0x37, die im XML nur im Sampler-Mode verwendet wird.
DJCi300.samplerPadGroups = {
    "[Channel1]": [
        "[Sampler1]", "[Sampler2]", "[Sampler3]", "[Sampler4]",
        "[Sampler5]", "[Sampler6]", "[Sampler7]", "[Sampler8]",
    ],
    "[Channel2]": [
        "[Sampler1]", "[Sampler2]", "[Sampler3]", "[Sampler4]",
        "[Sampler5]", "[Sampler6]", "[Sampler7]", "[Sampler8]",
    ],
};

DJCi300._updateSamplerPadsForGroup = function (group) {
    // Nur im Sampler-Mode LEDs setzen; sonst bleiben die Notes unberÃ¼hrt.
    if (DJCi300.padMode[group] !== DJCi300.padModeSampler) {
        return;
    }

    const padGroups = DJCi300.samplerPadGroups[group];
    if (!padGroups) {
        return;
    }

    const status = DJCi300.LED[group].pads; // 0x96 / 0x97
    const baseNote = 0x30; // Sampler-Mode: Pads 1â€“8 â†’ 0x30â€“0x37

    for (let i = 0; i < 8; i++) {
        const samplerGroup = padGroups[i];
        const note = baseNote + i;

        if (!samplerGroup) {
            DJCi300.led.send(status, note, 0x00);
            continue;
        }

        // Track geladen?
        const loaded = DJCi300._isTrackLoaded(samplerGroup);
        if (!loaded) {
            DJCi300.led.send(status, note, 0x00);
            continue;
        }

        // Spielt der Sampler?
        const playing =
            engine.getValue(samplerGroup, "play") > 0 ||
            engine.getValue(samplerGroup, "play_indicator") > 0;

        let val = 0x7F; // geladen, aber nicht spielend
        if (playing && DJCi300._samplerBlinkPhase) {
            // beim Spielen im 500ms-Takt ausblenden
            val = 0x00;
        }

        DJCi300.led.send(status, note, val);
    }
};

DJCi300._refreshSamplerModeLEDs = function () {
    CHANNEL_GROUPS.forEach(g => {
        DJCi300._updateSamplerPadsForGroup(g);
    });
};

///////////////////////////////////////////////////////////////
// 7) VU-METER (Kalibrierung & Probe)
///////////////////////////////////////////////////////////////
// --- VU-Kalibrierung --------------------------------------------------------
// Ziel: Rot erst in den obersten ~3â€“5 % auf dem Controller (Mixxx-Gelb â‰  Rot).
// Stellschrauben:
//  - redGate:   Unterhalb dieses Mixxx-VU-Wertes (0..1) wird ROT hart unterdrÃ¼ckt.
//  - redStart:  CC-Grenze, ab der der Controller visuell in ROT geht (gerÃ¤teabhÃ¤ngig).
//  - gamma:     KrÃ¼mmung der Kurve (0.85â€“1.15). <1 = subjektiv â€žmehr GrÃ¼n/Yellowsâ€œ.
//  - scale:     Maximaler CC-Wert (normal 127).
// Messung: Rot beginnt am Hardware-VU bei CC = 125.
DJCi300.vuCfg = {
    main: {
        redGate: 0.997,
        redStart: 125,
        gamma: 0.90,
        scale: 127
    },
    deck: {
        redGate: 0.997,
        redStart: 125,
        gamma: 0.90,
        scale: 127
    },
};
DJCi300._vuScale = function (x, cfg) {
    // Clamp & Kurve
    const clamped = Math.max(0, Math.min(1, x));
    const curved = Math.pow(clamped, cfg.gamma);
    let v = Math.round(curved * cfg.scale);
    // ROT erst ganz oben zulassen
    if (clamped < cfg.redGate)
        v = Math.min(v, cfg.redStart - 1);
    // Sicherheit: 0..127
    return Math.max(0, Math.min(127, v));
};
// Master-VU â†’ On-Board-LEDs
DJCi300.vuMeterUpdateMain = function (value, _group, control) {
    const v = DJCi300._vuScale(value, DJCi300.vuCfg.main);
    const note = (control === "vu_meter_left") ? 0x40 : 0x41;
    DJCi300.led.send(0xB0, note, v);
};
// Deck-VU â†’ Kanal-VU des Controllers (pro Deck eigener CC-Status)
DJCi300.vuMeterUpdateDeck = function (value, group, _control, _status) {
    const v = DJCi300._vuScale(value, DJCi300.vuCfg.deck);
    const status = DJCi300.LED[group].vu;
    DJCi300.led.send(status, 0x40, v);
};

// Langsame VU-Probe (1 s pro CC)
DJCi300._VU_PROBE_INTERVAL_MS = 1000;
DJCi300._vuProbeTimer = -1;

DJCi300._probeVUHardwareRed = function () {
    if (DJCi300._vuProbeTimer !== -1) {
        try {
            engine.stopTimer(DJCi300._vuProbeTimer);
        } catch (e) {}
        DJCi300._vuProbeTimer = -1;
    }
    let cc = 120; // 120..127

    const send = (val) => {
        DJCi300.led.send(0xB0, 0x40, val, true); // Main L
        DJCi300.led.send(0xB0, 0x41, val, true); // Main R
        DJCi300.led.send(0xB1, 0x40, val, true); // Deck 1
        DJCi300.led.send(0xB2, 0x40, val, true); // Deck 2
    };

    const step = () => {
        send(cc);
        print("[VU Probe] CC = " + cc + " (0x" + cc.toString(16).toUpperCase() + ")");
        cc++;
        if (cc <= 127) {
            DJCi300._vuProbeTimer = engine.beginTimer(DJCi300._VU_PROBE_INTERVAL_MS, step, true);
        } else {
            send(0);
            DJCi300._vuProbeTimer = -1;
        }
    };

    step();
};

///////////////////////////////////////////////////////////////
// 7b) EXPERIMENTAL: DECK-3/4-REMAP - CONNECTION (RE)BUILD
///////////////////////////////////////////////////////////////
//
// Baut alle Engine-Connections auf, die frÃ¼her direkt im init()-Loop
// "for (group of CHANNEL_GROUPS)" lagen: Top-Row/Hotcue-Components,
// Deck-Observer (vu_meter, scratch2, toneplayPitchControl, end_of_track,
// beatsync_tempo, bpm/play fÃ¼r den Tempo-Guide, cue_preview/start_play,
// MIRRORS, stem_count), FX-Unit-Monitoring fÃ¼r dieses Deck sowie den
// Track-Load/Unload-Observer. `physicalGroup` ist immer der physische Strip
// ("[Channel1]"/"[Channel2]"); intern wird auf DJCi300._resolveGroup()
// aufgelÃ¶st. Wird sowohl beim init() (einmal pro Strip) als auch beim
// Deck-Toggle (DJCi300._rebindDeckConnections) aufgerufen.
DJCi300._buildDeckConnections = function (physicalGroup) {
    const rg = DJCi300._resolveGroup(physicalGroup);
    const deck = script.deckFromGroup(rg); // 1..4

    // Soft-Takeover fÃ¼r Pitch-Fader (Rate) aktivieren
    engine.softTakeover(rg, "rate", true);
    engine.softTakeoverIgnoreNextValue(rg, "rate");

    // Top-Row-LEDs per Components (Outputs only, kein Input-Mapping)
    DJCi300._buildTopRow(physicalGroup);
    // HOTCUE-Row per Components (Outputs only)
    DJCi300._buildHotcueRow(physicalGroup);

    // Observer + InitialzustÃ¤nde Ã¼ber _connectAs (Tracking-Key = physischer Strip,
    // tatsÃ¤chliches Ziel = aufgelÃ¶stes logisches Deck)
    _connectAs(physicalGroup, rg, "vu_meter", DJCi300.vuMeterUpdateDeck);
    _connectAs(physicalGroup, rg, "scratch2", DJCi300.updateScratchAction);
    _connectAs(physicalGroup, rg, DJCi300.toneplayPitchControl, DJCi300.updateToneplayLED);
    // EOT-Observer Ã¼ber natives Flag
    _connectAs(physicalGroup, rg, "end_of_track", (v, g) => {
        if (v > 0)
            DJCi300._startEOTBlink(g);
        else
            DJCi300._stopEOTBlink(g);
    });
    // Tempo-Only-Sync Blink auch dann, wenn GUI/andere Mappings beatsync_tempo auslÃ¶sen
    _connectAs(physicalGroup, rg, "beatsync_tempo", (v, g) => {
        if (v > 0)
            DJCi300._startSyncTempoBlink(g);
    });

    // Tempo-Guide: reagiert auf BPM- und Play-Ã„nderungen
    _connectAs(physicalGroup, rg, "bpm", DJCi300.updateBeatmatchTempoLED);
    _connectAs(physicalGroup, rg, "play", DJCi300.updateBeatmatchTempoLED);

    // Momentary-Quellen Ã¼berwachen â†’ auf Release ggf. PLAY 1x setzen (cue_preview/start_play)
    _connectAs(physicalGroup, rg, "cue_preview", DJCi300._onMomentaryRelease);
    _connectAs(physicalGroup, rg, "start_play", DJCi300._onMomentaryRelease);

    MIRRORS.forEach(m => _connectAs(physicalGroup, rg, m.key, DJCi300[m.handler]));

    // STEMS: bei Ã„nderung der Stem-Anzahl live neu aufbauen,
    // falls Bank 0x13 im STEMS-Mode ist
    _connectAs(physicalGroup, rg, "stem_count", function (_v, g) {
        if (DJCi300.padMode[g] === DJCi300.padModeToneplay && DJCi300.isStemsMode()) {
            DJCi300.stems.enter(g);
        }
    });

    // Nicht an ein Control gebunden: einmalig spiegeln
    DJCi300.updateVinylLED(physicalGroup);

    // --- FX-Unit-Monitoring fÃ¼r dieses Deck ---------------------------------
    // 2-Unit-Kurzform (fx123Toggle/updateFxButtonLED nutzen NUR Unit 1 fÃ¼r
    // ungerade / Unit 2 fÃ¼r gerade Decks - siehe DJCi300._fxUnitForDeck()).
    const shortUnit = DJCi300._fxUnitForDeck(deck);
    _connectAs(physicalGroup, `[EffectRack1_EffectUnit${shortUnit}]`, "enabled",
        () => DJCi300.updateFxButtonLED(physicalGroup));
    for (let slotIdx = 1; slotIdx <= 3; slotIdx++) {
        _connectAs(physicalGroup, `[EffectRack1_EffectUnit${shortUnit}_Effect${slotIdx}]`, "enabled",
            () => DJCi300.updateFxButtonLED(physicalGroup));
    }

    // 4-Unit Pad-LED-Mirroring fÃ¼r padModeFX (_updateFxPadsForDeck erwartet
    // physicalGroup und lÃ¶st `deck` intern selbst wieder auf).
    [1, 2, 3, 4].forEach((unitIdx) => {
        _connectAs(physicalGroup, `[EffectRack1_EffectUnit${unitIdx}]`,
            `group_[Channel${deck}]_enable`,
            () => DJCi300._updateFxPadsForDeck(physicalGroup));
    });
    const slotUnits = DJCi300._fxSlotUnitsForDeck(deck); // z.B. [1,3] oder [2,4] oder [3,1]/[4,2] fÃ¼r Deck 3/4
    slotUnits.forEach((unitIdx) => {
        for (let slotIdx = 1; slotIdx <= 3; slotIdx++) {
            _connectAs(physicalGroup, `[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`,
                "enabled",
                () => DJCi300._updateFxPadsForDeck(physicalGroup));
        }
    });

    // --- Track-Load/Unload: Transport-LEDs & Guides konsistent halten ------
    const trackLoadedCb = function (v, g) {
        g = g || physicalGroup;
        const st = DJCi300._st(g);

        if (v <= 0) {
            // Track entladen â†’ PLAY/CUE/SYNC aus, EOT beendet, Beatmatch-Guide neutralisiert.
            DJCi300._latchWanted[g] = false;
            DJCi300._cancelLatchWatch(g);
            DJCi300._stopEOTBlink(g);
            try {
                if (DJCi300._stopSyncTempoBlink) {
                    DJCi300._stopSyncTempoBlink(g);
                }
            } catch (e) {}

            DJCi300.led.send(st, 0x07, 0x00, true); // PLAY
            DJCi300.led.send(st, 0x06, 0x00, true); // CUE
            DJCi300.led.send(st, 0x05, 0x00, true); // SYNC

            // Beatmatch-Tempo-Guide global neutralisieren
            DJCi300._clearTempoGuideLEDs();

            // Align-Guide IMMER global lÃ¶schen, wenn ein Deck entladen wird
            DJCi300._clearAlignGuideLEDs();
            DJCi300._alignState = {
                ema: 0,
                dir: 0,
                lastEmit: Date.now()
            };
            // Loop-4-LED bei entladenem Track aus
            DJCi300._updateLoop4LED(g);
        } else {
            // Track geladen â†’ Top-Row-State neu triggern
            DJCi300._triggerTopRowState(g);
            // Loop-4-LED passend zum neuen Trackzustand setzen
            DJCi300._updateLoop4LED(g);
        }
    };
    _connectAs(physicalGroup, rg, "track_loaded", trackLoadedCb);
};

// EXPERIMENTAL: Deck-Index (1..4) â†’ welche EINZELNE FX-Unit die kompakte
// fx123Toggle/updateFxButtonLED-Kurzform benutzt. Deck 1&3 teilen sich
// historisch Unit 1 als "ihre" Kurzform-Unit auf dem linken physischen
// Strip, Deck 2&4 Unit 2 auf dem rechten - das entspricht 1:1 dem, was
// vorher hart "[Channel1]" -> 1 / sonst -> 2 war, jetzt aber pro PHYSISCHEM
// STRIP (nicht pro logischem Deck) konstant gehalten, damit der FX-Button
// beim Deck-Toggle nicht plÃ¶tzlich eine andere Unit anspricht.
DJCi300._fxUnitForDeck = function (deck) {
    return (deck === 1 || deck === 3) ? 1 : 2;
};

// EXPERIMENTAL: Welche zwei FX-Units liefern die Slot-LEDs/Auto-Arm fÃ¼r
// _updateFxPadsForDeck() im 4-Unit-Layer. Bleibt an den PHYSISCHEN Strip
// gekoppelt (Deck 1&3 -> Units 1/3, Deck 2&4 -> Units 2/4), analog zu
// _fxUnitForDeck - siehe Report fÃ¼r die bekannte EinschrÃ¤nkung bei den
// XML-fest verdrahteten "Route-to-Deck"-Pads (0x53/0x57/0x5B/0x5F).
DJCi300._fxSlotUnitsForDeck = function (deck) {
    return (deck === 1 || deck === 3) ? [1, 3] : [2, 4];
};

// EXPERIMENTAL: Trennt alle Connections/Components eines physischen Strips
// (Top-Row, Hotcue-Row, Deck-Observer, FX-Monitoring, Track-Load) und baut
// sie gegen das neu aktive logische Deck wieder auf. Wird vom Toggle-Handler
// (DJCi300.toggleDeckMode) aufgerufen, NICHT beim init().
DJCi300._rebindDeckConnections = function (physicalGroup) {
    // 1) Alte Connections fÃ¼r diesen Strip trennen
    const arr = DJCi300._conns[physicalGroup] || [];
    for (const c of arr) {
        try {
            c.disconnect();
        } catch (e) {}
    }
    DJCi300._conns[physicalGroup] = [];

    // 2) Top-Row/Hotcue-Row-Components sauber trennen (werden in
    //    _buildDeckConnections -> _buildTopRow/_buildHotcueRow neu gebaut)
    const cont = DJCi300._topRow[physicalGroup];
    if (cont) {
        Object.keys(cont).forEach(k => {
            const c = cont[k];
            if (c && typeof c.disconnect === "function") {
                try {
                    c.disconnect();
                } catch (e) {}
            }
        });
        DJCi300._topRow[physicalGroup] = null;
    }

    // 3) Alles neu aufbauen gegen das jetzt aktive logische Deck
    DJCi300._buildDeckConnections(physicalGroup);

    // 4) Initialen Track-Loaded-Zustand fÃ¼r das neue Ziel-Deck erneut anwenden
    //    (bereits durch _connectAs()'s init-trigger abgedeckt, hier zusÃ¤tzlich
    //    ein expliziter Refresh der Hotcue-Row, falls padMode == Hotcue)
    DJCi300._refreshHotcueRow(physicalGroup);
};

// EXPERIMENTAL: Aktualisiert ALLE Pad-/Mode-abhÃ¤ngigen LEDs eines physischen
// Strips fÃ¼r den aktuell gesetzten DJCi300.padMode[group], ohne den Mode
// selbst zu wechseln (im Unterschied zu changeMode(), das nur beim
// Enter/Leave-Ãœbergang reagiert). Wird nach einem Deck-Toggle aufgerufen,
// damit z.B. Hotcue-LEDs, STEMS-Mute-Pads, Toneplay-Semitone-LED,
// Beatloop/Beatjump-statische Reihen und FX-Pads sofort den Zustand des neu
// aktiven logischen Decks zeigen.
DJCi300._refreshPadModeLEDs = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const mode = DJCi300.padMode[group];

    switch (mode) {
        case DJCi300.padModeHotcue:
            DJCi300._refreshHotcueRow(group);
            break;
        case DJCi300.padModeRoll:
            DJCi300._refreshLoopPadLEDs(group);
            break;
        case DJCi300.padModeBeatjump:
            DJCi300._setPadRangeStatic(group, 0x70, 0x77, true);
            break;
        case DJCi300.padModeSlicer:
        case DJCi300.padModeSlicerloop:
            DJCi300._slicerUpdateLEDBeatjump(group);
            break;
        case DJCi300.padModeSampler:
            DJCi300._updateSamplerPadsForGroup(group);
            break;
        case DJCi300.padModeFX:
            DJCi300._updateFxPadsForDeck(group);
            break;
        case DJCi300.padModeToneplay:
            if (DJCi300.isStemsMode()) {
                DJCi300.stems.refresh(group);
            } else {
                const ctrlName = DJCi300.toneplayPitchControl;
                DJCi300._updateToneplayLEDOriginal(engine.getValue(rg, ctrlName), group, ctrlName);
            }
            break;
        default:
            break;
    }
};

// EXPERIMENTAL: Lichtet die LOAD-Taster-LED als Deck-3/4-Modusindikator.
// An = dieser physische Strip steuert gerade Deck 3/4, aus = Deck 1/2.
DJCi300._updateDeckModeIndicator = function (physicalGroup) {
    const isAlt = DJCi300._activeDeck[physicalGroup] === DJCi300._altDeck[physicalGroup];
    DJCi300.led.send(DJCi300._st(physicalGroup), DJCi300.LED.notes.LOAD, isAlt ? 0x7F : 0x00, true);
};

// EXPERIMENTAL: Haupt-Handler fÃ¼r SHIFT+LOAD A/B - toggelt, welches logische
// Deck der angegebene physische Strip gerade steuert (Channel1<->Channel3
// bzw. Channel2<->Channel4), baut alle Engine-Connections fÃ¼r diesen Strip
// neu auf (_rebindDeckConnections) und refresht sÃ¤mtliche LEDs (Top-Row,
// Loop, Loop-4, Vinyl, aktueller Pad-Mode, Deck-Modus-Indikator).
DJCi300.toggleDeckMode = function (_ch, _ctrl, value, _status, physicalGroup) {
    if (!value) {
        return; // nur auf Press reagieren
    }

    const current = DJCi300._activeDeck[physicalGroup];
    const alt = DJCi300._altDeck[physicalGroup];

    // Toggle: steht der Strip aktuell auf "physicalGroup" (Deck 1/2) -> alt
    // (Deck 3/4) wechseln, sonst zurÃ¼ck auf physicalGroup (Deck 1/2).
    DJCi300._activeDeck[physicalGroup] =
        (current === physicalGroup) ? alt : physicalGroup;

    print(`[Inpulse300] Deck-Toggle ${physicalGroup}: jetzt aktiv = ${DJCi300._activeDeck[physicalGroup]}`);

    // Alle Engine-Connections dieses Strips gegen das neue Ziel-Deck neu aufbauen
    DJCi300._rebindDeckConnections(physicalGroup);

    // LEDs komplett fÃ¼r diesen Strip neu ziehen
    DJCi300._triggerTopRowState(physicalGroup);
    DJCi300._updateLoop4LED(physicalGroup);
    DJCi300.updateVinylLED(physicalGroup);
    DJCi300._refreshPadModeLEDs(physicalGroup);
    DJCi300.updateFxButtonLED(physicalGroup);
    DJCi300.updateStemsModeIndicator();
    DJCi300._updateDeckModeIndicator(physicalGroup);

    // Beatmatch-Guide/EOT/Sync-Blink fÃ¼r diesen Strip sauber zurÃ¼cksetzen,
    // damit kein Blink-Rest vom vorherigen Deck hÃ¤ngen bleibt.
    if (DJCi300._stopSyncTempoBlink) {
        DJCi300._stopSyncTempoBlink(physicalGroup);
    }
};

///////////////////////////////////////////////////////////////
// 8) INIT / SHUTDOWN
///////////////////////////////////////////////////////////////

DJCi300.init = function () {
    // --- 1) Components patchen: LED-Ausgabe Ã¼ber DJCi300.led umleiten -------------
    if (!DJCi300._componentsPatched && typeof components !== "undefined") {
        DJCi300._componentsPatched = true;
        const _origSend = components.Component.prototype.send;
        components.Component.prototype.send = function (value) {
            if (!this.midi || this.midi[0] === undefined || this.midi[1] === undefined)
                return;
            // PrimÃ¤rkanal Ã¼ber unseren Cache
            DJCi300.led.send(this.midi[0], this.midi[1], value);
            if (this.sendShifted) {
                const off = (typeof this.shiftOffset === "number") ? this.shiftOffset : 0;
                if (this.shiftChannel && off) {
                    DJCi300.led.send(this.midi[0] + off, this.midi[1], value);
                } else if (this.shiftControl && off) {
                    DJCi300.led.send(this.midi[0], this.midi[1] + off, value);
                }
            }
        };
    }

    // --- 2) â€žDark Bootâ€œ & GrundzustÃ¤nde pro Deck -------------------------------
    //   - alle LEDs aus
    //   - Scratch/Vinyl-Status, Wheel-Touch, PadModes initialisieren
    DJCi300.led.clearAll();

    // ZustÃ¤nde (MÃœSSEN vor Komponenten / Slicer existieren!)
    DJCi300.scratchButtonState = {
        "[Channel1]": false,
        "[Channel2]": false
    };
    DJCi300.wheelTouchState = {
        "[Channel1]": false,
        "[Channel2]": false
    };
    DJCi300.scratchAction = {
        "[Channel1]": DJCi300.kScratchActionBend,
        "[Channel2]": DJCi300.kScratchActionBend
    };
    DJCi300._scratchEnabled = {
        "[Channel1]": false,
        "[Channel2]": false
    };
    DJCi300.padMode = {
        "[Channel1]": DJCi300.padModeNone,
        "[Channel2]": DJCi300.padModeNone
    };
    // Welcher physische Mode-Knopf zuletzt gedrÃ¼ckt wurde (vor der
    // Slicerâ†’Toneplay-Umleitung in changeMode) - bestimmt, auf welcher
    // Notenreihe (0x20 SLICER / 0x60 SLICER-LOOP) die Pads wirklich senden.
    DJCi300._physicalPadBank = {
        "[Channel1]": DJCi300.padModeNone,
        "[Channel2]": DJCi300.padModeNone
    };

    // --- 3) Main-/App-Verbindungen (VU + Heartbeats + Sanity-Checks) ----------
    // Main-VU auf Controller-VU-CCs routen
    DJCi300._conns.main.push(engine.makeConnection("[Main]", "vu_meter_left", DJCi300.vuMeterUpdateMain));
    DJCi300._conns.main.push(engine.makeConnection("[Main]", "vu_meter_right", DJCi300.vuMeterUpdateMain));

    // Heartbeats (zentral fÃ¼r Blink-Logik: SYNC-Blink, EOT, Loop-Adjust)
    DJCi300._conns.main.push(engine.makeConnection("[App]", "indicator_250ms", DJCi300._onHeartbeat250));
    DJCi300._conns.main.push(engine.makeConnection("[App]", "indicator_500ms", DJCi300._onHeartbeat500));

    // Sanity: fehlende Handler loggen (verhindert 'undefined is not a function')
    REQUIRED_HANDLERS.forEach((name) => {
        if (typeof DJCi300[name] !== "function") {
            print(`[Inpulse300] Missing function: ${name}`);
        }
    });

    // --- 3b) Sampler-LED-Mirroring: track_loaded / play beobachten ----------
    for (let i = 1; i <= 8; i++) {
        const sg = `[Sampler${i}]`;
        DJCi300._conns.main.push(
            engine.makeConnection(sg, "track_loaded", () => {
                DJCi300._refreshSamplerModeLEDs();
            }));
        DJCi300._conns.main.push(
            engine.makeConnection(sg, "play", () => {
                DJCi300._refreshSamplerModeLEDs();
            }));
    }

    // --- 4) Deck-spezifische Verbindungen & LED-Setup -------------------------
    // EXPERIMENTAL: In eine eigene Funktion ausgelagert (DJCi300._buildDeckConnections),
    // damit der Deck-3/4-Toggle (SHIFT+LOAD) exakt denselben Aufbau-Pfad beim
    // Rebind wiederverwenden kann statt Logik zu duplizieren. `group` ist hier
    // immer der PHYSISCHE Strip ("[Channel1]"/"[Channel2]"); innerhalb wird
    // ausschlieÃŸlich Ã¼ber DJCi300._resolveGroup(group) auf das aktive logische
    // Deck aufgelÃ¶st.
    for (const group of CHANNEL_GROUPS) {
        DJCi300._buildDeckConnections(group);
    }

    // --- 6) Track-Load/Unload: Transport-LEDs & Guides konsistent halten ------
    // (Ebenfalls Teil von _buildDeckConnections/_rebindDeckConnections - hier nur
    //  einmalig der Align-LED-Treiber, der bewusst NICHT pro Strip lÃ¤uft.)

    // Align-LED: einmalig
    // Nur EIN Callback treibt die Align-LEDs (Snapshot beider Decks)
    DJCi300._conns.main.push(engine.makeConnection("[Channel1]", "beat_distance", DJCi300.updateBeatmatchAlignLED));

    // ZusÃ¤tzlich: Play-Ã„nderungen beider Decks beobachten, damit der Align-Guide
    // auch beim Stop/Start sauber gelÃ¶scht wird, selbst wenn beat_distance nicht mehr lÃ¤uft.
    // HINWEIS: Bleibt bewusst an die REALEN Channel1/2-Signale gebunden (nicht
    // resolved) - siehe updateBeatmatchAlignLED()/_onPlayChangedForAlign(), die
    // beide explizit "[Channel1]"/"[Channel2]" snapshotten. Der Beatmatch-Guide
    // vergleicht damit IMMER die zwei physischen Strips, unabhÃ¤ngig davon,
    // welches logische Deck sie gerade steuern - das ist im Deck-3/4-Remap so
    // gewollt (die Anzeige bleibt an der Hardware-Position, nicht am Deck-Index).
    _connect("[Channel1]", "play", DJCi300._onPlayChangedForAlign);
    _connect("[Channel2]", "play", DJCi300._onPlayChangedForAlign);

    // --- 7) Default-Pad-Mode je Deck: HOTCUE (Mode 15) -----------------------
    engine.beginTimer(80, () => {
        for (const group of CHANNEL_GROUPS) {
            DJCi300.padMode[group] = DJCi300.padModeHotcue; // interner State
            DJCi300.changeMode(0, DJCi300.padModeHotcue, 1, 0, group); // â€žButtonpressâ€œ simulieren
        }
        DJCi300._triggerTopRows();
    }, true);

    // --- 8) FX via Components â€“ optionales â€žnativâ€œ-Layer ---------------------
    // Liefert sauberes Soft-Takeover/Focus-Plumbing fÃ¼r die Units.
    // (Deine Macro-Taste/LED-Logik bleibt unverÃ¤ndert nutzbar.)
    try {
        DJCi300._fxEU1 = new components.EffectUnit(1, /*allowFocusWhenParametersHidden*/ true);
        DJCi300._fxEU2 = new components.EffectUnit(2, /*allowFocusWhenParametersHidden*/ true);
        // Falls der Controller Zuweisungs-Buttons hat, kÃ¶nnen die hier Ã¼ber Components
        // angebunden werden (Mapping im XML vorausgesetzt). Schadet nicht, wenn unbenutzt.
        DJCi300._fxEU1.enableOnChannelButtons.addButton("Channel1");
        DJCi300._fxEU1.enableOnChannelButtons.addButton("Channel2");
        DJCi300._fxEU2.enableOnChannelButtons.addButton("Channel1");
        DJCi300._fxEU2.enableOnChannelButtons.addButton("Channel2");
        DJCi300._fxEU1.init();
        DJCi300._fxEU2.init();
    } catch (e) {
        print("[Inpulse300] Components EffectUnit init skipped: " + e);
    }

    // --- 9) Controller â†’ GUI-State anfordern (Handshake) ---------------------
    DJCi300.led.send(0xB0, 0x7F, 0x7F);
    DJCi300.led.send(0xB1, 0x7F, 0x7F);
    DJCi300.led.send(0xB2, 0x7F, 0x7F);

    // --- 10) Startup-LEDs & Top-State-LEDs NACH dem Wipe setzen --------------
    engine.beginTimer(160, function () { // > 120ms aus clearAllLEDs()
        DJCi300.led.setFixedStartupLEDs(); // Browser-LED etc.
        DJCi300._triggerTopRows(); // Top-Row neu ziehen
        DJCi300.updateStemsModeIndicator(); // Shift+Q
        // Loop-4-LED direkt nach dem Boot einmal sauber initialisieren
        CHANNEL_GROUPS.forEach(g => DJCi300._updateLoop4LED(g))
        // EXPERIMENTAL: Deck-3/4-Modusindikator (LOAD-LED) auf Boot-Zustand setzen (immer aus, da Default = Deck 1/2)
        CHANNEL_GROUPS.forEach(g => DJCi300._updateDeckModeIndicator(g))
    }, true);

    // Optional: kleiner zweiter Retry, falls das GUI direkt danach nochmals schreibt
    engine.beginTimer(500, function () {
        DJCi300._triggerTopRows();
        DJCi300.updateStemsModeIndicator();
        // Falls der erste Timer vom GUI â€žÃ¼bermaltâ€œ wurde, hier nochmal nachziehen
        CHANNEL_GROUPS.forEach(g => DJCi300._updateLoop4LED(g));
        CHANNEL_GROUPS.forEach(g => DJCi300._updateDeckModeIndicator(g));
    }, true);

    // --- 11) Browser LEDs -----------------------------------
    // Browser/AutoDJ â†’ farbige Browser-LED (90 05) mit klaren Modi:
    //  - Gelb  (0x7C): AutoDJ aktiv.
    //  - WeiÃŸ  (0x7F): Library maximiert.
    //  - GrÃ¼n  (0x3C): beide Decks stehen â†’ â€žsicher zum Ladenâ€œ.
    //  - Blau  (0x0B): mindestens ein Deck spielt â†’ â€žMix-Modusâ€œ.
    _connect("[Skin]", "show_maximized_library", (v) => {
        DJCi300._browseState.visible = !!v;
        DJCi300._updateBrowseLED(DJCi300._browseState);
    });
    _connect("[AutoDJ]", "enabled", (v) => {
        DJCi300._browseState.autoDJOn = !!v;
        DJCi300._updateBrowseLED(DJCi300._browseState);
    });

    // Play-Status beider Decks beeinflusst GrÃ¼n/Blau
    CHANNEL_GROUPS.forEach(g => {
        _connect(g, "play", () => {
            DJCi300._updateBrowseLED(DJCi300._browseState);
        });
    });

    // Initialen Zustand nach dem Start einmal durchrechnen
    DJCi300._browseState.visible = !!engine.getValue("[Skin]", "show_maximized_library");
    DJCi300._browseState.autoDJOn = !!engine.getValue("[AutoDJ]", "enabled");
    DJCi300._updateBrowseLED(DJCi300._browseState);

};

// Shutdown: sauber, minimaler Traffic
DJCi300.shutdown = function () {
    // offenes scratch2-Release-Abo kappen
    for (const g of CHANNEL_GROUPS) {
        try {
            if (DJCi300._scratchReleaseConn[g]) {
                DJCi300._scratchReleaseConn[g].disconnect();
            }
        } catch (e) {}
        DJCi300._scratchReleaseConn[g] = null;
    }
    // Ab hier: keine LED-Sends mehr zulassen â€“ auch nicht "force"
    DJCi300._shutdownInProgress = true;
    DJCi300._suppressLEDs = true;

    // Timer stoppen
    try {
        if (DJCi300.browseLongPressTimer !== -1) {
            engine.stopTimer(DJCi300.browseLongPressTimer);
            DJCi300.browseLongPressTimer = -1;
        }
        if (DJCi300._vuProbeTimer !== -1) {
            engine.stopTimer(DJCi300._vuProbeTimer);
            DJCi300._vuProbeTimer = -1;
        }
    } catch (e) {}
    for (const g of CHANNEL_GROUPS) {
        // Latch-Watcher sauber beenden
        DJCi300._latchWanted[g] = false;
        DJCi300._cancelLatchWatch(g);
        DJCi300._stopLoopBlink(g);
        try {
            if (DJCi300._stopSyncTempoBlink)
                DJCi300._stopSyncTempoBlink(g);
        } catch (e) {}
        try {
            DJCi300._stopEOTBlink(g);
        } catch (e) {}
        // Brake-Watcher sauber beenden
        try {
            DJCi300._cancelBrakeWatch(g);
        } catch (e) {}
        DJCi300._brakeInProgress[g] = false;
        DJCi300._brakeCompleted[g] = false;
        DJCi300._shiftBrakeWasPlaying[g] = false;
        DJCi300._brakeStallCount[g] = 0;
        DJCi300._stopShiftBend(g);
    }

    // STEMS sauber abbauen (LED-Sends sind durch _shutdownInProgress bereits unterdrÃ¼ckt)
    try {
        DJCi300.stems.leave("[Channel1]");
    } catch (e) {}
    try {
        DJCi300.stems.leave("[Channel2]");
    } catch (e) {}

    // Verbindungen lÃ¶sen (keine spÃ¤ten GUI-Sends mehr)
    try {
        for (const key in DJCi300._conns) {
            const arr = DJCi300._conns[key];
            if (!Array.isArray(arr)) {
                continue;
            }
            for (const c of arr) {
                try {
                    c.disconnect();
                } catch (e) {}
            }
            DJCi300._conns[key] = [];
        }
    } catch (e) {}

    // Components-Top-Row sauber trennen
    try {
        for (const g of CHANNEL_GROUPS) {
            const cont = DJCi300._topRow[g];
            if (!cont)
                continue;
            Object.keys(cont).forEach(k => {
                const c = cont[k];
                if (c && typeof c.disconnect === "function") {
                    try {
                        c.disconnect();
                    } catch (e) {}
                }
            });
            DJCi300._topRow[g] = null;
        }
    } catch (e) {}

    // Handshake aus (manche Firmware relatcht sonst LEDs)
    try {
        midi.sendShortMsg(0xB0, 0x7F, 0x00);
        midi.sendShortMsg(0xB1, 0x7F, 0x00);
        midi.sendShortMsg(0xB2, 0x7F, 0x00);
    } catch (e) {}

    // Minimal-Traffic: nur anstehende LEDs/CCs aus dem Cache ausschalten
    DJCi300.led.targetedWipeFromCache();

    // Cache leeren
    DJCi300.led.cache = Object.create(null);
};
///////////////////////////////////////////////////////////////
// 9) BEATMATCH LED GUIDE (Tempo/Align)
///////////////////////////////////////////////////////////////

// Beatmatch-Guide zentral aktivierbar (optional komplett abschaltbar).
//  - tempoGuideEnabled: steuert die TEMPO-LED-Paare (Tempo-Differenz).
//  - alignGuideEnabled: steuert die ALIGN-LED-Paare (Phasen-Differenz)
DJCi300.tempoGuideEnabled = true;
DJCi300.alignGuideEnabled = true;

// --- Ruhiger Align-Guide: EMA + Hysterese + Rate-Limit (ein Callback) -----
// Nutzt die Differenz der beat_distance-Werte beider Decks:
//  - alignEMAAlpha:    GlÃ¤ttung der Rohwerte (0.2 ruhiger, 0.4 direkter).
//  - alignTolOn/Off:   Schwellwerte mit Hysterese (Schmitt-Trigger).
//  - alignMinUpdateMs: Minimalabstand zwischen LED-Updates (Flackerschutz).
DJCi300.alignEMAAlpha = 0.30; // 0.2 ruhiger, 0.4 direkter
DJCi300.alignTolOn = 0.05; // LED AN ab |ema| >= 0.05 Beats
DJCi300.alignTolOff = 0.03; // LED AUS ab |ema| <= 0.03 Beats
DJCi300.alignMinUpdateMs = 120; // min. Abstand LED-Updates
DJCi300._alignState = {
    ema: 0,
    dir: 0,
    lastEmit: 0
};

// Toleranz in BPM: unterhalb dieses Unterschieds bleiben die TEMPO-Pfeile aus.
DJCi300.beatmatchTempoTolerance = 0.3; // z.B. ~0,3 BPM

// Hilfsfunktionen: Beatmatch-LEDs zentral lÃ¶schen
DJCi300._clearTempoGuideLEDs = () => {
    const n = DJCi300.LED.notes;
    CHANNEL_GROUPS.forEach(group => {
        const st = DJCi300._st(group);
        DJCi300.led.send(st, n.TEMPO_L, 0x00);
        DJCi300.led.send(st, n.TEMPO_R, 0x00);
    });
};

DJCi300._clearAlignGuideLEDs = () => {
    const n = DJCi300.LED.notes;
    CHANNEL_GROUPS.forEach(group => {
        const st = DJCi300._st(group);
        DJCi300.led.send(st, n.ALIGN_L, 0x00);
        DJCi300.led.send(st, n.ALIGN_R, 0x00);
    });
};

// Wenn sich der Play-Status Ã¤ndert und nicht mehr beide Decks gleichzeitig spielen,
// Align-Guide komplett zurÃ¼cksetzen (LEDs + interner State).
DJCi300._onPlayChangedForAlign = function (_value, _group, _control) {
    if (!DJCi300._bothPlayingLoaded()) {
        DJCi300._clearAlignGuideLEDs();
        DJCi300._alignState = {
            ema: 0,
            dir: 0,
            lastEmit: Date.now()
        };
    }
};

// Beatmatch-Guide (Tempo) nach KISS:
//  - Basis: aktuelle BPM von Channel1 und Channel2 (Mixxx-Control "bpm" â†’ Tempo inkl. Pitch-Fader).
//  - Channel1 = Referenz, Channel2 = anzupassen.
//  - Wenn |d1 - d2| < beatmatchTempoTolerance (in BPM) â†’ keine Pfeile.
//  - Sonst: LED-Muster wie im Original-Mapping, aber Ã¼ber den LED-Cache.
DJCi300.updateBeatmatchTempoLED = function (_value, _group, _control) {
    if (!DJCi300.tempoGuideEnabled) {
        DJCi300._clearTempoGuideLEDs();
        return;
    }

    const g1 = "[Channel1]";
    const g2 = "[Channel2]";

    // Nur wenn beide Decks spielen UND ein Track geladen ist
    if (!DJCi300._isTrackLoaded(g1) || !DJCi300._isTrackLoaded(g2) ||
        engine.getValue(g1, "play") === 0 ||
        engine.getValue(g2, "play") === 0) {
        DJCi300._clearTempoGuideLEDs();
        return;
    }

    const d1 = engine.getValue(g1, "bpm");
    const d2 = engine.getValue(g2, "bpm");

    if (!Number.isFinite(d1) || !Number.isFinite(d2) || d1 <= 0 || d2 <= 0) {
        DJCi300._clearTempoGuideLEDs();
        return;
    }

    if (Math.abs(d1 - d2) < DJCi300.beatmatchTempoTolerance) {
        DJCi300._clearTempoGuideLEDs();
        return;
    }

    const s1 = DJCi300._st(g1);
    const s2 = DJCi300._st(g2);
    const n = DJCi300.LED.notes;

    if (d1 > d2) {
        // d1 > d2: Deck 1 schneller als Deck 2
        // â†’ Muster wie im Original-Code (LEDs gespiegelt)
        DJCi300.led.send(s1, n.TEMPO_L, 0x7F);
        DJCi300.led.send(s1, n.TEMPO_R, 0x00);
        DJCi300.led.send(s2, n.TEMPO_L, 0x00);
        DJCi300.led.send(s2, n.TEMPO_R, 0x7F);
    } else {
        // d2 > d1: Deck 2 schneller als Deck 1
        DJCi300.led.send(s1, n.TEMPO_L, 0x00);
        DJCi300.led.send(s1, n.TEMPO_R, 0x7F);
        DJCi300.led.send(s2, n.TEMPO_L, 0x7F);
        DJCi300.led.send(s2, n.TEMPO_R, 0x00);
    }
};

// Beatmatch-Guide (Align/Phase):
//  - Trigger: beat_distance von Channel1 (ein Treiber pro Tick â†’ kein LED-Duell).
//  - Grundlage: Phasendifferenz der beiden Decks, sauber auf (-0.5 .. +0.5] gewrappt.
//  - Ausgabe: ALIGN_L/ALIGN_R (welches Deck â€žvorâ€œ oder â€žhinterâ€œ liegt).
DJCi300.updateBeatmatchAlignLED = function (_value, group, _control) {
    // Optional komplett aus
    if (!DJCi300.alignGuideEnabled) {
        DJCi300._clearAlignGuideLEDs();
        DJCi300._alignState = {
            ema: 0,
            dir: 0,
            lastEmit: Date.now()
        };
        return;
    }

    // Nur EIN Treiber (Channel1), sonst â€žduellierendeâ€œ Updates â†’ Flackern.
    if (group !== "[Channel1]")
        return;

    // Wenn nicht beide Decks spielen oder kein Track geladen ist:
    //  - LEDs aus
    //  - internen State zurÃ¼cksetzen (kein â€žNachziehenâ€œ beim nÃ¤chsten Start).
    if (!DJCi300._bothPlayingLoaded()) {
        DJCi300._clearAlignGuideLEDs();
        DJCi300._alignState = {
            ema: 0,
            dir: 0,
            lastEmit: Date.now()
        };
        return;
    }

    // Snapshot beider Phasen und sauber wrappen auf (-0.5 .. +0.5]
    const a1 = engine.getValue("[Channel1]", "beat_distance");
    const a2 = engine.getValue("[Channel2]", "beat_distance");
    const rawDiff = a1 - a2;
    const diff = rawDiff - Math.round(rawDiff); // Wrap statt if/else

    // EMA-GlÃ¤ttung
    const S = DJCi300._alignState;
    S.ema += DJCi300.alignEMAAlpha * (diff - S.ema);
    const now = Date.now();

    // Hysterese (Schmitt-Trigger) auf Basis der geglÃ¤tteten Differenz:
    //  -1 = Channel1 zu spÃ¤t (links nachziehen).
    //  +1 = Channel1 zu frÃ¼h (rechts warten/zurÃ¼ckziehen).
    //   0 = innerhalb der Toleranz â†’ LEDs aus.
    const abs = Math.abs(S.ema);
    let newDir = S.dir; // -1 = Ch1 zu spÃ¤t (links), +1 = Ch1 zu frÃ¼h (rechts), 0 = ok
    if (abs >= DJCi300.alignTolOn)
        newDir = (S.ema > 0 ? +1 : -1);
    if (abs <= DJCi300.alignTolOff)
        newDir = 0;

    // Rate-Limit/Coalescing: LED-Updates hÃ¶chstens alle alignMinUpdateMs.
    if (newDir === S.dir && (now - S.lastEmit) < DJCi300.alignMinUpdateMs)
        return;
    S.dir = newDir;
    S.lastEmit = now;

    const st1 = DJCi300._st("[Channel1]");
    const st2 = DJCi300._st("[Channel2]");
    const n = DJCi300.LED.notes;

    if (newDir === 0) {
        DJCi300._clearAlignGuideLEDs();
        return;
    }

    const leftOn1 = (newDir < 0) ? 0x7F : 0x00;
    const rightOn1 = (newDir > 0) ? 0x7F : 0x00;

    // Anzeige wird â€“ wie beim Tempo-Guide â€“ gespiegelt, damit die Richtungshilfe
    // aus Sicht beider Decks konsistent ist.
    DJCi300.led.send(st1, n.ALIGN_L, leftOn1);
    DJCi300.led.send(st1, n.ALIGN_R, rightOn1);
    DJCi300.led.send(st2, n.ALIGN_L, rightOn1);
    DJCi300.led.send(st2, n.ALIGN_R, leftOn1);
};

///////////////////////////////////////////////////////////////
// 10) VINYL / SCRATCH / JOG
///////////////////////////////////////////////////////////////

// Scratch-ZustÃ¤nde / interne Flags
DJCi300.kScratchActionBend = 0;
DJCi300.kScratchActionScratch = 1;
DJCi300.kScratchActionSeek = 2;

// Merker: Haben WIR scratchEnable() gesetzt? (verhindert "Killing scratch timer 0")
DJCi300._scratchEnabled = {
    "[Channel1]": false,
    "[Channel2]": false,
};

// PPR-Counter nur fÃ¼r Debug-PPR-Messung
DJCi300._pprCount = {
    "[Channel1]": 0,
    "[Channel2]": 0,
};

// Dieser Abschnitt kapselt:
//  - Umschalten des Vinyl-/Scratch-Modes (Button + LED)
//  - Scratch-/Jog-Handling inkl. Auto-Disable bei zu langsamer Bewegung
//  - relative Jog-Werte (Format-Erkennung + Normalisierung)
//  - ramped Scratch-Release
//  - Play/Cue-Logik inkl. Brake/SoftStart im Vinyl-Mode

// Vinyl/Scratch-Toggle; der LED-Status wird zentral in updateVinylLED gespiegelt.
// Pro Deck wird nur ein boolescher State gehalten; tatsÃ¤chliches Scratch-Verhalten
// hÃ¤ngt zusÃ¤tzlich vom Play-Zustand ab.
// EXPERIMENTAL: LOAD A/B muss durch _resolveGroup, sonst laedt es immer auf
// Channel1/2 statt auf das aktuell aktive logische Deck (Channel3/4).
// LoadSelectedTrack ist ein reiner Mixxx-Control ohne Script-Anbindung,
// deshalb kann die XML hier nicht mehr direkt binden.
DJCi300.loadTrack = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    engine.setValue(rg, "LoadSelectedTrack", 1);
};

// EXPERIMENTAL: generic deck-aware passthroughs -----------------------------
// A large set of controls (hotcues, beatloop/beatjump pads, loop halve/
// double, PFL/quantize/slip/eject, volume/pregain) were previously bound
// directly in the XML to the raw Mixxx control name on [Channel1]/[Channel2]
// (<normal/> options, no <script-binding/>). Since that bypasses the JS
// entirely, none of them could ever be redirected to Deck 3/4 - pressing a
// hotcue pad while "on Deck 3" silently fired on Deck 1 instead, which is
// indistinguishable from "the pad doesn't work" when you're looking at
// Deck 3's waveform. Every one of those controls now routes through one of
// the two generic dispatchers below, keyed off the physical MIDI note via
// _passthroughByNote, so they resolve through DJCi300._resolveGroup like
// every other control in this mapping.

// note -> real Mixxx control name, for momentary/toggle button controls
// (value forwarded as-is: press=1/release=0, or a single trigger pulse).
DJCi300._passthroughButtonByNote = {
    // Hotcues SET (0x00-0x07) / CLEAR (0x08-0x0F) - same note layout on both decks
    0x00: "hotcue_1_activate", 0x01: "hotcue_2_activate", 0x02: "hotcue_3_activate", 0x03: "hotcue_4_activate",
    0x04: "hotcue_5_activate", 0x05: "hotcue_6_activate", 0x06: "hotcue_7_activate", 0x07: "hotcue_8_activate",
    0x08: "hotcue_1_clear", 0x09: "hotcue_2_clear", 0x0A: "hotcue_3_clear", 0x0B: "hotcue_4_clear",
    0x0C: "hotcue_5_clear", 0x0D: "hotcue_6_clear", 0x0E: "hotcue_7_clear", 0x0F: "hotcue_8_clear",
    // Loop/Roll mode static row (0x10-0x17)
    0x10: "beatloop_1", 0x11: "beatloop_2", 0x12: "beatloop_4", 0x13: "beatloop_8",
    0x14: "beatloop_16", 0x15: "beatloop_0.125", 0x16: "beatloop_0.25", 0x17: "beatloop_0.5",
    // Beatloop bank (0x30-0x37)
    0x30: "beatloop_0.125", 0x31: "beatloop_0.25", 0x32: "beatloop_0.5", 0x33: "beatloop_1",
    0x34: "beatloop_2", 0x35: "beatloop_4", 0x36: "beatloop_8", 0x37: "beatloop_16",
    // Beatjump bank (0x70-0x77)
    0x70: "beatjump_1_backward", 0x71: "beatjump_1_forward",
    0x72: "beatjump_2_backward", 0x73: "beatjump_2_forward",
    0x74: "beatjump_4_backward", 0x75: "beatjump_4_forward",
    0x76: "beatjump_32_backward", 0x77: "beatjump_32_forward",
};
DJCi300.passthroughButton = function (_ch, control, value, _st, group) {
    const name = DJCi300._passthroughButtonByNote[control];
    if (!name) {
        print(`[Inpulse300] passthroughButton: unmapped note 0x${control.toString(16)}`);
        return;
    }
    const rg = DJCi300._resolveGroup(group);
    const isLoopPad = control >= DJCi300._loopPadBase && control <= DJCi300._loopPadBase + 7 &&
        DJCi300.padMode[group] === DJCi300.padModeRoll;

    if (isLoopPad) {
        // EXPERIMENTAL: beatloop_N_activate only ACTIVATES that loop size -
        // per Mixxx's own docs it does not toggle off on a second press, and
        // release is a no-op. To get real press-on/press-off behaviour we
        // track it ourselves: if this exact pad's loop is already the active
        // one, a second press calls reloop_toggle (which DOES disable an
        // enabled loop); otherwise it (re)activates at this pad's size.
        if (!value) {
            return;
        }
        const idx = control - DJCi300._loopPadBase;
        const size = DJCi300._loopPadSizes[idx];
        const loopOn = engine.getValue(rg, "loop_enabled") > 0;
        const currentSize = loopOn ? engine.getValue(rg, "beatloop_size") : -1;
        const isThisPadActive = Math.abs(currentSize - size) < 1e-6;

        if (isThisPadActive) {
            engine.setValue(rg, "reloop_toggle", 1);
        } else {
            engine.setValue(rg, name, 1);
        }
        DJCi300._refreshLoopPadLEDs(group);
        return;
    }

    engine.setValue(rg, name, value ? 1 : 0);
};

// Toggle-style controls (press flips the value; release is a no-op) -
// PFL/quantize/slip_enabled/loop_halve/loop_double/eject all behave this way
// via their own real Mixxx control, one dedicated function each since they
// don't share a single note bank the way hotcues/beatloop/beatjump do.
DJCi300._makeToggleFn = function (controlName) {
    return function (_ch, _ctrl, value, _st, group) {
        if (!value)
            return;
        const rg = DJCi300._resolveGroup(group);
        script.toggleControl(rg, controlName);
    };
};
DJCi300.togglePfl = DJCi300._makeToggleFn("pfl");
DJCi300.toggleQuantize = DJCi300._makeToggleFn("quantize");
DJCi300.toggleSlip = DJCi300._makeToggleFn("slip_enabled");
DJCi300.ejectTrack = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    engine.setValue(rg, "eject", 1);
};
DJCi300.loopHalve = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    engine.setValue(rg, "loop_halve", 1);
};
DJCi300.loopDouble = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    engine.setValue(rg, "loop_double", 1);
};

// Continuous faders (volume/pregain): unlike a plain <normal/> XML binding
// (which Mixxx pre-scales to 0..1 internally before touching the control),
// a script-binding receives the raw 7-bit MIDI value (0..127) - it must be
// scaled by hand via script.absoluteLin, or the fader would only ever cover
// the bottom sliver of the control's real range.
DJCi300.passthroughVolume = function (_ch, _ctrl, value, _st, group) {
    const scaled = script.absoluteLin(value, 0, 1);
    engine.setValue(DJCi300._resolveGroup(group), "volume", scaled);
};
DJCi300.passthroughPregain = function (_ch, _ctrl, value, _st, group) {
    const scaled = script.absoluteLin(value, 0, 1);
    engine.setValue(DJCi300._resolveGroup(group), "pregain", scaled);
};

// Rate/pitch fader: hardware sends 14-bit MSB then LSB as two separate CCs
// (<fourteen-bit-msb/>/<fourteen-bit-lsb/> in the WORKING mapping normally
// reassemble this for us before calling a handler - script-binding does NOT
// support those option tags, so both halves are bound as plain 7-bit CCs
// here and reassembled by hand below). MSB note 0x08, LSB note 0x28 on both
// decks. Mixxx's `rate` control range is [-1, 1]; the 14-bit raw range is
// 0..16383 with center at 8192.
DJCi300._rateMSB = { "[Channel1]": 0, "[Channel2]": 0 };
DJCi300._rateLSB = { "[Channel1]": 0, "[Channel2]": 0 };
DJCi300._applyRate14bit = function (group) {
    const raw14 = ((DJCi300._rateMSB[group] & 0x7F) << 7) | (DJCi300._rateLSB[group] & 0x7F);
    const normalized = (raw14 - 8192) / 8192; // -1..~+1
    const rg = DJCi300._resolveGroup(group);
    engine.setValue(rg, "rate", normalized);
};
DJCi300.rateMSB = function (_ch, _ctrl, value, _st, group) {
    DJCi300._rateMSB[group] = value;
    DJCi300._applyRate14bit(group);
};
DJCi300.rateLSB = function (_ch, _ctrl, value, _st, group) {
    DJCi300._rateLSB[group] = value;
    DJCi300._applyRate14bit(group);
};

DJCi300.vinylButton = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    DJCi300.scratchButtonState[group] = !DJCi300.scratchButtonState[group];
    if (!DJCi300.scratchButtonState[group]) {
        DJCi300._stopAllVinylFx(script.deckFromGroup(DJCi300._resolveGroup(group)));
    }
    DJCi300.updateVinylLED(group);
};

// Scratch-Initialisierung (PPR, Platter-Speed, Alpha/Beta).
// Aktiviert prÃ¤zises Scratch-Verhalten fÃ¼r ein Deck Ã¼ber engine.scratchEnable().
// Wird von den Touch-Handlern (wheelTouch / wheelTouchShift) aufgerufen, wenn
// Vinyl-/Scratch-Mode aktiv ist bzw. Seek-Scratch benutzt wird.
// HINWEIS (EXPERIMENTAL): `deck` ist hier bereits das AUFGELÃ–STE logische
// Deck (1..4). DJCi300._scratchEnabled bleibt aber pro PHYSISCHEM Strip
// indiziert und wird ausschlieÃŸlich von den Aufrufern (wheelTouch/
// wheelTouchShift) direkt danach gesetzt - hier deshalb bewusst NICHT mehr
// zusÃ¤tzlich `[Channel${deck}]` schreiben (wÃ¤re bei Deck 3/4 ein toter,
// nie gelesener Key).
DJCi300._scratchEnable = function (deck) {
    const alpha = DJCi300.scratchAlpha;
    const beta = DJCi300.scratchBeta;
    engine.scratchEnable(deck, DJCi300.jogPPR, 33 + 1 / 3, alpha, beta);
};

// Umwandlung des relativen 7-Bit-Jog-Werts in eine Schrittweite Â±1..Â±7.
// Hintergrund:
//  - Controller sendet 7-Bit relative Werte (verschiedene Herstellerformate).
//  - Auto-Detection des Formats: Zweierkomplement vs. Sign-Magnitude.
//  - Ergebnis: normalisierte Schrittweite, begrenzt auf |step| <= 7.
DJCi300._wheelFormat = null; // "twos" | "signmag"
DJCi300._detectWheel = function (v) {
    // Ein einzelner kleiner Schritt â‰¥0x40 deutet auf Zweierkomplement hin.
    if (v === 0x01 || v === 0x7F) { // klassisch: Â±1 Schritte
        DJCi300._wheelFormat = "twos";
    } else {
        DJCi300._wheelFormat = (v & 0x40) ? "signmag" : "twos";
    }
};
DJCi300._convertWheelRotation = function (value) {
    if (DJCi300._wheelFormat === null)
        DJCi300._detectWheel(value);
    let step;
    if (DJCi300._wheelFormat === "twos") {
        step = (value >= 0x40) ? (value - 0x80) : value;
    } else {
        const mag = value & 0x3F; // 6-Bit Magnitude
        step = (value & 0x40) ? -mag : +mag; // Bit 6 = Vorzeichen
    }
    if (step > 7)
        step = 7;
    if (step < -7)
        step = -7;
    return step;
};

// Automatisches ZurÃ¼ckschalten von Scratchâ†’Bend, wenn Bewegung unter slipThreshold
// und kein Touch mehr anliegt.
// Nur aktiv, wenn dieses Skript scratchEnable() gesetzt hat (_scratchEnabled).
// Das verhindert, dass externe scratchEnable()-Aufrufe â€žweggedrÃ¼cktâ€œ werden.
DJCi300.updateScratchAction = function (value, group, _control) {
    const deck = script.deckFromGroup(DJCi300._resolveGroup(group));
    // Defensiv: Falls 'scratch2' keinen sinnvollen Wert liefert, niemals versehentlich
    // einen â€žkleinen Slipâ€œ simulieren, der Scratch abschaltet.
    if (!Number.isFinite(value)) {
        value = 1; // klar Ã¼ber slipThreshold halten
    }
    // Nur dann disableâ€™n, wenn wir selbst vorher enableâ€™t haben.
    if ((Math.abs(value) < DJCi300.slipThreshold) &&
        DJCi300._scratchEnabled[group] &&
        engine.isScratching(deck) &&
        !DJCi300.wheelTouchState[group]) {
        engine.scratchDisable(deck, true);
        DJCi300._scratchEnabled[group] = false;
        DJCi300.scratchAction[group] = DJCi300.kScratchActionBend;
    }
};

// Optional: ramped scratch release (Danke JosepMa).
// Statt Scratch sofort zu deaktivieren, wird Ã¼ber scratch2 eine Rampe beobachtet,
// bis sich der Teller â€žnatÃ¼rlichâ€œ beruhigt hat, bevor scratchDisable() aufgerufen wird.
DJCi300.rampedScratchRelease = true;
DJCi300._scratchReleaseConn = {
    "[Channel1]": null,
    "[Channel2]": null
};
DJCi300._scratchReleaseTarget = {
    "[Channel1]": 1.0,
    "[Channel2]": 1.0
};

// Jog-Touch: wÃ¤hlt je nach Play-Status und Vinyl-Modus zwischen Scratch und Bend.
// EXPERIMENTAL: `group` = physischer Strip (State-Dicts bleiben darauf indiziert);
// alle Engine-Zugriffe (getValue/makeConnection/scratchEnable/deckFromGroup)
// laufen Ã¼ber `rg` = DJCi300._resolveGroup(group).
DJCi300.wheelTouch = function (_channel, _control, value, _status, group) {
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);

    // Jeder neue Touch: Vinyl-FX stoppen, Brake-Flags zurÃ¼cksetzen.
    if (value > 0) {
        DJCi300._stopAllVinylFx(deck);
        DJCi300._brakeInProgress[group] = false;
    }
    if (value > 0) {
        if (DJCi300.debugPPR) {
            DJCi300._pprCount[group] = 0;
            print("[PPR] Starte Messung â€“ drehe exakt 1 Umdrehung, dann loslassen.");
        }
        if ((engine.getValue(rg, "play") !== 1) || (DJCi300.scratchButtonState[group])) {
            DJCi300._scratchEnable(deck);
            DJCi300._scratchEnabled[group] = true;
            DJCi300.wheelTouchState[group] = true;
            DJCi300.scratchAction[group] = DJCi300.kScratchActionScratch;
        } else {
            DJCi300.scratchAction[group] = DJCi300.kScratchActionBend;
        }
    } else {
        DJCi300.wheelTouchState[group] = false;
        // Ramped Release (optional)
        if (DJCi300._scratchEnabled[group] && DJCi300.rampedScratchRelease) {
            // Ziel: Wenn Deck spielt â†’ Velocity ~1; steht â†’ ~0. Etwas Toleranz addieren.
            DJCi300._scratchReleaseTarget[group] =
                (engine.getValue(rg, "play") ? 1 : 0) + DJCi300.slipThreshold;
            // Vorherige Verbindung beenden
            try {
                DJCi300._scratchReleaseConn[group]?.disconnect();
            } catch (e) {}
            DJCi300._scratchReleaseConn[group] = engine.makeConnection(rg, "scratch2", function (v) {
                const ok = (v >= 0 && v <= 1) ||
                (v > 1 && v < DJCi300._scratchReleaseTarget[group]) ||
                (v < 0 && Math.abs(v) < DJCi300.slipThreshold);
                if (ok) {
                    try {
                        DJCi300._scratchReleaseConn[group]?.disconnect();
                    } catch (e) {}
                    DJCi300._scratchReleaseConn[group] = null;
                    engine.scratchDisable(deck, true);
                    DJCi300._scratchEnabled[group] = false;
                    DJCi300.scratchAction[group] = DJCi300.kScratchActionBend;
                }
            });
            try {
                DJCi300._scratchReleaseConn[group].trigger();
            } catch (e) {}
            return; // nicht sofort disableâ€™n
        }
        // Fallback: altes Verhalten
        if (DJCi300._scratchEnabled[group]) {
            engine.scratchDisable(deck, true);
            DJCi300._scratchEnabled[group] = false;
            DJCi300.scratchAction[group] = DJCi300.kScratchActionBend;
        } else {
            // Kein eigener Scratch-Enable-Status: auf allgemeine Scratch-Action-Logik zurÃ¼ckfallen.
            DJCi300.updateScratchAction(
                engine.getValue(rg, "scratch2"), group);
        }
        if (DJCi300.debugPPR) {
            print("[PPR] Deck " + deck + " Umdrehungs-ZÃ¤hlung: " + DJCi300._pprCount[group] + " Ticks");
        }
    }
};

// Greift immer direkt auf Scratch-Engine zu, unabhÃ¤ngig vom Vinyl-Button,
// und nutzt ein eigenes ScratchAction-Flag (Seek).
DJCi300.wheelTouchShift = function (_channel, _control, value, _status, group) {
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);
    if (value > 0) {
        DJCi300._scratchEnable(deck);
        DJCi300._scratchEnabled[group] = true;
        DJCi300.wheelTouchState[group] = true;
        DJCi300.scratchAction[group] = DJCi300.kScratchActionSeek;
    } else {
        DJCi300.wheelTouchState[group] = false;
        if (DJCi300._scratchEnabled[group]) {
            engine.scratchDisable(deck, true);
            DJCi300._scratchEnabled[group] = false;
            DJCi300.scratchAction[group] = DJCi300.kScratchActionBend;
        } else {
            DJCi300.updateScratchAction(engine.getValue(rg, "scratch2"), group);
        }
    }
};

// Dreh-Handler:
//  - delegiert je nach aktuellem ScratchAction-Modus an
//      * Scratch (Scratch/Jog im Vinyl-Mode),
//      * Seek (Shift+Touch),
//      * klassisches Jog-Bend.
//  - wird von der Loop-Adjust-Erweiterung (siehe IIFE weiter unten) im
//    Adjust-Mode Ã¼berschrieben, um Loop-Kanten zu verschieben.
DJCi300.jogWheel = function (_channel, _control, value, _status, group) {
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);
    const interval = DJCi300._convertWheelRotation(value);
    const action = DJCi300.scratchAction[group];
    if (action === DJCi300.kScratchActionScratch) {
        engine.scratchTick(deck, interval * DJCi300.scratchScale);
    } else if (action === DJCi300.kScratchActionSeek) {
        engine.scratchTick(deck, interval * DJCi300.scratchScale * DJCi300.scratchShiftMultiplier);
    } else {
        engine.setValue(rg, "jog", interval * DJCi300.bendScale);
    }
};
// Wrapper um den ursprÃ¼nglichen jogWheel-Handler:
// Wenn Loop-Adjust aktiv ist, werden Jog-Bewegungen in Sample-Offsets fÃ¼r
// Loop-In/Out Ã¼bersetzt; sonst greift der ursprÃ¼ngliche Scratch/Bend/Seek-Path.
(function () {
    const _origJog = DJCi300.jogWheel;
    DJCi300.jogWheel = function (_ch, _ctrl, value, _status, group) {
        const rg = DJCi300._resolveGroup(group);
        const loopOn = engine.getValue(rg, "loop_enabled") > 0;
        const adj = DJCi300.loopAdjust[group] || {
            in: false,
            out: false
        };

        if (loopOn && (adj.in || adj.out)) {
            const interval = DJCi300._convertWheelRotation(value);
            if (interval !== 0) {
                DJCi300._adjustLoopEdge(group, adj.in ? "in" : "out", interval);
            }
            return; // Adjust hat Vorrang
        }
        if (DJCi300.debugPPR && DJCi300.wheelTouchState[group]) {
            DJCi300._pprCount[group] += Math.abs(DJCi300._convertWheelRotation(value));
        }
        return _origJog.call(this, _ch, _ctrl, value, _status, group);
    };
})();

// Vinyl-FX Parameter:
//  - brakeFactor / softStartFactor: Parameter fÃ¼r Mixxx' brake/softStart.
//  - shiftBend*: Verhalten fÃ¼r progressives â€žHand-auf-Tellerâ€œ-Bend via Shift+PLAY.
// Diese Einstellungen werden ausschlieÃŸlich in den Vinyl-spezifischen Pfaden
// (playBtnMixed / _startShiftBend) genutzt.
DJCi300.vinylFx = {
    brakeFactor: 10, // Mixxx: grÃ¶ÃŸer = stÃ¤rkere/schnellere Bremse (kÃ¼rzere Rampe)
    softStartFactor: 15, // Mixxx: grÃ¶ÃŸer = schnellerer Start (kÃ¼rzere Rampe)
    // Progressives â€žHand-auf-Tellerâ€œ-Bend fÃ¼r Shift+PLAY
    shiftBendTickMs: 25, // Pulsintervall
    shiftBendBase: 0.5, // Start-Nudge pro Tick
    shiftBendMax: 6.0, // Max-Nudge pro Tick
    shiftBendCurve: 1.3, // Kurvenform (>1 = sanfter Start, dann krÃ¤ftig)
    shiftBendRampMs: 1800, // Zeit bis zur Max-Wirkung
    shiftBendReleaseNudge: 0.8, // kleiner Gegen-Nudge beim Loslassen
};

// Brake/SoftStart Watcher-State:
//  - Ã¼berwacht den Fortschritt der Mixxx-Brake (engine.brake),
//  - setzt play am Ende zuverlÃ¤ssig auf 0,
//  - stellt sicher, dass ein erneuter PLAY-Tap eine laufende Brake sauber abbricht.
DJCi300._brakeWatchTimers = {
    "[Channel1]": -1,
    "[Channel2]": -1
};
DJCi300._brakeInProgress = {
    "[Channel1]": false,
    "[Channel2]": false
};
DJCi300._brakeCompleted = {
    "[Channel1]": false,
    "[Channel2]": false
};
DJCi300._brakeLastPos = {
    "[Channel1]": 0,
    "[Channel2]": 0
};
DJCi300._brakeStallCount = {
    "[Channel1]": 0,
    "[Channel2]": 0
};
DJCi300._shiftBrakeWasPlaying = {
    "[Channel1]": false,
    "[Channel2]": false
};
// NEU: Progressives Shift-Bend (Shift+PLAY)
DJCi300._shiftBendTimer = {
    "[Channel1]": -1,
    "[Channel2]": -1
};
DJCi300._shiftBendPressAt = {
    "[Channel1]": 0,
    "[Channel2]": 0
};
// Stoppt das progressive Shift-Bend (wird auch im Shutdown aufgerufen).
DJCi300._stopShiftBend = function (group) {
    const id = DJCi300._shiftBendTimer[group];
    if (id !== -1) {
        try {
            engine.stopTimer(id);
        } catch (e) {}
    }
    DJCi300._shiftBendTimer[group] = -1;
};
// Hilfsfunktion: prÃ¼ft, ob ein Deck aktuell im Vinyl-/Scratch-Mode ist.
// Grundlage fÃ¼r alle Vinyl-spezifischen Play-Verhalten (Brake/SoftStart,
// Shift-Bend etc.). UnabhÃ¤ngig vom Scratch-Action-Mode.
DJCi300._vinylOn = function (group) {
    return !!DJCi300.scratchButtonState[group];
};

// HINWEIS (EXPERIMENTAL): `deck` ist das AUFGELÃ–STE logische Deck (1..4).
// DJCi300._brakeInProgress bleibt pro PHYSISCHEM Strip indiziert; alle
// Aufrufer setzen `_brakeInProgress[physicalGroup] = false` bereits selbst
// direkt vor/nach diesem Aufruf. Ein zusÃ¤tzliches `[Channel${deck}]`-Write
// wÃ¤re bei Deck 3/4 ein toter, nie gelesener Key - deshalb hier entfernt.
DJCi300._stopAllVinylFx = function (deck) {
    try {
        if (typeof engine.isBrakeActive === "function" && engine.isBrakeActive(deck))
            engine.brake(deck, false);
        if (typeof engine.isSpinbackActive === "function" && engine.isSpinbackActive(deck))
            engine.spinback(deck, false);
        if (typeof engine.isSoftStartActive === "function" && engine.isSoftStartActive(deck))
            engine.softStart(deck, false);
    } catch (e) {}
};

// Startet ein progressives, stetig stÃ¤rkeres Bend (negativer â€žjogâ€œ),
// das Ã¼ber die Haltezeit von Shift+PLAY hochrampt.
// Wird nur verwendet, wenn:
//  - Vinyl-Mode aktiv ist,
//  - das Deck beim DrÃ¼cken von Shift+PLAY bereits spielt.
// Ziel: fein dosierbares Tempo-Pitchen per Hand, ohne Brake/SoftStart anzutasten,
// das Deck bleibt wÃ¤hrenddessen im Play-Zustand.
DJCi300._startShiftBend = function (group) {
    const rg = DJCi300._resolveGroup(group);
    // Safety: alten Timer stoppen
    DJCi300._stopShiftBend(group);
    DJCi300._shiftBendPressAt[group] = Date.now();

    // Nur aktiv, wenn Track lÃ¤uft
    if (!DJCi300._isTrackLoaded(rg) || engine.getValue(rg, "play") === 0)
        return;

    DJCi300._shiftBendTimer[group] = engine.beginTimer(DJCi300.vinylFx.shiftBendTickMs, function () {
        const now = Date.now();
        const elapsed = now - (DJCi300._shiftBendPressAt[group] || 0);
        const r = Math.max(0, Math.min(1, elapsed / DJCi300.vinylFx.shiftBendRampMs));
        const mag = DJCi300.vinylFx.shiftBendBase +
            (DJCi300.vinylFx.shiftBendMax - DJCi300.vinylFx.shiftBendBase) *
            Math.pow(r, DJCi300.vinylFx.shiftBendCurve);
        engine.setValue(rg, "jog", -mag * DJCi300.bendScale);
    });
};

// Stoppt das progressive Bend (wird auch im Shutdown aufgerufen).
// (DJCi300._stopShiftBend ist oben definiert)

// --- Brake Watcher: erkennt Ende der Brake und stoppt das Deck sauber ---
// Nutzt bevorzugt das Engine-Flag isBrakeActive(), optional (wenn aktiviert)
// eine Playpositions-Heuristik â€“ oder letztens fallback auf play==0.
DJCi300._cancelBrakeWatch = function (group) {
    const id = DJCi300._brakeWatchTimers[group];
    if (id !== -1) {
        try {
            engine.stopTimer(id);
        } catch (e) {}
        DJCi300._brakeWatchTimers[group] = -1;
    }
    DJCi300._brakeInProgress[group] = false;
};

// EXPERIMENTAL: `deck` ist bereits das aufgelÃ¶ste logische Deck (Aufrufer
// playBtnMixed leitet es aus `rg` ab); `group` bleibt der physische Strip
// fÃ¼r alle State-Dicts. Engine-Zugriffe (playposition/play) laufen zusÃ¤tzlich
// Ã¼ber ein lokal aufgelÃ¶stes `rg`, damit der Watcher auch bei Deck 3/4
// korrekt auf das reale Deck schaut.
DJCi300._startBrakeWatch = function (deck, group) {
    const rg = DJCi300._resolveGroup(group);
    DJCi300._cancelBrakeWatch(group);
    DJCi300._brakeInProgress[group] = true;
    DJCi300._brakeCompleted[group] = false;

    DJCi300._brakeWatchTimers[group] = engine.beginTimer(50, function () {
        // Bevorzugt: native Engine-Flag; Fallback nur optional.
        let done;
        if (typeof engine.isBrakeActive === "function") {
            done = !engine.isBrakeActive(deck);
        } else if (DJCi300.useBrakePositionFallback) {
            // (Deaktiviert per Default) â€“ frÃ¼here Heuristik Ã¼ber Playposition.
            const pos = engine.getValue(rg, "playposition");
            const delta = Math.abs(pos - (DJCi300._brakeLastPos[group] || 0));
            DJCi300._brakeLastPos[group] = pos;
            DJCi300._brakeStallCount[group] = (delta < 0.00002) ? (DJCi300._brakeStallCount[group] + 1) : 0;
            done = (DJCi300._brakeStallCount[group] >= 8);
        } else {
            // Minimaler Fallback: wenn die Engine Play bereits auf 0 gesetzt hat.
            done = (engine.getValue(rg, "play") === 0);
        }
        if (done) {
            engine.setValue(rg, "play", 0); // Deck sicher stoppen
            DJCi300._cancelBrakeWatch(group);
            DJCi300._brakeCompleted[group] = true;
        }
    });
};

// Play: gemischtes Verhalten in AbhÃ¤ngigkeit von:
//  - Vinyl-Mode (DJCi300.playBrakeOnVinyl + _vinylOn)
//  - Shift-Zustand
//  - aktuell gehaltenen Momentary-Quellen (Hotcues, cue_preview, start_play)
//
// Cases:
//  - Shift+PLAY â†’ im Vinyl-Mode: progressives Bend; sonst Stutter.
//  - Unshifted PLAY im Vinyl-Mode â†’ Brake/SoftStart-Logik (inkl. Retap-Abbruch).
//  - Unshifted PLAY auÃŸerhalb Vinyl â†’ klassisches Play-Toggle.
// EXPERIMENTAL: `group` = physischer Strip (State-Dicts + _isShift/_vinylOn
// bleiben darauf indiziert); `rg`/`deck` = aufgelÃ¶stes logisches Deck, nur
// fÃ¼r Engine-Aufrufe (getValue/setValue/toggleControl/brake/softStart/
// _stopAllVinylFx/_startBrakeWatch) verwendet.
DJCi300.playBtnMixed = function (_ch, _ctrl, value, status, group) {
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);
    const isShift = DJCi300._isShift(status, group);

    // Shift+PLAY â†’ im Vinyl-Mode: momentary Brake, sonst Stutter
    if (isShift) {
        // AuÃŸerhalb Vinyl (oder Feature aus): klassisches momentary Stutter
        if (!(DJCi300.playBrakeOnVinyl && DJCi300._vinylOn(group))) {
            engine.setValue(rg, "play_stutter", value);
            return;
        }
        if (value) { // PRESS â†’ progressives Bend starten
            DJCi300._shiftBrakeWasPlaying[group] = engine.getValue(rg, "play") > 0;
            if (DJCi300._shiftBrakeWasPlaying[group]) {
                DJCi300._stopAllVinylFx(deck); // keine Engine-Bremsen wÃ¤hrend Bend
                DJCi300._startShiftBend(group);
            }
        } else { // RELEASE â†’ Bend stoppen, Deck MUSS weiterlaufen
            const wasPlaying = !!DJCi300._shiftBrakeWasPlaying[group];
            DJCi300._shiftBrakeWasPlaying[group] = false;
            DJCi300._stopShiftBend(group);
            if (wasPlaying) {
                engine.setValue(rg, "play", 1); // Safety
                // kleiner â€žLoslassâ€œ-Kick fÃ¼r sauberes Ausklingen
                engine.setValue(rg, "jog", DJCi300.vinylFx.shiftBendReleaseNudge * DJCi300.bendScale);
            }
        }
        return;
    }

    // Unshifted: optionaler Brake/SoftStart auf normalem PLAY, aber nur im Vinyl-Mode
    // Latch-Guard: Wenn ein Momentary (hotcue*_activate / cue_preview / start_play) hÃ¤lt,
    // dann echtes PLAY setzen, Brake/Softstart Ã¼berspringen, Latch wÃ¼nschen und Watcher starten.
    if (value && DJCi300._hotcueHeld(rg)) {
        DJCi300._stopAllVinylFx(deck);
        DJCi300._cancelBrakeWatch(group);
        DJCi300._brakeInProgress[group] = false;
        DJCi300._brakeCompleted[group] = false;
        DJCi300._latchWanted[group] = true;
        engine.setValue(rg, "play", 1);
        DJCi300._startLatchWatch(group); // sorgt dafÃ¼r, dass nach Release nur 1x gelatched wird
        return;
    }

    if (DJCi300.playBrakeOnVinyl && DJCi300._vinylOn(group)) {
        if (value) { // PRESS
            // NEU: Falls gerade eine Brake lÃ¤uft (Song noch nicht â€žstehtâ€œ),
            // bricht ein erneuter PLAY-Tap die Brake SOFORT ab und setzt normales Play fort.
            if (DJCi300._brakeInProgress[group] && !DJCi300._brakeCompleted[group]) {
                DJCi300._stopAllVinylFx(deck); // brake/softstart/spinback sicher aus
                DJCi300._cancelBrakeWatch(group); // Watcher stoppen
                DJCi300._brakeInProgress[group] = false;
                DJCi300._brakeCompleted[group] = false;
                // sofort weiterlaufen, KEIN Softstart
                engine.setValue(rg, "play", 1);
                return;
            }

            // Retap-SoftStart: wenn Deck steht ODER eine Brake zuvor sauber abgeschlossen wurde
            if (DJCi300._brakeCompleted[group] || engine.getValue(rg, "play") === 0) {
                DJCi300._cancelBrakeWatch(group);
                DJCi300._brakeCompleted[group] = false;
                engine.setValue(rg, "play", 1);
                if (typeof engine.softStart === "function")
                    engine.softStart(deck, true, DJCi300.vinylFx.softStartFactor);
                return;
            }
            // Normalfall: Brake starten
            DJCi300._stopAllVinylFx(deck);
            DJCi300._startBrakeWatch(deck, group);
            if (typeof engine.brake === "function")
                engine.brake(deck, true, DJCi300.vinylFx.brakeFactor);
        } // RELEASE: keine Aktion â†’ Brake lÃ¤uft bis Stillstand
        return; // im Brake-Modus kein normales Toggle
    }

    // Standard: Toggle nur auf Press
    if (value)
        script.toggleControl(rg, "play");
};
// Kombinierter Cue-Handler:
//  - unshifted:   klassischer cue_default.
//  - Shift+CUE im Vinyl-Mode:  start_play (momentary, passend zur Brake-Logik).
//  - Shift+CUE auÃŸerhalb Vinyl: cue_preview (Hold-Preview mit Snapback).
DJCi300.cueBtnMixed = function (_ch, _ctrl, value, status, group) {
    const rg = DJCi300._resolveGroup(group);
    const isShift = DJCi300._isShift(status, group);
    const inVinyl = (DJCi300.playBrakeOnVinyl && DJCi300._vinylOn(group));

    if (!isShift) {
        engine.setValue(rg, "cue_default", value);
        return;
    }
    // Shift+CUE:
    //  - Im Vinyl-Mode weiter start_play (momentary) fÃ¼r konsistentes Verhalten mit Brake/SoftStart.
    //  - AuÃŸerhalb Vinyl â†’ cue_preview (Hold-Play ab Cue mit Snapback beim Loslassen).
    if (inVinyl) {
        engine.setValue(rg, "start_play", value);
    } else {
        engine.setValue(rg, "cue_preview", value);
    }
};

// Keylock-Toggle (aktuell via SHIFT+SLIP gebunden):
//  - einfacher On/Off-Toggle pro Deck,
//  - reine Transport-/Deck-FunktionalitÃ¤t, daher hier im Transport-Block einsortiert.
// Die LED-Anzeige selbst wird Ã¼ber die Top-Row-Components gespiegelt
// (keylock-Output, siehe _buildTopRow / _triggerTopRowState).
DJCi300.keylock = function (_ch, _ctrl, value, _status, group) {
    if (!value) {
        return; // nur auf Press reagieren
    }
    const rg = DJCi300._resolveGroup(group);
    const on = engine.getValue(rg, "keylock") > 0 ? 0 : 1;
    engine.setValue(rg, "keylock", on);
};

// Ein Button: 4-Beat-Loop setzen oder aktuellen Loop verlassen/re-enter
DJCi300.loop4Toggle = function (_ch, _ctrl, value, _status, group) {
    if (!value)
        return; // nur beim DrÃ¼cken reagieren

    const rg = DJCi300._resolveGroup(group);

    // Nur arbeiten, wenn ein Track geladen ist
    if (!DJCi300._isTrackLoaded(rg)) {
        return;
    }

    const loopOn = engine.getValue(rg, "loop_enabled") > 0;

    if (loopOn) {
        // Loop lÃ¤uft -> Loop verlassen / re-enter Ã¼ber Mixxx-Logik
        script.triggerControl(rg, "reloop_toggle");
    } else {
        // Kein Loop aktiv -> 4-Beat-Loop setzen
        script.triggerControl(rg, "beatloop_4_activate");
    }
};

///////////////////////////////////////////////////////////////
// 11) BROWSER / LIBRARY
///////////////////////////////////////////////////////////////

// Aggregierter Status fÃ¼r die Browser-LED
DJCi300._browseState = {
    visible: false, // Library maximiert
    autoDJOn: false, // AutoDJ aktiv
};

DJCi300._updateBrowseLED = function (state) {
    const a = DJCi300.LED.global.autoDJ;
    const b = DJCi300.LED.global.browse;

    // Laufende Deck-States
    const ch1Playing = engine.getValue("[Channel1]", "play") > 0;
    const ch2Playing = engine.getValue("[Channel2]", "play") > 0;
    const bothStopped = !ch1Playing && !ch2Playing;
    const anyPlaying = ch1Playing || ch2Playing;

    let browseVal = DJCi300.COLORS.OFF;

    // PrioritÃ¤t:
    // 1) WeiÃŸ  â†’ Library maximiert
    // 2) Gelb  â†’ AutoDJ aktiv
    // 3) GrÃ¼n  â†’ beide Decks stehen (sicher zum Laden)
    // 4) Blau  â†’ mindestens ein Deck spielt (Mix-Modus)
    if (state.visible) {
        browseVal = DJCi300.COLORS.WHITE;
    } else if (state.autoDJOn) {
        browseVal = DJCi300.COLORS.YELLOW;
    } else if (bothStopped) {
        browseVal = DJCi300.COLORS.GREEN;
    } else if (anyPlaying) {
        browseVal = DJCi300.COLORS.BLUE_MED;
    }

    // Browser-LED-Farbe nach obiger Logik setzen
    DJCi300.led.send(b.status, b.note, browseVal);

    // AutoDJ-LED: explizit AutoDJ-Status anzeigen (an/aus)
    if (a) {
        const autoVal = state.autoDJOn ? DJCi300.COLORS.YELLOW : DJCi300.COLORS.OFF;
        DJCi300.led.send(a.status, a.note, autoVal);
    }
};

DJCi300.browseLongPressTimer = -1;
DJCi300.browseLongPressFired = false;

// Browse-Button: Short-/Long-Press-Unterscheidung (Fokuswechsel vs. Baum nach rechts aufklappen).
DJCi300.browsePress = function (_ch, _ctrl, value) {
    const THRESH = 300; // Long-Press Schwelle in ms

    if (value) { // Key down
        if (DJCi300.browseLongPressTimer !== -1) {
            try {
                engine.stopTimer(DJCi300.browseLongPressTimer);
            } catch (e) {}
            DJCi300.browseLongPressTimer = -1;
        }
        DJCi300.browseLongPressFired = false;

        DJCi300.browseLongPressTimer = engine.beginTimer(THRESH, function () {
            DJCi300.browseLongPressFired = true;
            DJCi300.browseLongPressTimer = -1;
            // Aufklappen im linken Baum
            script.triggerControl("[Library]", "MoveRight");
        }, true);

    } else { // Key up
        if (DJCi300.browseLongPressTimer !== -1) {
            try {
                engine.stopTimer(DJCi300.browseLongPressTimer);
            } catch (e) {}
            DJCi300.browseLongPressTimer = -1;
        }
        if (!DJCi300.browseLongPressFired) {
            // kurzer Push â†’ Fokus wechseln (links/rechts)
            script.triggerControl("[Library]", "MoveFocus");
        }
    }
};

// Globales Waveform-Zoom (beide AKTIVEN Decks) per Up/Down â†’ GUI-Controls kurz triggern.
// EXPERIMENTAL: iteriert weiterhin Ã¼ber die physischen Strips (CHANNEL_GROUPS),
// lÃ¶st aber jeden auf sein aktuell aktives logisches Deck auf, damit im
// Deck-3/4-Modus die tatsÃ¤chlich hÃ¶rbaren Decks gezoomt werden.
DJCi300.waveformZoom = function (_ch, _ctrl, value /* 0x01 / 0x7F */, _status, _group) {
    const dir = (value === 0x01) ? "down" : (value === 0x7F) ? "up" : null;
    if (!dir) {
        return;
    }
    for (const g of CHANNEL_GROUPS) {
        // simuliert kurzen Button-Press (1â†’0)
        script.triggerControl(DJCi300._resolveGroup(g), "waveform_zoom_" + dir);
    }
};

///////////////////////////////////////////////////////////////
// 12) HILFSFUNKTIONEN
///////////////////////////////////////////////////////////////

// Wahr, solange irgendeine momentane Play-Quelle gehalten wird
DJCi300._hotcueHeld = function (group) {
    for (let i = 1; i <= 8; i++) {
        try {
            if (engine.getValue(group, `hotcue_${i}_activate`) > 0)
                return true;
        } catch (e) {}
    }
    try {
        if (engine.getValue(group, "cue_preview") > 0)
            return true;
    } catch (e) {}
    try {
        if (engine.getValue(group, "start_play") > 0)
            return true;
    } catch (e) {}
    return false;
};

// Latch-Mechanik: genau 1x nach Momentary-Release PLAY setzen, dann disarmen
DJCi300._latchWanted = {
    "[Channel1]": false,
    "[Channel2]": false
};
DJCi300._latchWatchTimer = {
    "[Channel1]": -1,
    "[Channel2]": -1
};
DJCi300._cancelLatchWatch = function (group) {
    const id = DJCi300._latchWatchTimer[group];
    if (id !== -1) {
        try {
            engine.stopTimer(id);
        } catch (e) {}
    }
    DJCi300._latchWatchTimer[group] = -1;
};
DJCi300._startLatchWatch = function (group) {
    const rg = DJCi300._resolveGroup(group);
    DJCi300._cancelLatchWatch(group);
    // Pollt kurz, bis KEIN Momentary mehr gehalten wird (Hotcue, cue_preview, start_play)
    DJCi300._latchWatchTimer[group] = engine.beginTimer(25, function () {
        if (!DJCi300._latchWanted[group]) {
            DJCi300._cancelLatchWatch(group);
            return;
        }
        if (!DJCi300._hotcueHeld(rg)) {
            DJCi300._latchWanted[group] = false; // disarmen
            try {
                engine.setValue(rg, "play", 1);
            } catch (e) {}
            DJCi300._cancelLatchWatch(group);
        }
    });
};
// Best-effort: explizite Releases (cue_preview/start_play) sofort auslÃ¶sen & disarmen
DJCi300._onMomentaryRelease = function (v, group, _control) {
    if (v > 0)
        return; // nur Release
    if (!DJCi300._latchWanted[group])
        return;
    DJCi300._latchWanted[group] = false; // disarmen
    try {
        engine.setValue(DJCi300._resolveGroup(group), "play", 1);
    } catch (e) {}
    DJCi300._cancelLatchWatch(group);
};

// Beatjump Â±32 Beats (~8 Takte bei 4/4), vorwÃ¤rts und rÃ¼ckwÃ¤rts.
DJCi300.quickJumpFwd = (_c, _k, v, _s, g) => {
    if (v)
        engine.setValue(g, "beatjump", 32);
};
DJCi300.quickJumpBack = (_c, _k, v, _s, g) => {
    if (v)
        engine.setValue(g, "beatjump", -32);
};

// Pitchfader-Range in Mixxx (rateRange) zum Durchschalten per Button.
// Werte = Â±6 %, Â±10 %, Â±16 %, Â±25 %.
DJCi300.rateRanges = [0.08, 0.16, 0.32, 0.64, 1];

// An Button X binden (z.B. SHIFT+Tempo-Taste): schaltet durch DJCi300.rateRanges.
// Bei unbekanntem current range â†’ springt auf den ersten Eintrag
DJCi300.cycleTempoRange = (_ch, _ctrl, value, _status, group) => {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    const cur = engine.getValue(rg, "rateRange");
    const idx = DJCi300.rateRanges.indexOf(cur);
    const nextIdx = (idx === -1 ? 0 : (idx + 1) % DJCi300.rateRanges.length);
    engine.setValue(rg, "rateRange", DJCi300.rateRanges[nextIdx]);
};

DJCi300._shiftHeld = {
    "[Channel1]": false,
    "[Channel2]": false
};
// Trust the MIDI status byte for any message that carries one (it reflects
// the real physical channel the press came in on and can't desync). Only
// fall back to the tracked _shiftHeld flag for callers that don't have a
// separate shifted channel to check against.
DJCi300._isShift = (status, group) => {
    if (status === DJCi300._stShift(group)) {
        return true;
    }
    if (status === DJCi300._st(group)) {
        return false;
    }
    return !!DJCi300._shiftHeld[group];
};

// OPTIONAL: an die SHIFT-Taste im XML binden (press/release)
DJCi300.shift = function (_ch, _ctrl, value, _status, group) {
    DJCi300._shiftHeld[group] = !!value;
    // Components-Container der Top-Row ebenfalls shiften, damit deren interne
    // Shift-Mechanik (inkl. sauberem Push-Reset) greift.
    const cont = DJCi300._topRow[group];
    if (cont && cont instanceof components.ComponentContainer) {
        if (value)
            cont.shift();
        else
            cont.unshift();
    }
    // Indikator-LED bleibt wie gehabt separat
    // Nach Kanalwechsel die sichtbaren LEDs hart neu senden
    DJCi300.updateVinylLED(group); // Vinyl liegt auf Shift-Kanal
    DJCi300._triggerTopRowState(group); // Top-Row-Components neu triggern
    DJCi300.updateStemsModeIndicator(); // Shift+Q ggf. aktualisieren
};

// Ist ein Track im Deck geladen?
DJCi300._isTrackLoaded = function (group) {
    // PrimÃ¤r: boolesches track_loaded (Mixxx-Control)
    const tl = engine.getValue(group, "track_loaded");
    if (typeof tl === "number")
        return tl > 0;
    // Fallback: >0 Samples als Proxy
    const samples = engine.getValue(group, "track_samples");
    return Number.isFinite(samples) && samples > 0;
};

// true, wenn auf beiden Decks ein Track geladen ist und beide spielen.
// Wird u.a. benutzt, um Beatmatch-Guides nur dann zu zeigen.
DJCi300._bothPlayingLoaded = () =>
CHANNEL_GROUPS.every(group =>
    engine.getValue(group, "play") !== 0 &&
    DJCi300._isTrackLoaded(group));

// Globaler Umschalter fÃ¼r Pad-Bank 0x13: STEMS â†” Toneplay.
// Aktualisiert aktive Decks sofort (enter/leave) und setzt Indikator-LEDs.
// Globaler Umschalter zwischen STEMS und Toneplay fÃ¼r Pad-Bank 0x13; aktualisiert aktive Decks.
DJCi300.togglePadBank13Mode = function (_ch, _ctrl, value, _status, _group) {
    if (!value) {
        return; // nur auf Press reagieren
    }

    // Zustand flippen
    DJCi300.padBank13Mode = (DJCi300.padBank13Mode === "stems") ? "toneplay" : "stems";

    // Wenn ein Deck gerade im Toneplay/Bank-0x13-Mode ist, sofort visuell anpassen
    for (const g of CHANNEL_GROUPS) {
        if (DJCi300.padMode[g] === DJCi300.padModeToneplay) {
            if (DJCi300.isStemsMode()) {
                // von Toneplay â†’ STEMS: Pads auf Mute-Status spiegeln
                DJCi300.stems.enter(g);
            } else {
                // von STEMS â†’ Toneplay: STEMS freigeben und direkt Toneplay-LED setzen
                DJCi300.stems.leave(g);
                // aktuelle Pitch-Position visualisieren (respektiere toneplayPitchControl)
                const ctrlName = DJCi300.toneplayPitchControl;
                DJCi300._updateToneplayLEDOriginal(engine.getValue(DJCi300._resolveGroup(g), ctrlName), g, ctrlName);
            }
        }
    }
    DJCi300.updateStemsModeIndicator();
    // (Optional) Log ins Controller-Log:
    print("[Inpulse300] Pad-Bank 0x13 Modus:", DJCi300.padBank13Mode);
};

///////////////////////////////////////////////////////////////
// 13) SYNC / TEMPO-MATCH
///////////////////////////////////////////////////////////////

// Dieser Block bÃ¼ndelt:
//  - Tempo-Only-Sync (Shift+SYNC â†’ beatsync_tempo + LED-Blink)
//  - Soft-Sync per Long-Press auf SYNC (sync_enabled Toggle)
//  - Optionalen Debug-Doppeltipp fÃ¼r die VU-Probe
//  - Heartbeat-getriebene Blink-Logik (250ms/500ms)

// --- Debug: VU-Probe per Shift+SYNC Doppeltipp ------------------------------
// Nur fÃ¼r Kalibrierung gedacht: bei aktivem Shortcut wird ein Doppeltipp auf
// Shift+SYNC innerhalb von _vuProbeDTWindowMs die VU-Probe starten.
DJCi300.debugVUProbeShortcut = false; // nur kurzzeitig auf true setzen
DJCi300._vuProbeDTWindowMs = 500; // Zeitfenster fÃ¼r Doppeltipp (ms)
DJCi300._vuProbeDTLast = {
    "[Channel1]": 0,
    "[Channel2]": 0
};

DJCi300.tempoMatch = function (_ch, _ctrl, value, _status, group) {
    if (!value)
        return; // nur auf Press reagieren

    // Debug: Doppeltipp auf Shift+SYNC â†’ VU-Probe starten, sonst normales tempoMatch
    if (DJCi300.debugVUProbeShortcut) {
        const now = Date.now();
        const last = DJCi300._vuProbeDTLast[group] || 0;
        DJCi300._vuProbeDTLast[group] = now;
        if (now - last <= DJCi300._vuProbeDTWindowMs) {
            DJCi300._probeVUHardwareRed();
            print("[VU-Probe] gestartet via Shift+SYNC Doppeltipp");
            return;
        }
    }

    // regulÃ¤res Verhalten: Tempo-Only Beat Sync + kurzes SYNC-Blink
    script.triggerControl(DJCi300._resolveGroup(group), "beatsync_tempo");
    DJCi300._startSyncTempoBlink(group);
};

// Blink-BestÃ¤tigung fÃ¼r Tempo-Only-Sync (Shift+SYNC).
// Die tatsÃ¤chliche Blinklogik hÃ¤ngt am 250ms-Heartbeat (_onHeartbeat250);
// hier wird nur die gewÃ¼nschte Gesamtdauer in Ticks hinterlegt.
DJCi300.SYNC_TEMPO_BLINK_DURATION = 1200; // Gesamtdauer (ms) â†’ wir zÃ¤hlen 250ms-Heartbeats

// SYNC-LED-Adresse (Mk2 fest): Status A/B = 0x91/0x92, Note = 0x05.
DJCi300._syncLEDAddr = function (group) {
    return {
        status: DJCi300.LED[group].transport,
        note: DJCi300.LED.notes.SYNC
    };
};

// Stoppt das Tempo-Only-Sync-Blinken:
//  - setzt _syncTempoBlinkTicks auf 0 (Heartbeat beendet das Blinken),
//  - restauriert den LED-Zustand entsprechend sync_enabled,
//  - respektiert EOT-Vorrang (kein Ãœberschreiben des EOT-Blinks).
DJCi300._stopSyncTempoBlink = function (group) {
    // Heartbeat-gesteuert: einfach Ticks auf 0 setzen
    DJCi300._syncTempoBlinkTicks[group] = 0;
    // Falls EOT aktiv ist: EOT behÃ¤lt Vorrang, keine LED-RÃ¼cksetzung dazwischen
    if (DJCi300._eotActive(group))
        return;
    // sonst LED zurÃ¼ck auf â€žnormalâ€œ (entsprechend sync_enabled)
    const { status, note } = DJCi300._syncLEDAddr(group);
    const on = engine.getValue(DJCi300._resolveGroup(group), "sync_enabled") ? 0x7F : 0x00;
    DJCi300.led.send(status, note, on, true);
};

// Temporary blink feedback for tempo-only sync; auto-stops after
// SYNC_TEMPO_BLINK_DURATION.
DJCi300._startSyncTempoBlink = function (group) {
    // Kein Tempo-Blink wÃ¤hrend EOT â€“ EOT hat LED-Vorrang.
    if (DJCi300._eotActive(group))
        return;

    // Dauer in 250ms-Ticks umrechnen; mindestens 1 Tick.
    DJCi300._syncTempoBlinkTicks[group] = Math.max(1, Math.ceil(DJCi300.SYNC_TEMPO_BLINK_DURATION / 250));
};

// SYNC: Short/Long-Press per Software.
//  - Short-Press: einmaliges beatsync (klassisches Beat-Sync).
//  - Long-Press:  Soft-Sync (sync_enabled Toggle).

// Long-Press-Schwelle in Millisekunden.
DJCi300.SYNC_LONGPRESS_MS = 350;

// Per-Deck Timer/Flags
DJCi300.syncLongPressTimer = {
    "[Channel1]": -1,
    "[Channel2]": -1
};
DJCi300.syncLongPressFired = {
    "[Channel1]": false,
    "[Channel2]": false
};

// Haupt-Handler: an SYNC-Button binden (beide Decks)
DJCi300.syncPress = function (_ch, _ctrl, value, _status, group) {
    const g = group; // physischer Strip - State-Dicts (Timer/Fired) bleiben hier
    const rg = DJCi300._resolveGroup(group); // aufgelÃ¶stes logisches Deck - nur fÃ¼r Engine-Calls

    if (value) { // Key down
        // evtl. alten Timer stoppen
        if (DJCi300.syncLongPressTimer[g] !== -1) {
            try {
                engine.stopTimer(DJCi300.syncLongPressTimer[g]);
            } catch (e) {}
            DJCi300.syncLongPressTimer[g] = -1;
        }
        DJCi300.syncLongPressFired[g] = false;

        // Long-Press nach THRESH feuern â†’ Soft-Sync toggeln
        DJCi300.syncLongPressTimer[g] = engine.beginTimer(DJCi300.SYNC_LONGPRESS_MS, function () {
            DJCi300.syncLongPressFired[g] = true;
            DJCi300.syncLongPressTimer[g] = -1;

            const on = engine.getValue(rg, "sync_enabled") ? 0 : 1;
            engine.setValue(rg, "sync_enabled", on);
            // LED spiegelt sich Ã¼ber updateSyncLED (unten), falls gewÃ¼nscht
        }, true);

    } else { // Key up
        // Timer abbrechen, falls noch nicht gefeuert
        if (DJCi300.syncLongPressTimer[g] !== -1) {
            try {
                engine.stopTimer(DJCi300.syncLongPressTimer[g]);
            } catch (e) {}
            DJCi300.syncLongPressTimer[g] = -1;
        }
        // Wenn kein Long-Press â†’ Short-Press Aktion: One-Shot Beat Sync
        if (!DJCi300.syncLongPressFired[g]) {
            script.triggerControl(rg, "beatsync")
        }
    }
};

// === HEARTBEAT-HANDLER ======================================================
// Beide Heartbeats werden von Mixxx getrieben:
//  - indicator_250ms â†’ _onHeartbeat250  (fÃ¼r SYNC-Blink)
//  - indicator_500ms â†’ _onHeartbeat500  (fÃ¼r EOT/Loop-LED-Blink)
DJCi300._onHeartbeat250 = function (v, _g, _k) {
    if (v <= 0)
        return; // nur auf steigende Flanke
    for (const g of CHANNEL_GROUPS) {
        // Tempo-Only-Sync Blink (250ms-Takt)
        if (DJCi300._syncTempoBlinkTicks[g] > 0 && !DJCi300._eotActive(g)) {
            const { status, note } = DJCi300._syncLEDAddr(g);
            // Toggle LED
            const cur = (DJCi300.led.cache[(status << 8) | note] | 0) ? 0x00 : 0x7F;
            DJCi300.led.send(status, note, cur, true);
            DJCi300._syncTempoBlinkTicks[g]--;
            if (DJCi300._syncTempoBlinkTicks[g] === 0) {
                // final: auf echten sync_enabled RÃ¼ckstand setzen
                const on = engine.getValue(DJCi300._resolveGroup(g), "sync_enabled") ? 0x7F : 0x00;
                DJCi300.led.send(status, note, on, true);
            }
        }
    }
};

DJCi300._onHeartbeat500 = function (v, _g, _k) {
    if (v <= 0)
        return; // steigende Flanke

    // Globaler 500ms-Takt u.a. fÃ¼r Sampler-Blink
    DJCi300._samplerBlinkPhase ^= 1;

    for (const g of CHANNEL_GROUPS) {
        // Phase immer toggeln â€“ unabhÃ¤ngig von EOT
        DJCi300._eotPhase[g] ^= 1;

        // EOT: alternierendes CUE<->SYNC
        if (DJCi300._eotActive(g)) {
            const st = DJCi300._st(g),
            CUE = 0x06,
            SYNC = 0x05;
            const cueOn = DJCi300._eotPhase[g] ? 0x7F : 0x00;
            DJCi300.led.send(st, CUE, cueOn, true);
            DJCi300.led.send(st, SYNC, cueOn ? 0x00 : 0x7F, true);
        }
        // Loop-Adjust Blink (nur Zielkante blinkt)
        if (DJCi300._loopBlinkActive[g] && engine.getValue(DJCi300._resolveGroup(g), "loop_enabled") > 0) {
            const a = DJCi300.loopAdjust[g] || {
                in: false,
                out: false
            };
            const val = DJCi300._eotPhase[g] ? 0x7F : 0x00;
            if (a.in)
                DJCi300._setLoopLEDs(g, val, 0x7F);
            else if (a.out)
                DJCi300._setLoopLEDs(g, 0x7F, val);
            else {
                DJCi300._loopBlinkActive[g] = false;
                DJCi300._setLoopLEDs(g, 0x7F, 0x7F);
            }
        }
        // Loop-4 LED
        DJCi300._updateLoop4LED(g);
    }

    // Sampler-Pads (falls Sampler-Mode aktiv) aktualisieren
    DJCi300._refreshSamplerModeLEDs();
};

///////////////////////////////////////////////////////////////
// 14) LOOP IN / LOOP OUT ADJUST
///////////////////////////////////////////////////////////////

// Loop-Adjust Schrittweite: Anteil eines Beats pro Jog-Tick.
// Dient nur zum Feintuning der bestehenden Loop-Grenzen â€“ alle Mixxx-Loop-Controls
// bleiben unberÃ¼hrt und werden ausschlieÃŸlich Ã¼ber diese Delta-Werte beeinflusst.
DJCi300.loopAdjustStepBeats = 0.02; // 2 % eines Beats pro Tick

/**
 * Liefert die Anzahl Samples pro Beat fÃ¼r das gegebene Deck.
 *
 * Quellen:
 *  - bevorzugt Analyse-BPM (`bpm`)
 *  - Fallback: lokales BPM (`local_bpm`)
 *
 * Gibt NaN zurÃ¼ck, wenn:
 *  - kein Track geladen ist oder
 *  - weder Samplerate noch BPM plausibel sind.
 */
DJCi300._samplesPerBeat = function (group) {
    const sr = engine.getValue(group, "track_samplerate");
    let bpm = engine.getValue(group, "bpm");

    if (!Number.isFinite(bpm) || bpm <= 0) {
        bpm = engine.getValue(group, "local_bpm");
    }

    if (!Number.isFinite(sr) || sr <= 0) {
        return NaN;
    }
    if (!Number.isFinite(bpm) || bpm <= 0) {
        return NaN;
    }

    // korrekt: samples per beat (Sample-Rate ist NICHT â€žstereoâ€œ)
    return (60 / bpm) * sr;
};

/**
 * Verschiebt die Loop-Kante `edge` (`"in"` oder `"out"`) in Sample-Schritten.
 *
 * - `interval` ist der rohe Jog-Schritt (Â±1..Â±7) â†’ wird mit loopAdjustStepBeats skaliert.
 * - Die Funktion Ã¤ndert nur die Position der vorhandenen Loop-Grenze und lÃ¤sst
 *   alle anderen Loop-Controls unverÃ¤ndert.
 */
DJCi300._adjustLoopEdge = function (group, edge, interval) {
    const rg = DJCi300._resolveGroup(group);
    const spb = DJCi300._samplesPerBeat(rg);
    if (!Number.isFinite(spb)) {
        return;
    }

    const delta = Math.round(spb * DJCi300.loopAdjustStepBeats * interval);
    const ctrl = (edge === "in") ? "loop_start_position" : "loop_end_position";
    engine.setValue(rg, ctrl, engine.getValue(rg, ctrl) + delta);
};

// Toggle loop-IN adjust mode (only when a loop is active).
// Im Adjust-Mode verschiebt das Jog-Wheel die IN-Grenze Ã¼ber _adjustLoopEdge()
// in Sample-Schritten (loopAdjustStepBeats). AuÃŸerhalb des Adjust-Modes arbeitet
// das Jog-Wheel wie gewohnt (Scratch/Bend/Seek).
DJCi300.toggleLoopAdjustIn = function (_ch, _ctrl, value, _status, group) {
    if (!value) {
        return;
    }
    const rg = DJCi300._resolveGroup(group);
    if (engine.getValue(rg, "loop_enabled") === 0) {
        return;
    }
    const s = DJCi300.loopAdjust[group];
    s.in = !s.in;
    if (s.in) {
        s.out = false;
    }

    // Anzeige/Blink: IN/OUT blinken nur wÃ¤hrend aktivem Adjust
    if (engine.getValue(rg, "loop_enabled") > 0) {
        if (s.in || s.out) {
            DJCi300._startLoopBlink(group);
        } else {
            DJCi300._stopLoopBlink(group);
            DJCi300._setLoopLEDs(group, 0x7F, 0x7F); // beide solid
        }
    }
};
// Toggle loop-OUT adjust mode (only when a loop is active).
// Analog zu IN: nutzt im Adjust-Mode das Jog-Wheel Ã¼ber _adjustLoopEdge(), auÃŸerhalb
// bleibt das Verhalten unverÃ¤ndert.
DJCi300.toggleLoopAdjustOut = function (_ch, _ctrl, value, _status, group) {
    if (!value) {
        return;
    }
    const rg = DJCi300._resolveGroup(group);
    if (engine.getValue(rg, "loop_enabled") === 0) {
        return;
    }
    const s = DJCi300.loopAdjust[group];
    s.out = !s.out;
    if (s.out) {
        s.in = false;
    }

    // Anzeige/Blink: IN/OUT blinken nur wÃ¤hrend aktivem Adjust
    if (engine.getValue(rg, "loop_enabled") > 0) {
        if (s.in) {
            DJCi300._startLoopBlink(group);
        } else if (s.out) {
            DJCi300._startLoopBlink(group);
        } else {
            DJCi300._stopLoopBlink(group);
            DJCi300._setLoopLEDs(group, 0x7F, 0x7F);
        }
    } else {
        DJCi300._stopLoopBlink(group);
        DJCi300._setLoopLEDs(group, 0x00, 0x00);
    }
};

///////////////////////////////////////////////////////////////
// 15) MODE BUTTONS
///////////////////////////////////////////////////////////////

// Handle pad mode changes, connect/disconnect Slicer,
// und enter/leave STEMS/Toneplay fÃ¼r Bank 0x13.
// EXPERIMENTAL: `group` = physischer Strip (padMode/_physicalPadBank/_slicerState
// bleiben darauf indiziert); `rg` = aufgelÃ¶stes logisches Deck fÃ¼r alle
// engine.getValue/setValue/makeConnection-Aufrufe.
DJCi300.changeMode = function (_channel, control, value, _status, group) {
    const rg = DJCi300._resolveGroup(group);
    // Hardware only has Hotcue/Loop/Slicer/Sampler mode buttons (no physical
    // button sends 0x13). Repurpose the Slicer button to enter STEMS mode
    // instead. Note: the hardware itself keeps sending pad notes on its own
    // fixed SLICER bank (0x20-0x27) regardless of this redirect, so we
    // remember which physical button was actually pressed (_physicalPadBank)
    // and use that - not the redirected padMode - to know which note range
    // the pads are really on (see _slicerRowBase / slicerPadInput).
    if (value) {
        DJCi300._physicalPadBank[group] = control;
    }
    if (control === DJCi300.padModeSlicer) {
        control = DJCi300.padModeToneplay;
    }

    const oldPadMode = DJCi300.padMode[group];
    DJCi300.padMode[group] = control;

    if (value) {
        // --- 1) Slicer: Enter/Leave ------------------------------------------
        const isSlicer = (DJCi300.padMode[group] === DJCi300.padModeSlicer) || (DJCi300.padMode[group] === DJCi300.padModeSlicerloop);
        const wasSlicer = (oldPadMode === DJCi300.padModeSlicer) || (oldPadMode === DJCi300.padModeSlicerloop);
        if (isSlicer && !wasSlicer) {
            // Beatjump-Slicer aktivieren
            const st = DJCi300._slicerState[group];
            st.active = true;
            st.mode = (DJCi300.padMode[group] === DJCi300.padModeSlicerloop) ? "loop" : "cont";
            if (!st.conn) {
                const c = engine.makeConnection(rg, "beat_active", (v, _g, k) => DJCi300._slicerBeatActive(v, group, k));
                st.conn = c;
                DJCi300._conns[group].push(c);
            }
            DJCi300._slicerUpdateLEDBeatjump(group);
        } else if (!isSlicer && wasSlicer) {
            // Beatjump-Slicer deaktivieren
            const st = DJCi300._slicerState[group];
            // One-Shot ggf. abbrechen
            if (st.timer && st.timer !== -1) {
                try {
                    engine.stopTimer(st.timer);
                } catch (e) {}
            }
            st.active = false;
            st.button = -1;
            st.timer = -1;
            engine.setValue(rg, "slip_enabled", 0);
            if (st.conn) {
                try {
                    st.conn.disconnect();
                } catch (e) {}
                // Auch aus der Connection-Liste entfernen, sonst doppelter Disconnect im Shutdown
                try {
                    const arr = DJCi300._conns[group] || [];
                    const idx = arr.indexOf(st.conn);
                    if (idx !== -1)
                        arr.splice(idx, 1);
                } catch (e) {}
                st.conn = null;
            }
            // Reset interner ZÃ¤hler fÃ¼r sauberen Re-Enter
            st.beatsPassed = 0;
            DJCi300._slicerUpdateLEDBeatjump(group);
            // Safety-Refresh gegen spÃ¤te GUI-Outputs
            engine.beginTimer(80, () => DJCi300._slicerUpdateLEDBeatjump(group), true);
        }

        // --- 2) STEMS/Toneplay-Enter/Leave nur bei Mode 0x13 -----------------
        // Gilt nur, wenn PadMode = Toneplay-Bank (0x13); Umschalter entscheidet
        // zwischen STEMS und Original-Toneplay.
        if (DJCi300.padMode[group] === DJCi300.padModeToneplay) {
            if (DJCi300.isStemsMode()) {
                DJCi300.stems.enter(group);
            } else {
                // von STEMS â†’ Toneplay: STEMS freigeben und direkt Toneplay-LED setzen
                DJCi300.stems.leave(group);
                const ctrlName = DJCi300.toneplayPitchControl;
                DJCi300._updateToneplayLEDOriginal(engine.getValue(rg, ctrlName), group, ctrlName);
            }
        } else if (oldPadMode === DJCi300.padModeToneplay) {
            // wir verlassen Bank 0x13 â†’ sauber aufrÃ¤umen
            if (DJCi300.isStemsMode()) {
                DJCi300.stems.leave(group); // macht Wipe + disconnect
            } else {
                DJCi300._wipePadRows(group); // Toneplay: Pads leeren
            }
        }

        // --- 3) HOTCUE-LEDs: Enter â†’ Refresh, Leave â†’ Wipe -------------------
        // HOTCUE-LEDs: components.js Ã¼bernimmt. Beim Enter refreshen,
        // beim Leave wipen.
        if (DJCi300.padMode[group] === DJCi300.padModeHotcue && oldPadMode !== DJCi300.padModeHotcue) {
            DJCi300._refreshHotcueRow(group);
        } else if (oldPadMode === DJCi300.padModeHotcue && DJCi300.padMode[group] !== DJCi300.padModeHotcue) {
            DJCi300._wipeHotcueRow(group);
        }

        // --- 4) Sampler-Mode: Pads spiegeln Sampler-Status -------------------
        if (DJCi300.padMode[group] === DJCi300.padModeSampler) {
            DJCi300._updateSamplerPadsForGroup(group);
        }
    }

    // --- 5) Beatloop-/ROLL-Mode: nur das Pad des aktiven Loops leuchtet --
    // Beatloop hÃ¤ngt auf der â€žROLLâ€œ-Padmode-ID und nutzt fÃ¼r Deck A/B
    // die Notes 0x10â€“0x17 auf dem jeweiligen Pad-Status (0x96/0x97).
    if (DJCi300.padMode[group] === DJCi300.padModeRoll &&
        oldPadMode !== DJCi300.padModeRoll) {
        DJCi300._refreshLoopPadLEDs(group);
    } else if (oldPadMode === DJCi300.padModeRoll &&
        DJCi300.padMode[group] !== DJCi300.padModeRoll) {
        DJCi300._setPadRangeStatic(group, 0x10, 0x17, false);
    }

    // --- 6) Beatjump-Mode: statische LED-Beleuchtung der Pads -----------
    // Laut deinem XML:
    //   Deck A: status 0x96, midino 0x70â€“0x77
    //   Deck B: status 0x97, midino 0x70â€“0x77
    // Status kommt aus DJCi300.LED[group].pads, hier setzen wir nur die Note-Range.
    if (DJCi300.padMode[group] === DJCi300.padModeBeatjump &&
        oldPadMode !== DJCi300.padModeBeatjump) {
        DJCi300._setPadRangeStatic(group, 0x70, 0x77, true);
    } else if (oldPadMode === DJCi300.padModeBeatjump &&
        DJCi300.padMode[group] !== DJCi300.padModeBeatjump) {
        DJCi300._setPadRangeStatic(group, 0x70, 0x77, false);
    }

    // --- 7) FX-Pad-LEDs + Q-Indikator + SYNC-Blink sÃ¤ubern -------------------
    // FX-Mode: FX-Pad-LEDs beim Enter/Leave aktualisieren
    if (DJCi300.padMode[group] === DJCi300.padModeFX &&
        oldPadMode !== DJCi300.padModeFX) {
        // Enter FX-Mode â†’ LEDs anhand des aktuellen Mixxx-States ziehen
        DJCi300._updateFxPadsForDeck(group);
    } else if (oldPadMode === DJCi300.padModeFX &&
        DJCi300.padMode[group] !== DJCi300.padModeFX) {
        // FX-Mode verlassen â†’ FX-Bereich lÃ¶schen
        const st = DJCi300.LED[group].pads;
        for (let n = 0x50; n <= 0x5F; n++) {
            DJCi300.led.send(st, n, 0x00);
        }
    }

    // Q-Indikator nach jedem Mode-Wechsel aktualisieren
    DJCi300.updateStemsModeIndicator();
    // Sicherheit: evtl. laufendes Tempo-Only-Sync-Blink beenden,
    // damit beim schnellen Mode-Wechsel keine â€žhÃ¤ngendeâ€œ SYNC-LED bleibt.
    if (DJCi300._stopSyncTempoBlink) {
        DJCi300._stopSyncTempoBlink(group);
    }
};

///////////////////////////////////////////////////////////////
// 16) TONEPLAY (ORIGINAL) + LED-LOGIK
///////////////////////////////////////////////////////////////

// Original Toneplay behavior: hotcue goto + semitone pitch selection, with LED highlight.
DJCi300._toneplayOriginalImpl = function (_channel, control, value, _status, group) {
    if (!value) {
        return;
    }
    const rg = DJCi300._resolveGroup(group);
    let button = control - 0x40;

    if (button < 8) {
        const recentHotcue = engine.getValue(rg, "hotcue_focus");
        if ((recentHotcue > 0) && (engine.getValue(rg, `hotcue_${recentHotcue}_status`) > 0)) {
            engine.setValue(rg, `hotcue_${recentHotcue}_goto`, 1);
        } else {
            engine.setValue(rg, "cue_goto", 1);
        }
    }
    button = (button < 8) ? button : button - 8;
    if (button < 4) {
        engine.setValue(rg, DJCi300.toneplayPitchControl, button); // +0..+3
    } else {
        engine.setValue(rg, DJCi300.toneplayPitchControl, button - 8); // âˆ’4..âˆ’1
    }
};
// Update Toneplay LEDs to reflect current semitone selection (-4..+3).
DJCi300._updateToneplayLEDOriginal = function (value, group, _control) {
    const status = DJCi300.LED[group].pads;
    value = Math.round(Math.max(-4, Math.min(3, value)));
    for (let i = 0; i < 8; i++) {
        DJCi300.led.send(status, 0x40 + i, 0x00);
        DJCi300.led.send(status, 0x40 + i + 8, 0x00);
    }
    let ctrl = 0x40 + ((value >= 0) ? value : (8 + value));
    DJCi300.led.send(status, ctrl, 0x7F);
    DJCi300.led.send(status, ctrl + 8, 0x7F);
};

///////////////////////////////////////////////////////////////
// 17) PAD-BANK 0x13 DISPATCH (STEMS/TONEPLAY)
///////////////////////////////////////////////////////////////

// -- PAD MODE 0x13: TONEPLAY/STEMS DISPATCH --------------------------------
// Zentraler Handler fÃ¼r Pad-Bank 0x13. Leitet je nach Modus (STEMS/Toneplay)
// die Pad-Events weiter und kÃ¼mmert sich um Release-/Momentary-Logik.
// EXPERIMENTAL: `group` = physischer Strip (padMode/stems._solo bleiben
// darauf indiziert); `deck` = aufgelÃ¶stes logisches Deck (1..4), nur fÃ¼r die
// dynamisch gebauten `[ChannelN_StemX]`-Gruppen und script.triggerControl.
DJCi300.toneplay = function (channel, control, value, status, group) {
    const rg = DJCi300._resolveGroup(group);
    // Event-Entry: entscheidet anhand von isStemsMode() zwischen STEMS- und Toneplay-Zweig.
    // Parameter: channel/control/value/status/group kommen aus der MIDI-Zuordnung.
    if (!value && DJCi300.isStemsMode()) {
        const idx = control - 0x40; // Pad-Index innerhalb der Bank (0..15): 0x40..0x47 = Pads, 0x48..0x4F = Shift-Reihe.
        if ((idx >= 4 && idx <= 7) || (idx >= 12 && idx <= 15)) {
            const solo = DJCi300.stems._solo[group];
            // Release-Handling ausschlieÃŸlich fÃ¼r STEMS-Momentary-Funktionen:
            // - SOLO (Pads 5â€“8) und Hold-Mute (Shift+Pads 5â€“8) stellen beim Loslassen
            //   die vorherigen Mute-ZustÃ¤nde wieder her.
            if (solo && solo.active) {
                const deck = script.deckFromGroup(rg);
                for (let s = 1; s <= 4; s++) {
                    engine.setValue(`[Channel${deck}_Stem${s}]`, "mute", solo.prev[s - 1] ? 1 : 0);
                }
                // Wenn SOLO/Hold-Mute aktiv war: ursprÃ¼ngliche Stem-Mutes aus 'solo.prev' zurÃ¼cksetzen
                // und die LED-Anzeige aktualisieren.
                solo.active = false;
                solo.stem = -1;
                DJCi300.stems.refresh(group);
            }
            return;
        }
    }

    if (!value) {
        return; // Ab hier nur Press-Handling (value==1). Release wurde oben bereits behandelt.
    }

    if (DJCi300.isStemsMode()) {
        const idx = control - 0x40; // 0..15
        // BPM Tap (Shift+Pad 1): lÃ¶st 'bpm_tap' aus; keine LED-Ã„nderung erforderlich.
        if (control === 0x48) { // 0x40..0x47 = Pads, 0x48..0x4F = Shift-Reihe
            script.triggerControl(rg, "bpm_tap");
            return;
        }
        // STEMS-Zweig: Pad-Belegung innerhalb 0x13
        //  - Pads 1â€“4: Toggle Mute der Stems 1..4
        //  - Pads 5â€“8: SOLO (nur gewÃ¤hlter Stem hÃ¶rbar, solange gedrÃ¼ckt)
        //  - Shift+Pads 5â€“8: Hold-Mute (nur gewÃ¤hlter Stem stumm, solange gedrÃ¼ckt)
        //  - Shift+Pad 1 (0x48): BPM Tap

        // Pads 1â€“4 â†’ Toggle des Mute-Status fÃ¼r Stem 1..4, inkl. sofortigem LED-Refresh.
        if (idx >= 0 && idx < 4) {
            DJCi300.stems.toggleStem(group, idx);
            return;
        }
        // Pads 5â€“8 â†’ SOLO (momentary):
        //  - speichert aktuelle Mute-ZustÃ¤nde,
        //  - schaltet alle Stems stumm auÃŸer dem gewÃ¤hlten,
        //  - aktualisiert LEDs; RÃ¼cknahme erfolgt im Release-Block oben.
        if (idx >= 4 && idx <= 7) {
            const stemIdx = idx - 4;
            const deck = script.deckFromGroup(rg);
            const solo = DJCi300.stems._solo[group] || (DJCi300.stems._solo[group] = {
                        active: false,
                        prev: [0, 0, 0, 0],
                        stem: -1
                    });
            if (!solo.active) {
                solo.prev = [1, 2, 3, 4].map(s => engine.getValue(`[Channel${deck}_Stem${s}]`, "mute") > 0 ? 1 : 0);
                solo.active = true;
                solo.stem = stemIdx;
            }
            const m = [1, 1, 1, 1];
            m[stemIdx] = 0;
            for (let s = 1; s <= 4; s++) {
                engine.setValue(`[Channel${deck}_Stem${s}]`, "mute", m[s - 1] ? 1 : 0);
            }
            DJCi300.stems.refresh(group);
            return;
        }
        // Shift+Pads 5â€“8 â†’ Hold-Mute (momentary):
        //  - speichert aktuelle Mute-ZustÃ¤nde,
        //  - schaltet ausschlieÃŸlich den gewÃ¤hlten Stem stumm,
        //  - aktualisiert LEDs; RÃ¼cknahme erfolgt im Release-Block oben.
        if (idx >= 12 && idx <= 15) {
            const stemIdx = idx - 12;
            const deck = script.deckFromGroup(rg);
            const solo = DJCi300.stems._solo[group] || (DJCi300.stems._solo[group] = {
                        active: false,
                        prev: [0, 0, 0, 0],
                        stem: -1
                    });
            if (!solo.active) {
                solo.prev = [1, 2, 3, 4].map(s => engine.getValue(`[Channel${deck}_Stem${s}]`, "mute") > 0 ? 1 : 0);
                solo.active = true;
                solo.stem = stemIdx;
            }
            // nur der gewÃ¤hlte Stem stumm, alle anderen offen:
            for (let s = 1; s <= 4; s++) {
                const mute = (s === stemIdx + 1) ? 1 : 0;
                engine.setValue(`[Channel${deck}_Stem${s}]`, "mute", mute);
            }
            DJCi300.stems.refresh(group);
            return;
        }
        return;
    }

    // Toneplay-Zweig (Originalverhalten): Ãœbergabe an _toneplayOriginalImpl().
    return DJCi300._toneplayOriginalImpl(channel, control, value, status, group);
};

// LED-Update fÃ¼r Pad-Bank 0x13 im *Toneplay*-Modus:
//  - hÃ¤ngt an DJCi300.toneplayPitchControl (z. B. â€žpitch_adjustâ€œ),
//  - im STEMS-Mode Ã¼bernimmt DJCi300.stems.* das LED-Handling vollstÃ¤ndig selbst.
DJCi300.updateToneplayLED = function (value, group, control) {
    if (DJCi300.padMode[group] !== DJCi300.padModeToneplay)
        return;
    if (DJCi300.isStemsMode()) {
        // Im STEMS-Mode: keine Aktion. LEDs kommen aus DJCi300.stems.updateLED/refresh().
        return;
    }
    DJCi300._updateToneplayLEDOriginal(value, group, control);
};

///////////////////////////////////////////////////////////////
// 18) SLICER / SLICER LOOP
///////////////////////////////////////////////////////////////

// State pro Deck fÃ¼r die beatjump-Variante
DJCi300._slicerState = {
    "[Channel1]": {
        active: false,
        mode: "cont",
        beatsPassed: 0,
        timer: false,
        button: -1,
        conn: null,
    },
    "[Channel2]": {
        active: false,
        mode: "cont",
        beatsPassed: 0,
        timer: false,
        button: -1,
        conn: null,
    },
};

// Einheitlicher Entry-Point fÃ¼r SLICER / SLICER LOOP aus dem XML
DJCi300.slicerPadInput = function (channel, control, value, status, group) {
    // control ist 0x20..0x27 (Slicer) bzw. 0x60..0x67 (Slicer-Loop)
    //
    // Die Hardware sendet auf der SLICER-Bank IMMER 0x20-0x27, unabhÃ¤ngig
    // davon, worauf das Skript intern DJCi300.padMode[group] setzt (der
    // physische Slicer-Knopf wird in changeMode() auf padModeToneplay
    // umgebogen, siehe dortiger Kommentar). Damit STEMS-Mute tatsÃ¤chlich
    // per Pad 1-4 nach Druck auf "Slicer" erreichbar ist, muss dieser
    // Handler selbst prÃ¼fen, ob das Deck aktuell im STEMS-Modus ist, und
    // in diesem Fall die Pad-Events dorthin umleiten statt zum Beatjump.
    if (DJCi300.padMode[group] === DJCi300.padModeToneplay && DJCi300.isStemsMode()) {
        return DJCi300._stemsSlicerBankInput(channel, control, value, status, group);
    }
    return DJCi300._slicerPadPressBeatjump(channel, control, value, status, group);
};

// STEMS-Dispatch fÃ¼r Pads, die auf der physischen SLICER-Bank (0x20-0x27 /
// 0x60-0x67) ankommen, wÃ¤hrend das Deck im STEMS-Modus ist:
//  - Pads 1-4 (Index 0-3): Toggle Mute der Stems 1..4
//  - Pads 5-8 (Index 4-7): SOLO (momentary), analog zur Toneplay-Bank
DJCi300._stemsSlicerBankInput = function (_channel, control, value, _status, group) {
    const base = DJCi300._slicerRowBase(group);
    const idx = (control - base) & 0x07;

    if (idx >= 0 && idx < 4) {
        if (!value) {
            return;
        }
        DJCi300.stems.toggleStem(group, idx);
        return;
    }

    // Pads 5-8: SOLO (momentary) - press isoliert den gewÃ¤hlten Stem,
    // release stellt die vorherigen Mute-ZustÃ¤nde wieder her.
    const stemIdx = idx - 4;
    const deck = script.deckFromGroup(DJCi300._resolveGroup(group));
    const solo = DJCi300.stems._solo[group] || (DJCi300.stems._solo[group] = {
                active: false,
                prev: [0, 0, 0, 0],
                stem: -1
            });

    if (value) {
        if (!solo.active) {
            solo.prev = [1, 2, 3, 4].map(s => engine.getValue(`[Channel${deck}_Stem${s}]`, "mute") > 0 ? 1 : 0);
            solo.active = true;
            solo.stem = stemIdx;
        }
        const m = [1, 1, 1, 1];
        m[stemIdx] = 0;
        for (let s = 1; s <= 4; s++) {
            engine.setValue(`[Channel${deck}_Stem${s}]`, "mute", m[s - 1] ? 1 : 0);
        }
        DJCi300.stems.refresh(group);
    } else if (solo.active && solo.stem === stemIdx) {
        for (let s = 1; s <= 4; s++) {
            engine.setValue(`[Channel${deck}_Stem${s}]`, "mute", solo.prev[s - 1] ? 1 : 0);
        }
        solo.active = false;
        solo.stem = -1;
        DJCi300.stems.refresh(group);
    }
};

// Sichere BPM-Ermittlung
DJCi300._getBPM = function (group) {
    let bpm = engine.getValue(group, "bpm");
    if (!Number.isFinite(bpm) || bpm <= 0)
        bpm = engine.getValue(group, "local_bpm");
    if (!Number.isFinite(bpm) || bpm <= 0)
        bpm = engine.getValue(group, "file_bpm");
    return bpm;
};

// --- Slicer-LED-Logik (beatjump-Engine) ----------------
DJCi300._slicerUpdateLEDBeatjump = function (group) {
    const mode = DJCi300.padMode[group];
    // Nur im SLICER- oder SLICER-LOOP-Mode LEDs anfassen
    if (mode !== DJCi300.padModeSlicer &&
        mode !== DJCi300.padModeSlicerloop) {
        // Beim Verlassen des Modes sicherheitshalber alles lÃ¶schen
        DJCi300._slicerClearAllLEDs(group);
        return;
    }
    // beide Reihen lÃ¶schen
    DJCi300._slicerClearAllLEDs(group);
    const st = DJCi300._slicerState[group];
    if (!st || !st.active)
        return;
    const domain = DJCi300.selectedSlicerDomainBeats;
    const pos = Math.floor(((st.beatsPassed % domain) / (domain / 8)));
    const idx = Math.max(0, Math.min(7, pos));
    const show = (st.button >= 0) ? st.button : idx;
    // aktiv markierten Slice in BEIDE Reihen schreiben
    DJCi300._slicerSendPadLED(group, show, 0x7F);
};

// Beat-Callback: zÃ¤hlt â€žbeatsPassedâ€œ fÃ¼r LED- und Slice-Berechnung
DJCi300._slicerBeatActive = function (_v, group, _c) {
    const st = DJCi300._slicerState[group];
    if (!st || !st.active)
        return;
    const rg = DJCi300._resolveGroup(group);
    const playpos = engine.getValue(rg, "playposition");
    const duration = engine.getValue(rg, "duration");
    let bpm = DJCi300._getBPM(rg);
    if (!Number.isFinite(playpos) || !Number.isFinite(duration) || !Number.isFinite(bpm) || bpm <= 0)
        return;
    st.beatsPassed = Math.floor((playpos * duration) * (bpm / 60.0));
    DJCi300._slicerUpdateLEDBeatjump(group);
};

// Pad-Press fÃ¼r beatjump-Engine: springt in Slice, hÃ¤lt bis zum nÃ¤chsten Beat via slip
// EXPERIMENTAL: `group` = physischer Strip (State/LEDs); `rg` = aufgelÃ¶stes
// logisches Deck fÃ¼r alle engine.getValue/setValue-Aufrufe.
DJCi300._slicerPadPressBeatjump = function (_ch, control, value, _status, group) {
    if (!value)
        return;
    const st = DJCi300._slicerState[group];
    if (!st || !st.active)
        return;
    const rg = DJCi300._resolveGroup(group);
    const base = DJCi300._slicerRowBase(group);
    const idx = (control - base) & 0x07;
    const domain = DJCi300.selectedSlicerDomainBeats;
    const passed = engine.getValue(rg, "beat_distance"); // 0..1 in aktuellem Beat
    const loopOn = engine.getValue(rg, "loop_enabled") > 0;
    st.button = idx;
    const step = domain / 8; // Beats pro Slice
    const beatsToJump = (idx * step) - (st.beatsPassed % domain) - passed;
    if (loopOn)
        engine.setValue(rg, "reloop_toggle", 1); // Loop kurz verlassen
    engine.setValue(rg, "slip_enabled", 1);
    engine.setValue(rg, "beatjump", beatsToJump);
    if (loopOn)
        engine.setValue(rg, "reloop_toggle", 1);
    // One-shot Timer bis Beatende (ggf. +1 Beat â€žLate Pressâ€œ-QoL)
    let bpm = DJCi300._getBPM(rg);
    if (!Number.isFinite(bpm) || bpm <= 0)
        bpm = 120;
    let ms = (1 - passed) * 60.0 / bpm * 1000;
    if (passed >= 0.8 && !(loopOn && (st.beatsPassed % domain) === (domain - 1)))
        ms += 60.0 / bpm * 1000;
    if (st.timer && st.timer !== -1) {
        try {
            engine.stopTimer(st.timer);
        } catch (e) {}
    }
    st.timer = engine.beginTimer(ms, function () {
        engine.setValue(rg, "slip_enabled", 0);
        st.timer = -1;
        st.button = -1;
        DJCi300._slicerUpdateLEDBeatjump(group);
    }, true);
    DJCi300._slicerUpdateLEDBeatjump(group);
};

// SHIFT + Sampler-Pad: fÃ¼hrt denselben Beatjump-Slice wie
// _slicerPadPressBeatjump aus, aber unabhÃ¤ngig vom aktuellen padMode
// (Sampler-Pads bleiben sonst unverÃ¤ndert: normaler Press lÃ¤dt/spielt
// weiterhin den Sample-Slot). Nutzt die Deck-BPM/beat_distance direkt statt
// st.beatsPassed, da jene nur wÃ¤hrend aktivem Slicer-Mode per Connection
// mitgezÃ¤hlt wird. Bestehende Slicer-/Slicer-Loop-/STEMS-Logik bleibt
// unangetastet. EXPERIMENTAL: `group` = physischer Strip (Timer-Dict);
// `rg` = aufgelÃ¶stes logisches Deck fÃ¼r Engine-Zugriffe.
DJCi300._samplerShiftSlicerPress = function (_ch, control, value, _status, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    const idx = (control - 0x38) & 0x07;
    const domain = DJCi300.selectedSlicerDomainBeats;
    const passed = engine.getValue(rg, "beat_distance"); // 0..1 in aktuellem Beat
    if (!Number.isFinite(passed))
        return;
    const playpos = engine.getValue(rg, "playposition");
    const duration = engine.getValue(rg, "duration");
    let bpm = DJCi300._getBPM(rg);
    if (!Number.isFinite(bpm) || bpm <= 0)
        bpm = 120;
    let beatsPassed = 0;
    if (Number.isFinite(playpos) && Number.isFinite(duration))
        beatsPassed = Math.floor((playpos * duration) * (bpm / 60.0));
    const loopOn = engine.getValue(rg, "loop_enabled") > 0;
    const step = domain / 8; // Beats pro Slice
    const beatsToJump = (idx * step) - (beatsPassed % domain) - passed;
    if (loopOn)
        engine.setValue(rg, "reloop_toggle", 1); // Loop kurz verlassen
    engine.setValue(rg, "slip_enabled", 1);
    engine.setValue(rg, "beatjump", beatsToJump);
    if (loopOn)
        engine.setValue(rg, "reloop_toggle", 1);
    // One-shot Timer bis Beatende (ggf. +1 Beat â€žLate Pressâ€œ-QoL)
    let ms = (1 - passed) * 60.0 / bpm * 1000;
    if (passed >= 0.8 && !(loopOn && (beatsPassed % domain) === (domain - 1)))
        ms += 60.0 / bpm * 1000;
    if (DJCi300._samplerShiftSlicerTimer && DJCi300._samplerShiftSlicerTimer[group] && DJCi300._samplerShiftSlicerTimer[group] !== -1) {
        try {
            engine.stopTimer(DJCi300._samplerShiftSlicerTimer[group]);
        } catch (e) {}
    }
    if (!DJCi300._samplerShiftSlicerTimer)
        DJCi300._samplerShiftSlicerTimer = {};
    DJCi300._samplerShiftSlicerTimer[group] = engine.beginTimer(ms, function () {
        engine.setValue(rg, "slip_enabled", 0);
        DJCi300._samplerShiftSlicerTimer[group] = -1;
    }, true);
};

// Mapping-Helfer: 8 Pads IMMER im aktiven Block (0x20 = SLICER, 0x60 = SLICER-LOOP).
// Nutzt _physicalPadBank statt padMode, da SLICER intern auf padModeToneplay
// umgeleitet wird (STEMS-Mute), die Hardware-Pads aber weiterhin auf ihrer
// eigenen festen Notenreihe senden.
DJCi300._slicerRowBase = function (group) {
    return (DJCi300._physicalPadBank[group] === DJCi300.padModeSlicer) ? 0x20 : 0x60;
};

// LED-Helper: spiegelt Slicer-Pad-LEDs immer auf BEIDE Reihen (0x20 & 0x60)
DJCi300._slicerSendPadLED = function (group, idx, value) {
    const st = DJCi300.LED[group].pads;
    DJCi300.led.send(st, 0x20 + idx, value);
    DJCi300.led.send(st, 0x60 + idx, value);
};
DJCi300._slicerClearAllLEDs = function (group) {
    for (let i = 0; i < 8; i++)
        DJCi300._slicerSendPadLED(group, i, 0x00);
};

///////////////////////////////////////////////////////////////
// 19) STEMS-MODE
///////////////////////////////////////////////////////////////

// Ersetzt Toneplay auf Pad-Bank 0x13, wenn padBank13Mode === "stems".
//
// Design:
//  - Pads 1â€“4: Mute-Toggle der verfÃ¼gbaren Stems (1..4)
//  - Pads 5â€“8: SOLO (momentary) â€“ nur ein Stem offen, beim Loslassen wird
//              der vorherige Mute-Zustand wiederhergestellt.
//  - Shift+Pads 5â€“8: Hold-Mute (momentary) â€“ nur ein Stem stumm, Rest offen.
// LED-Feedback kommt direkt aus den Stem-Mute-Controls, keine XML-Outputs nÃ¶tig.
DJCi300.stems = {
    // Zuordnung: welcher Pad-Notecode gehÃ¶rt zu Stem 1..4 pro Deck.
    padNotes: {
        "[Channel1]": [0x40, 0x41, 0x42, 0x43],
        "[Channel2]": [0x40, 0x41, 0x42, 0x43],
    },

    // Stem-Reihenfolge umgekehrt: Pad 1<->4 und Pad 2<->3 getauscht.
    // padToStem[padIndex] liefert den Stem-Index (0..3), den dieses Pad steuert;
    // LEDs bleiben am physischen Pad, nur die angesteuerte Stem-Nummer Ã¤ndert sich.
    padToStem: [3, 2, 1, 0],

    // makeConnection-Handles pro Deck, um beim Mode-Wechsel sauber disconnecten zu kÃ¶nnen.
    conns: {
        "[Channel1]": [],
        "[Channel2]": [],
    },

    // SOLO-/Hold-Mute-Zustand pro Deck:
    //  - active: ob ein momentary SOLO/Hold aktiv ist
    //  - prev:   vorherige Mute-ZustÃ¤nde der Stems (zum Wiederherstellen auf Release)
    //  - stem:   Index des aktuell betroffenen Stems (0..3), -1 = keiner
    _solo: {
        "[Channel1]": {
            active: false,
            prev: [0, 0, 0, 0],
            stem: -1
        },
        "[Channel2]": {
            active: false,
            prev: [0, 0, 0, 0],
            stem: -1
        },
    },

    // Hilfsfunktion: stem_count sauber auf 0..4 clampen.
    // Erwartet bereits ein aufgelÃ¶stes (reales) Group-Argument.
    _getStemCount(rg) {
        const raw = engine.getValue(rg, "stem_count") | 0;
        return Math.max(0, Math.min(4, raw));
    },

    /**
     * Einstieg in den STEMS-Mode fÃ¼r ein Deck:
     *  - laufende SOLO-/Hold-Mute-ZustÃ¤nde verwerfen
     *  - bestehende Stem-Connections trennen
     *  - fÃ¼r vorhandene Stems Muteâ†’LED-Connections aufbauen
     *  - initialen LED-Zustand setzen (+ kleiner Retry via Timer)
     *
     * EXPERIMENTAL: `group` = physischer Strip (State/Conns/LEDs bleiben
     * darauf indiziert); alle Engine-Zugriffe/Connections laufen Ã¼ber
     * `rg`/`deck` = DJCi300._resolveGroup(group).
     */
    enter(group) {
        const rg = DJCi300._resolveGroup(group);
        // 1) laufende SOLO/Hold-ZustÃ¤nde verwerfen
        const solo = this._solo[group];
        if (solo) {
            solo.active = false;
            solo.stem = -1;
        }

        // 2) alte Stem-Verbindungen lÃ¶sen
        this.disconnect(group);

        // 3) Stem-Anzahl bestimmen (max. 4) und nur vorhandene Stems verdrahten
        const deck = script.deckFromGroup(rg);
        const count = this._getStemCount(rg);

        for (let stem = 1; stem <= count; stem++) {
            const g = `[Channel${deck}_Stem${stem}]`;
            const idx = stem - 1;
            const c = engine.makeConnection(g, "mute", () => {
                this.updateLED(group, idx);
            });
            this.conns[group].push(c);
        }

        // 4) LEDs anhand des aktuellen Mute-Status refreshen
        this.refresh(group);
        engine.beginTimer(80, () => this.refresh(group), true);
    },

    /**
     * Deaktiviert den STEMS-Modus auf einem Deck:
     *  - ggf. SOLO-/Hold-ZustÃ¤nde zurÃ¼cksetzen (alte Mutes wiederherstellen)
     *  - Pads leeren
     *  - Stem-Verbindungen trennen
     */
    leave(group) {
        // Falls SOLO/Hold aktiv war: ursprÃ¼ngliche Mutes wiederherstellen
        const solo = this._solo[group];
        if (solo && solo.active) {
            const deck = script.deckFromGroup(DJCi300._resolveGroup(group));
            for (let s = 1; s <= 4; s++) {
                engine.setValue(
`[Channel${deck}_Stem${s}]`,
                    "mute",
                    solo.prev[s - 1] ? 1 : 0);
            }
            solo.active = false;
            solo.stem = -1;
        }

        // Pads leeren und Verbindungen lÃ¶sen
        DJCi300._wipePadRows(group);
        DJCi300._slicerClearAllLEDs(group); // physische SLICER-Bank-LEDs (0x20-0x27) mitlÃ¶schen
        this.disconnect(group);
    },

    /**
     * Trennt alle zuvor angelegten makeConnection-Handles fÃ¼r dieses Deck,
     * um nach einem Mode-Wechsel keine Ghost-Updates zu bekommen.
     */
    disconnect(group) {
        const list = this.conns[group] || [];
        for (const c of list) {
            try {
                c.disconnect();
            } catch (e) {}
        }
        this.conns[group] = [];
    },

    // Toggle eines Stem-Mute-Status per Pad und anschlieÃŸende LED-Aktualisierung.
    // padIndex 0..3 â†’ Stem 1..4. `group` = physischer Strip.
    toggleStem(group, padIndex) {
        const rg = DJCi300._resolveGroup(group);
        const count = this._getStemCount(rg);
        const stemIndex = this.padToStem[padIndex];
        if (stemIndex >= count) {
            // kein gÃ¼ltiger Stem â†’ nichts tun
            return;
        }

        const deck = script.deckFromGroup(rg);
        const stem = stemIndex + 1;
        const g = `[Channel${deck}_Stem${stem}]`;
        const muted = engine.getValue(g, "mute") > 0;

        engine.setValue(g, "mute", muted ? 0 : 1);
        this.updateLED(group, padIndex);
    },

    // Setzt die LED eines einzelnen Stem-Pads passend zum aktuellen Mute-Status.
    // `group` = physischer Strip (LED-Adressen); Engine-Reads laufen Ã¼ber `rg`.
    updateLED(group, padIndex) {
        const rg = DJCi300._resolveGroup(group);
        const count = this._getStemCount(rg);
        const status = DJCi300.LED[group].pads;
        const bases = this.padNotes[group];
        const base = bases && bases[padIndex];
        // Physische SLICER-Bank-Note fÃ¼r dasselbe Pad (0x20-0x23), da die
        // Hardware wÃ¤hrend "Slicer"-Modus auf dieser Notenreihe sendet/lechtet,
        // unabhÃ¤ngig von der internen padModeToneplay-Umleitung.
        const slicerBase = DJCi300._slicerRowBase(group) + padIndex;

        // UngÃ¼ltiger Index oder kein Pad-Mapping â†’ nichts machen.
        if (!Number.isFinite(base)) {
            return;
        }

        const stemIndex = this.padToStem[padIndex];

        // Pads auÃŸerhalb der vorhandenen Stem-Anzahl bleiben aus.
        if (stemIndex >= count) {
            DJCi300.led.send(status, base, 0x00);
            DJCi300.led.send(status, base + 0x08, 0x00);
            DJCi300.led.send(status, slicerBase, 0x00);
            return;
        }

        const deck = script.deckFromGroup(rg);
        const stem = stemIndex + 1;
        const g = `[Channel${deck}_Stem${stem}]`;
        const muted = engine.getValue(g, "mute") > 0;
        const v = muted ? 0x00 : 0x7F;

        DJCi300.led.send(status, base, v); // Basis (Pads 1â€“4)
        DJCi300.led.send(status, base + 0x08, v); // Shift (Pads 1â€“4 bei gedrÃ¼cktem Shift)
        DJCi300.led.send(status, slicerBase, v); // physische SLICER-Bank-Pads 1â€“4
    },

    // Setzt die STEM-Pads gemÃ¤ÃŸ aktuellem Mute-Zustand neu (Full-Refresh).
    refresh(group) {
        const rg = DJCi300._resolveGroup(group);
        // Zuerst alle STEM-Pads lÃ¶schen â€¦
        DJCi300._wipePadRows(group);
        // â€¦ und auch die physische SLICER-Bank (0x20-0x27), da Pads 1-4 dort
        // wÃ¤hrend STEMS-Mode das Mute-Feedback zeigen.
        DJCi300._slicerClearAllLEDs(group);

        // â€¦ dann nur die tatsÃ¤chlich vorhandenen Stems neu setzen.
        const count = this._getStemCount(rg);
        for (let i = 0; i < count; i++) {
            this.updateLED(group, i);
        }
    },
};

///////////////////////////////////////////////////////////////
// 20) FX UNIT
///////////////////////////////////////////////////////////////

// Toggle: schaltet Unit + Slots 1..3 gemeinsam (all-on â†” all-off)
// EXPERIMENTAL: unitIdx/routeKey werden jetzt aus dem AUFGELÃ–STEN Deck
// abgeleitet (DJCi300._fxUnitForDeck), damit SHIFT+LOAD-Toggle auf Deck 3/4
// automatisch die richtige Unit + das richtige Routing-Control anspricht.
DJCi300.fx123Toggle = function (_ch, _ctrl, value, _st, group) {
    if (!value)
        return;
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);
    const unitIdx = DJCi300._fxUnitForDeck(deck);
    const U = `[EffectRack1_EffectUnit${unitIdx}]`;
    const S = n => `[EffectRack1_EffectUnit${unitIdx}_Effect${n}]`;
    const routeKey = `group_[Channel${deck}]_enable`;

    const s1 = engine.getValue(S(1), "enabled") > 0;
    const s2 = engine.getValue(S(2), "enabled") > 0;
    const s3 = engine.getValue(S(3), "enabled") > 0;
    const allOn = (engine.getValue(U, "enabled") > 0) && s1 && s2 && s3;

    if (allOn) {
        // OFF: Slots zuerst, dann Unit
        engine.setValue(S(3), "enabled", 0);
        engine.setValue(S(2), "enabled", 0);
        engine.setValue(S(1), "enabled", 0);
        engine.setValue(U, "enabled", 0);
        // Routing optional mit aus â€“ â€žklinisch sauberâ€œ
        try {
            engine.setValue(U, routeKey, 0);
        } catch (e) {}
    } else {
        // ON: Unit + Routing zuerst, dann Slots
        engine.setValue(U, routeKey, 1);
        engine.setValue(U, "enabled", 1);
        engine.setValue(S(1), "enabled", 1);
        engine.setValue(S(2), "enabled", 1);
        engine.setValue(S(3), "enabled", 1);
    }
};

// LED: an, wenn wenigstens ein Slot aktiv und Unit an
// EXPERIMENTAL: `group` ist hier immer der PHYSISCHE Strip (Aufrufer:
// DJCi300._buildDeckConnections / Track-Load-Callbacks etc.) - unitIdx wird
// daher Ã¼ber das aktuell aufgelÃ¶ste Deck bestimmt, die LED-Adresse bleibt
// aber am physischen Strip (DJCi300._st(group)).
DJCi300.updateFxButtonLED = function (group) {
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg);
    const unitIdx = DJCi300._fxUnitForDeck(deck);
    const S = n => `[EffectRack1_EffectUnit${unitIdx}_Effect${n}]`;

    // LED an, sobald mindestens EIN FX-Slot aktiv ist â€“ egal,
    // ob die Unit selbst "enabled" ist.
    const anySlotOn =
        (engine.getValue(S(1), "enabled") > 0) ||
    (engine.getValue(S(2), "enabled") > 0) ||
    (engine.getValue(S(3), "enabled") > 0);

    const st = DJCi300._st(group);
    const fxNote = DJCi300.LED.notes.FX;
    DJCi300.led.send(st, fxNote, anySlotOn ? 0x7F : 0x00);
};

// FX-Pad-LEDs fÃ¼r padModeFX spiegeln:
// Laut XML:
//  Deck A (Status 0x96):
//    - 0x50â€“0x52: Unit 1 Slot 1â€“3 enabled
//    - 0x53:      Unit 1 â†’ Deck A (group_[Channel1]_enable)
//    - 0x57:      Unit 2 â†’ Deck A (group_[Channel1]_enable)
//    - 0x58â€“0x5A: Unit 3 Slot 1â€“3 enabled
//    - 0x5B:      Unit 3 â†’ Deck A
//    - 0x5F:      Unit 4 â†’ Deck A
//
//  Deck B (Status 0x97):
//    - 0x50â€“0x52: Unit 2 Slot 1â€“3 enabled
//    - 0x53:      Unit 1 â†’ Deck B (group_[Channel2]_enable)
//    - 0x57:      Unit 2 â†’ Deck B
//    - 0x58â€“0x5A: Unit 4 Slot 1â€“3 enabled
//    - 0x5B:      Unit 3 â†’ Deck B
//    - 0x5F:      Unit 4 â†’ Deck B
// EXPERIMENTAL: `group` ist der PHYSISCHE Strip; deck wird Ã¼ber
// DJCi300._resolveGroup() aufgelÃ¶st (1..4). unitUnshift/unitShift kommen aus
// DJCi300._fxSlotUnitsForDeck(deck), die konsistent zu _fxUnitForDeck bleibt
// (Deck 1&3 -> Units 1/3, Deck 2&4 -> Units 2/4).
DJCi300._updateFxPadsForDeck = function (group) {
    const st = DJCi300.LED[group].pads;
    const rg = DJCi300._resolveGroup(group);
    const deck = script.deckFromGroup(rg); // 1..4

    const route = (unitIdx) =>
    engine.getValue(
        `[EffectRack1_EffectUnit${unitIdx}]`,
`group_[Channel${deck}]_enable`) > 0;

    const slotEnabled = (unitIdx, slotIdx) =>
    engine.getValue(
`[EffectRack1_EffectUnit${unitIdx}_Effect${slotIdx}]`,
        "enabled") > 0;

    // Welche Units liefern die Slot-States?
    const [unitUnshift, unitShift] = DJCi300._fxSlotUnitsForDeck(deck); // 0x50â€“0x52 / 0x58â€“0x5A

    // --- Auto-Arm: sobald ein Pad-Slot aktiv ist, Unit + Routing fÃ¼r dieses Deck einschalten
    const autoArmUnit = (unitIdx) => {
        const U = `[EffectRack1_EffectUnit${unitIdx}]`;
        const routeKey = `group_[Channel${deck}]_enable`;
        const unitOn = engine.getValue(U, "enabled") > 0;
        const routed = engine.getValue(U, routeKey) > 0;

        // Nur im echten â€žalles ausâ€œ-Fall auto-armen:
        // verhindert, dass man manuelles Routing sofort wieder â€žweg-automatisiertâ€œ.
        if (!unitOn && !routed) {
            engine.setValue(U, "enabled", 1);
            engine.setValue(U, routeKey, 1);
        }
    };

    const anyUnshiftSlotOn =
        slotEnabled(unitUnshift, 1) ||
        slotEnabled(unitUnshift, 2) ||
        slotEnabled(unitUnshift, 3);

    const anyShiftSlotOn =
        slotEnabled(unitShift, 1) ||
        slotEnabled(unitShift, 2) ||
        slotEnabled(unitShift, 3);

    if (anyUnshiftSlotOn) {
        autoArmUnit(unitUnshift);
    }
    if (anyShiftSlotOn) {
        autoArmUnit(unitShift);
    }

    // Nur im FX-Mode LEDs anzeigen, sonst Bereich leeren
    if (DJCi300.padMode[group] !== DJCi300.padModeFX) {
        for (let n = 0x50; n <= 0x5F; n++) {
            DJCi300.led.send(st, n, 0x00);
        }
        return;
    }

    // --- Unshift-Reihe: 0x50â€“0x57 -----------------------------------------
    DJCi300.led.send(st, 0x50, slotEnabled(unitUnshift, 1) ? 0x7F : 0x00);
    DJCi300.led.send(st, 0x51, slotEnabled(unitUnshift, 2) ? 0x7F : 0x00);
    DJCi300.led.send(st, 0x52, slotEnabled(unitUnshift, 3) ? 0x7F : 0x00);

    DJCi300.led.send(st, 0x53, route(1) ? 0x7F : 0x00); // Unit 1 â†’ Deck
    // 0x54â€“0x56 = next_effect â†’ LED-neutral
    DJCi300.led.send(st, 0x57, route(2) ? 0x7F : 0x00); // Unit 2 â†’ Deck

    // --- Shift-Reihe: 0x58â€“0x5F -------------------------------------------
    DJCi300.led.send(st, 0x58, slotEnabled(unitShift, 1) ? 0x7F : 0x00);
    DJCi300.led.send(st, 0x59, slotEnabled(unitShift, 2) ? 0x7F : 0x00);
    DJCi300.led.send(st, 0x5A, slotEnabled(unitShift, 3) ? 0x7F : 0x00);

    DJCi300.led.send(st, 0x5B, route(3) ? 0x7F : 0x00); // Unit 3 â†’ Deck
    // 0x5Câ€“0x5E = next_effect â†’ LED-neutral
    DJCi300.led.send(st, 0x5F, route(4) ? 0x7F : 0x00); // Unit 4 â†’ Deck
};