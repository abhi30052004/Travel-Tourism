import secrets

from app.config import ADMIN_API_TOKEN
from app.config import ADMIN_PASSWORD
from app.config import ADMIN_USERNAME


class AuthService:

    @staticmethod
    def verify_credentials(username: str, password: str):

        username_ok = secrets.compare_digest(
            username,
            ADMIN_USERNAME
        )
        password_ok = secrets.compare_digest(
            password,
            ADMIN_PASSWORD
        )

        return username_ok and password_ok

    @staticmethod
    def verify_token(token: str):

        return secrets.compare_digest(
            token,
            ADMIN_API_TOKEN
        )
