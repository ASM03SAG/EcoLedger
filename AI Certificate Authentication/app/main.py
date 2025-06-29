from fastapi import FastAPI, UploadFile, File
from app.utils.extract import extract_metadata
from app.utils.ipfs import upload_to_ipfs
from app.utils.carbonmark import validate_with_carbonmark

app = FastAPI()

@app.post("/uploadCertificate")
async def upload_certificate(file: UploadFile = File(...)):
    contents = await file.read()

    # Step 1: Extract metadata
    metadata = extract_metadata(contents)

    # Step 2: Upload to IPFS
    cid = upload_to_ipfs(contents)

    # Step 3: Validate with Carbonmark logic
    is_valid, project_id = validate_with_carbonmark(metadata)

    if not is_valid:
        return {"status": "rejected", "reason": "Score below 70"}

    # Step 4: Prepare structured metaJson
    meta_json = {
        "project_id": project_id,
        "score": metadata["score"],
        "issuer": metadata["issuer"],
        "issued_to": metadata["name"],
        "cid": cid
    }

    return {"status": "authenticated", "meta": meta_json}

