from datetime import datetime, timedelta, timezone
import os
from typing import Optional, List

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import User

# -------------------------
# LOAD ENV
# -------------------------
load_dotenv()

# -------------------------
# JWT CONFIG
# -------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here_change_this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# -------------------------
# PASSWORD HASHING
# -------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# TOKEN URL
# -------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# -------------------------
# HASH PASSWORD
# -------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# -------------------------
# VERIFY PASSWORD
# -------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------
# CREATE ACCESS TOKEN
# -------------------------
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


# -------------------------
# GET USER BY EMAIL
# -------------------------
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


# -------------------------
# AUTHENTICATE USER
# -------------------------
def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


# -------------------------
# GET CURRENT USER FROM TOKEN
# -------------------------
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email = payload.get("sub")
        role = payload.get("role")

        if email is None or role is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email)

    if user is None:
        raise credentials_exception

    return user


# -------------------------
# ROLE BASED ACCESS CONTROL
# -------------------------
def role_required(allowed_roles: List[str]):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: insufficient permissions"
            )
        return current_user

    return checker