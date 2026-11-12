// Codex DI: Post und Briefe (Daten: packs/post). 91 Briefe in 30 Reihen von Figuren früherer Städte.
// Eine Reihe öffnet sich, wenn man mit der Figur gesprochen hat (Gesprächsstand, post_kontakt_<npc>),
// ihr Kapitel erreicht ist (k<n>_arrived) und genug Spieltage seit dem Zeitanker vergangen sind.
// Höchstens zwei neue Briefe pro Spieltag; der Rest wartet. Lesen, Antworten und Beilage abholen
// geht überall im Notizbuch (Reiter „Post“), eine Rückreise ist nie nötig.
// Vereinfachung im Koop: ein gemeinsames Postfach, antworten darf jeder (beide sitzen am selben Rechner).
import { DAY_SECONDS } from './Clock.js';

export const POST_LIMIT = 2;
const ANKUNFT = { 2: 'k2_arrived', 3: 'k3_arrived', 4: 'k4_arrived', 5: 'k5_arrived', 6: 'k6_arrived' };
/** Zirkel-Absender: Kontakt über das erste Treffen. */
const ZIRKEL_KONTAKT = { zirkel_lichtlose: 'treffen_lichtlose', zirkel_schichtbund: 'treffen_schichtbund' };

const emptyPost = () => ({ fach: [], anker: {}, faellig: {}, tag: -1, heute: 0 });

export const postMethods = {
  postDaten() {
    return this.content.post ?? null;
  },

  postTag() {
    return Math.floor((this.playTime ?? 0) / DAY_SECONDS);
  },

  postBrief(id) {
    return this.postDaten()?.briefe.find((b) => b.id === id) ?? null;
  },

  /** Kontaktflags aus dem Gesprächsstand ableiten (auch für alte Spielstände), Ankunftsanker setzen. */
  postSync() {
    const d = this.postDaten();
    if (!d) return;
    this.post ??= emptyPost();
    const seen = [...(this.seenNodes ?? [])];
    for (const a of d.post.absender) {
      const flag = a.freigabe_flag ?? `post_kontakt_${a.npc}`;
      if (this.flags.has(flag)) continue;
      const npc = this.content.npcs?.[a.npc];
      const talked = ZIRKEL_KONTAKT[a.npc] ? this.flags.has(ZIRKEL_KONTAKT[a.npc]) : !!npc?.dialogue && seen.some((k) => k.startsWith(`${npc.dialogue}.`));
      if (talked) this.flags.add(flag);
    }
    // Oda schreibt nur bei offenem Auftrag
    if ((this.pendingOrders?.() ?? []).length) this.flags.add('post_fasserin_auftrag_offen');
    else this.flags.delete('post_fasserin_auftrag_offen');
    const tag = this.postTag();
    for (const [k, f] of Object.entries(ANKUNFT)) if (this.flags.has(f) && this.post.anker[`post_ankunft_${k}`] === undefined) this.post.anker[`post_ankunft_${k}`] = tag;
  },

  postBeziehungsId(npc) {
    const a = this.postDaten()?.post.absender.find((x) => x.npc === npc);
    return a?.beziehungs_id ?? null;
  },

  /** Sind alle Bedingungen für die Zustellung erfüllt? */
  postFaellig(b) {
    const a = b.ausloeser ?? {};
    if ((a.requires_flags ?? []).some((f) => !this.flags.has(f))) return false;
    if (a.requires_any_flags?.length && !a.requires_any_flags.some((f) => this.flags.has(f))) return false;
    const anker = this.post.anker[a.zeitanker];
    if (anker === undefined) return false;
    if (this.postTag() - anker < (a.tage_nach ?? 0)) return false;
    if (b.absender) {
      const rid = this.postBeziehungsId(b.absender);
      if (rid && this.content.npcs?.[rid] && this.relation(rid) < (a.beziehung_min ?? 0)) return false;
    }
    return true;
  },

  /** Zustellung: fällige Briefe ins Fach, höchstens zwei pro Spieltag. Gibt die neu zugestellten zurück. */
  checkPost() {
    if (!this.postDaten()) return [];
    this.postSync();
    const p = this.post;
    const tag = this.postTag();
    if (p.tag !== tag) { p.tag = tag; p.heute = 0; }
    const da = new Set(p.fach.map((f) => f.id));
    const kandidaten = this.postDaten().briefe.filter((b) => !da.has(b.id) && this.postFaellig(b));
    for (const b of kandidaten) if (p.faellig[b.id] === undefined) p.faellig[b.id] = tag;
    kandidaten.sort((x, y) => x.kapitel - y.kapitel || p.faellig[x.id] - p.faellig[y.id] || (x.id < y.id ? -1 : 1));
    const neu = [];
    for (const b of kandidaten) {
      if (p.heute >= POST_LIMIT) break;
      p.fach.push({ id: b.id, tag, gelesen: false, antwort: null, beilage: Object.keys(b.beilage ?? {}).length ? false : null });
      p.heute += 1;
      this.flags.add(`${b.id}_zugestellt`);
      neu.push(b);
    }
    if (neu.length) {
      const m = this.postDaten().post.buero ?? [];
      this.emit('notice', m[Math.min(m.length - 1, neu.length - 1)]?.text ?? 'Du hast Post.');
      this.emit('post', neu.map((b) => b.id));
      this.emit('changed');
    }
    return neu;
  },

  postFach() {
    return [...(this.post?.fach ?? [])].reverse();
  },

  postUngelesen() {
    return (this.post?.fach ?? []).filter((f) => !f.gelesen).length;
  },

  /** Text eines Briefs mit dem passenden Nachsatz (genau eine Variante passt). */
  postText(id) {
    const b = this.postBrief(id);
    if (!b) return '';
    const n = (b.nachsatz_varianten ?? []).find((v) => (v.requires_flags ?? []).every((f) => this.flags.has(f)));
    return n ? `${b.text}\n\n${n.text}` : b.text;
  },

  postAbsender(b) {
    if (!b.absender) return 'Ohne Absender';
    return this.content.npcs?.[b.absender]?.name ?? this.postDaten().post.absender.find((a) => a.npc === b.absender)?.name ?? b.absender;
  },

  postLesen(id) {
    const f = this.post?.fach.find((x) => x.id === id);
    if (!f || f.gelesen) return;
    f.gelesen = true;
    this.flags.add(`${id}_gelesen`);
    this.emit('changed');
  },

  /** Antwort wählen (einmalig): setzt das Antwortflag und den Zeitanker für den Folgebrief. */
  postAntworten(id, i) {
    const f = this.post?.fach.find((x) => x.id === id);
    const b = this.postBrief(id);
    const a = b?.antworten?.[i];
    if (!f || !a || f.antwort !== null) return { ok: false, text: 'Diese Antwort ist schon verschickt.' };
    f.antwort = i;
    f.gelesen = true;
    this.flags.add(a.folge_flag);
    this.flags.add(`${id}_beantwortet`);
    this.post.anker[`${id}_beantwortet`] = this.postTag();
    this.emit('changed');
    return { ok: true, text: a.abschluss_text ?? 'Deine Antwort ist unterwegs.' };
  },

  /** Beilage einmalig abholen (Gegenstand oder ein paar Schilling). */
  postBeilage(id) {
    const f = this.post?.fach.find((x) => x.id === id);
    const b = this.postBrief(id);
    if (!f || !b || f.beilage !== false) return { ok: false, text: 'Hier liegt nichts mehr bei.' };
    const parts = [];
    for (const [k, n] of Object.entries(b.beilage)) {
      if (k === 'schilling') { this.money += n; parts.push(`${n} Schilling`); continue; }
      if (!this.item(k)) continue;
      this.addItem(k, n);
      parts.push(this.item(k).name);
    }
    f.beilage = true;
    this.flags.add(`${id}_beilage_erhalten`);
    this.emit('changed');
    return { ok: true, text: `Beilage genommen: ${parts.join(', ')}.` };
  },

  serializePost() {
    return { post: this.post ?? emptyPost() };
  },

  loadPost(data) {
    this.post = { ...emptyPost(), ...(data?.post ?? {}) };
  },
};
