// Online-Koop: Spiegel der Bedienoberfläche. Der Host schickt das HTML seiner Oberfläche (#ui), der Gast gleicht seine
// Kopie Knoten für Knoten an. Dadurch bleiben Scrollstände und laufende CSS-Animationen beim Gast erhalten, statt bei
// jedem Update neu zu starten.

/** Ziel-Element an das HTML angleichen (nur die Kinder; Klasse/Stil des Elements selbst setzt der Aufrufer). */
export function morphChildren(target, html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  patchChildren(target, tpl.content);
}

function patchChildren(to, from) {
  const want = [...from.childNodes];
  let have = [...to.childNodes];
  for (let i = 0; i < want.length; i++) {
    const w = want[i];
    const h = have[i];
    if (!h) { to.appendChild(w.cloneNode(true)); continue; }
    if (!sameKind(h, w)) { to.replaceChild(w.cloneNode(true), h); continue; }
    if (w.nodeType === 3 || w.nodeType === 8) { if (h.nodeValue !== w.nodeValue) h.nodeValue = w.nodeValue; continue; }
    patchAttrs(h, w);
    patchChildren(h, w);
  }
  have = [...to.childNodes];
  for (let i = have.length - 1; i >= want.length; i--) to.removeChild(have[i]);
}

const sameKind = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName);

function patchAttrs(h, w) {
  for (const a of [...h.attributes]) if (!w.hasAttribute(a.name)) h.removeAttribute(a.name);
  for (const a of [...w.attributes]) if (h.getAttribute(a.name) !== a.value) h.setAttribute(a.name, a.value);
}

/** Weg von root zu el über Element-Indizes (z. B. [2, 0, 5]); null, wenn el nicht unter root liegt. */
export function elementPath(root, el) {
  const path = [];
  let n = el;
  while (n && n !== root) {
    const p = n.parentElement;
    if (!p) return null;
    path.unshift([...p.children].indexOf(n));
    n = p;
  }
  return n === root ? path : null;
}

/** Element zu einem Weg aus elementPath (oder null). */
export function resolvePath(root, path) {
  let n = root;
  for (const i of path ?? []) {
    n = n?.children?.[i];
    if (!n) return null;
  }
  return n;
}
