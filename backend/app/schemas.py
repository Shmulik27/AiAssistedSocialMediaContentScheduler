from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class SocialAccountOut(BaseModel):
    platform: str
    created_at: datetime
    class Config:
        orm_mode = True

class PostCreate(BaseModel):
    social_account_id: int
    content: str
    scheduled_time: datetime

class PostOut(BaseModel):
    id: int
    social_account_id: int
    content: str
    scheduled_time: datetime
    status: str
    created_at: datetime
    class Config:
        orm_mode = True 