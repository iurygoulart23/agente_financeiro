from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    liberado = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    meta_mensal = Column(Float, default=2000.0)  # Valor padrão 
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relação com o usuário
    user = relationship("User", back_populates="settings")

# Adicione também ao modelo User:
User.settings = relationship("UserSettings", back_populates="user", uselist=False)