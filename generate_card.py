import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"
EMAIL = "SRkXEDAjSy@example.com"
PASSWORD = "password123"

def generate_card():
    # 1. Login
    login_data = json.dumps({"email": EMAIL, "password": PASSWORD}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            token = data["access_token"]
            print("Logged in successfully.")
    except Exception as e:
        print(f"Login failed: {e}")
        return

    # 2. Generate Card
    gen_req = urllib.request.Request(f"{BASE_URL}/cards/generate?card_type=debit", headers={"Authorization": f"Bearer {token}"}, method="POST")
    try:
        with urllib.request.urlopen(gen_req) as response:
            print("Card generated successfully.")
    except Exception as e:
        print(f"Card generation failed: {e}")

    # 3. List Cards
    list_req = urllib.request.Request(f"{BASE_URL}/cards/", headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(list_req) as response:
            cards = json.loads(response.read().decode())
            print(f"Found {len(cards)} cards.")
            for card in cards:
                print(f"- {card['card_type']} ending in {card['card_number'][-4:]}")
    except Exception as e:
        print(f"List cards failed: {e}")

if __name__ == "__main__":
    generate_card()
