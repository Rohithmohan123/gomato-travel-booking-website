// Generates original flat-illustration SVG landscapes for each destination (MIT licensed).
// Each destination gets three images: day, golden hour and dusk versions of its scene type.
// Usage: node tools/generate-images.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { destinations } from '../js/data.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'images/destinations');
mkdirSync(out, { recursive: true });

const W = 1200, H = 800;
const moods = {
  day: { sky1: '#bfe3f2', sky2: '#eaf6fb', sun: '#fff1b8', sunY: 170, tint: 0 },
  golden: { sky1: '#f7c58b', sky2: '#fde9c9', sun: '#ffd27a', sunY: 300, tint: 0.12 },
  dusk: { sky1: '#4b4f8c', sky2: '#d98f87', sun: '#ffd1a3', sunY: 420, tint: 0.3 }
};

// Darken a hex colour by t (0-1) towards navy for the dusk tint
function shade(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c, target) => Math.round(c + (target - c) * t);
  const r = mix(n >> 16, 40), g = mix((n >> 8) & 255, 40), b = mix(n & 255, 80);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const ridge = (y, amp, seed, color) => {
  let d = `M0 ${H} L0 ${y}`;
  for (let x = 0; x <= W; x += 60) d += ` L${x} ${y - Math.abs(Math.sin((x + seed * 97) / 140)) * amp - Math.sin((x + seed * 31) / 53) * amp * 0.25}`;
  return `<path d="${d} L${W} ${H}Z" fill="${color}"/>`;
};
const palm = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 C6 -60 4 -120 14 -170" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${[[-70, -150], [-60, -195], [10, -215], [80, -190], [85, -150]].map(([dx, dy]) => `<path d="M14 -170 Q${(14 + dx) / 2} ${-200} ${dx} ${dy}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
const tree = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-20" width="8" height="24" fill="${c}"/><path d="M0 -110 L32 -20 L-32 -20Z" fill="${c}"/><path d="M0 -140 L24 -60 L-24 -60Z" fill="${c}"/></g>`;

const scenes = {
  hills: (m) => `${ridge(420, 90, 1, shade('#8fb59a', m.tint))}${ridge(520, 70, 2, shade('#5f9a6b', m.tint))}${ridge(610, 50, 3, shade('#3f7d4f', m.tint))}
    <g stroke="${shade('#2f6b3f', m.tint)}" stroke-width="5" opacity=".55" fill="none">${[...Array(7)].map((_, i) => `<path d="M0 ${660 + i * 22} Q300 ${630 + i * 22} 600 ${665 + i * 22} T1200 ${650 + i * 22}"/>`).join('')}</g>
    ${[120, 180, 1040, 1100].map((x, i) => tree(x, 600 + (i % 2) * 20, 0.9, shade('#2c5a36', m.tint))).join('')}`,
  forest: (m) => `${ridge(430, 110, 4, shade('#7aa889', m.tint))}${ridge(540, 60, 5, shade('#4c8a5c', m.tint))}
    <path d="M820 300 L840 300 L860 640 L800 640Z" fill="#d9eef6" opacity=".85"/>
    ${[...Array(18)].map((_, i) => tree(30 + i * 68, 700 + (i % 3) * 25, 1 + (i % 4) * 0.2, shade(i % 2 ? '#2c5a36' : '#356b41', m.tint))).join('')}`,
  backwaters: (m) => `${ridge(470, 20, 6, shade('#6e9f6a', m.tint))}<rect y="500" width="${W}" height="300" fill="${shade('#6fb3c4', m.tint)}"/>
    <g stroke="#ffffff" opacity=".35" stroke-width="3">${[...Array(8)].map((_, i) => `<line x1="${80 + i * 140}" y1="${560 + (i % 3) * 60}" x2="${150 + i * 140}" y2="${560 + (i % 3) * 60}"/>`).join('')}</g>
    ${[60, 200, 330, 960, 1100].map((x, i) => palm(x, 505, 0.9 + (i % 2) * 0.2, shade('#2f5a32', m.tint))).join('')}
    <g transform="translate(470 560)"><path d="M0 40 Q150 90 300 40 L280 70 Q150 105 20 70Z" fill="${shade('#7a4a2a', m.tint)}"/><path d="M40 40 Q150 -20 260 40Z" fill="${shade('#d9b77c', m.tint)}"/><path d="M60 40 Q150 -5 240 40" stroke="${shade('#8a6436', m.tint)}" stroke-width="4" fill="none"/></g>`,
  beach: (m) => `<rect y="430" width="${W}" height="170" fill="${shade('#4fb0c6', m.tint)}"/><rect y="430" width="${W}" height="20" fill="#ffffff" opacity=".25"/>
    <path d="M0 600 Q300 560 600 590 T1200 570 V${H} H0Z" fill="${shade('#f1d9a7', m.tint)}"/>
    <path d="M0 590 Q300 550 600 580 T1200 560" stroke="#ffffff" stroke-width="8" fill="none" opacity=".7"/>
    <g transform="translate(960 300)"><rect x="-14" y="0" width="28" height="140" fill="#ffffff"/><rect x="-14" y="30" width="28" height="20" fill="#d1495b"/><rect x="-14" y="80" width="28" height="20" fill="#d1495b"/><rect x="-20" y="-24" width="40" height="26" fill="${shade('#3a3a3a', m.tint)}"/></g>
    ${[90, 210, 1120].map((x, i) => palm(x, 640, 1 + (i % 2) * 0.15, shade('#2f5a32', m.tint))).join('')}`,
  island: (m) => `<rect y="420" width="${W}" height="${H}" fill="${shade('#2fb0c0', m.tint)}"/><rect y="560" width="${W}" height="${H}" fill="${shade('#1d8fa6', m.tint)}" opacity=".6"/>
    <ellipse cx="420" cy="520" rx="260" ry="34" fill="${shade('#f3e2b6', m.tint)}"/>${palm(360, 515, 1.1, shade('#2f5a32', m.tint))}${palm(470, 518, 0.9, shade('#2f5a32', m.tint))}
    <g fill="${shade('#a87b4f', m.tint)}">${[0, 1, 2, 3].map((i) => `<rect x="${760 + i * 90}" y="560" width="70" height="44"/><path d="M${752 + i * 90} 562 L${795 + i * 90} 528 L${838 + i * 90} 562Z"/><rect x="${790 + i * 90}" y="604" width="6" height="40"/>`).join('')}</g>
    <rect x="760" y="640" width="340" height="8" fill="${shade('#8a6436', m.tint)}"/>`,
  fort: (m) => `${ridge(470, 120, 7, shade('#c89a6a', m.tint))}<rect y="620" width="${W}" height="180" fill="${shade('#e0c08f', m.tint)}"/>
    <g fill="${shade('#d98b5f', m.tint)}"><rect x="260" y="380" width="680" height="250"/>${[...Array(12)].map((_, i) => `<rect x="${260 + i * 58}" y="356" width="34" height="26"/>`).join('')}
    <rect x="200" y="300" width="110" height="330"/><rect x="890" y="300" width="110" height="330"/><path d="M200 300 Q255 230 310 300Z M890 300 Q945 230 1000 300Z"/></g>
    <g fill="${shade('#8c4a2f', m.tint)}">${[...Array(6)].map((_, i) => `<path d="M${330 + i * 100} 630 v-90 q35 -50 70 0 v90Z"/>`).join('')}</g>`,
  snow: (m) => `<path d="M0 560 L240 260 L420 470 L640 180 L880 460 L1040 300 L1200 480 V${H} H0Z" fill="${shade('#8fa3b8', m.tint)}"/>
    <path d="M190 322 L240 260 L290 330 L260 320 L240 345Z M580 255 L640 180 L700 260 L660 250 L640 280 L615 255Z M1000 350 L1040 300 L1085 360 L1040 345Z" fill="#ffffff"/>
    ${ridge(620, 40, 8, shade('#4f7a5e', m.tint))}${[...Array(16)].map((_, i) => tree(40 + i * 75, 720 + (i % 2) * 25, 1.1, shade('#264d39', m.tint))).join('')}`,
  skyline: (m) => `<rect y="640" width="${W}" height="160" fill="${shade('#5aa6c4', m.tint)}"/>
    <g fill="${shade('#7f8fa6', m.tint)}">${[[60, 380], [150, 300], [250, 420], [340, 260], [470, 340], [700, 290], [800, 400], [900, 330], [1010, 380], [1100, 300]].map(([x, y]) => `<rect x="${x}" y="${y}" width="78" height="${640 - y}"/>`).join('')}</g>
    <path d="M575 640 L600 120 L625 640Z" fill="${shade('#9aaabf', m.tint)}"/><rect x="560" y="420" width="80" height="220" fill="${shade('#9aaabf', m.tint)}"/>
    <g fill="#fff6c9" opacity="${0.15 + m.tint * 2}">${[...Array(40)].map((_, i) => `<rect x="${70 + (i * 97) % 1100}" y="${420 + (i * 53) % 200}" width="10" height="14"/>`).join('')}</g>`,
  rice: (m) => `${ridge(420, 100, 9, shade('#7fae6a', m.tint))}
    ${[...Array(6)].map((_, i) => `<path d="M0 ${480 + i * 55} Q300 ${450 + i * 55} 600 ${485 + i * 55} T1200 ${470 + i * 55} V${H} H0Z" fill="${shade(['#9cc96b', '#86bb5c', '#73ad4f', '#62a045', '#53913b', '#468232'][i], m.tint)}"/>`).join('')}
    ${palm(1050, 520, 1, shade('#2f5a32', m.tint))}<g transform="translate(200 470)" fill="${shade('#6b3f2a', m.tint)}"><rect x="-40" y="-40" width="80" height="40"/><path d="M-60 -40 L0 -90 L60 -40Z M-45 -90 L0 -125 L45 -90Z"/></g>`
};

function render(scene, moodName, title) {
  const m = moods[moodName];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title.replace(/&/g, "&amp;")} (illustration)">
  <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.sky1}"/><stop offset="1" stop-color="${m.sky2}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="880" cy="${m.sunY}" r="64" fill="${m.sun}"/>
  ${scenes[scene](m)}</svg>\n`;
}

let n = 0;
for (const d of destinations) {
  for (const [i, mood] of ['day', 'golden', 'dusk'].entries()) {
    writeFileSync(resolve(out, `${d.slug}${i ? `-${i + 1}` : ''}.svg`), render(d.scene, mood, d.name));
    n++;
  }
}
writeFileSync(resolve(root, 'images/hero.svg'), render('backwaters', 'golden', 'Kerala backwaters'));
console.log(`Wrote ${n + 1} SVG illustrations.`);
