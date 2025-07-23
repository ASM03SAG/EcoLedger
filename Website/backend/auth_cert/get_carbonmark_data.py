# get_carbonmark_data.py
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

CARBONMARK_API_KEY = os.getenv("CARBONMARK_API_KEY")
CARBONMARK_API_BASE_URL = os.getenv("CARBONMARK_API_BASE_URL")

if not CARBONMARK_API_KEY or not CARBONMARK_API_BASE_URL:
    print("Error: Carbonmark API keys or base URL not set in .env")
    exit()

def fetch_carbonmark_data(endpoint):
    url = f"{CARBONMARK_API_BASE_URL}{endpoint}"
    headers = {
        "Authorization": f"Bearer {CARBONMARK_API_KEY}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from {endpoint}: {e}")
        return None

if __name__ == "__main__":
    print("--- Fetching Carbonmark Sandbox Projects ---")
    projects_data = fetch_carbonmark_data("/projects")
    if projects_data:
        print(json.dumps(projects_data, indent=2))
        # Optional: Save to a file
        with open("sandbox_projects.json", "w") as f:
            json.dump(projects_data, f, indent=2)
        print("\nProjects saved to sandbox_projects2.json")

    print("\n--- Fetching Carbonmark Sandbox Products ---")
    products_data = fetch_carbonmark_data("/products")
    if products_data:
        print(json.dumps(products_data, indent=2))
        # Optional: Save to a file
        with open("sandbox_products2.json", "w") as f:
            json.dump(products_data, f, indent=2)
        print("\nProducts saved to sandbox_products2.json")