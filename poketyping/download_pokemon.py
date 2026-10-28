import os
import json
import time
import urllib.request
import urllib.error

# Configuration
BASE_URL = "https://zukan.pokemon.co.jp"
API_ENDPOINT = "/zukan-api/api/search/"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "pokemon_images")
LIMIT = 50

def setup_directory():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")
    else:
        print(f"Directory already exists: {OUTPUT_DIR}")

def download_image(url, filename):
    try:
        # Check if URL is relative
        if not url.startswith("http"):
            url = BASE_URL + url
            
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Don't re-download if verified
        if os.path.exists(filepath):
            # print(f"Skipping {filename}, already exists.")
            return

        urllib.request.urlretrieve(url, filepath)
        # print(f"Downloaded: {filename}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")

def fetch_pokemon_data():
    page = 1
    total_downloaded = 0
    
    print("Starting download process...")
    
    while True:
        api_url = f"{BASE_URL}{API_ENDPOINT}?limit={LIMIT}&page={page}"
        print(f"Fetching page {page}...")
        
        try:
            req = urllib.request.Request(api_url)
            # Add User-Agent to avoid specific blocking, though UseBasicParsing worked
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
            
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            results = data.get('results', [])
            if not results:
                print("No more results found. Finishing.")
                break
                
            for pokemon in results:
                # Name file as No. + Name (sanitized) or just No.
                # data format has 'no' like "0001" and 'image_s'
                p_no = pokemon.get('no')
                # p_name = pokemon.get('name') 
                image_url = pokemon.get('image_s')
                
                if image_url and p_no:
                    # Some pokemon have sub-forms, so we might want to handle that. 
                    # But the 'no' seems unique enough for primary list? 
                    # Actually for variants, the 'no' might be same. 
                    # Let's use ID just in case, or combine no + sub?
                    # let's look at the structure: "id":1,"no":"0001","sub":0
                    p_sub = pokemon.get('sub', 0)
                    filename = f"{p_no}_{p_sub}.png"
                    
                    download_image(image_url, filename)
                    total_downloaded += 1
            
            # Be nice to the server
            time.sleep(1)
            page += 1
            
        except urllib.error.HTTPError as e:
            print(f"HTTP Error on page {page}: {e}")
            break
        except Exception as e:
            print(f"Error on page {page}: {e}")
            break

    print(f"Total Pokemon images processed: {total_downloaded}")

if __name__ == "__main__":
    setup_directory()
    fetch_pokemon_data()
