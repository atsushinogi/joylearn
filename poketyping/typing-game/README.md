# Pokemon Typing Game

A web-based typing game to practice Japanese (Hiragana/Katakana/Romaji) with Pokemon!

## 💻 How to Run

No server and no install needed: just **double-click `index.html`** (opens in Chrome / Edge / any browser).
It runs on Windows, Mac and Chromebooks.

- Keep the folder layout as is: `typing-game/` and `pokemon_svg/` must sit side by side, because the game loads `../pokemon_svg/`.
- To copy the game to another PC, copy the whole `poketyping` folder (at least `typing-game/` and `pokemon_svg/`).
- To put it online (GitHub Pages etc.), upload both folders the same way.
- The game uses traced SVG images. Original 180px WebP files remain in `pokemon_images/` as backups. Each SVG is no larger than its WebP source. To add images: download PNGs, run `python ../optimize_images.py`, then `python ../vectorize_images.py`, and regenerate the data. The conversion scripts require Pillow; vectorization also requires NumPy and OpenCV.
- Progress is saved per browser. When opened as a file, all local HTML files in that browser share the same storage.

### 🔄 Updating the Pokemon list
After editing `../pokemon_list.csv`, regenerate `pokemon-data.js`:
- `node prepare_data.js` or `python prepare_data.py`

## 🎮 Features
- **All 1000+ Pokemon** (Images & Names)
- **Flexible Input**: Supports Hiragana, Katakana, and Romaji.
- **Smart Validation**: Ignores symbols like `♂`, `♀`, and form names in parentheses (e.g., just "Raichu" is okay for Alolan Raichu).
- **Progress Save**: Your caught collection is saved automatically in the browser (each form, e.g. Mega or Alolan, is counted separately).

## ❓ FAQ

**Q: Can I run this in Google AI Studio?**
A: **No.** Google AI Studio is for building AI models, not for hosting games. Please use **GitHub Pages** (free) or run it locally on your computer.

**Q: Can I run this on a Chromebook?**
A: **Yes!** Copy the folder (with `pokemon_svg`) to the Chromebook and open `index.html`, or host it on the web (like GitHub Pages).
