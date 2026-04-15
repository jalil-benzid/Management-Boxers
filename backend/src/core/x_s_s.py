import re
from fastapi import HTTPException

HTML_PATTERN = re.compile(r"<[^>]*>")

def assert_plain_text(value: str, field_name: str = "field"):
    if HTML_PATTERN.search(value):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must not contain HTML or scripts"
        )
    return value

