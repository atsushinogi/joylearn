
const kanaMap = {
    // Vowels
    'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ',
    'la': 'ァ', 'li': 'ィ', 'lu': 'ゥ', 'le': 'ェ', 'lo': 'ォ',
    'xa': 'ァ', 'xi': 'ィ', 'xu': 'ゥ', 'xe': 'ェ', 'xo': 'ォ',

    // K
    'ka': 'カ', 'ki': 'キ', 'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',
    'ca': 'カ', 'cu': 'ク', 'co': 'コ',
    'kya': 'キャ', 'kyi': 'キィ', 'kyu': 'キュ', 'kye': 'キェ', 'kyo': 'キョ',
    'qya': 'クゃ', 'qyu': 'クゅ', 'qyo': 'クょ', // rare

    // S
    'sa': 'サ', 'si': 'シ', 'su': 'ス', 'se': 'セ', 'so': 'ソ',
    'sha': 'シャ', 'shi': 'シ', 'shu': 'シュ', 'she': 'シェ', 'sho': 'ショ',
    'sya': 'シャ', 'syi': 'シィ', 'syu': 'シュ', 'sye': 'シェ', 'syo': 'ショ',

    // T
    'ta': 'タ', 'ti': 'チ', 'tu': 'ツ', 'te': 'テ', 'to': 'ト',
    'chi': 'チ', 'tsu': 'ツ',
    'cha': 'チャ', 'che': 'チェ', 'cho': 'チョ', 'chu': 'チュ',
    'tya': 'チャ', 'tyi': 'チィ', 'tyu': 'チュ', 'tye': 'チェ', 'tyo': 'チョ',
    'tha': 'テャ', 'thi': 'ティ', 'thu': 'テュ', 'the': 'テェ', 'tho': 'テョ',
    'ltsu': 'ッ',

    // N
    'na': 'ナ', 'ni': 'ニ', 'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',
    'nya': 'ニャ', 'nyi': 'ニィ', 'nyu': 'ニュ', 'nye': 'ニェ', 'nyo': 'ニョ',
    'nn': 'ン',

    // H
    'ha': 'ハ', 'hi': 'ヒ', 'hu': 'フ', 'he': 'ヘ', 'ho': 'ホ',
    'fu': 'フ',
    'hya': 'ヒャ', 'hyi': 'ヒィ', 'hyu': 'ヒュ', 'hye': 'ヒェ', 'hyo': 'ヒョ',
    'fya': 'フャ', 'fyu': 'フュ', 'fyo': 'フョ',
    'fa': 'ファ', 'fi': 'フィ', 'fe': 'フェ', 'fo': 'フォ',

    // M
    'ma': 'マ', 'mi': 'ミ', 'mu': 'ム', 'me': 'メ', 'mo': 'モ',
    'mya': 'ミャ', 'myi': 'ミィ', 'myu': 'ミュ', 'mye': 'ミェ', 'myo': 'ミョ',

    // Y
    'ya': 'ヤ', 'yi': 'イ', 'yu': 'ユ', 'ye': 'イェ', 'yo': 'ヨ',

    // R
    'ra': 'ラ', 'ri': 'リ', 'ru': 'ル', 're': 'レ', 'ro': 'ロ',
    'rya': 'リャ', 'ryi': 'リィ', 'ryu': 'リュ', 'rye': 'リェ', 'ryo': 'リョ',

    // W
    'wa': 'ワ', 'wi': 'ウィ', 'wu': 'ウ', 'we': 'ウェ', 'wo': 'ヲ',

    // G
    'ga': 'ガ', 'gi': 'ギ', 'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',
    'gya': 'ギャ', 'gyi': 'ギィ', 'gyu': 'ギュ', 'gye': 'ギェ', 'gyo': 'ギョ',

    // Z
    'za': 'ザ', 'zi': 'ジ', 'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',
    'ja': 'ジャ', 'ji': 'ジ', 'ju': 'ジュ', 'je': 'ジェ', 'jo': 'ジョ',
    'jya': 'ジャ', 'jyi': 'ジィ', 'jyu': 'ジュ', 'jye': 'ジェ', 'jyo': 'ジョ',

    // D
    'da': 'ダ', 'di': 'ヂ', 'du': 'ヅ', 'de': 'デ', 'do': 'ド',
    'dha': 'デャ', 'dhi': 'ディ', 'dhu': 'デュ', 'dhe': 'デェ', 'dho': 'デョ',
    'dya': 'ヂャ', 'dyi': 'ヂィ', 'dyu': 'ヂュ', 'dye': 'ヂェ', 'dyo': 'ヂョ',

    // B
    'ba': 'バ', 'bi': 'ビ', 'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',
    'bya': 'ビャ', 'byi': 'ビィ', 'byu': 'ビュ', 'bye': 'ビェ', 'byo': 'ビョ',

    // P
    'pa': 'パ', 'pi': 'ピ', 'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',
    'pya': 'ピャ', 'pyi': 'ピィ', 'pyu': 'ピュ', 'pye': 'ピェ', 'pyo': 'ピョ',

    // V
    'va': 'ヴァ', 'vi': 'ヴィ', 'vu': 'ヴ', 've': 'ヴェ', 'vo': 'ヴォ',

    // Special Symbols
    '-': 'ー',
    '/': '・',
};

function toKana(input) {
    let result = '';
    let i = 0;
    const len = input.length;

    while (i < len) {
        // 1. Try to match longest possible key (length 3, 2, 1)

        // Try length 3
        if (i + 3 <= len) {
            const sub = input.substring(i, i + 3).toLowerCase();
            if (kanaMap[sub]) {
                result += kanaMap[sub];
                i += 3;
                continue;
            }
        }

        // Try length 2
        if (i + 2 <= len) {
            const sub = input.substring(i, i + 2).toLowerCase();
            if (kanaMap[sub]) {
                result += kanaMap[sub];
                i += 2;
                continue;
            }
        }

        // Try length 1
        if (i + 1 <= len) {
            const sub = input.substring(i, i + 1).toLowerCase();
            // Important: We only convert single chars if they are vowels or special.
            // Consonants like 'k' should NOT be converted to anything yet unless map has it.
            // Our map has 'a', 'i', etc. giving vowels. 
            // It does NOT have 'k' -> ?. 
            // So if kanaMap[sub] exists, we take it.
            if (kanaMap[sub]) {
                result += kanaMap[sub];
                i += 1;
                continue;
            }
        }

        const char = input[i].toLowerCase();

        // 2. Special 'n' handling
        // 'n' followed by consonant (not y) -> 'ン'
        if (char === 'n') {
            const next = (i + 1 < len) ? input[i + 1].toLowerCase() : null;
            if (next && !isVowel(next) && next !== 'y' && next !== 'n') {
                result += 'ン';
                i++; // Consumes 'n', leaves next char for next iteration
                continue;
            }
            // 'nn' is handled by map (length 2) above.
            // 'n' + vowel matched by map (length 2) above.
            // 'n' at end or partial -> keep as 'n'
            result += input[i];
            i++;
            continue;
        }

        // 3. Sokuon (Double Consonant) handling
        // e.g. 'kk' -> 'ッk'
        if (i + 1 < len) {
            const next = input[i + 1].toLowerCase();
            if (char === next && isConsonant(char)) {
                result += 'ッ';
                i++; // Consumes first char, leaves second for next iteration
                continue;
            }
        }

        // 4. Default: passthrough
        // If it's a kanji or katakana or symbol not in map, just keep it.
        result += input[i];
        i++;
    }

    return result;
}

function isVowel(char) {
    return ['a', 'i', 'u', 'e', 'o'].includes(char);
}

function isConsonant(char) {
    // Simple check, assumed non-vowel a-z
    return /[a-z]/.test(char) && !isVowel(char);
}
