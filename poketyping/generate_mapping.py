import os
import json
import csv
import time
import urllib.request
import urllib.error

# Configuration
BASE_URL = "https://zukan.pokemon.co.jp"
API_ENDPOINT = "/zukan-api/api/search/"
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "pokemon_list.csv")
LIMIT = 50

def generate_csv():
    page = 1
    all_pokemon = []
    
    print("Starting CSV generation process...")
    
    while True:
        api_url = f"{BASE_URL}{API_ENDPOINT}?limit={LIMIT}&page={page}"
        print(f"Fetching page {page}...")
        
        try:
            req = urllib.request.Request(api_url)
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            results = data.get('results', [])
            if not results:
                print("No more results found. Finishing.")
                break
                
            for pokemon in results:
                p_no = pokemon.get('no')
                p_name = pokemon.get('name')
                p_sub_name = pokemon.get('sub_name', '')
                p_sub = pokemon.get('sub', 0)
                
                if p_no:
                    # Construct filename to match download_pokemon.py logic
                    filename = f"{p_no}_{p_sub}.svg"
                    
                    all_pokemon.append({
                        'filename': filename,
                        'no': p_no,
                        'name': p_name,
                        'sub_name': p_sub_name
                    })
            
            # Be nice to the server
            time.sleep(1)
            page += 1
            
        except urllib.error.HTTPError as e:
            print(f"HTTP Error on page {page}: {e}")
            break
        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

    # Write to CSV
    try:
        with open(OUTPUT_CSV, mode='w', encoding='utf-8', newline='') as csv_file:
            fieldnames = ['filename', 'no', 'name', 'sub_name']
            writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
            
            writer.writeheader()
            for p in all_pokemon:
                writer.writerow(p)
                
        print(f"Successfully wrote {len(all_pokemon)} entries to {OUTPUT_CSV}")
    except Exception as e:
        print(f"Failed to write CSV: {e}")

if __name__ == "__main__":
    generate_csv()
