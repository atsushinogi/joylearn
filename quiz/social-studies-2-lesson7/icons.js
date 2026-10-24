/* 社会 第7回 安土・桃山時代 クイズ用イラスト（SVG）
 * キーは quiz-data.js の icon に対応する。joke_ で始まるものは遊び心のある選択肢用。
 * 同じ形で色ちがいのもの（城・合戦・人物など）は関数で作っている。
 */
const ICONS = (function () {
  const K = "#2B2420";
  const SKIN = "#F4D6B5";
  const GOLD = "#D9AE3F";
  const GOLDL = "#F0D78A";
  const VER = "#C0442F";
  const LAC = "#2E2B33";
  const CREAM = "#FFF8EA";
  const WOOD = "#9A6337";
  const GREEN = "#5E8C4E";
  const BLUE = "#3F6FA6";
  const SEA = "#6FA8D6";
  const S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const T = `stroke="${K}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

  const svg = (bg, body) =>
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${bg}"/>${body}</svg>`;
  const eyes = (cx, cy, d) =>
    `<circle cx="${cx - d}" cy="${cy}" r="1.8" fill="${K}"/><circle cx="${cx + d}" cy="${cy}" r="1.8" fill="${K}"/>`;
  const smile = (cx, cy, w) =>
    `<path d="M${cx - w},${cy} Q${cx},${cy + w * 0.9} ${cx + w},${cy}" fill="none" ${T}/>`;
  const face = (cx, cy, r, skin = SKIN) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${skin}" ${S}/>` + eyes(cx, cy, r * 0.38) + smile(cx, cy + r * 0.38, r * 0.28);
  const waves = (y, c = SEA) =>
    `<path d="M0,${y} Q12,${y - 5} 25,${y} T50,${y} T75,${y} T100,${y} L100,100 L0,100 Z" fill="${c}"/>` +
    `<path d="M8,${y + 9} q6,-4 12,0 M44,${y + 12} q6,-4 12,0 M76,${y + 8} q6,-4 12,0" fill="none" stroke="${CREAM}" stroke-width="2" stroke-linecap="round"/>`;
  const ground = (c, y = 82) => `<path d="M0,${y} Q50,${y - 8} 100,${y} L100,100 L0,100 Z" fill="${c}"/>`;
  const sparkle = (x, y, s = 4, c = GOLD) =>
    `<path d="M${x},${y - s} L${x + s * 0.3},${y - s * 0.3} L${x + s},${y} L${x + s * 0.3},${y + s * 0.3} L${x},${y + s} L${x - s * 0.3},${y + s * 0.3} L${x - s},${y} L${x - s * 0.3},${y - s * 0.3} Z" fill="${c}"/>`;

  /* ---------- 歴史のイラスト ---------- */

  const battle = (c1, c2, bg) =>
    svg(bg,
      ground("#8FA36B", 84) +
      `<line x1="26" y1="88" x2="26" y2="12" ${S}/><rect x="26" y="14" width="20" height="40" fill="${c1}" ${S}/><circle cx="36" cy="32" r="5" fill="${CREAM}" ${T}/>` +
      `<line x1="74" y1="88" x2="74" y2="12" ${S}/><rect x="54" y="14" width="20" height="40" fill="${c2}" ${S}/><circle cx="64" cy="32" r="5" fill="${CREAM}" ${T}/>` +
      `<line x1="32" y1="60" x2="68" y2="92" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/><line x1="68" y1="60" x2="32" y2="92" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/>` +
      `<polygon points="28,56 36,60 32,64" fill="#C9CDD2" ${T}/><polygon points="72,56 64,60 68,64" fill="#C9CDD2" ${T}/>`);

  const castle = (bg, wall, roof, stone = "#B9B2A3") =>
    svg(bg,
      ground("#9DB57A", 92) +
      `<polygon points="20,92 80,92 72,72 28,72" fill="${stone}" ${S}/>` +
      `<rect x="30" y="56" width="40" height="16" fill="${wall}" ${S}/><polygon points="20,59 80,59 68,48 32,48" fill="${roof}" ${S}/>` +
      `<rect x="36" y="38" width="28" height="11" fill="${wall}" ${S}/><polygon points="28,40 72,40 62,29 38,29" fill="${roof}" ${S}/>` +
      `<rect x="42" y="20" width="16" height="10" fill="${wall}" ${S}/><polygon points="36,22 64,22 56,13 44,13" fill="${roof}" ${S}/>` +
      `<circle cx="44" cy="12" r="2.6" fill="${GOLD}"/><circle cx="56" cy="12" r="2.6" fill="${GOLD}"/>` +
      `<rect x="37" y="61" width="5" height="6" fill="${K}"/><rect x="47.5" y="61" width="5" height="6" fill="${K}"/><rect x="58" y="61" width="5" height="6" fill="${K}"/>` +
      `<rect x="47.5" y="41" width="5" height="5" fill="${K}"/>`);

  const noble = (robe, bg) =>
    svg(bg,
      `<path d="M26,100 L33,64 Q50,56 67,64 L74,100 Z" fill="${robe}" ${S}/>` +
      `<path d="M44,60 L50,72 L56,60" fill="none" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>` +
      face(50, 44, 13) +
      `<rect x="41" y="20" width="18" height="13" rx="2" fill="${LAC}" ${S}/><path d="M57,24 Q72,14 78,20" fill="none" stroke="${LAC}" stroke-width="4" stroke-linecap="round"/>` +
      `<rect x="46" y="70" width="8" height="26" rx="2" fill="${CREAM}" ${S}/>`);

  const shogun = (robe, bg) =>
    svg(bg,
      `<polygon points="18,70 82,70 74,100 26,100" fill="${robe}" ${S}/><polygon points="14,64 40,60 44,74 18,76" fill="${robe}" ${S}/><polygon points="86,64 60,60 56,74 82,76" fill="${robe}" ${S}/>` +
      `<circle cx="50" cy="86" r="6" fill="${GOLD}" ${T}/>` +
      face(50, 46, 13) +
      `<path d="M37,38 Q38,12 62,14 L64,36 Z" fill="${LAC}" ${S}/>`);

  const daimyo = (armor, bg) =>
    svg(bg,
      `<path d="M24,100 L30,68 Q50,60 70,68 L76,100 Z" fill="${armor}" ${S}/>` +
      `<path d="M30,78 L70,78 M29,86 L71,86 M28,94 L72,94" stroke="${GOLDL}" stroke-width="2.5" stroke-linecap="round"/>` +
      face(50, 57, 12) +
      `<path d="M35,46 Q50,24 65,46 Z" fill="${LAC}" ${S}/><polygon points="26,46 74,46 68,52 32,52" fill="${LAC}" ${S}/>` +
      `<path d="M30,16 Q50,42 70,16 Q50,34 30,16 Z" fill="${GOLD}" ${T}/>`);

  const missionary = (robe, bg, beard) =>
    svg(bg,
      `<path d="M26,100 L32,64 Q50,56 68,64 L74,100 Z" fill="${robe}" ${S}/>` +
      `<rect x="47" y="70" width="6" height="18" fill="${GOLD}" ${T}/><rect x="42" y="75" width="16" height="6" fill="${GOLD}" ${T}/>` +
      face(50, 44, 13) +
      (beard ? `<path d="M38,48 Q50,70 62,48 Q56,58 50,58 Q44,58 38,48 Z" fill="#7A5232" ${T}/>` : "") +
      `<path d="M37,44 Q36,30 50,29 Q64,30 63,44" fill="none" stroke="#7A5232" stroke-width="5" stroke-linecap="round"/>`);

  const globe = (bg, flag) =>
    svg(bg,
      `<path d="M30,84 Q50,92 70,84" fill="none" ${S}/><line x1="50" y1="76" x2="50" y2="90" ${S}/><rect x="36" y="88" width="28" height="6" rx="3" fill="${WOOD}" ${S}/>` +
      `<circle cx="46" cy="48" r="28" fill="#8EC0E4" ${S}/>` +
      `<path d="M30,38 Q36,28 46,32 Q50,40 42,44 Q34,50 30,38 Z M48,52 Q58,46 64,54 Q62,66 52,68 Q46,60 48,52 Z" fill="${GREEN}" ${T}/>` +
      `<line x1="72" y1="20" x2="72" y2="46" ${T}/>` + flag);

  const flagH = (c1, c2, c3) =>
    `<rect x="73" y="20" width="20" height="5" fill="${c1}"/><rect x="73" y="25" width="20" height="5" fill="${c2}"/><rect x="73" y="30" width="20" height="5" fill="${c3}"/><rect x="73" y="20" width="20" height="15" fill="none" ${T}/>`;
  const flagPT = `<rect x="73" y="20" width="8" height="15" fill="#2E7D4F"/><rect x="81" y="20" width="12" height="15" fill="#C8352B"/><circle cx="81" cy="27.5" r="3" fill="${GOLD}"/><rect x="73" y="20" width="20" height="15" fill="none" ${T}/>`;

  const oldShip = (sail, bg) =>
    svg(bg,
      waves(76) +
      `<path d="M14,64 L86,64 L76,82 L24,82 Z" fill="${WOOD}" ${S}/>` +
      `<line x1="50" y1="64" x2="50" y2="14" ${S}/>` +
      `<rect x="30" y="18" width="40" height="38" fill="${sail}" ${S}/>` +
      `<path d="M30,28 H70 M30,37 H70 M30,46 H70" stroke="${K}" stroke-width="1.5" opacity=".5"/>`);

  const port = (roof, bg) =>
    svg(bg,
      `<rect x="0" y="80" width="100" height="20" fill="${SEA}"/>` +
      `<path d="M0,78 H100" ${S}/>` +
      `<rect x="10" y="50" width="22" height="28" fill="${CREAM}" ${S}/><polygon points="6,52 36,52 21,38" fill="${roof}" ${S}/>` +
      `<rect x="68" y="46" width="24" height="32" fill="${CREAM}" ${S}/><polygon points="64,48 96,48 80,32" fill="${roof}" ${S}/>` +
      `<line x1="42" y1="78" x2="42" y2="36" stroke="${WOOD}" stroke-width="5"/><line x1="58" y1="78" x2="58" y2="36" stroke="${WOOD}" stroke-width="5"/><rect x="36" y="32" width="28" height="6" fill="${WOOD}" ${T}/>` +
      `<rect x="15" y="60" width="5" height="8" fill="${K}"/><rect x="74" y="58" width="5" height="8" fill="${K}"/><rect x="82" y="58" width="5" height="8" fill="${K}"/>`);

  const pottery = (body, pattern, bg) =>
    svg(bg,
      `<ellipse cx="50" cy="86" rx="26" ry="5" fill="${K}" opacity=".15"/>` +
      `<path d="M40,16 L60,16 L58,28 Q80,46 68,82 L32,82 Q20,46 42,28 Z" fill="${body}" ${S}/>` + pattern);

  const screen = (motif, bg) =>
    svg(bg,
      `<polygon points="10,26 30,20 30,84 10,90" fill="${GOLDL}" ${S}/><polygon points="30,20 50,26 50,90 30,84" fill="${GOLD}" ${S}/>` +
      `<polygon points="50,26 70,20 70,84 50,90" fill="${GOLDL}" ${S}/><polygon points="70,20 90,26 90,90 70,84" fill="${GOLD}" ${S}/>` + motif);

  const temple = (pillar, roof, bg, wall = CREAM) =>
    svg(bg,
      ground("#C9B98F", 90) +
      `<rect x="16" y="82" width="68" height="8" fill="#B9B2A3" ${S}/>` +
      `<rect x="24" y="50" width="52" height="32" fill="${wall}" ${S}/>` +
      `<line x1="32" y1="52" x2="32" y2="82" stroke="${pillar}" stroke-width="5"/><line x1="50" y1="52" x2="50" y2="82" stroke="${pillar}" stroke-width="5"/><line x1="68" y1="52" x2="68" y2="82" stroke="${pillar}" stroke-width="5"/>` +
      `<path d="M8,54 Q20,46 26,32 L74,32 Q80,46 92,54 Z" fill="${roof}" ${S}/>` +
      `<path d="M30,32 Q40,22 50,20 Q60,22 70,32 Z" fill="${roof}" ${S}/>`);

  const ledger = (cover, bg) =>
    svg(bg,
      `<rect x="28" y="14" width="46" height="72" rx="2" fill="${cover}" ${S}/>` +
      `<line x1="66" y1="14" x2="66" y2="86" ${T}/>` +
      `<path d="M66,24 H74 M66,40 H74 M66,58 H74 M66,76 H74" ${T}/>` +
      `<rect x="36" y="22" width="12" height="40" fill="${CREAM}" ${T}/>` +
      `<path d="M42,28 V56" stroke="${K}" stroke-width="2" stroke-dasharray="4 3"/>`);

  const silver = (ingot, bg) =>
    svg(bg,
      `<polygon points="0,78 30,26 52,56 66,38 100,78" fill="#8D8A84" ${S}/>` +
      `<path d="M22,78 Q22,60 32,60 Q42,60 42,78 Z" fill="${LAC}" ${S}/>` +
      `<rect x="0" y="78" width="100" height="22" fill="#B8A685"/>` +
      `<polygon points="52,90 84,90 78,78 58,78" fill="${ingot}" ${S}/><polygon points="58,78 78,78 74,68 62,68" fill="${ingot}" ${S}/>` +
      sparkle(86, 64, 5, CREAM));

  const era = (frame, sand, bg) =>
    svg(bg,
      `<rect x="28" y="12" width="44" height="7" rx="3" fill="${frame}" ${S}/><rect x="28" y="81" width="44" height="7" rx="3" fill="${frame}" ${S}/>` +
      `<path d="M34,19 Q34,40 48,50 Q34,60 34,81 L66,81 Q66,60 52,50 Q66,40 66,19 Z" fill="#E9F2F8" ${S}/>` +
      `<path d="M40,30 L60,30 Q58,40 50,47 Q42,40 40,30 Z" fill="${sand}"/>` +
      `<path d="M38,80 Q50,62 62,80 Z" fill="${sand}"/><line x1="50" y1="50" x2="50" y2="70" stroke="${sand}" stroke-width="2"/>`);

  const monk = (robe, kesa, bg) =>
    svg(bg,
      `<path d="M24,100 L30,66 Q50,58 70,66 L76,100 Z" fill="${robe}" ${S}/>` +
      `<path d="M36,64 L64,100 L52,100 L32,70 Z" fill="${kesa}" ${T}/>` +
      `<circle cx="50" cy="44" r="15" fill="${SKIN}" ${S}/>` + eyes(50, 45, 6) + smile(50, 51, 4) +
      `<path d="M38,80 Q50,92 62,80" fill="none" stroke="#7A3E2E" stroke-width="3" stroke-dasharray="1 4" stroke-linecap="round"/>`);

  const island = (shape, bg) =>
    svg(bg,
      `<rect x="0" y="0" width="100" height="100" fill="${SEA}" opacity=".55"/>` +
      `<path d="M10,22 q6,-4 12,0 M70,84 q6,-4 12,0 M72,18 q6,-4 12,0" fill="none" stroke="${CREAM}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="${shape}" fill="#8DBA6A" ${S}/>`);

  const seal = (shape, marks, bg) =>
    svg(bg, `<rect x="16" y="78" width="68" height="8" rx="2" fill="${WOOD}" opacity=".35"/>` + shape + marks);

  const sanshinLike = (body, skin, bg) =>
    svg(bg,
      `<g transform="rotate(-30 50 50)"><rect x="46" y="4" width="8" height="58" rx="2" fill="${LAC}" ${S}/>` +
      `<line x1="40" y1="12" x2="60" y2="12" ${S}/><line x1="40" y1="20" x2="60" y2="20" ${S}/>` +
      `<rect x="30" y="58" width="40" height="36" rx="9" fill="${body}" ${S}/><rect x="35" y="63" width="30" height="26" rx="6" fill="${skin}"/>` +
      `<path d="M48,8 V90 M52,8 V90" stroke="${CREAM}" stroke-width="1"/></g>`);

  const icons = {
    battle_a: battle(VER, BLUE, "#F2DCCB"),
    battle_b: battle(GREEN, GOLD, "#E6EBD3"),
    battle_c: battle("#6B4E8C", CREAM, "#E6DEEE"),

    castle_a: castle("#F5E6C8", "#E9B94A", LAC),
    castle_b: castle("#DCEAF4", CREAM, LAC),
    castle_c: castle("#E8E1D3", CREAM, "#5B6B5A"),
    castle_white: castle("#CFE4F5", "#FFFFFF", "#6E7C8C", "#C9C3B6"),

    noble: noble("#5B3F7A", "#E6DDF0"),
    noble_red: noble(VER, "#F3DDD4"),
    noble_green: noble("#3E6B4E", "#DCE8D9"),

    shogun: shogun("#3E6B4E", "#DDE6D8"),
    shogun_b: shogun("#3A4F7A", "#DCE3EF"),
    shogun_c: shogun("#7A4A2E", "#EFE0D0"),

    daimyo_a: daimyo(VER, "#EADFC4"),
    daimyo_b: daimyo("#3A4F7A", "#DCE3EF"),
    daimyo_c: daimyo("#3E6B4E", "#DDE6D8"),

    missionary: missionary("#2F3440", "#E3EAF2", false),
    missionary_b: missionary("#5A4632", "#EFE6DA", true),

    globe_a: globe("#DCE6F2", flagPT),
    globe_b: globe("#F6E6CC", flagH("#C8352B", "#F2C230", "#C8352B")),
    globe_c: globe("#E3E8EE", flagH("#C8352B", "#FFFFFF", "#2B4C9A")),

    cross: svg("#DCE6F2",
      sparkle(22, 24, 6, "#FFFFFF") + sparkle(80, 30, 5, "#FFFFFF") +
      `<path d="M44,14 H56 V36 H72 V48 H56 V86 H44 V48 H28 V36 H44 Z" fill="${GOLD}" ${S}/>` +
      `<path d="M30,62 Q50,94 70,62" fill="none" stroke="${VER}" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/>`),

    envoy: svg("#EDE6D6",
      [18, 39, 61, 82].map((x, i) =>
        `<rect x="${x - 9}" y="66" width="18" height="34" rx="4" fill="${i % 2 ? "#3A4F7A" : LAC}" ${T}/>` +
        `<ellipse cx="${x}" cy="64" rx="11" ry="5" fill="#FFFFFF" ${T}/>` +
        `<circle cx="${x}" cy="50" r="9" fill="${SKIN}" ${T}/>` + eyes(x, 50, 3.4) +
        `<path d="M${x - 9},47 Q${x},36 ${x + 9},47" fill="${LAC}" ${T}/>`).join("") +
      sparkle(50, 18, 6)),

    envoy_scroll: svg("#E6EBD3",
      `<path d="M26,100 L32,64 Q50,56 68,64 L74,100 Z" fill="#E9E4F2" ${S}/>` +
      face(50, 46, 12) +
      `<ellipse cx="50" cy="34" rx="24" ry="5" fill="${LAC}" ${S}/><rect x="42" y="18" width="16" height="16" rx="3" fill="${LAC}" ${S}/>` +
      `<rect x="30" y="72" width="40" height="12" fill="${CREAM}" ${S}/><rect x="26" y="70" width="6" height="16" rx="2" fill="${WOOD}" ${T}/><rect x="68" y="70" width="6" height="16" rx="2" fill="${WOOD}" ${T}/>`),

    old_ship_a: oldShip("#D9C08A", "#E6F0F6"),
    old_ship_b: oldShip("#C9876A", "#F1E6DA"),

    nanban_ship: svg("#DCEBF5",
      waves(78) +
      `<path d="M10,62 L90,58 L80,84 L22,84 Z" fill="${WOOD}" ${S}/><rect x="70" y="48" width="18" height="12" fill="${WOOD}" ${S}/>` +
      `<line x1="34" y1="62" x2="34" y2="16" ${S}/><line x1="58" y1="60" x2="58" y2="10" ${S}/>` +
      `<path d="M22,22 Q34,30 46,22 L46,50 Q34,56 22,50 Z" fill="${CREAM}" ${S}/>` +
      `<path d="M46,16 Q58,24 70,16 L70,48 Q58,54 46,48 Z" fill="${CREAM}" ${S}/>` +
      `<polygon points="58,10 72,6 58,4" fill="${VER}" ${T}/>` +
      `<path d="M58,24 V40 M51,32 H65" stroke="${VER}" stroke-width="3"/>`),

    port_a: port(LAC, "#F1E6D0"),
    port_b: port("#7A4A2E", "#E6EBD3"),
    port_c: port("#3A4F7A", "#E3EAF2"),

    pottery_a: pottery("#FFFFFF",
      `<circle cx="50" cy="52" r="10" fill="none" stroke="${BLUE}" stroke-width="3"/><circle cx="50" cy="52" r="3" fill="${VER}"/>` +
      `<path d="M30,66 Q40,60 50,66 T70,66 M44,22 H56" fill="none" stroke="${BLUE}" stroke-width="3" stroke-linecap="round"/>`, "#E9EEF5"),
    pottery_b: pottery("#8B5A2B",
      `<path d="M30,44 Q50,52 70,44" fill="none" stroke="#5B3A1B" stroke-width="5" stroke-linecap="round" opacity=".8"/>`, "#F1E6D6"),
    pottery_c: pottery("#D49A62",
      `<circle cx="40" cy="50" r="2" fill="#7A4A2E"/><circle cx="58" cy="44" r="2" fill="#7A4A2E"/><circle cx="52" cy="62" r="2" fill="#7A4A2E"/><circle cx="62" cy="70" r="2" fill="#7A4A2E"/><circle cx="36" cy="68" r="2" fill="#7A4A2E"/>`, "#EEE6D8"),

    screen_a: screen(
      `<path d="M18,74 Q24,58 36,60 Q46,48 58,56 Q70,50 78,62 Q84,66 82,76 Z" fill="#E08A3C" ${T}/>` +
      `<circle cx="40" cy="62" r="5" fill="#B5652A" ${T}/>` + eyes(40, 61, 1.8) +
      `<path d="M58,40 Q66,30 76,36" fill="none" stroke="${GREEN}" stroke-width="5" stroke-linecap="round"/>`, "#F1E4C6"),
    screen_b: screen(
      `<circle cx="26" cy="50" r="8" fill="${GREEN}" ${T}/><circle cx="74" cy="50" r="8" fill="#FFFFFF" ${T}/>` +
      `<path d="M14,64 Q22,58 30,64 Q38,58 44,64 M56,64 Q62,58 70,64 Q78,58 86,64" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>`, "#EEE6D0"),

    ink_painting: svg("#EFE8DA",
      `<rect x="30" y="8" width="40" height="84" fill="#FAF6EC" ${S}/><rect x="26" y="6" width="48" height="6" rx="3" fill="${WOOD}" ${T}/><rect x="26" y="88" width="48" height="6" rx="3" fill="${WOOD}" ${T}/>` +
      `<path d="M34,72 L46,38 L54,56 L60,46 L66,72 Z" fill="#6E6E6E" opacity=".75"/><path d="M34,72 L42,58 L50,72 Z" fill="#3A3A3A" opacity=".8"/>` +
      `<circle cx="58" cy="24" r="5" fill="${VER}" opacity=".8"/>`),

    ukiyoe: svg("#F0E6D2",
      `<rect x="12" y="16" width="76" height="68" fill="#F7EEDC" ${S}/>` +
      `<polygon points="52,66 64,46 76,66" fill="#5C6E8C"/><polygon points="60,52 64,46 68,52" fill="#FFFFFF"/>` +
      `<path d="M14,82 Q20,50 44,44 Q58,42 56,56 Q48,52 44,60 Q54,62 60,70 Q70,78 86,82 Z" fill="#2F5E9E" ${T}/>` +
      `<path d="M44,44 q4,-4 8,0 q4,-4 8,2" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>`),

    market: svg("#F1E2C6",
      `<rect x="16" y="46" width="68" height="40" fill="${CREAM}" ${S}/>` +
      `<path d="M10,30 H90 L86,46 H14 Z" fill="${VER}" ${S}/>` +
      `<path d="M26,30 L24,46 M42,30 L41,46 M58,30 L59,46 M74,30 L76,46" stroke="${CREAM}" stroke-width="5"/>` +
      `<rect x="22" y="62" width="56" height="8" fill="${WOOD}" ${T}/>` +
      `<circle cx="32" cy="56" r="6" fill="#E08A3C" ${T}/><circle cx="48" cy="56" r="6" fill="${GREEN}" ${T}/><circle cx="64" cy="56" r="6" fill="${GOLD}" ${T}/>` +
      `<line x1="20" y1="86" x2="20" y2="92" ${S}/><line x1="80" y1="86" x2="80" y2="92" ${S}/>`),

    masu: svg("#F2E6CF",
      `<path d="M28,40 Q50,16 72,40 Z" fill="#FFFFFF" ${S}/>` +
      `<circle cx="40" cy="34" r="1.5" fill="${K}" opacity=".4"/><circle cx="52" cy="28" r="1.5" fill="${K}" opacity=".4"/><circle cx="60" cy="36" r="1.5" fill="${K}" opacity=".4"/>` +
      `<polygon points="22,40 78,40 84,48 28,48" fill="#C79A5E" ${S}/>` +
      `<rect x="22" y="48" width="56" height="36" fill="#D9AE72" ${S}/><polygon points="78,48 84,48 84,78 78,84" fill="#B5864E" ${S}/>` +
      `<path d="M30,58 H70" stroke="${WOOD}" stroke-width="2" opacity=".6"/>`),

    rice_bag: svg("#F2E6CF",
      `<path d="M26,30 Q22,60 28,86 L72,86 Q78,60 74,30 Q50,22 26,30 Z" fill="#E8D7A8" ${S}/>` +
      `<path d="M28,30 Q50,40 72,30" fill="none" ${S}/><path d="M24,52 H76 M26,70 H74" stroke="${WOOD}" stroke-width="3"/>` +
      `<path d="M40,26 Q44,14 50,22 Q56,14 60,26" fill="${GOLD}" ${T}/>`),

    katana: svg("#EADBD2",
      `<g transform="rotate(40 50 50)"><path d="M48,8 Q54,40 52,70 L48,70 Q50,40 44,8 Z" fill="#DCE1E6" ${S}/><ellipse cx="50" cy="72" rx="9" ry="3" fill="${GOLD}" ${T}/><rect x="47" y="74" width="6" height="20" rx="2" fill="${LAC}" ${T}/></g>` +
      `<g transform="rotate(-40 50 50)"><path d="M48,8 Q54,40 52,70 L48,70 Q50,40 44,8 Z" fill="#DCE1E6" ${S}/><ellipse cx="50" cy="72" rx="9" ry="3" fill="${GOLD}" ${T}/><rect x="47" y="74" width="6" height="20" rx="2" fill="${VER}" ${T}/></g>`),

    admiral: svg("#DCE8F2",
      `<path d="M24,100 L30,66 Q50,58 70,66 L76,100 Z" fill="#3A5C9A" ${S}/><path d="M30,80 H70 M29,90 H71" stroke="${GOLDL}" stroke-width="2.5"/>` +
      face(50, 50, 13) +
      `<path d="M50,40 m-14,0 L50,22 L64,40 Z" fill="${LAC}" ${S}/>` +
      `<path d="M50,22 Q46,10 54,6 Q52,14 58,16 Q52,18 50,22 Z" fill="${VER}" ${T}/>` +
      `<path d="M40,58 Q50,66 60,58" fill="none" stroke="${LAC}" stroke-width="3"/>`),

    rice_field: svg("#E5EED5",
      `<polygon points="6,52 50,40 94,52 50,66" fill="#9CC46A" ${S}/><polygon points="6,52 50,66 50,92 6,76" fill="#D9C35C" ${S}/><polygon points="50,66 94,52 94,76 50,92" fill="#7FAF55" ${S}/>` +
      `<path d="M14,60 V70 M22,62 V74 M30,64 V78 M38,68 V82 M60,70 V82 M68,66 V80 M76,64 V76 M84,60 V72" stroke="${GREEN}" stroke-width="2"/>` +
      `<polygon points="60,40 74,40 67,28" fill="${WOOD}" ${T}/><rect x="61" y="40" width="12" height="8" fill="${CREAM}" ${T}/>`),

    checkpoint: svg("#ECE3D0",
      ground("#C9B98F", 88) +
      `<rect x="22" y="34" width="8" height="54" fill="${WOOD}" ${S}/><rect x="70" y="34" width="8" height="54" fill="${WOOD}" ${S}/>` +
      `<path d="M12,34 Q50,22 88,34 L84,40 H16 Z" fill="${LAC}" ${S}/>` +
      `<rect x="30" y="54" width="40" height="6" fill="${CREAM}" ${T}/><path d="M36,54 V60 M44,54 V60 M52,54 V60 M60,54 V60" stroke="${VER}" stroke-width="3"/>` +
      `<rect x="40" y="66" width="20" height="10" fill="${CREAM}" ${T}/><path d="M44,70 H56" ${T}/>`),

    gekokujo: svg("#EEDFD0",
      `<path d="M50,92 V38" stroke="${VER}" stroke-width="10" stroke-linecap="round"/><polygon points="34,44 50,20 66,44" fill="${VER}" ${S}/>` +
      `<circle cx="24" cy="70" r="7" fill="${SKIN}" ${T}/><path d="M18,92 L20,80 Q24,76 28,80 L30,92 Z" fill="#6F8D4E" ${T}/>` +
      `<g transform="rotate(35 78 30)"><path d="M70,30 Q72,14 86,16 L86,30 Z" fill="${LAC}" ${T}/></g>` +
      `<path d="M66,46 q8,-6 14,2" fill="none" ${T} stroke-dasharray="2 4"/>`),

    farmer: svg("#E5EED5",
      ground("#B9A06A", 90) +
      `<path d="M28,100 L32,66 Q50,58 68,66 L72,100 Z" fill="#6F8D4E" ${S}/>` +
      face(50, 48, 12) +
      `<polygon points="22,40 78,40 50,24" fill="#E3C778" ${S}/>` +
      `<line x1="80" y1="30" x2="72" y2="92" stroke="${WOOD}" stroke-width="4" stroke-linecap="round"/><polygon points="64,90 82,90 80,98 66,98" fill="#9AA0A6" ${T}/>`),

    temple_a: temple(VER, LAC, "#F1E6D0"),
    temple_b: temple(VER, "#5B4A3A", "#E5EED5"),
    temple_c: temple("#7A4A2E", "#4E5A6A", "#E3EAF2"),
    temple_gold: temple(GOLD, LAC, "#DCEAF4", GOLDL),

    fire_temple: svg("#F7DCC2",
      `<path d="M14,60 Q8,38 20,26 Q22,40 30,36 Q26,18 42,8 Q42,26 52,28 Q54,14 64,10 Q62,28 74,30 Q80,22 82,16 Q94,36 86,60 Z" fill="#F08A3C" ${T}/>` +
      `<path d="M26,60 Q24,44 34,40 Q36,48 42,46 Q42,34 52,30 Q54,44 62,44 Q66,38 70,36 Q78,48 72,60 Z" fill="#F6C24A"/>` +
      `<rect x="16" y="86" width="68" height="8" fill="#9B8F7E" ${S}/><rect x="24" y="64" width="52" height="22" fill="#6B5848" ${S}/>` +
      `<path d="M8,66 Q20,60 24,52 L76,52 Q80,60 92,66 Z" fill="${LAC}" ${S}/>`),

    ledger_a: ledger("#C9B48A", "#EFE7D6"),
    ledger_b: ledger("#3A4F7A", "#E3E8EF"),
    ledger_c: ledger("#7A4A2E", "#F1E6D6"),

    law_scroll: svg("#E9E1CF",
      `<rect x="16" y="26" width="68" height="48" fill="#FAF3E2" ${S}/>` +
      `<rect x="10" y="22" width="8" height="56" rx="3" fill="${WOOD}" ${S}/><rect x="82" y="22" width="8" height="56" rx="3" fill="${WOOD}" ${S}/>` +
      `<path d="M30,34 V66 M40,34 V60 M50,34 V66 M60,34 V56 M70,34 V64" stroke="${K}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
      `<rect x="62" y="58" width="12" height="12" fill="${VER}" opacity=".85"/>`),

    peach: svg("#F7E1DA",
      `<path d="M50,30 Q50,20 58,14" fill="none" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M52,24 Q66,10 80,22 Q66,30 52,24 Z" fill="${GREEN}" ${T}/>` +
      `<path d="M50,32 Q24,22 22,52 Q22,82 50,88 Q78,82 78,52 Q76,22 50,32 Z" fill="#F6A6A0" ${S}/>` +
      `<path d="M50,34 Q42,58 50,86" fill="none" stroke="#E07E78" stroke-width="2.5"/>` +
      sparkle(18, 22, 6) + sparkle(84, 70, 5) + sparkle(22, 84, 4)),

    silver_a: silver("#E4E7EB", "#E2E4E8"),
    silver_b: silver(GOLD, "#F2E9D0"),
    silver_c: silver("#C9CED6", "#E7E2D8"),

    silk: svg("#F3EDE0",
      `<ellipse cx="34" cy="50" rx="16" ry="30" fill="#FFFDF6" ${S}/><ellipse cx="34" cy="50" rx="7" ry="20" fill="none" ${T}/>` +
      `<ellipse cx="66" cy="50" rx="16" ry="30" fill="#FBF3D9" ${S}/><ellipse cx="66" cy="50" rx="7" ry="20" fill="none" ${T}/>` +
      `<rect x="20" y="46" width="60" height="8" fill="${VER}" ${T}/>`),

    matchlock: svg("#F3E3C3",
      `<g transform="rotate(-22 50 50)"><rect x="18" y="44" width="72" height="6" rx="2" fill="#5A5A5E" ${S}/>` +
      `<path d="M6,48 L44,44 L48,54 Q30,58 10,64 Z" fill="${WOOD}" ${S}/>` +
      `<rect x="40" y="50" width="6" height="8" fill="${GOLD}" ${T}/></g>` +
      `<path d="M40,64 Q34,74 42,80 Q50,86 44,94" fill="none" stroke="${VER}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="44" cy="94" r="2.5" fill="#F08A3C"/>`),

    ashigaru: svg("#E7DCC6",
      ground("#B9A06A", 92) +
      `<line x1="22" y1="92" x2="84" y2="30" stroke="#5A5A5E" stroke-width="5" stroke-linecap="round"/><line x1="22" y1="92" x2="44" y2="70" stroke="${WOOD}" stroke-width="8" stroke-linecap="round"/>` +
      `<path d="M32,100 L36,62 Q50,56 64,62 L68,100 Z" fill="#3B4A6B" ${S}/>` +
      face(50, 44, 11) +
      `<polygon points="28,38 72,38 50,22" fill="${LAC}" ${S}/>` +
      `<path d="M38,78 Q30,84 34,92" fill="none" stroke="${VER}" stroke-width="3" stroke-linecap="round"/>`),

    tea: svg("#E3EAD6",
      `<ellipse cx="50" cy="86" rx="34" ry="5" fill="${K}" opacity=".12"/>` +
      `<path d="M18,48 Q20,84 50,84 Q80,84 82,48 Z" fill="#3B3230" ${S}/>` +
      `<ellipse cx="50" cy="48" rx="32" ry="8" fill="#7DAA4A" ${S}/>` +
      `<path d="M36,46 q4,-3 8,0 q4,-3 8,0" fill="none" stroke="#B6D488" stroke-width="2"/>` +
      `<path d="M44,30 Q48,20 44,12 M56,30 Q60,20 56,12" fill="none" stroke="#9AA59A" stroke-width="2.5" stroke-linecap="round"/>`),

    artist: svg("#F0E6D2",
      `<rect x="10" y="20" width="56" height="64" fill="${GOLDL}" ${S}/>` +
      `<path d="M18,70 Q30,44 44,56 Q52,40 60,48" fill="none" stroke="${GREEN}" stroke-width="5" stroke-linecap="round"/>` +
      `<g transform="rotate(30 74 50)"><rect x="70" y="14" width="8" height="54" rx="3" fill="${WOOD}" ${S}/><path d="M70,68 L78,68 L74,84 Z" fill="${LAC}" ${T}/></g>`),

    kabuki: svg("#F4DCE2",
      `<path d="M26,100 L34,62 Q50,54 66,62 L74,100 Z" fill="#D9486B" ${S}/>` +
      `<path d="M30,82 L70,74" stroke="${GOLD}" stroke-width="6"/>` +
      face(50, 46, 12, "#FBEAE0") +
      `<path d="M38,40 Q38,26 50,26 Q62,26 62,40 Q56,32 50,33 Q44,32 38,40 Z" fill="${LAC}" ${T}/><circle cx="50" cy="22" r="7" fill="${LAC}" ${T}/>` +
      `<path d="M66,64 L82,38" ${S}/><path d="M72,30 Q86,22 94,36 L82,40 Z" fill="${GOLD}" ${T}/>` +
      sparkle(18, 26, 5, "#FFFFFF")),

    noh: svg("#EDE4D2",
      `<path d="M30,44 Q30,14 50,14 Q70,14 70,44 Q70,82 50,86 Q30,82 30,44 Z" fill="#FFFDF6" ${S}/>` +
      `<path d="M32,34 Q40,18 50,24 Q60,18 68,34 Q60,26 50,30 Q40,26 32,34 Z" fill="${LAC}"/>` +
      `<path d="M38,44 q4,-3 8,0 M54,44 q4,-3 8,0" fill="none" ${T}/>` +
      `<path d="M44,66 Q50,70 56,66" fill="#C0442F" ${T}/>` +
      `<circle cx="38" cy="56" r="3" fill="#F2B9B0" opacity=".7"/><circle cx="62" cy="56" r="3" fill="#F2B9B0" opacity=".7"/>`),

    shamisen: sanshinLike(WOOD, "#FFFDF6", "#EFE2D0"),
    sanshin: sanshinLike(LAC, "#6E5F4E", "#DCEBE6"),

    biwa: svg("#EFE6D6",
      `<g transform="rotate(-28 50 50)"><path d="M50,6 L54,30 Q74,48 66,78 Q58,94 50,94 Q42,94 34,78 Q26,48 46,30 Z" fill="#B5753E" ${S}/>` +
      `<path d="M44,6 H56 L54,14 H46 Z" fill="${LAC}" ${T}/><ellipse cx="50" cy="80" rx="10" ry="4" fill="${LAC}"/>` +
      `<path d="M48,14 V80 M52,14 V80" stroke="${CREAM}" stroke-width="1"/></g>`),

    shakuhachi: svg("#E9EEDF",
      `<g transform="rotate(25 50 50)"><rect x="44" y="6" width="12" height="88" rx="5" fill="#C9A86A" ${S}/>` +
      `<path d="M44,28 H56 M44,52 H56 M44,76 H56" ${T}/><circle cx="50" cy="40" r="2.5" fill="${K}"/><circle cx="50" cy="62" r="2.5" fill="${K}"/></g>` +
      `<path d="M74,22 q6,-6 10,0 M70,34 q6,-6 10,0" fill="none" ${T}/>`),

    era_a: era(VER, "#E0B04A", "#F3DDD4"),
    era_b: era("#3E6B4E", "#B9A06A", "#DDE6D8"),
    era_c: era("#3A4F7A", "#C9B98F", "#DCE3EF"),

    monk: monk("#5B4E44", "#C9A24A", "#E6E0D0"),
    monk_b: monk(LAC, "#7A6E62", "#E3E3DE"),

    island_a: island("M30,30 Q50,18 60,34 Q66,50 62,70 Q58,86 46,82 Q40,64 36,50 Q26,40 30,30 Z", "#D8E9F3"),
    island_b: island("M24,50 Q24,26 50,24 Q76,26 76,50 Q76,76 50,78 Q24,76 24,50 Z", "#D8E9F3"),
    island_c: island("M44,16 Q56,18 54,40 Q52,48 60,56 Q62,78 50,86 Q40,80 44,60 Q36,48 44,40 Q38,28 44,16 Z", "#D8E9F3"),

    seal_a: seal(
      `<path d="M28,74 L28,44 Q28,18 50,18 Q72,18 72,44 L72,74 Z" fill="${VER}" ${S}/>`,
      `<path d="M38,32 H48 M43,32 V48 M38,48 H48 M54,30 L62,46 M62,30 L54,46 M38,58 H62 M44,58 V68 M56,58 V68" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>`, "#F3E7D3"),
    seal_b: seal(
      `<circle cx="50" cy="46" r="28" fill="${VER}" ${S}/>`,
      `<path d="M38,34 H62 M50,34 V60 M38,60 H62 M40,46 H60" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>`, "#EFE8DA"),
    seal_c: seal(
      `<rect x="24" y="20" width="52" height="52" rx="4" fill="#9C2F2A" ${S}/>`,
      `<path d="M34,30 H46 M40,30 V62 M34,44 H46 M34,62 H46 M54,30 Q62,38 54,46 Q62,54 54,62 M66,30 V62" fill="none" stroke="${GOLDL}" stroke-width="3" stroke-linecap="round"/>`, "#E8E3D8"),

    levee: svg("#DCEBF0",
      `<polygon points="0,20 30,20 70,100 0,100" fill="#8DBA6A"/>` +
      `<polygon points="30,20 56,20 100,90 100,100 70,100" fill="${SEA}" ${S}/>` +
      `<polygon points="56,20 70,20 100,66 100,90" fill="#B9A06A" ${S}/>` +
      `<path d="M38,34 q5,-3 10,0 M52,58 q5,-3 10,0 M70,80 q5,-3 10,0" fill="none" stroke="${CREAM}" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="66" cy="32" r="2.5" fill="#7E7466"/><circle cx="76" cy="46" r="2.5" fill="#7E7466"/><circle cx="86" cy="60" r="2.5" fill="#7E7466"/>` +
      `<circle cx="16" cy="40" r="7" fill="${GREEN}" ${T}/><circle cx="12" cy="66" r="6" fill="${GREEN}" ${T}/>`),

    stone_wall: svg("#E6E0D4",
      waves(84) +
      [[10, 44], [34, 44], [58, 44], [82, 44], [22, 60], [46, 60], [70, 60], [10, 76], [34, 76], [58, 76], [82, 76]]
        .map(([x, y]) => `<rect x="${x - 11}" y="${y - 8}" width="22" height="16" rx="5" fill="#A9A294" ${T}/>`).join("")),

    church: svg("#E3E8EF",
      ground("#C9B98F", 90) +
      `<rect x="26" y="50" width="48" height="40" fill="${CREAM}" ${S}/>` +
      `<path d="M14,54 Q24,48 30,36 L70,36 Q76,48 86,54 Z" fill="${LAC}" ${S}/>` +
      `<rect x="42" y="64" width="16" height="26" rx="8" fill="${WOOD}" ${S}/>` +
      `<rect x="47" y="10" width="6" height="26" fill="${GOLD}" ${T}/><rect x="40" y="16" width="20" height="6" fill="${GOLD}" ${T}/>`),

    /* ---------- 遊び心のある選択肢 ---------- */

    joke_snowman: svg("#DCEFFA",
      ground("#FFFFFF", 86) +
      `<circle cx="50" cy="68" r="20" fill="#FFFFFF" ${S}/><circle cx="50" cy="38" r="14" fill="#FFFFFF" ${S}/>` +
      eyes(50, 36, 5) + `<polygon points="50,40 62,43 50,44" fill="#F08A3C" ${T}/>` +
      `<rect x="38" y="16" width="24" height="10" fill="${VER}" ${S}/>` +
      `<path d="M30,62 L16,52 M70,62 L84,50" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="86" cy="46" r="6" fill="#FFFFFF" ${T}/><circle cx="18" cy="20" r="2" fill="#FFFFFF"/><circle cx="80" cy="16" r="2" fill="#FFFFFF"/>`),

    joke_demon: svg("#E7DDF3",
      `<polygon points="32,30 26,10 42,24" fill="${GOLD}" ${S}/><polygon points="68,30 74,10 58,24" fill="${GOLD}" ${S}/>` +
      `<path d="M20,60 Q20,24 50,24 Q80,24 80,60 Q80,90 50,90 Q20,90 20,60 Z" fill="#7B4FB0" ${S}/>` +
      `<circle cx="38" cy="54" r="8" fill="#FFFFFF" ${T}/><circle cx="62" cy="54" r="8" fill="#FFFFFF" ${T}/><circle cx="40" cy="55" r="3.5" fill="${VER}"/><circle cx="60" cy="55" r="3.5" fill="${VER}"/>` +
      `<path d="M36,72 Q50,80 64,72" fill="none" ${S}/><polygon points="42,74 45,80 48,75" fill="#FFFFFF" ${T}/><polygon points="52,75 55,80 58,74" fill="#FFFFFF" ${T}/>`),

    joke_ufo: svg("#1F2A4A",
      sparkle(16, 18, 4, "#FFF3A6") + sparkle(82, 14, 5, "#FFF3A6") + sparkle(84, 56, 3, "#FFF3A6") + sparkle(12, 60, 3, "#FFF3A6") +
      `<polygon points="36,54 64,54 80,96 20,96" fill="#FFF3A6" opacity=".35"/>` +
      `<path d="M34,40 Q34,22 50,22 Q66,22 66,40 Z" fill="#A8E0F0" ${S}/>` +
      `<ellipse cx="50" cy="44" rx="34" ry="10" fill="#B8BEC8" ${S}/>` +
      `<circle cx="30" cy="45" r="2.5" fill="#F6C24A"/><circle cx="50" cy="48" r="2.5" fill="#F6C24A"/><circle cx="70" cy="45" r="2.5" fill="#F6C24A"/>`),

    joke_detective: svg("#F1E7D3",
      `<line x1="62" y1="62" x2="86" y2="86" stroke="${WOOD}" stroke-width="9" stroke-linecap="round"/>` +
      `<circle cx="44" cy="44" r="26" fill="#DDF0FA" stroke="${K}" stroke-width="5"/>` +
      `<ellipse cx="44" cy="44" rx="13" ry="9" fill="#FFFFFF" ${T}/><circle cx="44" cy="44" r="5" fill="#3F6FA6"/><circle cx="46" cy="42" r="1.5" fill="#FFFFFF"/>` +
      `<path d="M28,30 Q34,24 40,26" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`),

    joke_takoyaki: svg("#F6E3C8",
      `<path d="M10,58 L90,58 L80,82 L20,82 Z" fill="#E8D2A6" ${S}/>` +
      `<circle cx="32" cy="52" r="12" fill="#C9874A" ${S}/><circle cx="56" cy="52" r="12" fill="#C9874A" ${S}/><circle cx="44" cy="40" r="12" fill="#C9874A" ${S}/>` +
      `<path d="M24,48 Q32,44 40,50 M48,48 Q56,44 64,50 M36,36 Q44,32 52,38" fill="none" stroke="#5B3A1B" stroke-width="3" stroke-linecap="round"/>` +
      `<circle cx="30" cy="54" r="1.5" fill="${GREEN}"/><circle cx="58" cy="56" r="1.5" fill="${GREEN}"/><circle cx="46" cy="42" r="1.5" fill="${GREEN}"/>` +
      `<line x1="70" y1="54" x2="86" y2="22" stroke="${WOOD}" stroke-width="2.5" stroke-linecap="round"/>`),

    joke_egg: svg("#E9EEF2",
      `<line x1="70" y1="62" x2="94" y2="86" stroke="${LAC}" stroke-width="8" stroke-linecap="round"/>` +
      `<circle cx="44" cy="48" r="32" fill="#4A4A50" ${S}/>` +
      `<path d="M24,46 Q22,28 40,26 Q58,20 64,38 Q70,56 52,64 Q30,70 24,46 Z" fill="#FFFFFF" ${T}/>` +
      `<circle cx="44" cy="46" r="10" fill="#F6B526" ${T}/><circle cx="41" cy="43" r="2.5" fill="#FFE59A"/>`),

    joke_doodle: svg("#F3EFE6",
      `<rect x="18" y="12" width="64" height="78" rx="4" fill="#FFFFFF" ${S}/>` +
      `<path d="M18,22 H12 M18,36 H12 M18,50 H12 M18,64 H12 M18,78 H12" ${T}/>` +
      `<circle cx="42" cy="40" r="12" fill="none" stroke="#F08A3C" stroke-width="3"/>` + eyes(42, 38, 4) + smile(42, 43, 4) +
      `<path d="M30,70 Q40,58 50,70 T70,70" fill="none" stroke="#3F6FA6" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M62,28 l4,8 8,1 -6,6 2,8 -8,-4 -8,4 2,-8 -6,-6 8,-1 Z" fill="#F6C24A" ${T}/>`),

    joke_trophy: svg("#FFF3D6",
      `<path d="M30,18 H70 V40 Q70,62 50,62 Q30,62 30,40 Z" fill="${GOLD}" ${S}/>` +
      `<path d="M30,26 Q16,26 18,38 Q20,48 32,48 M70,26 Q84,26 82,38 Q80,48 68,48" fill="none" ${S}/>` +
      `<rect x="45" y="62" width="10" height="12" fill="${GOLD}" ${S}/><rect x="32" y="74" width="36" height="12" rx="2" fill="${WOOD}" ${S}/>` +
      `<text x="50" y="50" text-anchor="middle" font-size="22" font-weight="900" font-family="sans-serif" fill="${CREAM}">1</text>` +
      sparkle(16, 16, 5) + sparkle(86, 66, 4)),

    joke_sale: svg("#FDE3DE",
      `<path d="M22,20 H62 L86,48 L62,76 H22 Z" fill="#F6C24A" ${S}/><circle cx="30" cy="48" r="4" fill="#FFFFFF" ${T}/>` +
      `<text x="56" y="56" text-anchor="middle" font-size="22" font-weight="900" font-family="sans-serif" fill="${VER}">%</text>` +
      `<path d="M40,84 l6,8 M54,84 l0,10 M68,84 l-6,8" ${S}/>`),

    joke_turtle: svg("#DCEBF5",
      waves(80) +
      `<ellipse cx="78" cy="58" rx="9" ry="8" fill="#9CC46A" ${S}/>` + eyes(80, 56, 3) +
      `<path d="M20,66 Q20,34 50,34 Q80,34 78,66 Z" fill="#4E8C4A" ${S}/>` +
      `<path d="M38,42 L50,52 L62,42 M50,52 V66 M30,58 L38,48 M70,58 L62,48" fill="none" stroke="#9CC46A" stroke-width="2.5"/>` +
      `<rect x="38" y="22" width="24" height="10" rx="3" fill="#FFFFFF" ${S}/><path d="M34,32 H66" stroke="${LAC}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="27" r="2.5" fill="${GOLD}"/>`),

    joke_sandbox: svg("#E5EED5",
      `<rect x="8" y="58" width="84" height="32" fill="${WOOD}" ${S}/><rect x="14" y="62" width="72" height="24" fill="#E9CF8E"/>` +
      `<path d="M24,68 Q40,48 56,68 Z" fill="#DDBB6E" ${T}/>` +
      `<path d="M60,40 L80,40 L76,62 L64,62 Z" fill="#F08A3C" ${S}/><path d="M62,40 Q70,28 78,40" fill="none" ${T}/>` +
      `<line x1="30" y1="30" x2="40" y2="58" stroke="#3F6FA6" stroke-width="4" stroke-linecap="round"/><ellipse cx="42" cy="62" rx="5" ry="3" fill="#3F6FA6"/>`),

    joke_onigiri: svg("#F4EADA",
      `<path d="M50,14 Q60,14 80,56 Q88,78 70,82 L30,82 Q12,78 20,56 Q40,14 50,14 Z" fill="#FFFFFF" ${S}/>` +
      `<rect x="34" y="60" width="32" height="22" fill="${LAC}"/>` +
      eyes(50, 46, 8) + smile(50, 52, 5) +
      `<circle cx="34" cy="52" r="3.5" fill="#F6B0A8" opacity=".8"/><circle cx="66" cy="52" r="3.5" fill="#F6B0A8" opacity=".8"/>` +
      `<path d="M88,30 L94,20 M92,40 L98,36" ${T}/>`),

    joke_imo: svg("#F6E3C8",
      `<path d="M14,56 Q16,34 40,32 Q70,28 86,46 Q92,62 72,70 Q44,80 22,70 Q12,64 14,56 Z" fill="#8B3A6B" ${S}/>` +
      `<path d="M50,34 Q64,34 70,50 Q62,66 46,64 Q38,50 50,34 Z" fill="#F6C24A" ${T}/>` +
      `<path d="M30,24 Q26,16 32,10 M44,22 Q40,14 46,8 M58,22 Q54,14 60,8" fill="none" stroke="#B8B0A6" stroke-width="2.5" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="88" rx="34" ry="4" fill="#9B8F7E" opacity=".5"/>`),

    joke_monster_book: svg("#FDE3DE",
      `<rect x="24" y="12" width="52" height="76" rx="8" fill="#D83A34" ${S}/>` +
      `<circle cx="36" cy="24" r="6" fill="#8EE0F0" ${T}/><circle cx="50" cy="22" r="2.5" fill="#F6C24A"/><circle cx="58" cy="22" r="2.5" fill="#6FB06A"/>` +
      `<rect x="32" y="34" width="36" height="28" rx="3" fill="#E9F6EE" ${T}/>` +
      `<path d="M40,56 Q40,42 50,42 Q60,42 60,56 Z" fill="#F6C24A" ${T}/>` + eyes(50, 49, 4) +
      `<rect x="34" y="70" width="12" height="4" rx="2" fill="${LAC}"/><circle cx="62" cy="74" r="5" fill="${LAC}"/>` +
      sparkle(86, 20, 5) + sparkle(14, 76, 4)),

    joke_pudding: svg("#FFF0D8",
      `<ellipse cx="50" cy="84" rx="38" ry="8" fill="#FFFFFF" ${S}/>` +
      `<path d="M28,82 L34,40 Q50,34 66,40 L72,82 Z" fill="#F6D06A" ${S}/>` +
      `<path d="M34,40 Q50,34 66,40 L67,50 Q58,46 50,52 Q42,46 33,50 Z" fill="#8B4A1F" ${T}/>` +
      `<circle cx="50" cy="30" r="6" fill="${VER}" ${S}/><path d="M50,24 Q54,14 60,12" fill="none" stroke="${GREEN}" stroke-width="2.5" stroke-linecap="round"/>` +
      eyes(50, 64, 6) + smile(50, 70, 4)),

    joke_momotaro: svg("#FBE6DF",
      `<path d="M50,30 Q24,20 22,50 Q22,82 50,88 Q78,82 78,50 Q76,20 50,30 Z" fill="#F6A6A0" ${S}/>` +
      `<path d="M24,44 Q50,52 76,44 L76,52 Q50,60 24,52 Z" fill="#FFFFFF" ${T}/><circle cx="50" cy="52" r="4" fill="${VER}"/>` +
      eyes(50, 64, 8) + smile(50, 70, 5) +
      `<path d="M52,24 Q66,10 80,20 Q66,28 52,24 Z" fill="${GREEN}" ${T}/>` +
      `<path d="M80,52 L94,46 M80,58 L94,60" stroke="${VER}" stroke-width="3" stroke-linecap="round"/>`),

    joke_bath: svg("#DDEFF7",
      `<path d="M14,40 L86,40 L80,88 L20,88 Z" fill="#C79A5E" ${S}/>` +
      `<path d="M17,56 H83 M19,74 H81" stroke="${LAC}" stroke-width="3"/>` +
      `<ellipse cx="50" cy="40" rx="36" ry="6" fill="#8EC0E4" ${S}/>` +
      `<circle cx="28" cy="28" r="5" fill="#FFFFFF" ${T}/><circle cx="40" cy="20" r="3.5" fill="#FFFFFF" ${T}/><circle cx="74" cy="24" r="4" fill="#FFFFFF" ${T}/>` +
      `<path d="M52,36 Q52,26 60,26 Q68,26 66,34 L72,34 Q66,40 56,40 Z" fill="#F6C24A" ${T}/><circle cx="62" cy="30" r="1.3" fill="${K}"/>`),

    joke_santa: svg("#E6F0E6",
      `<path d="M26,46 Q30,14 60,16 Q76,18 82,34 L70,40 Q58,30 50,30 Q34,32 26,46 Z" fill="${VER}" ${S}/>` +
      `<circle cx="84" cy="38" r="6" fill="#FFFFFF" ${S}/>` +
      `<rect x="22" y="42" width="56" height="10" rx="5" fill="#FFFFFF" ${S}/>` +
      `<circle cx="50" cy="62" r="13" fill="${SKIN}" ${S}/>` + eyes(50, 60, 5) +
      `<path d="M32,62 Q34,94 50,94 Q66,94 68,62 Q60,74 50,72 Q40,74 32,62 Z" fill="#FFFFFF" ${S}/>` +
      `<circle cx="50" cy="66" r="3" fill="#E77F72"/>`),

    joke_notebook: svg("#EDF3E6",
      `<rect x="20" y="14" width="56" height="74" rx="3" fill="#7BB0D9" ${S}/>` +
      `<rect x="30" y="24" width="36" height="16" fill="#FFFFFF" ${T}/><path d="M34,32 H62" ${T}/>` +
      `<path d="M30,52 H66 M30,62 H66 M30,72 H58" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>` +
      `<g transform="rotate(35 78 60)"><rect x="74" y="30" width="8" height="46" fill="#F6C24A" ${T}/><polygon points="74,76 82,76 78,86" fill="${SKIN}" ${T}/></g>`),

    joke_sandcastle: svg("#DDEFF7",
      `<rect x="0" y="80" width="100" height="20" fill="#EBD39A"/>` +
      `<rect x="22" y="50" width="56" height="32" fill="#E1BF77" ${S}/><rect x="36" y="30" width="28" height="22" fill="#E1BF77" ${S}/>` +
      `<path d="M22,50 v-6 h8 v6 M38,50 v-6 h8 v6 M54,50 v-6 h8 v6 M70,50 v-6 h8 v6" fill="#E1BF77" ${T}/>` +
      `<path d="M44,82 Q44,70 50,70 Q56,70 56,82 Z" fill="#B58E4E" ${T}/>` +
      `<line x1="50" y1="30" x2="50" y2="12" ${T}/><polygon points="50,12 62,16 50,20" fill="${VER}" ${T}/>` +
      `<path d="M80,90 Q86,82 92,90 Z" fill="#F6B0A8" ${T}/>`),

    joke_sushi: svg("#FFF2DD",
      `<rect x="0" y="70" width="100" height="16" fill="#9AA0A6"/><path d="M0,70 H100 M0,86 H100" ${S}/>` +
      `<ellipse cx="50" cy="66" rx="34" ry="8" fill="#FFFFFF" ${S}/>` +
      `<rect x="30" y="46" width="40" height="16" rx="7" fill="#FFFFFF" ${S}/>` +
      `<path d="M26,46 Q50,30 74,44 Q74,52 50,50 Q28,52 26,46 Z" fill="#F4845F" ${S}/>` +
      `<path d="M38,42 L44,48 M50,40 L56,47 M62,41 L66,46" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M10,78 h8 M40,78 h8 M70,78 h8" stroke="#6E747A" stroke-width="2"/>`),

    joke_rice_bowl: svg("#F6EBDC",
      `<path d="M26,58 Q30,10 50,10 Q70,10 74,58 Z" fill="#FFFFFF" ${S}/>` +
      `<path d="M16,56 H84 Q82,88 50,88 Q18,88 16,56 Z" fill="${VER}" ${S}/>` +
      `<path d="M30,70 Q50,78 70,70" fill="none" stroke="${CREAM}" stroke-width="3"/>` +
      `<line x1="72" y1="16" x2="94" y2="44" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/><line x1="78" y1="12" x2="96" y2="40" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/>` +
      sparkle(18, 22, 4, GOLD)),

    joke_rocket: svg("#1F2A4A",
      sparkle(16, 18, 4, "#FFF3A6") + sparkle(84, 22, 5, "#FFF3A6") + sparkle(78, 80, 3, "#FFF3A6") + sparkle(14, 70, 3, "#FFF3A6") +
      `<g transform="rotate(35 50 50)"><path d="M50,8 Q66,24 64,62 L36,62 Q34,24 50,8 Z" fill="#E9EEF2" ${S}/>` +
      `<circle cx="50" cy="34" r="7" fill="#8EC0E4" ${S}/>` +
      `<path d="M36,50 L24,68 L36,64 Z M64,50 L76,68 L64,64 Z" fill="${VER}" ${S}/>` +
      `<path d="M40,62 Q50,90 60,62 Z" fill="#F6C24A" ${T}/></g>`),

    joke_slide: svg("#E3F0F8",
      ground("#9CC46A", 90) +
      `<line x1="22" y1="86" x2="22" y2="26" ${S}/><line x1="34" y1="86" x2="34" y2="26" ${S}/>` +
      `<path d="M22,36 H34 M22,48 H34 M22,60 H34 M22,72 H34" ${T}/>` +
      `<path d="M34,26 Q60,32 70,70 Q74,84 90,86 L90,92 Q66,92 62,72 Q54,38 34,34 Z" fill="#F6C24A" ${S}/>` +
      `<circle cx="66" cy="54" r="6" fill="${SKIN}" ${T}/><path d="M60,62 L72,66" stroke="${VER}" stroke-width="5" stroke-linecap="round"/>`),

    joke_curry: svg("#FFF0D8",
      `<ellipse cx="50" cy="78" rx="42" ry="12" fill="#FFFFFF" ${S}/>` +
      `<path d="M26,74 Q36,22 50,20 Q64,22 74,74 Z" fill="#FFFFFF" ${S}/>` +
      `<path d="M16,78 Q20,62 36,66 Q50,72 66,64 Q82,60 84,78 Q50,88 16,78 Z" fill="#C9873A" ${S}/>` +
      `<rect x="30" y="68" width="8" height="6" fill="#F08A3C"/><rect x="62" y="68" width="8" height="6" fill="#F6C24A"/>` +
      `<line x1="50" y1="20" x2="50" y2="6" ${T}/><polygon points="50,6 62,9 50,13" fill="${VER}" ${T}/>`),

    joke_chips: svg("#FFF3D6",
      `<path d="M24,14 L76,14 L72,22 Q80,56 72,88 L28,88 Q20,56 28,22 Z" fill="${VER}" ${S}/>` +
      `<path d="M26,22 H74" ${T}/><ellipse cx="50" cy="54" rx="16" ry="12" fill="#F6C24A" ${T}/>` +
      `<path d="M42,52 q8,-4 16,2" fill="none" stroke="#C9873A" stroke-width="2"/>` +
      `<ellipse cx="14" cy="80" rx="8" ry="5" fill="#F6C24A" ${T}/><ellipse cx="86" cy="76" rx="8" ry="5" fill="#F6C24A" ${T}/>`),

    joke_icecream: svg("#EAF3E0",
      `<polygon points="36,54 64,54 50,94" fill="#D9A85E" ${S}/>` +
      `<path d="M40,62 L58,80 M60,62 L44,80" stroke="#B5864E" stroke-width="2"/>` +
      `<path d="M30,56 Q26,40 40,40 Q36,26 50,24 Q48,12 56,10 Q60,22 64,28 Q74,30 70,42 Q76,52 70,56 Z" fill="#9CC46A" ${S}/>` +
      `<path d="M38,48 Q50,52 62,46" fill="none" stroke="#C8E0A4" stroke-width="3" stroke-linecap="round"/>`),

    joke_mushroom: svg("#F1E6D6",
      `<path d="M8,80 L92,80 L84,94 L16,94 Z" fill="#C79A5E" ${S}/><path d="M12,86 H88" stroke="#8B5A2B" stroke-width="2"/>` +
      `<rect x="30" y="38" width="12" height="44" rx="5" fill="#F4E6CC" ${S}/><path d="M22,42 Q36,22 50,42 Z" fill="#8B5A2B" ${S}/>` +
      `<rect x="58" y="30" width="12" height="52" rx="5" fill="#F4E6CC" ${S}/><path d="M50,34 Q64,12 78,34 Z" fill="#8B5A2B" ${S}/>` +
      sparkle(86, 18, 5)),

    joke_candy_castle: svg("#FCE4EC",
      `<rect x="20" y="56" width="60" height="32" fill="#F6B0C8" ${S}/><rect x="34" y="34" width="32" height="24" fill="#FFF0D8" ${S}/>` +
      `<path d="M20,66 Q30,72 40,66 T60,66 T80,66" fill="none" stroke="#FFFFFF" stroke-width="4"/>` +
      `<path d="M34,42 Q42,48 50,42 T66,42" fill="none" stroke="#8B4A1F" stroke-width="4"/>` +
      `<rect x="10" y="36" width="10" height="52" fill="#FFFFFF" ${S}/><path d="M10,44 L20,40 M10,56 L20,52 M10,68 L20,64 M10,80 L20,76" stroke="${VER}" stroke-width="3"/>` +
      `<rect x="80" y="36" width="10" height="52" fill="#FFFFFF" ${S}/><path d="M80,44 L90,40 M80,56 L90,52 M80,68 L90,64 M80,80 L90,76" stroke="${VER}" stroke-width="3"/>` +
      `<circle cx="50" cy="26" r="7" fill="${VER}" ${S}/>`),

    joke_polar_bear: svg("#DCEFFA",
      `<rect x="0" y="78" width="100" height="22" fill="#FFFFFF"/><path d="M0,78 H100" stroke="#A8D0E6" stroke-width="3"/>` +
      `<circle cx="30" cy="30" r="9" fill="#FFFFFF" ${S}/><circle cx="70" cy="30" r="9" fill="#FFFFFF" ${S}/>` +
      `<path d="M20,52 Q20,26 50,26 Q80,26 80,52 Q80,80 50,80 Q20,80 20,52 Z" fill="#FFFFFF" ${S}/>` +
      eyes(50, 48, 12) + `<ellipse cx="50" cy="60" rx="10" ry="7" fill="#F4EEE4" ${T}/><ellipse cx="50" cy="57" rx="4" ry="3" fill="${K}"/>` +
      smile(50, 63, 4)),

    joke_radio: svg("#FFF0D8",
      `<line x1="64" y1="30" x2="82" y2="8" ${S}/>` +
      `<rect x="14" y="30" width="72" height="50" rx="8" fill="#E77F72" ${S}/>` +
      `<circle cx="36" cy="55" r="13" fill="#5A4A44" ${S}/><circle cx="36" cy="55" r="5" fill="#8A7A74"/>` +
      `<rect x="56" y="42" width="22" height="10" rx="2" fill="#FFF8EA" ${T}/><circle cx="62" cy="66" r="4" fill="${GOLD}" ${T}/><circle cx="74" cy="66" r="4" fill="${GOLD}" ${T}/>` +
      `<path d="M18,22 V12 L28,10 V20" fill="none" ${T}/><circle cx="16" cy="22" r="3" fill="${K}"/><circle cx="26" cy="20" r="3" fill="${K}"/>`),

    joke_dinosaur: svg("#E5EED5",
      ground("#B9A06A", 90) +
      `<path d="M14,80 Q10,60 30,56 Q40,54 46,40 Q50,22 66,20 Q84,20 84,34 Q84,42 72,42 L66,42 Q62,60 64,80 Z" fill="#6FB06A" ${S}/>` +
      `<circle cx="72" cy="30" r="2.5" fill="${K}"/><path d="M74,38 H82" ${T}/>` +
      `<path d="M30,56 l-4,-8 8,4 M40,50 l-2,-9 7,6 M46,40 l0,-9 6,7" fill="#4E8C4A" ${T}/>` +
      `<rect x="26" y="78" width="8" height="12" fill="#6FB06A" ${T}/><rect x="50" y="78" width="8" height="12" fill="#6FB06A" ${T}/>`),

    joke_ninja: svg("#E3E3DE",
      `<circle cx="50" cy="50" r="30" fill="${LAC}" ${S}/>` +
      `<rect x="26" y="40" width="48" height="14" rx="6" fill="${SKIN}" ${T}/>` +
      `<path d="M34,46 q5,-3 10,0 M56,46 q5,-3 10,0" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M76,36 Q90,30 94,40 M76,40 Q88,40 90,50" fill="none" stroke="${LAC}" stroke-width="4" stroke-linecap="round"/>` +
      `<g transform="translate(20 82) rotate(20)"><path d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" fill="#9AA0A6" ${T}/></g>`),

    joke_game: svg("#E6E4F0",
      `<path d="M18,40 Q20,30 32,30 H68 Q80,30 82,40 L90,70 Q92,82 80,80 L68,68 H32 L20,80 Q8,82 10,70 Z" fill="#6E6A8A" ${S}/>` +
      `<path d="M30,42 V56 M23,49 H37" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>` +
      `<circle cx="66" cy="44" r="4" fill="${VER}" ${T}/><circle cx="74" cy="52" r="4" fill="#F6C24A" ${T}/><circle cx="58" cy="52" r="4" fill="#5AB0E0" ${T}/><circle cx="66" cy="60" r="4" fill="#6FB06A" ${T}/>`),

    joke_pillow: svg("#E6EEF8",
      `<g transform="rotate(-15 36 40)"><rect x="12" y="24" width="48" height="30" rx="12" fill="#FFFFFF" ${S}/></g>` +
      `<g transform="rotate(18 64 66)"><rect x="40" y="50" width="48" height="30" rx="12" fill="#F6D06A" ${S}/></g>` +
      `<path d="M66,22 L82,14 M70,32 L88,28 M16,72 L30,66 M14,84 L30,80" ${T}/>` +
      `<path d="M80,46 q4,-4 8,0 q-4,4 -8,0 Z M24,10 q4,-4 8,0 q-4,4 -8,0 Z" fill="#FFFFFF" ${T}/>`),

    joke_tanuki: svg("#EFE6D6",
      `<circle cx="30" cy="34" r="8" fill="#8B6A4A" ${S}/><circle cx="70" cy="34" r="8" fill="#8B6A4A" ${S}/>` +
      `<path d="M20,58 Q20,32 50,32 Q80,32 80,58 Q80,86 50,86 Q20,86 20,58 Z" fill="#A9825A" ${S}/>` +
      `<ellipse cx="38" cy="56" rx="9" ry="7" fill="#5A4030"/><ellipse cx="62" cy="56" rx="9" ry="7" fill="#5A4030"/>` +
      `<circle cx="38" cy="56" r="2.5" fill="#FFFFFF"/><circle cx="62" cy="56" r="2.5" fill="#FFFFFF"/>` +
      `<ellipse cx="50" cy="70" rx="8" ry="6" fill="#F4EEE4" ${T}/><circle cx="50" cy="67" r="2.5" fill="${K}"/>` +
      `<path d="M50,30 Q44,14 56,8 Q62,20 50,30 Z" fill="${GREEN}" ${T}/>`),

    joke_runner: svg("#F3E8DA",
      `<rect x="0" y="84" width="100" height="16" fill="#D96B4A"/><path d="M0,92 H100" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="10 6"/>` +
      `<circle cx="58" cy="20" r="9" fill="${SKIN}" ${S}/>` +
      `<path d="M56,30 L48,56 M52,40 L68,48 M52,40 L36,44 M48,56 L62,70 L58,84 M48,56 L36,70 L22,70" fill="none" stroke="${BLUE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<rect x="66" y="42" width="12" height="6" rx="2" fill="#F6C24A" ${T} transform="rotate(-30 72 45)"/>` +
      `<path d="M14,30 H28 M8,42 H24 M14,54 H26" ${T}/>`),

    joke_drum: svg("#F6E3C8",
      `<ellipse cx="50" cy="40" rx="30" ry="10" fill="#F4E6CC" ${S}/>` +
      `<path d="M20,40 Q16,62 20,78 Q50,92 80,78 Q84,62 80,40" fill="${VER}" ${S}/>` +
      `<ellipse cx="50" cy="40" rx="12" ry="4" fill="none" stroke="#E0A040" stroke-width="2.5"/>` +
      `<path d="M24,46 v4 M34,49 v4 M44,50 v4 M56,50 v4 M66,49 v4 M76,46 v4" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` +
      `<line x1="22" y1="8" x2="40" y2="32" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/><line x1="78" y1="8" x2="60" y2="32" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>`),

    joke_robot: svg("#E3EEF7",
      `<line x1="50" y1="20" x2="50" y2="8" ${S}/><circle cx="50" cy="8" r="4" fill="${VER}" ${T}/>` +
      `<rect x="20" y="20" width="60" height="52" rx="14" fill="#5AA0E0" ${S}/>` +
      `<rect x="28" y="28" width="44" height="36" rx="10" fill="#FFFFFF" ${T}/>` +
      `<circle cx="40" cy="42" r="5" fill="${K}"/><circle cx="60" cy="42" r="5" fill="${K}"/><circle cx="42" cy="40" r="1.6" fill="#FFFFFF"/><circle cx="62" cy="40" r="1.6" fill="#FFFFFF"/>` +
      smile(50, 52, 7) +
      `<rect x="30" y="72" width="40" height="18" rx="4" fill="#5AA0E0" ${S}/><circle cx="50" cy="81" r="4" fill="#F6C24A" ${T}/>`),

    joke_watermelon: svg("#DDEFF7",
      `<path d="M10,40 Q50,110 90,40 Z" fill="#2E8B57" ${S}/>` +
      `<path d="M16,42 Q50,98 84,42 Z" fill="#F2F2D8"/><path d="M20,42 Q50,92 80,42 Z" fill="#E8505B"/>` +
      `<path d="M10,40 H90" ${S}/>` +
      sparkle(50, 22, 6, "#FFFFFF") + sparkle(24, 18, 4, "#FFFFFF") + sparkle(78, 20, 4, "#FFFFFF")),

    joke_stage: svg("#3A2E3A",
      `<path d="M0,0 H100 V14 Q50,22 0,14 Z" fill="${VER}" ${T}/>` +
      `<path d="M0,0 Q22,40 8,100 H0 Z M100,0 Q78,40 92,100 H100 Z" fill="${VER}" ${T}/>` +
      `<polygon points="36,0 64,0 76,90 24,90" fill="#FFF3A6" opacity=".25"/>` +
      `<rect x="10" y="88" width="80" height="12" fill="${WOOD}"/>` +
      `<circle cx="50" cy="48" r="9" fill="${SKIN}" ${S}/><path d="M38,88 L42,60 Q50,56 58,60 L62,88 Z" fill="#6FB06A" ${S}/>` +
      `<rect x="40" y="66" width="20" height="14" fill="#FFFFFF" ${T}/><text x="50" y="78" text-anchor="middle" font-size="12" font-weight="900" font-family="sans-serif" fill="${K}">A</text>`),

    joke_tempura: svg("#F6EBDC",
      `<path d="M14,56 H86 Q84,90 50,90 Q16,90 14,56 Z" fill="${LAC}" ${S}/><path d="M30,70 Q50,78 70,70" fill="none" stroke="${VER}" stroke-width="3"/>` +
      `<ellipse cx="50" cy="56" rx="36" ry="7" fill="#9B6B3E" ${S}/>` +
      `<path d="M26,54 Q30,30 50,24 Q70,20 72,30 Q60,32 54,40 Q46,50 42,56 Z" fill="#E8B04E" ${S}/>` +
      `<path d="M72,30 L82,20 M72,30 L84,30" stroke="${VER}" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M36,46 l3,-3 M44,38 l3,-3 M54,32 l3,-3" ${T}/>`),

    joke_sealion: svg("#DCEBF5",
      waves(84) +
      `<circle cx="66" cy="14" r="9" fill="${VER}" ${S}/><path d="M60,10 Q66,18 72,10" fill="none" stroke="#FFFFFF" stroke-width="2"/>` +
      `<path d="M30,86 Q24,58 44,44 Q52,30 62,30 Q74,32 70,44 Q66,56 60,62 Q66,74 70,86 Z" fill="#7A6050" ${S}/>` +
      `<circle cx="62" cy="38" r="2" fill="${K}"/><ellipse cx="70" cy="30" rx="3" ry="2" fill="${K}"/>` +
      `<path d="M40,66 Q30,70 26,80" fill="none" stroke="#5A4030" stroke-width="5" stroke-linecap="round"/>`),

    joke_beaver: svg("#E3EEF2",
      `<rect x="0" y="80" width="100" height="20" fill="${SEA}"/>` +
      `<rect x="56" y="70" width="40" height="10" rx="5" fill="${WOOD}" ${T}/><rect x="62" y="60" width="32" height="10" rx="5" fill="${WOOD}" ${T}/>` +
      `<path d="M14,80 Q10,50 30,40 Q50,34 54,56 Q56,76 46,80 Z" fill="#8B5A2B" ${S}/>` +
      `<circle cx="28" cy="36" r="5" fill="#8B5A2B" ${T}/>` +
      `<circle cx="38" cy="50" r="2.2" fill="${K}"/><ellipse cx="48" cy="56" rx="5" ry="4" fill="#C9A47A" ${T}/>` +
      `<rect x="44" y="60" width="6" height="6" fill="#FFFFFF" ${T}/>`),

    joke_cat: svg("#F6EEDF",
      `<polygon points="28,36 30,14 44,28" fill="#F0A85A" ${S}/><polygon points="72,36 70,14 56,28" fill="#F0A85A" ${S}/>` +
      `<path d="M20,56 Q20,28 50,28 Q80,28 80,56 Q80,84 50,84 Q20,84 20,56 Z" fill="#F0A85A" ${S}/>` +
      eyes(50, 52, 12) + `<polygon points="46,60 54,60 50,64" fill="#E77F72"/>` +
      `<path d="M50,64 Q46,70 42,66 M50,64 Q54,70 58,66 M22,58 H34 M22,64 L34,62 M66,58 H78 M66,62 L78,64" fill="none" ${T}/>` +
      `<path d="M86,96 Q90,60 80,40" fill="none" stroke="${GREEN}" stroke-width="2.5"/><ellipse cx="80" cy="34" rx="4" ry="9" fill="#C9B46A" ${T}/>`),

    joke_guitar: svg("#E6E4F0",
      `<g transform="rotate(-35 50 50)"><rect x="46" y="2" width="8" height="54" fill="${WOOD}" ${S}/><rect x="43" y="0" width="14" height="10" rx="2" fill="${LAC}" ${T}/>` +
      `<path d="M50,50 Q30,46 30,66 Q30,74 36,78 Q28,90 40,96 Q50,100 60,96 Q72,90 64,78 Q70,74 70,66 Q70,46 50,50 Z" fill="${VER}" ${S}/>` +
      `<rect x="42" y="74" width="16" height="5" fill="${LAC}"/><rect x="44" y="64" width="12" height="4" fill="#FFFFFF" ${T}/></g>` +
      `<path d="M78,18 V8 L88,6 V16" fill="none" ${T}/><circle cx="76" cy="18" r="3" fill="${K}"/><circle cx="86" cy="16" r="3" fill="${K}"/>`),

    joke_chicken: svg("#FFF0D8",
      `<ellipse cx="50" cy="76" rx="40" ry="10" fill="#FFFFFF" ${S}/>` +
      `<path d="M18,70 Q16,48 36,46 Q48,46 50,60 Q52,72 34,74 Q20,76 18,70 Z" fill="#C9873A" ${S}/>` +
      `<path d="M48,70 Q46,44 66,42 Q84,42 82,62 Q80,74 62,74 Q50,74 48,70 Z" fill="#C9873A" ${S}/>` +
      `<path d="M30,52 Q40,48 46,58 Q40,64 30,60 Z M58,48 Q70,44 76,54 Q70,60 60,58 Z" fill="#FFFDF0" ${T}/>` +
      `<circle cx="38" cy="54" r="1.4" fill="${GREEN}"/><circle cx="66" cy="50" r="1.4" fill="${GREEN}"/>` +
      `<path d="M82,30 Q78,22 84,16 M90,32 Q86,24 92,18" fill="none" stroke="#B8B0A6" stroke-width="2.5" stroke-linecap="round"/>`)
  };

  return icons;
})();
