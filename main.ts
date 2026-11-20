// main.ts — GTA 6 meme generator for make.fun bounty gta6-meme-x-01
// "WANTED: GTA VI" — the make.fun ghost is the bounty hunter who already got paid.
// Node 22, stdlib ONLY, no network. Fully deterministic: same code -> byte-identical PNG.
// Run:  node main.ts        (writes meme.png next to this file)
// The meme: a Vice City sunset, a "WANTED: GRAND THEFT AUTO VI" poster
// (crime: making the world wait 13 years, reward $500), and the make.fun
// ghost — sheriff's star on its chest, holding a money bag — with the
// "make.fun — MY AI AGENT ALREADY GOT PAID" strip at the bottom.
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------- CRC32
const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------- PNG encoder (truecolor RGBA, 8-bit, filter 0)
function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width: number, height: number, rgba: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 = RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: None
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- color
type RGBA = [number, number, number, number]; // r,g,b,a (0-255)
const C = {
  white: [255, 255, 255, 255] as RGBA,
  black: [26, 26, 26, 255] as RGBA,
  cream: [247, 232, 201, 255] as RGBA,
  posterBorder: [62, 39, 35, 255] as RGBA,
  darkRed: [122, 31, 31, 255] as RGBA,
  darkBrown: [43, 27, 18, 255] as RGBA,
  midBrown: [93, 64, 55, 255] as RGBA,
  skyline: [30, 11, 51, 255] as RGBA,
  barBg: [18, 8, 30, 255] as RGBA,
  gold: [255, 213, 79, 255] as RGBA,
  goldDark: [184, 134, 11, 255] as RGBA,
  moneyGreen: [67, 160, 71, 255] as RGBA,
  moneyDark: [46, 125, 50, 255] as RGBA,
  blush: [248, 187, 208, 170] as RGBA,
  shadow: [0, 0, 0, 70] as RGBA,
};
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function lerpColor(c1: RGBA, c2: RGBA, t: number): RGBA {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
    Math.round(lerp(c1[3], c2[3], t)),
  ];
}

// ---------------------------------------------------------------- canvas
class Canvas {
  width: number;
  height: number;
  data: Uint8Array;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);
  }
  setPixel(x: number, y: number, c: RGBA): void {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (xi < 0 || yi < 0 || xi >= this.width || yi >= this.height) return;
    const i = (yi * this.width + xi) * 4;
    const sa = c[3] / 255;
    const da = this.data[i + 3] / 255;
    const outA = sa + da * (1 - sa);
    if (outA <= 0) return;
    this.data[i] = Math.round((c[0] * sa + this.data[i] * da * (1 - sa)) / outA);
    this.data[i + 1] = Math.round((c[1] * sa + this.data[i + 1] * da * (1 - sa)) / outA);
    this.data[i + 2] = Math.round((c[2] * sa + this.data[i + 2] * da * (1 - sa)) / outA);
    this.data[i + 3] = Math.round(outA * 255);
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGBA): void {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.ceil(x + w));
    const y1 = Math.min(this.height, Math.ceil(y + h));
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) this.setPixel(xx, yy, c);
  }
  fillCircle(cx: number, cy: number, r: number, c: RGBA): void {
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) this.setPixel(x, y, c);
      }
  }
  fillEllipse(cx: number, cy: number, rx: number, ry: number, c: RGBA): void {
    const x0 = Math.max(0, Math.floor(cx - rx));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + rx));
    const y0 = Math.max(0, Math.floor(cy - ry));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + ry));
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.setPixel(x, y, c);
      }
  }
  // Even-odd scanline polygon fill. points: [x,y][]
  fillPolygon(points: number[][], c: RGBA): void {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    const y0 = Math.max(0, Math.floor(minY));
    const y1 = Math.min(this.height - 1, Math.ceil(maxY));
    for (let y = y0; y <= y1; y++) {
      const xs: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
          const t = (y - a[1]) / (b[1] - a[1]);
          xs.push(a[0] + t * (b[0] - a[0]));
        }
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.max(0, Math.ceil(xs[k]));
        const x1 = Math.min(this.width - 1, Math.floor(xs[k + 1]));
        for (let x = x0; x <= x1; x++) this.setPixel(x, y, c);
      }
    }
  }
  // Thick line as a chain of filled circles.
  drawLine(x0: number, y0: number, x1: number, y1: number, w: number, c: RGBA): void {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(len));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillCircle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, c);
    }
  }
  // Vertical gradient from color stops: stops = [[t0,c0],[t1,c1],...] with t in 0..1
  verticalGradient(stops: [number, RGBA][]): void {
    for (let y = 0; y < this.height; y++) {
      const t = this.height <= 1 ? 0 : y / (this.height - 1);
      let col: RGBA = stops[stops.length - 1][1];
      for (let i = 0; i + 1 < stops.length; i++) {
        const [t0, c0] = stops[i];
        const [t1, c1] = stops[i + 1];
        if (t >= t0 && t <= t1) {
          col = lerpColor(c0, c1, (t - t0) / (t1 - t0));
          break;
        }
      }
      this.fillRect(0, y, this.width, 1, col);
    }
  }
}

// ---------------------------------------------------------------- 5x7 bitmap font
// Each glyph: 7 rows of 5 chars ("#" on, "." off). Only the glyphs the meme needs.
const FONT: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
  e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
  f: ["..##.", ".#...", ".#...", "####.", ".#...", ".#...", ".#..."],
  k: [".....", "#....", "#.#..", "#.#..", "##...", "#.#..", "#.#.."],
  m: [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#.#.#"],
  n: [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#.#.#"],
  u: [".....", ".....", "#...#", "#...#", "#...#", "#...#", ".###."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  $: ["..#..", ".###.", "#.#..", ".###.", "..#.#", ".###.", "..#.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};
function textWidth(s: string, scale: number): number {
  if (!s) return 0;
  const gap = scale;
  return s.length * 5 * scale + (s.length - 1) * gap;
}
function drawText(cv: Canvas, s: string, x: number, y: number, scale: number, c: RGBA, align: "left" | "center" = "left"): void {
  const w = textWidth(s, scale);
  let cx = x;
  if (align === "center") cx = x - w / 2;
  const gap = scale;
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]] ?? FONT[" "];
    const gx = cx + i * (5 * scale + gap);
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === "#") {
          cv.fillRect(gx + col * scale, y + r * scale, scale, scale, c);
        }
      }
    }
  }
}

// ---------------------------------------------------------------- shapes
function starPoints(cx: number, cy: number, rOuter: number, rInner: number, rot = -Math.PI / 2): number[][] {
  const pts: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = rot + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
// The make.fun ghost: dome head + straight sides + 4 scalloped lobes at the bottom.
function drawGhost(cv: Canvas, cx: number, topY: number, w: number, h: number, body: RGBA): void {
  const r = w / 2;
  const domeCy = topY + r;
  const sideBottom = topY + h - r / 2;
  const pts: number[][] = [];
  // Dome: semicircle from left (180deg) over the top to right (0deg).
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI + (i / 24) * Math.PI; // 180deg -> 360deg
    pts.push([cx + r * Math.cos(a), domeCy + r * Math.sin(a)]);
  }
  // Right side down to the scallop line.
  pts.push([cx + r, sideBottom]);
  // Bottom scallops: 4 lobes, each a downward semicircle (radius w/8).
  const lobes = 4;
  const lobeW = w / lobes;
  for (let l = 0; l < lobes; l++) {
    const x0 = cx + r - l * lobeW;
    const x1 = x0 - lobeW;
    const midX = (x0 + x1) / 2;
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const a = Math.PI * t; // 0 -> PI: upper half? we want downward bulge
      // Param: x from x0 to x1, y = sideBottom + sin(pi*t) * lobeW/2
      pts.push([x0 - lobeW * t, sideBottom + Math.sin(a) * (lobeW / 2)]);
    }
    void midX;
  }
  // Left side back up to the dome start.
  pts.push([cx - r, domeCy]);
  cv.fillPolygon(pts, body);
}
function drawMoneyBag(cv: Canvas, cx: number, cy: number, rx: number, ry: number): void {
  // Tied neck (small trapezoid on top).
  cv.fillPolygon(
    [
      [cx - rx * 0.32, cy - ry * 0.85],
      [cx + rx * 0.32, cy - ry * 0.85],
      [cx + rx * 0.55, cy - ry * 1.25],
      [cx - rx * 0.55, cy - ry * 1.25],
    ],
    C.moneyDark
  );
  // Sack body.
  cv.fillEllipse(cx, cy, rx, ry, C.moneyGreen);
  // Drawstring band.
  cv.fillRect(cx - rx * 0.45, cy - ry * 0.88, rx * 0.9, ry * 0.12, C.moneyDark);
  // "$" on the sack.
  drawText(cv, "$", cx, cy - ry * 0.32, 6, C.white, "center");
}
function drawPalmTree(cv: Canvas, baseX: number, baseY: number, h: number, c: RGBA): void {
  const topX = baseX + h * 0.12;
  const topY = baseY - h;
  // Trunk: two segments, slight lean.
  cv.drawLine(baseX, baseY, baseX + h * 0.06, baseY - h * 0.55, 9, c);
  cv.drawLine(baseX + h * 0.06, baseY - h * 0.55, topX, topY, 8, c);
  // Fronds: 6 arcs radiating from the crown.
  const fronds: [number, number][] = [
    [-1.0, -0.25], [-0.75, -0.7], [-0.3, -0.95], [0.3, -0.95], [0.75, -0.7], [1.0, -0.25],
  ];
  for (const [dx, dy] of fronds) {
    const ex = topX + dx * h * 0.42;
    const ey = topY + dy * h * 0.32 + h * 0.18;
    cv.drawLine(topX, topY, (topX + ex) / 2, (topY + ey) / 2 - h * 0.06, 6, c);
    cv.drawLine((topX + ex) / 2, (topY + ey) / 2 - h * 0.06, ex, ey, 5, c);
  }
  // Coconuts.
  cv.fillCircle(topX - 7, topY + 8, 6, c);
  cv.fillCircle(topX + 8, topY + 10, 6, c);
}
function drawSkyline(cv: Canvas, yBase: number, c: RGBA): void {
  // Deterministic pseudo-random heights (fixed table, no Math.random).
  const heights = [62, 96, 48, 118, 74, 132, 58, 88, 44, 104, 70, 126, 52, 92, 66, 110, 40, 84, 60, 98];
  const bw = 62;
  for (let i = 0; i < heights.length; i++) {
    const x = i * bw;
    const h = heights[i];
    cv.fillRect(x, yBase - h, bw - 4, h, c);
    // A few lit windows.
    if (i % 3 === 0) cv.fillRect(x + 14, yBase - h + 18, 10, 12, [255, 196, 107, 255]);
    if (i % 4 === 1) cv.fillRect(x + 34, yBase - h + 42, 10, 12, [255, 196, 107, 220]);
  }
}

// ---------------------------------------------------------------- the meme
const W = 1200;
const H = 675;
function drawMeme(): Canvas {
  const cv = new Canvas(W, H);
  // 1. Vice City sunset.
  cv.verticalGradient([
    [0.0, [43, 22, 80, 255]],
    [0.35, [123, 45, 110, 255]],
    [0.6, [214, 51, 108, 255]],
    [0.8, [255, 122, 69, 255]],
    [1.0, [255, 196, 107, 255]],
  ]);
  // 2. Low sun in the gap between poster and ghost.
  cv.fillCircle(750, 352, 40, [255, 214, 130, 255]);
  cv.fillCircle(750, 352, 40, [255, 122, 69, 70]);
  // 3. Skyline silhouette (peeks out at the edges and gaps).
  drawSkyline(cv, 580, C.skyline);
  // 4. Palm trees at the far edges (behind poster/ghost).
  drawPalmTree(cv, 28, 580, 175, C.skyline);
  drawPalmTree(cv, 1178, 580, 150, C.skyline);
  // 5. WANTED poster (drop shadow, then cream board + borders).
  cv.fillRect(55 + 10, 42 + 12, 640, 512, C.shadow);
  cv.fillRect(55, 42, 640, 512, C.posterBorder);
  cv.fillRect(63, 50, 624, 496, C.cream);
  cv.fillRect(77, 64, 596, 468, C.posterBorder); // inner frame (thin)
  cv.fillRect(79, 66, 592, 464, C.cream); // inner cream
  // Poster text (center x = 375).
  drawText(cv, "WANTED", 375, 80, 10, C.darkRed, "center");
  cv.fillRect(115, 170, 520, 4, C.posterBorder);
  drawText(cv, "GRAND THEFT AUTO VI", 375, 194, 4, C.darkBrown, "center");
  drawText(cv, "FOR MAKING THE WORLD", 375, 240, 4, C.darkBrown, "center");
  drawText(cv, "WAIT 13 YEARS", 375, 288, 5, C.darkRed, "center");
  drawText(cv, "REWARD $500", 375, 352, 8, C.darkRed, "center");
  drawText(cv, "LAST SEEN VICE CITY LEONIDA", 375, 442, 3, C.midBrown, "center");
  // Three small gold stars at the poster's foot.
  for (const sx of [325, 375, 425]) {
    cv.fillPolygon(starPoints(sx, 492, 15, 7), C.goldDark);
    cv.fillPolygon(starPoints(sx, 492, 13, 6), C.gold);
  }
  // 6. The make.fun ghost — sheriff's star, money bag, friendly face.
  drawGhost(cv, 935, 100, 260, 415, C.white);
  // Blush.
  cv.fillCircle(862, 330, 13, C.blush);
  cv.fillCircle(1008, 330, 13, C.blush);
  // Eyes.
  cv.fillEllipse(885, 272, 13, 20, C.black);
  cv.fillEllipse(985, 272, 13, 20, C.black);
  // Smile (arc of small circles).
  for (let i = 0; i <= 14; i++) {
    const a = ((20 + (i / 14) * 140) * Math.PI) / 180;
    cv.fillCircle(935 + 30 * Math.cos(a), 302 + 30 * Math.sin(a), 4.5, C.black);
  }
  // Sheriff's star on the chest.
  cv.fillPolygon(starPoints(935, 425, 48, 20), C.goldDark);
  cv.fillPolygon(starPoints(935, 425, 44, 18), C.gold);
  // Money bag at the ghost's side.
  drawMoneyBag(cv, 755, 480, 58, 62);
  // 7. Bottom strip: make.fun + the sell.
  cv.fillRect(0, 580, W, H - 580, C.barBg);
  drawText(cv, "make.fun", 60, 602, 7, C.white, "left");
  drawText(cv, "MY AI AGENT ALREADY GOT PAID", 430, 614, 4, C.gold, "left");
  return cv;
}

// ---------------------------------------------------------------- main
const outDir = dirname(fileURLToPath(import.meta.url));
const canvas = drawMeme();
const png = encodePNG(canvas.width, canvas.height, canvas.data);
const outPath = join(outDir, "meme.png");
writeFileSync(outPath, png);
const sha = createHash("sha256").update(png).digest("hex");
console.log(`wrote ${outPath} (${png.length} bytes, ${canvas.width}x${canvas.height}, sha256 ${sha})`);
