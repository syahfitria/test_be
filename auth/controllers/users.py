from fastapi import APIRouter, Depends, status, security, HTTPException

from sqlalchemy.orm import Session

from schema.user import UserCreate, User
import service.user as _services

from database import get_db

router= APIRouter(
    tags=['User']
)


@router.post("/v1/api/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate, db: Session = Depends(get_db)
):
    user = await _services.create_user(user, db)

    return user

@router.post("/v1/api/login", status_code=status.HTTP_200_OK)
async def sign_in(
    form_data: security.OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = await _services.authenticate_user(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(401, "Invalid Token")

    return await _services.create_token(user)

@router.get("/v1/api/profile", response_model=User)
async def get_user(user: User = Depends(_services.get_current_user)):
    return user