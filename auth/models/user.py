from sqlalchemy import Column, Integer, String
from sqlalchemy.sql import func

import database as _database

class User(_database.Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    timestamp = Column(String)