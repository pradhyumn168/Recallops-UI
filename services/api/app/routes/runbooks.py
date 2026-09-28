import json
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(prefix="/api/runbooks", tags=["Runbooks"])


@router.get("")
async def get_runbooks():
    """
    Returns available verified runbooks.
    """
    demo_file = Path(__file__).resolve().parent.parent.parent.parent.parent / "shared" / "demo_data.json"
    if demo_file.exists():
        with open(demo_file, "r", encoding="utf-8") as f:
            return json.load(f).get("runbooks", [])
    return []
