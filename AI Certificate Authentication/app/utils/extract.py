import pytesseract
from pdf2image import convert_from_bytes
import re

POPPLER_PATH = r"C:\Users\SHANVI\Poppler\poppler-24.08.0\Library\bin"

def extract_metadata(file_bytes):
    images = convert_from_bytes(file_bytes, poppler_path=POPPLER_PATH)
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image)

    # Basic regex to extract Name, Score, Issuer
    name = re.search(r"Name:\s*(.*)", text)
    score = re.search(r"Score:\s*(\d+)", text)
    issuer = re.search(r"Issuer:\s*(.*)", text)

    return {
        "name": name.group(1).strip() if name else None,
        "score": int(score.group(1)) if score else None,
        "issuer": issuer.group(1).strip() if issuer else None,
        "raw_text": text
    }
