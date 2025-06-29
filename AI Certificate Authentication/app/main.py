from fastapi import FastAPI, UploadFile, File
from app.utils.extract import extract_metadata
from app.utils.ipfs import upload_to_ipfs
from app.utils.carbonmark import verify_project_id

app = FastAPI()

@app.post("/uploadCertificate")
async def upload_certificate(file: UploadFile = File(...)):
    contents = await file.read()

    # Step 1: Extract metadata
    metadata = extract_metadata(contents)

    # Step 2: Check score
    if metadata["score"] < 70:
        return {"status": "rejected", "reason": "Score below 70"}

    # Step 3: Validate project_id with Carbonmark API
    project_id = metadata["project_id"]
    is_valid_project, project_data = verify_project_id(project_id)

    if not is_valid_project:
        return {"status": "rejected", "reason": "Invalid Carbonmark project_id"}

    # Step 4: Upload PDF to IPFS
    cid = upload_to_ipfs(contents)

    # Step 5: Create metaJson
    meta_json = {
        "project_id": project_id,
        "project_name": project_data.get("name", "N/A"),
        "score": metadata["score"],
        "issuer": metadata["issuer"],
        "issued_to": metadata["name"],
        "cid": cid
    }

    return {"status": "authenticated", "meta": meta_json}
