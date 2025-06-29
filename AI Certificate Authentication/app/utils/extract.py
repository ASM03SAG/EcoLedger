 
import pytesseract
from pdf2image import convert_from_bytes
import re

def extract_metadata(file_bytes):
    images = convert_from_bytes(
    file_bytes,
    poppler_path=r"C:/Users/SHANVI/Poppler/poppler-24.08.0/Library/bin"
)

    text = ""
    for image in images:
        text += pytesseract.image_to_string(image)

    name_match = re.search(r"Name[:\-]?\s*(.*)", text)
    score_match = re.search(r"Score[:\-]?\s*(\d+)", text)
    issuer_match = re.search(r"Issuer[:\-]?\s*(.*)", text)

    return {
        "name": name_match.group(1).strip() if name_match else "Unknown",
        "score": int(score_match.group(1)) if score_match else 0,
        "issuer": issuer_match.group(1).strip() if issuer_match else "Unknown"
    }
