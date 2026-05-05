from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum


class UserRole(str, enum.Enum):
    hr = "HR"
    manager = "MANAGER"
    employee = "EMPLOYEE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)