const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../pokemon_list.csv');
// Loaded with a plain <script> tag so the game also works when index.html is opened directly (file://)
const outPath = path.join(__dirname, 'pokemon-data.js');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split(/\r?\n/);

const pokemons = [];
// Skip header (line 0)
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (assuming no commas in values)
    // filename,no,name,sub_name
    const [filename, no, name, subName = ''] = line.split(',');

    if (!filename || !name) continue;

    // Format full name for display
    let displayName = name;
    if (subName) {
        displayName += ` (${subName})`;
    }

    pokemons.push({
        id: no,
        name: displayName,
        kana: name, // The part we actually type
        imagePath: `../pokemon_svg_color_256/${filename}`
    });
}

fs.writeFileSync(outPath, `window.POKEMON_DATA = ${JSON.stringify(pokemons, null, 2)};\n`, 'utf8');
console.log(`Generated ${pokemons.length} pokemon entries.`);
