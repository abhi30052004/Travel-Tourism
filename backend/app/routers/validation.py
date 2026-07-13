from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import BrandValidationRequest
from app.services.brand_validation_service import BrandValidationService


router = APIRouter(
    prefix="/brand-validation",
    tags=["Brand Validation Agent"]
)


@router.post("/run")
def run_brand_validation(
    payload: BrandValidationRequest = BrandValidationRequest(),
    db: Session = Depends(get_db)
):

    result = BrandValidationService.run(
        db,
        content_ids=payload.content_ids
    )

    return {
        "message": "Brand validation completed",
        "result": result,
    }
