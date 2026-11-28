// Minimaler Canvas-Ersatz für Node (nur für Vorschauen): reicht für die prozeduralen Texturen aus src/world/textures.js.
import { deflateSync } from 'node:zlib';

function farbe(s) {
  if (typeof s !== 'string') return null; // Verläufe werden ausgelassen
  let m;
  if ((m = s.match(/^#([0-9a-f]{3})$/i))) return [...m[1]].map((c) => parseInt(c + c, 16)).concat(255);
  if ((m = s.match(/^#([0-9a-f]{6})$/i))) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).concat(255);
  if ((m = s.match(/^#([0-9a-f]{8})$/i))) return [0, 2, 4, 6].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  if ((m = s.match(/^rgba?\(([^)]+)\)$/i))) { const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? Math.round(p[3] * 255) : 255]; }
  return null;
}

export class FakeCanvas {
  constructor() { this._w = 0; this._h = 0; this.data = new Uint8ClampedArray(0); }
  get width() { return this._w; }
  set width(v) { this._w = v; this.data = new Uint8ClampedArray(this._w * this._h * 4); }
  get height() { return this._h; }
  set height(v) { this._h = v; this.data = new Uint8ClampedArray(this._w * this._h * 4); }
  getContext() {
    const cv = this;
    return {
      imageSmoothingEnabled: false,
      fillStyle: '#000',
      fillRect(x, y, w, h) {
        const c = farbe(this.fillStyle);
        if (!c) return;
        const a = c[3] / 255;
        for (let yy = Math.max(0, Math.round(y)); yy < Math.min(cv._h, Math.round(y + h)); yy++) for (let xx = Math.max(0, Math.round(x)); xx < Math.min(cv._w, Math.round(x + w)); xx++) {
          const i = (yy * cv._w + xx) * 4;
          const d = cv.data;
          const da = d[i + 3] / 255;
          const oa = a + da * (1 - a);
          for (let k = 0; k < 3; k++) d[i + k] = oa ? (c[k] * a + d[i + k] * da * (1 - a)) / oa : 0;
          d[i + 3] = oa * 255;
        }
      },
      getImageData(x, y, w, h) {
        const out = new Uint8ClampedArray(w * h * 4);
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) for (let k = 0; k < 4; k++) out[(yy * w + xx) * 4 + k] = cv.data[((y + yy) * cv._w + (x + xx)) * 4 + k] ?? 0;
        return { data: out, width: w, height: h };
      },
      putImageData(img, x, y) {
        for (let yy = 0; yy < img.height; yy++) for (let xx = 0; xx < img.width; xx++) for (let k = 0; k < 4; k++) cv.data[((y + yy) * cv._w + (x + xx)) * 4 + k] = img.data[(yy * img.width + xx) * 4 + k];
      },
      createRadialGradient() { return { addColorStop() {} }; },
      createLinearGradient() { return { addColorStop() {} }; },
      drawImage() {}, beginPath() {}, arc() {}, fill() {}, save() {}, restore() {}, clearRect() {},
    };
  }
}

/** RGBA-Ausschnitt als PNG-Buffer. */
export function png(cv, x0 = 0, y0 = 0, w = cv.width, h = cv.height) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w * 4; x++) raw[y * (w * 4 + 1) + 1 + x] = cv.data[((y0 + y) * cv.width + x0) * 4 + x] ?? 0; }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

globalThis.document = { createElement: () => new FakeCanvas() };
