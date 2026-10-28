
const romajiMap = {
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
    'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
    'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
    'ティ': 'ti', 'ディ': 'di', 'シェ': 'she', 'ジェ': 'je', 'チェ': 'che',
    'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
    'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
    'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
    'ー': '-',
    'ァ': 'xa', 'ィ': 'xi', 'ゥ': 'xu', 'ェ': 'xe', 'ォ': 'xo',
    'ッ': 'xtu', 'ャ': 'xya', 'ュ': 'xyu', 'ョ': 'xyo', 'ヮ': 'xwa'
};

// Simplified mapping for basic cases, more complex logic needed for 'ッ' (sokuon)
function toRomaji(kana) {
    let result = '';
    let i = 0;
    while (i < kana.length) {
        // Check for 2-character compounds first
        if (i + 1 < kana.length) {
            const twoChar = kana.substring(i, i + 2);
            if (romajiMap[twoChar]) {
                result += romajiMap[twoChar];
                i += 2;
                continue;
            }
        }

        const char = kana[i];

        // Sokuon handling (small tsu)
        if (char === 'ッ') {
            if (i + 1 < kana.length) {
                const nextChar = kana[i + 1];
                // Peek at next char's romaji to convert small tsu to double consonant
                let nextRomaji = '';
                if (i + 2 < kana.length && romajiMap[kana.substring(i + 1, i + 3)]) {
                    nextRomaji = romajiMap[kana.substring(i + 1, i + 3)];
                } else if (romajiMap[nextChar]) {
                    nextRomaji = romajiMap[nextChar];
                }

                if (nextRomaji && nextRomaji.length > 0) {
                    result += nextRomaji[0]; // Repeat first consonant
                    i++;
                    continue;
                }
            }
            // Fallback for dangling small tsu or invalid follow-up
            result += 'xtu';
            i++;
            continue;
        }

        if (romajiMap[char]) {
            result += romajiMap[char];
        } else {
            // Keep original if not map (e.g. latin chars or symbols)
            result += char;
        }
        i++;
    }
    return result;
}

// Convert Hiragana to Katakana first if needed (assuming input is Katakana based on file view)
// But wait, the file showed Katakana names.
// Also handle 'ー' (long vowel) - usually ignored or converted to hyphen in typing games?
// In many typing games, 'ー' is typed as '-' key.
