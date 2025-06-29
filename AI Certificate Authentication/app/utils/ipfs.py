 
import requests

PINATA_API_KEY = "your-pinata-api-key"
PINATA_SECRET_API_KEY = "your-pinata-secret"

def upload_to_ipfs(file_bytes):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }
    files = {
        'file': ('certificate.pdf', file_bytes)
    }

    response = requests.post(url, headers=headers, files=files)

    if response.status_code == 200:
        return response.json()['IpfsHash']
    else:
        raise Exception(f"IPFS Upload Failed: {response.text}")
