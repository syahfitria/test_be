from fastapi import HTTPException, status, Depends

from sqlalchemy.exc import IntegrityError
import random, string
import datetime

import fastapi.security as _security
import jwt as _jwt

import sqlalchemy.orm as _orm
import database as _database, models.user as _model, schema.user as _schemas

oauth2schema = _security.OAuth2PasswordBearer(tokenUrl="/v1/api/login")

JWT_SECRET = "testefishery"

def password_generate(size=4, chars=string.ascii_uppercase + string.ascii_lowercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

async def get_user_by_phone(phone: str, db: _orm.Session):
    return db.query(_model.User).filter(_model.User.phone == phone).first()

async def create_user(user: _schemas.UserCreate, db:_orm.Session):
    presentDate = datetime.datetime.now()
    unix_timestamp = datetime.datetime.timestamp(presentDate)*1000
    print(unix_timestamp)
    user_obj = _model.User(
        name=user.name, phone=user.phone, password=password_generate(), role=user.role, timestamp=int(unix_timestamp)
    )
    try:
        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)
        return user_obj
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail=f"Phone Number exist")

async def authenticate_user(phone: str, password: str, db: _orm.Session):
  user = await get_user_by_phone(db=db, phone=phone)
  if not user:
      return False
  if not user.password == password:
      return False
  return user

async def create_token(user: _model.User):
    user_obj = _schemas.User.from_orm(user)
    user_data = dict(
        id=user_obj.id,
        name=user_obj.name,
        phone=user_obj.phone,
        role=user_obj.role,
        timestamp= user_obj.timestamp
    )
    token = _jwt.encode(user_data, JWT_SECRET)

    return dict(access_token=token, token_type="bearer")

async def get_current_user(
    db: _orm.Session = Depends(_database.get_db),
    token: str = Depends(oauth2schema),
):
    try:
        payload = _jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = db.query(_model.User).get(payload["phone"])
    except:
        raise HTTPException(
            status_code=401, detail="Invalid Email or Password"
        )

    return payload