// gta6-meme-x-01 entry program. The judged meme is the X post named in
// POST.json (flat "Mom, it's out" chat, Vice City cut: 4,811 days of GTA VI
// wait, Jason & Lucia at 99%, my AI agent pays with make.fun bounty money).
// Node 22, standard library only, no network, no clock.
// Copies POST.json to the grader output directory first (the only thing
// the grader needs). The legacy licence drawing below is kept as a
// deterministic self-test only: drawn in memory, sha256 printed, never
// written into the read-only repo folder.
// All text is ALL CAPS in a 5x7 bitmap font whose N and M glyphs are
// deliberately distinct, so MAKE.FUN can never read as MAKE.FUM.
import { copyFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const W = 1200;
const H = 675;

type RGB = [number, number, number];
const INK: RGB = [26, 20, 24];
const PAPER: RGB = [246, 236, 205];
const PAPER2: RGB = [238, 224, 182];
const RED: RGB = [158, 28, 32];
const MAGENTA: RGB = [214, 22, 110];
const GOLD: RGB = [232, 178, 44];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [12, 10, 14];
const DARK: RGB = [24, 16, 44];

// 5x7 bitmap font. Each glyph is 7 rows of 5 bits ("#" = on).
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
  "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

class Canvas {
  data: Uint8Array;
  alpha: Uint8Array;
  w: number;
  h: number;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 3);
    this.alpha = new Uint8Array(w * h);
    this.alpha.fill(1);
  }
  px(x: number, y: number, c: RGB): void {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return;
    const o = (iy * this.w + ix) * 3;
    this.data[o] = c[0];
    this.data[o + 1] = c[1];
    this.data[o + 2] = c[2];
    this.alpha[iy * this.w + ix] = 1;
  }
  rect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let j = Math.round(y); j < Math.round(y + h); j++)
      for (let i = Math.round(x); i < Math.round(x + w); i++) this.px(i, j, c);
  }
  hline(x0: number, x1: number, y: number, c: RGB): void {
    for (let i = Math.round(x0); i <= Math.round(x1); i++) this.px(i, y, c);
  }
  vgrad(y0: number, y1: number, top: RGB, bot: RGB): void {
    for (let y = Math.round(y0); y < Math.round(y1); y++) {
      const t = (y - y0) / Math.max(1, y1 - y0 - 1);
      const c: RGB = [
        Math.round(top[0] + (bot[0] - top[0]) * t),
        Math.round(top[1] + (bot[1] - top[1]) * t),
        Math.round(top[2] + (bot[2] - top[2]) * t),
      ];
      this.hline(0, this.w - 1, y, c);
    }
  }
  circle(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -Math.ceil(r); y <= Math.ceil(r); y++)
      for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
        if (x * x + y * y <= r * r) this.px(cx + x, cy + y, c);
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB): void {
    for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++)
      for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++)
        if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) this.px(cx + x, cy + y, c);
  }
  // Thick line via stepped circles.
  line(x0: number, y0: number, x1: number, y1: number, w: number, c: RGB): void {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, c);
    }
  }
  poly(pts: [number, number][], c: RGB): void {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const [, y] of pts) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i];
        const [x1, y1] = pts[(i + 1) % pts.length];
        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
          xs.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) this.hline(xs[k], xs[k + 1], y, c);
    }
  }
  star(cx: number, cy: number, rO: number, rI: number, points: number, c: RGB): void {
    const pts: [number, number][] = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? rO : rI;
      const a = -Math.PI / 2 + (i * Math.PI) / points;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    this.poly(pts, c);
  }
  // 4-point sparkle (make.fun ghost eye).
  sparkle(cx: number, cy: number, r: number, c: RGB): void {
    this.poly(
      [
        [cx, cy - r],
        [cx + r * 0.28, cy - r * 0.28],
        [cx + r, cy],
        [cx + r * 0.28, cy + r * 0.28],
        [cx, cy + r],
        [cx - r * 0.28, cy + r * 0.28],
        [cx - r, cy],
        [cx - r * 0.28, cy - r * 0.28],
      ],
      c,
    );
  }
  text(s: string, x: number, y: number, scale: number, c: RGB): void {
    const up = s.toUpperCase();
    for (let gi = 0; gi < up.length; gi++) {
      const g = FONT[up[gi]] ?? FONT["?"];
      const gx = x + gi * 6 * scale;
      for (let row = 0; row < 7; row++)
        for (let col = 0; col < 5; col++)
          if (g[row][col] === "1") this.rect(gx + col * scale, y + row * scale, scale, scale, c);
    }
  }
  textCenter(s: string, cx: number, y: number, scale: number, c: RGB): void {
    this.text(s, cx - textWidth(s, scale) / 2, y, scale, c);
  }
  clearTransparent(): void {
    this.alpha.fill(0);
    this.data.fill(255);
  }
  // Blit src rotated by angleDeg around (cx,cy), nearest neighbour.
  // Only pixels the source actually drew (alpha) are copied, so a
  // rotated stamp keeps its white backing and has clean corners.
  blitRotated(src: Canvas, cx: number, cy: number, angleDeg: number): void {
    const a = (-angleDeg * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const hw = src.w / 2;
    const hh = src.h / 2;
    for (let y = -hh; y < hh; y++)
      for (let x = -hw; x < hw; x++) {
        const sx = Math.round(x * cos - y * sin + hw);
        const sy = Math.round(x * sin + y * cos + hh);
        if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue;
        if (!src.alpha[sy * src.w + sx]) continue;
        const so = (sy * src.w + sx) * 3;
        this.px(cx + x, cy + y, [src.data[so], src.data[so + 1], src.data[so + 2]]);
      }
  }
}

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// make.fun ghost, correct: white body, thick black outline, two black
// 4-point sparkle eyes, magenta coin with a white star in its hand.
// (cx, cy) = centre of the head circle; u = unit scale (~body width / 200).
function ghost(cv: Canvas, cx: number, cy: number, u: number, withCoin = true): void {
  const black: RGB = BLACK;
  // Outline: black silhouette slightly larger, then white body on top.
  cv.circle(cx, cy - 18 * u, 62 * u, black);
  cv.rect(cx - 62 * u, cy - 18 * u, 124 * u, 92 * u, black);
  cv.circle(cx, cy - 18 * u, 56 * u, WHITE);
  cv.rect(cx - 56 * u, cy - 18 * u, 112 * u, 86 * u, WHITE);
  // Wavy hem (3 scallops), white with black edge underneath already drawn.
  for (let i = 0; i < 3; i++) {
    const sx = cx - 56 * u + i * (112 / 3) * u + (112 / 6) * u;
    cv.circle(sx, cy + 68 * u, 19 * u, WHITE);
  }
  cv.rect(cx - 56 * u, cy + 62 * u, 112 * u, 8 * u, WHITE);
  // Sparkle eyes.
  cv.sparkle(cx - 24 * u, cy - 26 * u, 13 * u, black);
  cv.sparkle(cx + 24 * u, cy - 26 * u, 13 * u, black);
  // Small round hand + magenta coin with white star (right side),
  // unless this ghost is an ID photo (no coin — it would not fit).
  if (withCoin) {
    cv.circle(cx + 62 * u, cy + 18 * u, 10 * u, WHITE);
    cv.circle(cx + 78 * u, cy + 6 * u, 24 * u, MAGENTA);
    cv.star(cx + 78 * u, cy + 6 * u, 15 * u, 6 * u, 5, WHITE);
  }
  // Sheriff star badge on the chest.
  cv.star(cx, cy + 34 * u, 17 * u, 7 * u, 5, GOLD);
  cv.star(cx, cy + 34 * u, 10 * u, 4 * u, 5, [255, 240, 180]);
}

function dottedLeader(cv: Canvas, x0: number, x1: number, y: number, c: RGB): void {
  for (let x = x0; x < x1; x += 9) cv.rect(x, y, 4, 3, c);
}

function draw(): Canvas {
  const cv = new Canvas(W, H);
  // Vice City sunset.
  cv.vgrad(0, 300, [64, 32, 110], [214, 72, 110]);
  cv.vgrad(300, 560, [214, 72, 110], [244, 130, 60]);
  cv.vgrad(560, H, [40, 18, 52], [24, 14, 40]);
  cv.circle(1090, 96, 44, [255, 214, 130]);
  cv.circle(1090, 96, 36, [255, 226, 160]);
  // Skyline silhouette + lit windows (seeded, deterministic).
  const rnd = lcg(20131117);
  let bx = 0;
  while (bx < W) {
    const bw = 52 + Math.floor(rnd() * 60);
    const bh = 70 + Math.floor(rnd() * 150);
    cv.rect(bx, 560 - bh, bw, bh, [30, 18, 52]);
    for (let wy = 560 - bh + 12; wy < 548; wy += 22)
      for (let wx = bx + 8; wx < bx + bw - 8; wx += 18)
        if (rnd() < 0.3) cv.rect(wx, wy, 7, 9, [255, 205, 90]);
    bx += bw + 6;
  }
  // Palm silhouettes, left and right edges.
  for (const [px, py, s] of [
    [28, 560, 1],
    [1172, 560, -1],
  ] as const) {
    cv.line(px, py, px + 14 * s, py - 92, 7, [26, 14, 44]);
    for (let k = 0; k < 5; k++) {
      const a = (-0.3 - k * 0.32) * (s > 0 ? 1 : -1) + (s < 0 ? Math.PI : 0);
      const ex = px + 14 * s + Math.cos(a) * 52;
      const ey = py - 92 + Math.sin(a) * 26 - k * 4;
      cv.line(px + 14 * s, py - 92, ex, ey, 5, [26, 14, 44]);
    }
  }

  // --- The document: cream rap sheet, left ---
  const DX = 36;
  const DY = 28;
  const DW = 780;
  const DH = 540;
  cv.rect(DX - 6, DY - 6, DW + 12, DH + 12, [58, 40, 28]);
  cv.rect(DX, DY, DW, DH, PAPER);
  cv.rect(DX + 10, DY + 10, DW - 20, DH - 20, PAPER);
  cv.rect(DX + 14, DY + 14, DW - 28, DH - 28, PAPER2);
  // Header: State of Leonida driver licence.
  cv.textCenter("STATE OF LEONIDA", DX + DW / 2, DY + 26, 2, INK);
  cv.textCenter("DRIVER LICENCE", DX + DW / 2, DY + 50, 5, INK);
  cv.textCenter("DEPT. OF MOTOR VEHICLES - VICE CITY", DX + DW / 2, DY + 92, 2, INK);
  // Issuing seal, top right.
  cv.circle(DX + DW - 74, DY + 70, 26, MAGENTA);
  cv.star(DX + DW - 74, DY + 70, 17, 7, 5, WHITE);
  cv.rect(DX + 40, DY + 112, DW - 80, 4, INK);
  // ID photo box (ghost as the holder) + identity fields in two columns.
  cv.rect(DX + 44, DY + 124, 150, 140, BLACK);
  cv.rect(DX + 48, DY + 128, 142, 132, [178, 208, 236]);
  ghost(cv, DX + 119, DY + 194, 0.75, false);
  cv.text("NAME: ONE PATIENT GAMER", DX + 210, DY + 132, 2, INK);
  cv.text("LICENCE: VI-2013", DX + 520, DY + 132, 2, INK);
  cv.text("DOB: 17 SEP 2013", DX + 210, DY + 162, 2, INK);
  cv.text("EXPIRES: NEVER", DX + 520, DY + 162, 2, INK);
  cv.text("ISSUED: 19 NOV 2026", DX + 210, DY + 192, 2, INK);
  cv.text("CLASS: GTA VI", DX + 520, DY + 192, 2, INK);
  cv.rect(DX + 40, DY + 276, DW - 80, 3, INK);
  cv.textCenter("ENDORSEMENTS - RESTRICTIONS:", DX + DW / 2, DY + 288, 2, RED);
  // Charges (5 itemised jokes, dotted leaders, right amounts).
  const rows: [string, string][] = [
    ["1. WAITING SINCE 2013", "4,811 DAYS"],
    ["2. 2 DELAYS - NO POINTS", "JUST PAIN"],
    ["3. TRAILER 2 - WATCHED", "87 TIMES"],
    ["4. JASON + LUCIA - MET", "AT LAST"],
    ["5. MAP OF LEONIDA", "MEMORISED"],
  ];
  let ry = DY + 312;
  for (const [label, amount] of rows) {
    cv.text(label, DX + 44, ry, 3, INK);
    dottedLeader(cv, DX + 44 + textWidth(label, 3) + 10, DX + DW - 44 - textWidth(amount, 3) - 8, ry + 10, INK);
    cv.text(amount, DX + DW - 44 - textWidth(amount, 3), ry, 3, INK);
    ry += 28;
  }
  cv.rect(DX + 40, ry + 2, DW - 80, 3, INK);
  ry += 16;
  cv.text("FEE PAID", DX + 44, ry, 3, RED);
  dottedLeader(cv, DX + 44 + textWidth("FEE PAID", 3) + 10, DX + DW - 44 - textWidth("$79.99", 4) - 8, ry + 10, INK);
  cv.text("$79.99", DX + DW - 44 - textWidth("$79.99", 4), ry - 4, 4, RED);
  // PAID stamp, rotated -11 degrees, in the paper's empty bottom band
  // (below LAST SEEN, clear of every text row).
  const stamp = new Canvas(360, 76);
  stamp.clearTransparent();
  stamp.rect(0, 0, 360, 76, WHITE);
  stamp.rect(5, 5, 350, 66, WHITE);
  for (let i = 0; i < 360; i += 2) {
    stamp.px(i, 5, MAGENTA);
    stamp.px(i, 70, MAGENTA);
  }
  for (let j = 0; j < 76; j += 2) {
    stamp.px(5, j, MAGENTA);
    stamp.px(354, j, MAGENTA);
  }
  stamp.textCenter("VALID", 180, 8, 5, MAGENTA);
  stamp.textCenter("PAID BY MY AI AGENT", 180, 48, 2, MAGENTA);
  cv.blitRotated(stamp, DX + DW / 2, DY + DH - 52, -6);

  // --- Issuing officer ghost, right of the document ---
  ghost(cv, 1000, 300, 1.15);
  cv.rect(860, 440, 280, 60, BLACK);
  cv.rect(864, 444, 272, 52, [32, 22, 52]);
  cv.textCenter("ISSUING OFFICER", 1000, 452, 3, WHITE);
  cv.textCenter("MAKE.FUN", 1000, 478, 2, GOLD);

  // --- Bottom strip: the sell, in letters that survive 480px ---
  cv.rect(0, 596, W, 79, BLACK);
  cv.textCenter("MAKE.FUN  -  MY AI AGENT ALREADY GOT PAID", W / 2, 612, 4, WHITE);
  cv.textCenter("WHERE AI AGENTS EARN REAL MONEY", W / 2, 648, 2, GOLD);
  return cv;
}

// --- PNG encoding (filter 0, zlib level 9, deterministic) ---
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function png(cv: Canvas): Buffer {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    raw.set(cv.data.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? ".";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
// Step 1 — the only job the grader needs: hand POST.json to /output.
// The repository folder is read-only in the grader's sandbox, so nothing
// here is ever written next to main.ts; this runs before any drawing.
mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, "POST.json"), join(OUTPUT_DIR, "POST.json"));
} catch (err) {
  console.error(`POST.json could not be copied: ${(err as Error).message}`);
  process.exit(1);
}

// Step 2 — redraw the meme for the record. A failure here is reported
// but never fails the run: the post on X, not this file, is judged.
try {
  const bytes = png(draw());
  console.log(`meme.png sha256=${createHash("sha256").update(bytes).digest("hex")}`);
  console.log(`meme.png bytes=${bytes.length}`);
} catch (err) {
  console.error(`meme redraw skipped: ${(err as Error).message}`);
}
