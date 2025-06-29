import requests

CARBONMARK_BASE_URL = "https://v17.api.carbonmark.com/api/projects/"

def verify_project_id(project_id):
    try:
        url = CARBONMARK_BASE_URL + project_id
        response = requests.get(url)

        if response.status_code == 200:
            return True, response.json()
        elif response.status_code == 404:
            return False, None
        else:
            return False, {"error": f"Unexpected status {response.status_code}"}
    except Exception as e:
        return False, {"error": str(e)}
