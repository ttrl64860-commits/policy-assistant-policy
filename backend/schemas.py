from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# -------------------------
# USER REGISTER SCHEMA
# -------------------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)
    role: str


# -------------------------
# USER LOGIN SCHEMA
# -------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------------------------
# TOKEN RESPONSE
# -------------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str


# -------------------------
# USER RESPONSE
# -------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# -------------------------
# PROFILE RESPONSE
# -------------------------
class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# -------------------------
# UPDATE USER SCHEMA
# -------------------------
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None


# =========================
# 🔥 ADD THIS (IMPORTANT)
# =========================
class QuestionRequest(BaseModel):
    question: str