// Ortsunabhängige Prüfungen der Seq-6-Rituale (Seb, 2026-11-12). Weil es keine Rückreise in frühere Städte gibt,
// darf ein Ritual nicht an Orte oder Fälle hängen, die man verpasst haben kann. Vier Pfade legen stattdessen
// eine zufällige Probe ab, die überall geht und jedes Mal anders ausfällt:
// - faden: vier Spuren ihrem Schluss zuordnen (Zufallsauswahl aus einem Vorrat, mit falschen Fährten).
// - echo:  drei Stimmen lauschen, eine hallt nach und wird dem Sprecher zugeordnet (Stimmenprüfung).
// - moor:  sieben Namen merken; dann fehlt einer und einer ist neu.
// - uhr:   eine Frist ohne Uhr abzählen: nach genau n Sekunden anhalten.
// Bestanden setzt das Flag probe_<pfad>_<seq> (Spieler 2: p2_…), das der Ritualschritt abfragt.
// Ein Fehlversuch kostet Nerven und bringt Unruhe; die nächste Probe ist eine neue.

export const PROBE_FAIL = { nerves: 10, unruhe: 5 };
export const UHR_TOLERANZ = 0.8; // Sekunden

/** Spur → Schluss. Jede Probe zieht vier Paare und mischt die Schlüsse als Antworten. */
export const FADEN_PAARE = [
  ['Nasse Stiefel im Flur, aber kein Regen seit Tagen', 'Jemand kam über den Kanal'],
  ['Die Kerze ist von zwei Seiten abgebrannt', 'Sie wurde mehrfach umgesteckt'],
  ['Tintenfleck am rechten Ärmel', 'Der Schreiber ist Linkshänder'],
  ['Der Hund hat nicht gebellt', 'Der Besucher war ihm vertraut'],
  ['Asche im kalten Kamin, Fensterriegel offen', 'Papiere wurden verbrannt, dann gelüftet'],
  ['Zwei Teetassen, nur eine mit Lippenspur', 'Der Gast hat nicht getrunken'],
  ['Die Taschenuhr blieb um drei stehen', 'Sie fiel beim Handgemenge zu Boden'],
  ['Frischer Lehm an der Schaufel, aber trockene Beete', 'Gegraben wurde nicht im Garten'],
  ['Brief mit Datum von gestern, Poststempel von morgen', 'Der Brief ist gefälscht'],
  ['Der Schlüssel steckt von innen', 'Niemand ist durch diese Tür gegangen'],
  ['Salzränder an den Hosenbeinen', 'Er stand im Watt'],
  ['Die Uhr im Flur geht vor, die in der Küche nach', 'Die Zeitangaben der Zeugen passen doch zusammen'],
  ['Ein Handschuh fehlt, der andere liegt gefaltet da', 'Der Täter wurde unterbrochen'],
  ['Spinnweben über dem Riegel der Hintertür', 'Der Weg führte durch den Vordereingang'],
];

/** Stimmen im Nebel: wer spricht, und was man von ihm hören kann. */
export const ECHO_STIMMEN = {
  'Die Alte vom Markt': ['„Zwölf Pence das Pfund, und keinen Penny weniger.“', '„Meine Mutter hat das noch anders gesungen.“', '„Da war ein Licht über dem Wasser, ich schwör’s.“'],
  'Das Kind aus dem Hof': ['„Ich war das nicht. Das war der Hund.“', '„Kannst du auch mit den Toten reden?“', '„Mama sagt, nachts geht man nicht zum Kanal.“'],
  'Der Bälgetreter': ['„Die Orgel atmet nur, wenn ich trete.“', '„Nach dem Brand haben sie weitergesungen. Woanders.“', '„Ich hör sie noch, jede Nacht, im Takt.“'],
  'Die Wäscherin': ['„Blut geht mit kaltem Wasser raus, Ruß nie.“', '„Der Herr hatte Salz an den Manschetten.“', '„Wer Hemden flickt, kennt die Narben der Leute.“'],
  'Der Schaffner': ['„Einsteigen, wer bezahlt hat. Die anderen bleiben.“', '„Der Nachtzug hält hier nicht. Hat nie gehalten.“', '„Die Uhr am Bahnsteig lügt um vier Minuten.“'],
  'Der Laternenanzünder': ['„Jede dritte Flamme geht von allein aus.“', '„Im Nebel brennt das Gas blau, merken Sie sich das.“', '„Ich zünde sie an, ich lösche sie nicht.“'],
  'Die Gräfin ohne Namen': ['„Man vergisst mich. Das ist meine Mitgift.“', '„Ein Siegel ist nur Wachs, bis einer daran glaubt.“', '„Mein Bruder wartet unten. Er wartet lange.“'],
  'Der Fuhrmann': ['„Vier Kisten rein, drei raus. Zählen Sie selbst.“', '„Die Gäule scheuen vor der Brücke. Immer.“', '„Wer nachts lädt, zahlt doppelt.“'],
};

/** Namen aus dem Torfgedächtnis: Täfelchen am Schrein, die keiner mehr trägt. */
export const MOOR_NAMEN = [
  'Agathe Torf', 'Benedikt Kaar', 'Cordula Riet', 'Dorian Veck', 'Edda Moll', 'Fenn Halloran', 'Greta Sumpf', 'Hilde Wrack',
  'Ignaz Brack', 'Jorun Pfahl', 'Käthe Lorn', 'Lennart Fenn', 'Maren Salt', 'Nikolas Rohr', 'Ottilie Schlick', 'Pelle Weide',
  'Quirin Tann', 'Rosalind Moor', 'Sievert Aal', 'Thea Binse', 'Ulrich Dunst', 'Veit Klamm', 'Wiebke Nebel', 'Xaver Torf',
];

export const PROBE_NAMEN = { faden: 'Die Fadenprobe', echo: 'Die Stimmenprüfung', moor: 'Die Namensprobe', uhr: 'Die Fristprobe' };

/** Mischt eine Kopie. */
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const probeMethods = {
  /** Merker für eine bestandene Probe (Spieler 2 hat eigene, wie beim Ritual). */
  probeFlag(pid, seq) {
    return `${this.acting === 2 ? 'p2_' : ''}probe_${pid}_${seq}`;
  },

  probeDone(pid, seq) {
    return this.flags.has(this.probeFlag(pid, seq));
  },

  /** Welche Probe das nächste Ritual verlangt (oder null). */
  pendingProbe(pid = this.pathway?.id, seq = (this.pathway?.seq ?? 0) - 1) {
    const r = this.ritualDef(pid, seq);
    if (!r?.probe || this.probeDone(pid, seq) || this.ritualDone(pid, seq)) return null;
    return { kind: r.probe, pid, seq, name: PROBE_NAMEN[r.probe] ?? 'Die Probe' };
  },

  /**
   * Beginnt die Probe des nächsten Rituals. Der Ablauf steht danach in `this.probe`:
   * { kind, pid, seq, step, rounds: [{ prompt, options, answer }], listen?: [...] , target?, startedAt? }.
   */
  startProbe(rng = Math.random, now = Date.now()) {
    const p = this.pendingProbe();
    if (!p) return { ok: false, text: 'Dein nächstes Ritual verlangt keine Probe.' };
    const probe = { ...p, step: 0, rounds: [], log: [] };
    if (p.kind === 'faden') {
      const pairs = shuffle(FADEN_PAARE, rng).slice(0, 4);
      const answers = pairs.map((x) => x[1]);
      probe.rounds = pairs.map(([spur, schluss]) => ({ prompt: spur, options: shuffle(answers, rng), answer: schluss }));
      probe.intro = 'Vier Spuren, vier Schlüsse. Knüpf jede an den Faden, der trägt. Ein falscher Knoten, und das Netz reißt.';
    } else if (p.kind === 'echo') {
      // Seb (2026-11-12): leicht halten. Drei Stimmen von drei Sprechern; eine hallt nach und muss zugeordnet werden.
      const speakers = shuffle(Object.keys(ECHO_STIMMEN), rng).slice(0, 3);
      const lines = speakers.map((s) => ({ who: s, text: ECHO_STIMMEN[s][Math.floor(rng() * ECHO_STIMMEN[s].length)] }));
      probe.listen = shuffle(lines, rng);
      const again = probe.listen[Math.floor(rng() * probe.listen.length)];
      probe.rounds = [{ prompt: `Eine Stimme hallt nach: ${again.text} Wer war das?`, options: shuffle(speakers, rng), answer: again.who }];
      probe.intro = 'Streu den Staub, schließ die Augen. Drei Stimmen reden aus dem Nebel. Eine davon kommt als Nachhall zurück, und du nennst ihren Namen.';
    } else if (p.kind === 'moor') {
      const pool = shuffle(MOOR_NAMEN, rng);
      const shown = pool.slice(0, 7);
      const missing = shown[Math.floor(rng() * shown.length)];
      const added = pool[7];
      const second = shuffle([...shown.filter((n) => n !== missing), added], rng);
      probe.listen = shown;
      probe.second = second;
      probe.rounds = [
        { prompt: 'Welcher Name fehlt jetzt am Schrein?', options: shuffle([missing, ...pool.slice(8, 11)], rng), answer: missing },
        { prompt: 'Welcher Name ist neu dazugekommen?', options: shuffle([added, ...shuffle(shown.filter((n) => n !== missing), rng).slice(0, 3)], rng), answer: added },
      ];
      probe.intro = 'Sieben Täfelchen hängen am Schrein. Präg dir jeden Namen ein. Dann kommt die Flut, und du sagst, was fehlt und was fremd ist.';
    } else if (p.kind === 'uhr') {
      probe.target = 7 + Math.floor(rng() * 6); // 7 bis 12 Sekunden
      probe.startedAt = null;
      probe.intro = `Keine Uhr, kein Zählwerk, nur dein Atem. Halte nach genau ${probe.target} Sekunden an. Erlaubt sind ${UHR_TOLERANZ.toString().replace('.', ',')} Sekunden Abweichung.`;
    } else {
      return { ok: false, text: `Unbekannte Probe: ${p.kind}` };
    }
    this.probe = probe;
    this.sfx('probe_start');
    // DS: drei Nebelstimmen ohne Worte, nacheinander (Varianten 1 bis 3)
    if (p.kind === 'echo') probe.listen.forEach((_, i) => this.sfx('probe_echo_stimme', { variant: i + 1, delay: 700 + i * 1500 }));
    this.emit('changed');
    return { ok: true, probe };
  },

  /** Echo und Moor: vom Lauschen beziehungsweise Einprägen zu den Fragen. */
  probeListened() {
    const pr = this.probe;
    if (!pr || pr.phase === 'fragen') return { ok: false };
    pr.phase = 'fragen';
    if (pr.kind === 'echo') this.sfx('probe_echo_nachhall'); // DS: eine Stimme kommt gedämpft zurück
    if (pr.kind === 'moor') this.sfx('probe_moor_name_weg'); // DS: die Flut nimmt einen Namen mit
    return { ok: true };
  },

  /** Uhr: die Frist beginnt. */
  probeStart(now = Date.now()) {
    const pr = this.probe;
    if (!pr || pr.kind !== 'uhr') return { ok: false };
    pr.startedAt = now;
    this.sfx('probe_uhr_puls'); // DS: zwei Schläge, dann zählst du allein
    return { ok: true };
  },

  /** Uhr: anhalten. */
  probeStop(now = Date.now()) {
    const pr = this.probe;
    if (!pr || pr.kind !== 'uhr' || pr.startedAt === null) return { ok: false, text: 'Die Frist läuft noch nicht.' };
    const elapsed = (now - pr.startedAt) / 1000;
    const diff = Math.abs(elapsed - pr.target);
    const shown = elapsed.toFixed(1).replace('.', ',');
    if (diff <= UHR_TOLERANZ) return this.finishProbe(true, `${shown} Sekunden. Der fehlende Schlag sitzt genau, wo du ihn gehört hast.`);
    return this.finishProbe(false, `${shown} Sekunden statt ${pr.target}. ${elapsed < pr.target ? 'Zu früh: die Frist war noch nicht um.' : 'Zu spät: der Zug ist weg.'}`);
  },

  /** Faden, Echo, Moor: eine Antwort auf die aktuelle Frage (Index in options). */
  probeAnswer(i) {
    const pr = this.probe;
    if (!pr || !pr.rounds.length) return { ok: false };
    const round = pr.rounds[pr.step];
    if (!round) return { ok: false };
    const picked = round.options[i];
    if (picked === undefined) return { ok: false };
    if (picked !== round.answer) {
      const why = { faden: 'Der Knoten hält nicht. Das Netz reißt.', echo: 'Die Stimme gehörte jemand anderem. Der Nachhall verliert sich.', moor: 'Falscher Name. Das Moor behält ihn für sich.' }[pr.kind];
      return this.finishProbe(false, `${why} Richtig wäre gewesen: ${round.answer}.`);
    }
    pr.step += 1;
    pr.log.push(`✓ ${round.answer}`);
    if (pr.kind === 'faden') this.sfx('probe_faden_verbinden');
    if (pr.step >= pr.rounds.length) {
      const done = { faden: 'Alle vier Knoten halten. Das Netz trägt.', echo: 'Der Nachhall hat einen Namen. Du kennst ihn.', moor: 'Was fehlte und was fremd war: beides hast du gesehen.' }[pr.kind];
      return this.finishProbe(true, done);
    }
    this.emit('changed');
    return { ok: true, next: pr.rounds[pr.step] };
  },

  /** Abbruch (Fenster geschlossen): zählt wie ein Fehlversuch nur, wenn schon geantwortet oder die Frist lief. */
  cancelProbe() {
    const pr = this.probe;
    if (!pr) return { ok: false };
    if (pr.step > 0 || pr.startedAt) return this.finishProbe(false, 'Abgebrochen. Die Probe zählt als misslungen.');
    this.probe = null;
    return { ok: true };
  },

  finishProbe(passed, text) {
    const pr = this.probe;
    if (!pr) return { ok: false };
    this.probe = null;
    if (passed) {
      this.flags.add(this.probeFlag(pr.pid, pr.seq));
      this.sfx('probe_bestanden', { delay: pr.kind === 'faden' ? 500 : 0 });
      this.emit('probe', { pathway: pr.pid, seq: pr.seq, passed: true, player: this.acting ?? 1 });
      this.emit('changed');
      return { ok: true, passed: true, text: `${pr.name}: bestanden. ${text}` };
    }
    this.sfx('probe_fehlversuch');
    this.setComposure(this.composure - PROBE_FAIL.nerves);
    if (this.pathway) this.setUnruhe(this.unruhe + PROBE_FAIL.unruhe);
    this.emit('probe', { pathway: pr.pid, seq: pr.seq, passed: false, player: this.acting ?? 1 });
    this.emit('changed');
    return { ok: true, passed: false, text: `${pr.name}: misslungen. ${text} (−${PROBE_FAIL.nerves} Nerven, +${PROBE_FAIL.unruhe} Unruhe.) Du kannst es gleich noch einmal versuchen, die Probe fällt dann anders aus.` };
  },
};
