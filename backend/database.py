import os
from dotenv import load_dotenv

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# -------------------------
# LOAD ENV VARIABLES
# -------------------------
load_dotenv()


# -------------------------
# DATABASE CONFIG
# -------------------------
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")


# -------------------------
# DATABASE URL
# -------------------------
DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:3306/{DB_NAME}"
)


# -------------------------
# SQLALCHEMY ENGINE
# -------------------------
engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=3600
)


# -------------------------
# SESSION FACTORY
# -------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# -------------------------
# BASE MODEL
# -------------------------
Base = declarative_base()


# -------------------------
# GET DB SESSION
# -------------------------
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()