 
def validate_with_carbonmark(metadata):
    # Simulate Carbonmark verification
    if metadata["score"] >= 70:
        return True, "carbonmark-project-001"
    return False, None
