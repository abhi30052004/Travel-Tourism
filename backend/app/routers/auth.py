from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.security import HTTPBearer

from app.config import ADMIN_API_TOKEN
from app.config import ADMIN_USERNAME
from app.schemas import AdminLoginRequest
from app.schemas import AdminLoginResponse
from app.services.auth_service import AuthService


security = HTTPBearer(auto_error=False)

router = APIRouter(
    prefix="/auth",
    tags=["Admin Auth"]
)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
):

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required"
        )

    if not AuthService.verify_token(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token"
        )

    return {
        "username": ADMIN_USERNAME
    }


@router.post("/login", response_model=AdminLoginResponse)
def login(payload: AdminLoginRequest):

    if not AuthService.verify_credentials(
        payload.username,
        payload.password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin username or password"
        )

    return AdminLoginResponse(
        access_token=ADMIN_API_TOKEN,
        username=ADMIN_USERNAME
    )


@router.get("/me")
def me(admin=Depends(require_admin)):

    return admin
