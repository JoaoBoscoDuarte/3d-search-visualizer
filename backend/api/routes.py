from fastapi import APIRouter, HTTPException

from backend.api.schemas import CompareRequest, RunRequest
from backend.services.runner import compare_all, run_algorithm

router = APIRouter(prefix="/api", tags=["search"])

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/run")
def run(req: RunRequest):
    try:
        return run_algorithm(req.model_dump(), req.algorithm, req.dls_limit)
    
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

@router.post("/compare")
def compare(req: CompareRequest):
    return {
        "results": compare_all(
            req.model_dump(),
            req.dls_limit,
            req.selected_algorithms,
            req.limits,
        )
    }
