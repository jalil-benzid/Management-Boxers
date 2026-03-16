from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from src.modules.admin.service import AdminService
from src.modules.coach.service import CoachService
from src.modules.boxer.service import BoxerService
from src.modules.auth.utils.logger import logger
from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        logger.info(f"[Service] Access token created for: {data.get('sub')} role: {data.get('role')}")
        return token

    @staticmethod
    async def login(email: str, password: str):
        try:
            admin = await AdminService.get_admin_by_email(email)
            if not admin:
                logger.warning(f"[Service] Login failed - email not found: {email}")
                return None

            if not AuthService.verify_password(password, admin.password):
                logger.warning(f"[Service] Login failed - wrong password: {email}")
                return None

            token = AuthService.create_access_token({
                "sub": str(admin.id),
                "role": "admin"        # <-- role ya jalil
            })
            return token

        except Exception as e:
            logger.error(f"[Service] Login error ({email}): {str(e)}")
            raise

    @staticmethod
    async def login_coach(email: str, password: str):
        try:
            coach = await CoachService.get_coach_by_email(email)
            if not coach:
                logger.warning(f"[Service] Coach login failed - email not found: {email}")
                return None

            if not AuthService.verify_password(password, coach.password):
                logger.warning(f"[Service] Coach login failed - wrong password: {email}")
                return None

            token = AuthService.create_access_token({
                "sub": str(coach.id),
                "role": "coach"
            })
            return token

        except Exception as e:
            logger.error(f"[Service] Coach login error ({email}): {str(e)}")
            raise

    @staticmethod
    async def login_boxer(email: str, password: str):
        try:
            boxer = await BoxerService.get_boxer_by_email(email)
            if not boxer:
                logger.warning(f"[Service] Boxer login failed - email not found: {email}")
                return None

            if not AuthService.verify_password(password, boxer.password):
                logger.warning(f"[Service] Boxer login failed - wrong password: {email}")
                return None

            token = AuthService.create_access_token({
                "sub": str(boxer.id),
                "role": "boxer"
            })
            return token

        except Exception as e:
            logger.error(f"[Service] Boxer login error ({email}): {str(e)}")
            raise