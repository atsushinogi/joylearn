
import csv
import json
import os

csv_path = os.path.join(os.path.dirname(__file__), '../pokemon_list.csv')
# Loaded with a plain <script> tag so the game also works when index.html is opened directly (file://)
out_path = os.path.join(os.path.dirname(__file__), 'pokemon-data.js')

pokemons = []

# Basic Romaji mapping for Python (simplified, frontend will handle the heavy lifting or we can just supply Kana)
# For the JSON, we'll leave 'romaji' empty or null, and let the frontend calculate it using romaji.js at runtime.
# This avoids maintaining two identical mapping tables.

try:
    with open(csv_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            filename = row.get('filename')
            no = row.get('no')
            name = row.get('name')
            sub_name = row.get('sub_name', '')

            if not filename or not name:
                continue

            display_name = name
            if sub_name:
                display_name += f" ({sub_name})"

            pokemons.append({
                "id": no,
                "name": display_name,
                "kana": name,
                "imagePath": f"../pokemon_svg/{filename}"
            })
            
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("window.POKEMON_DATA = ")
        json.dump(pokemons, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"Generated {len(pokemons)} pokemon entries.")

except Exception as e:
    print(f"Error: {e}")
