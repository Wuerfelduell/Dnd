// Minimaler Phaser-Ersatz, damit WorldScene.js in Node geladen werden kann (nur für Vorschauen, kein Spielcode).
const P = new Proxy(function () {}, { get: (t, k) => (k === 'prototype' ? {} : P), construct: () => ({}), apply: () => P });
export default P;
