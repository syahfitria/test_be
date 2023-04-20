from pydantic import BaseModel, validator
from typing import Literal

class UserBase(BaseModel):
    phone: str
    name: str
    role:  Literal['admin', 'guest']

class UserCreate(UserBase):
    class Config:
        orm_mode = True

class User(UserBase):
    id: int
    timestamp: str

    class Config:
        orm_mode = True