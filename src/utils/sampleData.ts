import { SamplePreset } from '../types';

// High-fidelity SVG generator for realistic pairs with deliberate subtle discrepancies
function createChairReal(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="bgReal" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#f8f9fa"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </radialGradient>
      <!-- Real subtle ground contact shadow with natural soft falloff -->
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="18"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.15  0 0 0 0 0.2  0 0 0 0.45 0"/>
        <feOffset dx="0" dy="24"/>
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
      </filter>
      <!-- Real Oak Wood Grain Pattern -->
      <pattern id="oakGrainReal" width="40" height="80" patternUnits="userSpaceOnUse">
        <rect width="40" height="80" fill="#c49a6c"/>
        <path d="M0,10 Q10,12 20,8 T40,15 M0,35 Q15,40 30,32 T40,38 M0,60 Q8,55 25,65 T40,58" stroke="#a07548" stroke-width="1.8" fill="none" opacity="0.65"/>
        <path d="M5,0 Q12,25 6,50 T10,80 M25,0 Q32,30 24,55 T28,80" stroke="#875e38" stroke-width="0.9" fill="none" opacity="0.5"/>
        <!-- Natural organic wood knots & pores -->
        <ellipse cx="18" cy="24" rx="3" ry="1.5" fill="#6e4624" opacity="0.4"/>
      </pattern>
      <!-- Real Leather texture with organic creases & warm specular sheen -->
      <linearGradient id="leatherCushionReal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3d271d"/>
        <stop offset="35%" stop-color="#543729"/>
        <stop offset="70%" stop-color="#42291e"/>
        <stop offset="100%" stop-color="#2a1811"/>
      </linearGradient>
      <!-- Real subtle studio warm fill light -->
      <linearGradient id="warmLightReal" x1="0%" y1="0%" x2="60%" y2="80%">
        <stop offset="0%" stop-color="#fff8eb" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Studio Floor & Backdrop -->
    <rect width="800" height="800" fill="url(#bgReal)"/>
    <ellipse cx="400" cy="690" rx="270" ry="42" fill="#0f172a" opacity="0.28" filter="blur(16px)"/>
    <ellipse cx="400" cy="684" rx="200" ry="24" fill="#020617" opacity="0.45" filter="blur(7px)"/>

    <!-- Chair Back Legs (Oak Wood with real organic grain) -->
    <!-- Back-left leg -->
    <path d="M260,380 L220,680 L242,684 L285,385 Z" fill="url(#oakGrainReal)"/>
    <!-- Back-right leg -->
    <path d="M540,380 L580,680 L558,684 L515,385 Z" fill="url(#oakGrainReal)"/>

    <!-- Chair Backrest & Curved Spindles -->
    <!-- Curved Top Rail with rounded organic bevel (Real) -->
    <path d="M230,220 C230,130 570,130 570,220 C560,250 540,255 520,245 C460,195 340,195 280,245 C260,255 240,250 230,220 Z" fill="url(#oakGrainReal)" filter="drop-shadow(0px 8px 12px rgba(0,0,0,0.18))"/>
    
    <!-- 7 Wooden Spindles with handcrafted bevels -->
    <path d="M285,240 L290,440 L298,440 L295,236 Z" fill="url(#oakGrainReal)"/>
    <path d="M325,225 L330,442 L338,442 L334,222 Z" fill="url(#oakGrainReal)"/>
    <path d="M365,212 L368,444 L376,444 L373,210 Z" fill="url(#oakGrainReal)"/>
    <path d="M400,208 L400,445 L408,445 L407,208 Z" fill="url(#oakGrainReal)"/>
    <path d="M435,212 L432,444 L440,444 L443,210 Z" fill="url(#oakGrainReal)"/>
    <path d="M475,225 L470,442 L478,442 L482,222 Z" fill="url(#oakGrainReal)"/>
    <path d="M515,240 L510,440 L518,440 L523,236 Z" fill="url(#oakGrainReal)"/>

    <!-- Real Leather Seat with Natural Wrinkles & Soft Padding Creases -->
    <path d="M240,430 C240,400 560,400 560,430 C570,470 540,510 510,518 C450,528 350,528 290,518 C260,510 230,470 240,430 Z" fill="url(#leatherCushionReal)" filter="drop-shadow(0px 14px 18px rgba(0,0,0,0.35))"/>
    
    <!-- Subtle real leather creases and stitching -->
    <path d="M260,445 C320,475 480,475 540,445" stroke="#23140d" stroke-width="2.5" fill="none" opacity="0.6"/>
    <path d="M290,465 C340,488 460,488 510,465" stroke="#1d100a" stroke-width="1.8" fill="none" opacity="0.45"/>
    <!-- Hand-stitched thread detail on border -->
    <path d="M255,432 C255,410 545,410 545,432 C552,460 530,500 500,508 C440,518 360,518 300,508 C270,500 248,460 255,432 Z" stroke="#875638" stroke-dasharray="3,3" stroke-width="1.2" fill="none" opacity="0.7"/>

    <!-- Natural specular leather sheen -->
    <ellipse cx="380" cy="450" rx="90" ry="24" fill="#ffffff" opacity="0.12" filter="blur(8px)"/>

    <!-- Front Wooden Frame & Legs -->
    <path d="M275,510 L250,710 L274,714 L305,515 Z" fill="url(#oakGrainReal)"/>
    <path d="M525,510 L550,710 L526,714 L495,515 Z" fill="url(#oakGrainReal)"/>
    
    <!-- Real Brass Floor Caps on leg tips -->
    <path d="M248,690 L250,710 L274,714 L272,694 Z" fill="#d4af37"/>
    <path d="M548,690 L550,710 L526,714 L524,694 Z" fill="#d4af37"/>
    
    <!-- Real Ambient Occlusion & Ambient Light -->
    <rect width="800" height="800" fill="url(#warmLightReal)" pointer-events="none"/>
    
    <text x="30" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#0f172a" letter-spacing="1">FOTO REAL (CANON EOS R5 / 50MM F/1.8)</text>
    <rect x="30" y="60" width="80" height="4" fill="#10b981" rx="2"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createChairRender(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="bgRender" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#f8f9fa"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </radialGradient>
      <!-- 3D Render: Shadow is noticeably sharper/harder (Discrepancy 1) -->
      <filter id="renderShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0 0.12  0 0 0 0.65 0"/>
        <feOffset dx="0" dy="18"/>
        <feBlend in="SourceGraphic" in2="blurOut" mode="normal"/>
      </filter>
      <!-- 3D Render Wood: Procedural texture too uniform, missing natural knots & grain variation (Discrepancy 2) -->
      <pattern id="oakGrainRender" width="40" height="80" patternUnits="userSpaceOnUse">
        <rect width="40" height="80" fill="#c89d6e"/>
        <!-- Perfectly straight synthetic stripes without organic wobble -->
        <path d="M0,10 L40,10 M0,28 L40,28 M0,48 L40,48 M0,66 L40,66" stroke="#9a6e42" stroke-width="1.4" fill="none" opacity="0.45"/>
        <path d="M12,0 L12,80 M28,0 L28,80" stroke="#7a5430" stroke-width="0.8" fill="none" opacity="0.3"/>
      </pattern>
      <!-- 3D Render Leather: Flat PBR roughness, missing natural wrinkle relief and micro-creases (Discrepancy 3) -->
      <linearGradient id="leatherCushionRender" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#362219"/>
        <stop offset="50%" stop-color="#4d3225"/>
        <stop offset="100%" stop-color="#24150e"/>
      </linearGradient>
    </defs>

    <!-- Studio Floor -->
    <rect width="800" height="800" fill="url(#bgRender)"/>
    <!-- Hard CGI shadow with razor edge (Discrepancy: Shadow penumbra too sharp) -->
    <ellipse cx="400" cy="690" rx="265" ry="36" fill="#050811" opacity="0.55" filter="blur(5px)"/>
    <ellipse cx="400" cy="686" rx="195" ry="20" fill="#000000" opacity="0.75" filter="blur(2px)"/>

    <!-- Chair Back Legs -->
    <path d="M260,380 L220,680 L242,684 L285,385 Z" fill="url(#oakGrainRender)"/>
    <path d="M540,380 L580,680 L558,684 L515,385 Z" fill="url(#oakGrainRender)"/>

    <!-- Chair Backrest & Curved Spindles -->
    <!-- Backrest Top Rail: Notice sharp CGI polygonal corners, bevel radius too small (Discrepancy 4) -->
    <path d="M230,220 C230,135 570,135 570,220 C565,248 545,252 525,242 C465,195 335,195 275,242 C255,252 235,248 230,220 Z" fill="url(#oakGrainRender)" stroke="#7a5430" stroke-width="0.8"/>
    
    <!-- 7 Wooden Spindles (Slightly thinner spacing) -->
    <path d="M285,240 L290,440 L297,440 L294,236 Z" fill="url(#oakGrainRender)"/>
    <path d="M325,225 L330,442 L337,442 L333,222 Z" fill="url(#oakGrainRender)"/>
    <path d="M365,212 L368,444 L375,444 L372,210 Z" fill="url(#oakGrainRender)"/>
    <path d="M400,208 L400,445 L407,445 L406,208 Z" fill="url(#oakGrainRender)"/>
    <path d="M435,212 L432,444 L439,444 L442,210 Z" fill="url(#oakGrainRender)"/>
    <path d="M475,225 L470,442 L477,442 L481,222 Z" fill="url(#oakGrainRender)"/>
    <path d="M515,240 L510,440 L517,440 L522,236 Z" fill="url(#oakGrainRender)"/>

    <!-- 3D Leather Cushion: Flat without hand-stitched details or realistic sag wrinkles (Discrepancy 5) -->
    <path d="M240,430 C240,402 560,402 560,430 C568,468 538,508 510,516 C450,525 350,525 290,516 C262,508 232,468 240,430 Z" fill="url(#leatherCushionRender)"/>
    
    <!-- CGI Specular Highlight: overly sharp point reflection from digital omni light -->
    <ellipse cx="370" cy="442" rx="45" ry="12" fill="#ffffff" opacity="0.32" filter="blur(2px)"/>

    <!-- Front Wooden Frame & Legs -->
    <path d="M275,510 L250,710 L274,714 L305,515 Z" fill="url(#oakGrainRender)"/>
    <path d="M525,510 L550,710 L526,714 L495,515 Z" fill="url(#oakGrainRender)"/>
    
    <!-- 3D Render Leg Tips: MISSING brass caps entirely! Model was unfinished here (Discrepancy 6: Critical missing detail) -->
    <!-- Flat wood cuts at bottom instead of brass ferrule -->

    <text x="30" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#0f172a" letter-spacing="1">RENDER 3D (BLENDER CYCLES / PBR)</text>
    <rect x="30" y="60" width="80" height="4" fill="#3b82f6" rx="2"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Perfume Luxury Bottle Preset
function createPerfumeReal(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="perfumeBgReal" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>
      <!-- Glass Caustics on dark surface -->
      <radialGradient id="causticReal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>
        <stop offset="40%" stop-color="#d97706" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="amberLiquidReal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="50%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <linearGradient id="goldCapReal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="25%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="75%" stop-color="#fef9c3"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#perfumeBgReal)"/>
    <!-- Table reflection and glass caustic pools -->
    <ellipse cx="400" cy="650" rx="220" ry="40" fill="url(#causticReal)"/>
    <ellipse cx="400" cy="635" rx="140" ry="18" fill="#000000" opacity="0.6" filter="blur(6px)"/>
    
    <!-- Thick Glass Base with Optical Meniscus (Real) -->
    <path d="M280,320 L290,620 C290,635 510,635 510,620 L520,320 Z" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-width="2.5" stroke-opacity="0.4"/>
    
    <!-- Liquid inside with concave meniscus at top -->
    <path d="M305,370 C305,362 495,362 495,370 L490,590 C490,600 310,600 310,590 Z" fill="url(#amberLiquidReal)" opacity="0.85"/>
    <ellipse cx="400" cy="370" rx="95" ry="10" fill="#fef3c7" opacity="0.4"/>
    
    <!-- Inner glass refraction caustics and bubbles -->
    <path d="M315,390 L320,570" stroke="#fff" stroke-width="4" stroke-opacity="0.6" filter="blur(2px)"/>
    <circle cx="340" cy="510" r="3" fill="#fff" opacity="0.5"/>
    
    <!-- Golden Metallic Cap with micro-grooved knurling -->
    <rect x="345" y="190" width="110" height="130" rx="4" fill="url(#goldCapReal)"/>
    <line x1="345" y1="210" x2="455" y2="210" stroke="#78350f" stroke-width="2"/>
    <line x1="345" y1="230" x2="455" y2="230" stroke="#78350f" stroke-width="2"/>
    <line x1="345" y1="250" x2="455" y2="250" stroke="#78350f" stroke-width="2"/>
    
    <!-- Embossed Gold Foil Label -->
    <rect x="330" y="430" width="140" height="80" rx="3" fill="#18181b" stroke="#d97706" stroke-width="1.8"/>
    <text x="400" y="465" font-family="'Cinzel', serif, Georgia" font-size="16" font-weight="700" fill="#fef08a" text-anchor="middle" letter-spacing="4">AURA</text>
    <text x="400" y="485" font-family="system-ui, sans-serif" font-size="8" fill="#d97706" text-anchor="middle" letter-spacing="2">EAU DE PARFUM</text>
    
    <!-- Soft softbox specular strip on glass -->
    <path d="M300,330 L308,610" stroke="#ffffff" stroke-width="8" stroke-opacity="0.3" filter="blur(4px)"/>
    <path d="M500,330 L492,610" stroke="#ffffff" stroke-width="5" stroke-opacity="0.25" filter="blur(3px)"/>

    <text x="30" y="50" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#f8fafc" letter-spacing="1">FOTO REAL (ESTÚDIO COM ILUMINAÇÃO MACIA)</text>
    <rect x="30" y="60" width="80" height="4" fill="#10b981" rx="2"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createPerfumeRender(): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="perfumeBgRender" cx="50%" cy="45%" r="65%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#090d16"/>
      </radialGradient>
      <!-- 3D Render missing caustics on table! (Discrepancy 1) -->
      <linearGradient id="amberLiquidRender" x1="0%" y1="0%" x2="0%" y2="100%">
        <!-- Color tone slightly too saturated orange without depth falloff (Discrepancy 2) -->
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <linearGradient id="goldCapRender" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#92400e"/>
        <stop offset="35%" stop-color="#fef08a"/>
        <stop offset="70%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#perfumeBgRender)"/>
    <!-- Missing table caustics, only generic dark shadow circle -->
    <ellipse cx="400" cy="635" rx="140" ry="16" fill="#000000" opacity="0.8" filter="blur(4px)"/>
    
    <!-- Glass Bottle: Wall thickness is too thin at bottom, missing heavy base (Discrepancy 3) -->
    <path d="M280,320 L290,620 C290,635 510,635 510,620 L520,320 Z" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-width="1.8" stroke-opacity="0.5"/>
    
    <!-- Liquid inside: perfectly flat top surface, missing liquid meniscus curvature against glass walls (Discrepancy 4) -->
    <path d="M305,370 L495,370 L490,610 L310,610 Z" fill="url(#amberLiquidRender)" opacity="0.8"/>
    <ellipse cx="400" cy="370" rx="95" ry="8" fill="#fef3c7" opacity="0.2"/>
    
    <!-- Golden Metallic Cap: Missing knurled grip lines! Flat cylinder in 3D (Discrepancy 5) -->
    <rect x="345" y="190" width="110" height="130" rx="1" fill="url(#goldCapRender)"/>
    
    <!-- Label: Font weight mismatch and missing embossed gold foil border (Discrepancy 6) -->
    <rect x="330" y="430" width="140" height="80" rx="1" fill="#18181b" stroke="#f59e0b" stroke-width="1.0"/>
    <text x="400" y="468" font-family="system-ui, sans-serif" font-size="19" font-weight="900" fill="#fef08a" text-anchor="middle" letter-spacing="2">AURA</text>
    <text x="400" y="488" font-family="system-ui, sans-serif" font-size="9" fill="#f59e0b" text-anchor="middle" letter-spacing="1">EAU DE PARFUM</text>
    
    <!-- Hard specular strip (point light rather than area light softbox) -->
    <line x1="302" y1="330" x2="308" y2="610" stroke="#ffffff" stroke-width="3" stroke-opacity="0.8"/>

    <text x="30" y="50" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#f8fafc" letter-spacing="1">RENDER 3D (UNREAL ENGINE 5 / LUMEN)</text>
    <rect x="30" y="60" width="80" height="4" fill="#3b82f6" rx="2"/>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'nordic-chair',
    name: 'Cadeira Escandinava de Carvalho & Couro',
    subtitle: 'Móvel de Design / ArchViz',
    category: 'Mobiliário',
    realImage: createChairReal(),
    renderImage: createChairRender(),
    description:
      'Comparação de uma cadeira nórdica com pés de carvalho maciço e assento em couro natural versus renderização 3D PBR.',
  },
  {
    id: 'luxury-perfume',
    name: 'Frasco de Perfume Minimalista Aura',
    subtitle: 'Design de Embalagem & Cosméticos',
    category: 'Produto',
    realImage: createPerfumeReal(),
    renderImage: createPerfumeRender(),
    description:
      'Frasco de perfume em vidro de alto índice de refração com líquido âmbar, tampa metálica dourada e rótulo com foil.',
  },
];
