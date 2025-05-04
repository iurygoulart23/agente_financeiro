from sqlalchemy import Column, Integer, String, Boolean
from src.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    liberado = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)