import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIRS = [
  path.resolve('assets/images'),
  path.resolve('public/assets/images'),
];

for (const dir of OUTPUT_DIRS) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeAsset(filename, svgContent) {
  const trimmed = svgContent.trim() + '\n';
  for (const dir of OUTPUT_DIRS) {
    fs.writeFileSync(path.join(dir, filename), trimmed, 'utf8');
  }
}

function createHeroSvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 540" width="720" height="540" role="img" aria-label="Koleksi Fisik PS5 Disc, Switch 1 Cartridge, dan Switch 2 Cartridge">
  <defs>
    <linearGradient id="studioBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="55%" stop-color="#E8EEF6"/>
      <stop offset="100%" stop-color="#DCE5F2"/>
    </linearGradient>
    <linearGradient id="ps5Blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0055C4"/>
      <stop offset="100%" stop-color="#003078"/>
    </linearGradient>
    <linearGradient id="discHolo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="30%" stop-color="#93C5FD"/>
      <stop offset="55%" stop-color="#F8FAFC"/>
      <stop offset="80%" stop-color="#A5B4FC"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="sw1Red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E60012"/>
      <stop offset="100%" stop-color="#B8000E"/>
    </linearGradient>
    <linearGradient id="sw2Crimson" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D90429"/>
      <stop offset="100%" stop-color="#8D0801"/>
    </linearGradient>
    <filter id="softDrop" x="-15%" y="-15%" width="130%" height="135%">
      <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.14"/>
    </filter>
  </defs>

  <rect width="720" height="540" fill="url(#studioBg)"/>
  <ellipse cx="360" cy="456" rx="290" ry="26" fill="#CBD5E1" opacity="0.65"/>
  <rect x="44" y="438" width="632" height="10" rx="5" fill="#FFFFFF" opacity="0.85"/>

  <!-- 1. PS5 Blu-ray Case + Optical Disc (Left) -->
  <g transform="translate(68, 96)" filter="url(#softDrop)">
    <!-- Peeking Blu-ray Disc -->
    <circle cx="156" cy="172" r="78" fill="url(#discHolo)" stroke="#94A3B8" stroke-width="2"/>
    <circle cx="156" cy="172" r="24" fill="#F1F5F9" stroke="#64748B" stroke-width="2"/>
    <circle cx="156" cy="172" r="9" fill="#E2E8F0"/>
    <path d="M156 94 A78 78 0 0 1 224 134 L177 160 A24 24 0 0 0 156 148 Z" fill="#FFFFFF" opacity="0.45"/>

    <!-- Translucent Blue Keep Case -->
    <rect x="0" y="18" width="166" height="304" rx="10" fill="url(#ps5Blue)"/>
    <rect x="6" y="24" width="152" height="292" rx="6" fill="#0F172A"/>
    <!-- White PS5 Header Strip -->
    <path d="M6 30 Q6 24 12 24 L152 24 Q158 24 158 30 L158 58 L6 58 Z" fill="#FFFFFF"/>
    <text x="18" y="46" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#0F172A" letter-spacing="1">PS5</text>
    <text x="148" y="45" text-anchor="end" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#00439C">ULTRA HD BLU-RAY</text>
    <!-- Cover Graphic -->
    <rect x="6" y="58" width="152" height="258" fill="#1E293B"/>
    <circle cx="82" cy="162" r="46" fill="#1D4ED8" opacity="0.35"/>
    <circle cx="82" cy="162" r="28" fill="#60A5FA" opacity="0.85"/>
    <rect x="26" y="232" width="112" height="8" rx="4" fill="#F8FAFC" opacity="0.9"/>
    <rect x="42" y="248" width="80" height="6" rx="3" fill="#94A3B8"/>
    <rect x="16" y="284" width="38" height="18" rx="3" fill="#FFFFFF"/>
    <text x="35" y="297" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#0F172A">REG 3</text>
  </g>

  <!-- 2. Nintendo Switch 1 Case + Dark Cartridge (Center) -->
  <g transform="translate(284, 78)" filter="url(#softDrop)">
    <rect x="0" y="0" width="156" height="328" rx="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="6" y="6" width="144" height="316" rx="6" fill="#0F172A"/>
    <!-- Red Corner Badge -->
    <path d="M6 12 Q6 6 12 6 L54 6 L54 48 L6 48 Z" fill="url(#sw1Red)"/>
    <rect x="18" y="15" width="11" height="22" rx="4" fill="#FFFFFF"/>
    <rect x="32" y="15" width="11" height="22" rx="4" fill="#FFFFFF"/>
    <!-- Cover Graphic -->
    <linearGradient id="sw1Art" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
    <rect x="6" y="48" width="144" height="274" fill="url(#sw1Art)"/>
    <polygon points="78,102 118,176 38,176" fill="#FACC15" opacity="0.9"/>
    <rect x="26" y="204" width="104" height="8" rx="4" fill="#FFFFFF"/>
    <rect x="40" y="220" width="76" height="6" rx="3" fill="#CBD5E1"/>

    <!-- Switch 1 Dark Charcoal Game Card Foreground -->
    <g transform="translate(98, 246)">
      <rect x="0" y="0" width="74" height="96" rx="8" fill="#1E293B" stroke="#475569" stroke-width="2"/>
      <rect x="8" y="10" width="58" height="68" rx="4" fill="#E60012"/>
      <text x="37" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#FFFFFF">SWITCH 1</text>
      <text x="37" y="48" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="600" fill="#FEE2E2">GAME CARD</text>
      <polygon points="37,84 43,91 31,91" fill="#94A3B8"/>
    </g>
  </g>

  <!-- 3. Nintendo Switch 2 Full Red Case + Red Express Card (Right) -->
  <g transform="translate(486, 96)" filter="url(#softDrop)">
    <rect x="0" y="12" width="160" height="312" rx="10" fill="url(#sw2Crimson)"/>
    <!-- Full Top Crimson Header -->
    <path d="M4 20 Q4 16 8 16 L152 16 Q156 16 156 20 L156 56 L4 56 Z" fill="#C8102E"/>
    <text x="16" y="41" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" letter-spacing="0.5">SWITCH 2</text>
    <rect x="114" y="25" width="30" height="22" rx="5" fill="#FFFFFF"/>
    <text x="129" y="40" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#C8102E">2</text>
    <!-- Cover Graphic -->
    <rect x="6" y="56" width="148" height="262" rx="4" fill="#18181B"/>
    <circle cx="80" cy="154" r="46" fill="#E11D48" opacity="0.28"/>
    <path d="M44 172 L80 112 L116 172 Z" fill="#FB7185"/>
    <rect x="26" y="218" width="108" height="8" rx="4" fill="#FFFFFF"/>
    <rect x="38" y="234" width="84" height="6" rx="3" fill="#FDA4AF"/>

    <!-- Switch 2 Red High-Speed Cartridge Foreground -->
    <g transform="translate(-26, 232)">
      <rect x="0" y="0" width="76" height="98" rx="8" fill="#BE123C" stroke="#FDA4AF" stroke-width="2"/>
      <rect x="8" y="10" width="60" height="70" rx="4" fill="#18181B"/>
      <text x="38" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="800" fill="#FB7185">SWITCH 2</text>
      <text x="38" y="48" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF">EXPRESS</text>
      <polygon points="38,86 44,93 32,93" fill="#FDE047"/>
    </g>
  </g>

  <!-- Subtle Bottom Caption -->
  <text x="360" y="506" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#334155">
    Blu-ray Disc PS5 · Game Card Switch 1 · Express Game Card Switch 2
  </text>
</svg>`;
}

function createFallbackSvg() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450" role="img" aria-label="Ilustrasi fisik game">
  <rect width="600" height="450" fill="#E2E8F0"/>
  <rect x="190" y="65" width="220" height="320" rx="14" fill="#FFFFFF" stroke="#94A3B8" stroke-width="3"/>
  <circle cx="300" cy="205" r="54" fill="#CBD5E1"/>
  <circle cx="300" cy="205" r="16" fill="#FFFFFF"/>
  <text x="300" y="315" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#1E293B">Media Fisik Konsol</text>
  <text x="300" y="342" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#475569">Kasetia Game</text>
</svg>`;
}

function createProductSvg({
  platform,
  titleLine1,
  titleLine2,
  region,
  condition,
  bgStart,
  bgEnd,
  accent,
  motifSvg,
}) {
  const isPs5 = platform === 'ps5';
  const isSw1 = platform === 'sw1';

  let mediaPreview = '';
  if (isPs5) {
    mediaPreview = `
    <!-- Blu-ray Disc Peeking Right -->
    <g transform="translate(362, 232)">
      <circle cx="0" cy="0" r="96" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
      <path d="M0 -96 A96 96 0 0 1 84 -46 L26 -14 A30 30 0 0 0 0 -30 Z" fill="#93C5FD" opacity="0.65"/>
      <path d="M0 96 A96 96 0 0 1 -84 46 L-26 14 A30 30 0 0 0 0 30 Z" fill="#A5B4FC" opacity="0.55"/>
      <circle cx="0" cy="0" r="28" fill="#F8FAFC" stroke="#64748B" stroke-width="2"/>
      <circle cx="0" cy="0" r="10" fill="#CBD5E1"/>
    </g>
    <!-- PS5 Blue Translucent Case -->
    <g transform="translate(136, 46)">
      <rect x="0" y="0" width="238" height="358" rx="12" fill="#00439C"/>
      <rect x="8" y="8" width="220" height="342" rx="7" fill="url(#coverGrad)"/>
      <path d="M8 15 Q8 8 15 8 L221 8 Q228 8 228 15 L228 48 L8 48 Z" fill="#FFFFFF"/>
      <text x="20" y="34" font-family="system-ui, sans-serif" font-size="17" font-weight="900" fill="#0F172A" letter-spacing="1.2">PS5</text>
      <text x="216" y="32" text-anchor="end" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#00439C">BLU-RAY DISC</text>
      ${motifSvg}
      <rect x="8" y="256" width="220" height="94" fill="#0F172A" opacity="0.84"/>
      <text x="22" y="286" font-family="system-ui, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF">${titleLine1}</text>
      <text x="22" y="308" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#CBD5E1">${titleLine2}</text>
      <text x="22" y="334" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="${accent}">${region} · ${condition}</text>
    </g>`;
  } else if (isSw1) {
    mediaPreview = `
    <!-- Switch 1 Dark Game Card Right -->
    <g transform="translate(376, 250)">
      <rect x="0" y="0" width="94" height="124" rx="10" fill="#1E293B" stroke="#475569" stroke-width="2.5"/>
      <rect x="10" y="12" width="74" height="88" rx="5" fill="#E60012"/>
      <text x="47" y="42" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF">SWITCH</text>
      <text x="47" y="58" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#FEE2E2">GAME CARD</text>
      <rect x="18" y="72" width="58" height="16" rx="3" fill="#FFFFFF"/>
      <text x="47" y="83" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#0F172A">${region}</text>
      <polygon points="47,108 54,117 40,117" fill="#94A3B8"/>
    </g>
    <!-- Switch 1 Clear Keep Case -->
    <g transform="translate(132, 38)">
      <rect x="0" y="0" width="222" height="374" rx="12" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2.5"/>
      <rect x="8" y="8" width="206" height="358" rx="7" fill="url(#coverGrad)"/>
      <path d="M8 15 Q8 8 15 8 L66 8 L66 56 L8 56 Z" fill="#E60012"/>
      <rect x="22" y="18" width="12" height="26" rx="4" fill="#FFFFFF"/>
      <rect x="38" y="18" width="12" height="26" rx="4" fill="#FFFFFF"/>
      ${motifSvg}
      <rect x="8" y="270" width="206" height="96" fill="#0F172A" opacity="0.85"/>
      <text x="20" y="300" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">${titleLine1}</text>
      <text x="20" y="321" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#E2E8F0">${titleLine2}</text>
      <text x="20" y="348" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="${accent}">${region} · ${condition}</text>
    </g>`;
  } else {
    mediaPreview = `
    <!-- Switch 2 Red Express Game Card Right -->
    <g transform="translate(376, 248)">
      <rect x="0" y="0" width="96" height="126" rx="10" fill="#BE123C" stroke="#FDA4AF" stroke-width="2.5"/>
      <rect x="10" y="12" width="76" height="88" rx="5" fill="#18181B"/>
      <text x="48" y="40" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#FB7185">SWITCH 2</text>
      <text x="48" y="56" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#FFFFFF">GAME CARD</text>
      <rect x="18" y="70" width="60" height="18" rx="3" fill="#C8102E"/>
      <text x="48" y="82" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FFFFFF">${region}</text>
      <polygon points="48,110 55,119 41,119" fill="#FDE047"/>
    </g>
    <!-- Switch 2 Full Red Case -->
    <g transform="translate(132, 38)">
      <rect x="0" y="0" width="224" height="374" rx="12" fill="#B91C1C"/>
      <rect x="7" y="7" width="210" height="360" rx="7" fill="url(#coverGrad)"/>
      <path d="M7 14 Q7 7 14 7 L210 7 Q217 7 217 14 L217 54 L7 54 Z" fill="#DC2626"/>
      <text x="20" y="37" font-family="system-ui, sans-serif" font-size="15" font-weight="900" fill="#FFFFFF" letter-spacing="0.6">NINTENDO SWITCH 2</text>
      ${motifSvg}
      <rect x="7" y="270" width="210" height="97" fill="#09090B" opacity="0.88"/>
      <text x="20" y="300" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">${titleLine1}</text>
      <text x="20" y="321" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#FECDD3">${titleLine2}</text>
      <text x="20" y="348" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="${accent}">${region} · ${condition}</text>
    </g>`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
  <defs>
    <linearGradient id="bgBackdrop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="coverGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgStart}"/>
      <stop offset="100%" stop-color="${bgEnd}"/>
    </linearGradient>
    <filter id="cardDrop" x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#0F172A" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="600" height="450" fill="url(#bgBackdrop)"/>
  <ellipse cx="300" cy="414" rx="210" ry="16" fill="#CBD5E1" opacity="0.7"/>
  <g filter="url(#cardDrop)">
    ${mediaPreview}
  </g>
</svg>`;
}

writeAsset('hero-physical-games.svg', createHeroSvg());
writeAsset('fallback-media.svg', createFallbackSvg());

const CATALOG_ART = [
  {
    file: 'ps5-astro-bot.svg',
    platform: 'ps5',
    titleLine1: 'ASTRO BOT',
    titleLine2: 'Platformer Petualangan',
    region: 'REG 3 ASIA',
    condition: 'SEGEL BARU',
    bgStart: '#1D4ED8',
    bgEnd: '#0F172A',
    accent: '#93C5FD',
    motifSvg: `
      <circle cx="118" cy="148" r="54" fill="#FFFFFF" opacity="0.95"/>
      <rect x="86" y="132" width="64" height="32" rx="14" fill="#0F172A"/>
      <circle cx="104" cy="148" r="7" fill="#38BDF8"/>
      <circle cx="132" cy="148" r="7" fill="#38BDF8"/>
      <line x1="118" y1="94" x2="118" y2="76" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
      <circle cx="118" cy="72" r="7" fill="#60A5FA"/>`,
  },
  {
    file: 'ps5-elden-ring-sote.svg',
    platform: 'ps5',
    titleLine1: 'ELDEN RING',
    titleLine2: 'Shadow of the Erdtree',
    region: 'REG 3 ASIA',
    condition: 'SEGEL BARU',
    bgStart: '#422006',
    bgEnd: '#09090B',
    accent: '#FBBF24',
    motifSvg: `
      <circle cx="118" cy="145" r="46" fill="none" stroke="#F59E0B" stroke-width="4" opacity="0.9"/>
      <circle cx="118" cy="126" r="34" fill="none" stroke="#FCD34D" stroke-width="3" opacity="0.75"/>
      <circle cx="118" cy="164" r="34" fill="none" stroke="#D97706" stroke-width="3" opacity="0.75"/>
      <line x1="118" y1="86" x2="118" y2="212" stroke="#FDE68A" stroke-width="3"/>`,
  },
  {
    file: 'ps5-ff7-rebirth.svg',
    platform: 'ps5',
    titleLine1: 'FINAL FANTASY VII',
    titleLine2: 'Rebirth · 2-Disc Edition',
    region: 'REG 3 ASIA',
    condition: 'SEGEL BARU',
    bgStart: '#064E3B',
    bgEnd: '#0F172A',
    accent: '#6EE7B7',
    motifSvg: `
      <circle cx="132" cy="140" r="42" fill="#10B981" opacity="0.35"/>
      <path d="M74 192 L148 96 L162 110 L96 202 Z" fill="#E2E8F0"/>
      <circle cx="108" cy="162" r="6" fill="#34D399"/>
      <circle cx="122" cy="144" r="6" fill="#34D399"/>`,
  },
  {
    file: 'ps5-gran-turismo-7.svg',
    platform: 'ps5',
    titleLine1: 'GRAN TURISMO 7',
    titleLine2: 'Real Driving Simulator',
    region: 'REG 3 ASIA',
    condition: 'BEKAS CIB',
    bgStart: '#1E293B',
    bgEnd: '#020617',
    accent: '#F87171',
    motifSvg: `
      <path d="M58 182 L106 108 L142 108 L94 182 Z" fill="#3B82F6"/>
      <path d="M108 182 L156 108 L184 108 L136 182 Z" fill="#EF4444"/>
      <line x1="44" y1="198" x2="192" y2="198" stroke="#94A3B8" stroke-width="3"/>`,
  },
  {
    file: 'nsw1-zelda-totk.svg',
    platform: 'sw1',
    titleLine1: 'ZELDA: TEARS OF',
    titleLine2: 'THE KINGDOM',
    region: 'REGION FREE',
    condition: 'SEGEL BARU',
    bgStart: '#0F766E',
    bgEnd: '#134E4A',
    accent: '#FDE047',
    motifSvg: `
      <polygon points="111,92 141,144 81,144" fill="#FACC15"/>
      <polygon points="81,144 111,196 51,196" fill="#EAB308"/>
      <polygon points="141,144 171,196 111,196" fill="#EAB308"/>`,
  },
  {
    file: 'nsw1-mario-wonder.svg',
    platform: 'sw1',
    titleLine1: 'SUPER MARIO BROS.',
    titleLine2: 'WONDER',
    region: 'REG ASIA',
    condition: 'SEGEL BARU',
    bgStart: '#2563EB',
    bgEnd: '#1E1B4B',
    accent: '#FDE047',
    motifSvg: `
      <circle cx="111" cy="148" r="46" fill="#38BDF8" opacity="0.35"/>
      <polygon points="111,98 124,132 160,132 131,153 142,188 111,167 80,188 91,153 62,132 98,132" fill="#FACC15"/>`,
  },
  {
    file: 'nsw1-xenoblade-3.svg',
    platform: 'sw1',
    titleLine1: 'XENOBLADE',
    titleLine2: 'CHRONICLES 3',
    region: 'REG USA',
    condition: 'BEKAS CIB',
    bgStart: '#7F1D1D',
    bgEnd: '#0F172A',
    accent: '#FCA5A5',
    motifSvg: `
      <path d="M98 206 L116 86 L132 104 L112 206 Z" fill="#EF4444"/>
      <circle cx="114" cy="148" r="24" fill="none" stroke="#38BDF8" stroke-width="4"/>`,
  },
  {
    file: 'nsw1-animal-crossing.svg',
    platform: 'sw1',
    titleLine1: 'ANIMAL CROSSING',
    titleLine2: 'New Horizons',
    region: 'REGION FREE',
    condition: 'SEGEL BARU',
    bgStart: '#059669',
    bgEnd: '#065F46',
    accent: '#FEF08A',
    motifSvg: `
      <circle cx="111" cy="150" r="44" fill="#A7F3D0"/>
      <circle cx="126" cy="136" r="14" fill="#059669"/>
      <path d="M111 106 Q126 88 138 98" fill="none" stroke="#FEF08A" stroke-width="5" stroke-linecap="round"/>`,
  },
  {
    file: 'nsw2-mario-kart-world.svg',
    platform: 'sw2',
    titleLine1: 'MARIO KART WORLD',
    titleLine2: 'Switch 2 Exclusive',
    region: 'GLOBAL',
    condition: 'SEGEL BARU',
    bgStart: '#BE123C',
    bgEnd: '#1E1B4B',
    accent: '#FDE047',
    motifSvg: `
      <circle cx="112" cy="152" r="48" fill="none" stroke="#FACC15" stroke-width="7"/>
      <circle cx="112" cy="152" r="22" fill="#F43F5E"/>
      <path d="M56 196 L168 112" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    file: 'nsw2-donkey-kong-bananza.svg',
    platform: 'sw2',
    titleLine1: 'DONKEY KONG',
    titleLine2: 'BANANZA',
    region: 'GLOBAL',
    condition: 'SEGEL BARU',
    bgStart: '#78350F',
    bgEnd: '#1C1917',
    accent: '#FDE047',
    motifSvg: `
      <polygon points="112,96 158,148 112,200 66,148" fill="#F59E0B"/>
      <polygon points="112,114 140,148 112,182 84,148" fill="#FEF3C7"/>`,
  },
  {
    file: 'nsw2-metroid-prime-4.svg',
    platform: 'sw2',
    titleLine1: 'METROID PRIME 4',
    titleLine2: 'Beyond · Switch 2 Ed.',
    region: 'REG ASIA/USA',
    condition: 'SEGEL BARU',
    bgStart: '#311042',
    bgEnd: '#09090B',
    accent: '#C084FC',
    motifSvg: `
      <circle cx="112" cy="150" r="44" fill="none" stroke="#A855F7" stroke-width="5"/>
      <path d="M88 182 L116 108 L108 146 L136 146 L104 196 L112 158 Z" fill="#E879F9"/>`,
  },
  {
    file: 'nsw2-zelda-totk-s2e.svg',
    platform: 'sw2',
    titleLine1: 'ZELDA: TOTK',
    titleLine2: 'Switch 2 Edition',
    region: 'REG ASIA',
    condition: 'BEKAS CIB',
    bgStart: '#115E59',
    bgEnd: '#09090B',
    accent: '#FDE047',
    motifSvg: `
      <circle cx="112" cy="150" r="50" fill="none" stroke="#2DD4BF" stroke-width="3" stroke-dasharray="8 6"/>
      <polygon points="112,102 146,162 78,162" fill="#FACC15"/>
      <polygon points="112,124 130,156 94,156" fill="#115E59"/>`,
  },
];

for (const art of CATALOG_ART) {
  writeAsset(art.file, createProductSvg(art));
}

console.log(`Generated ${CATALOG_ART.length + 2} local SVG illustrations in assets/images and public/assets/images.`);
