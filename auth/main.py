from typing import Union

import fastapi as _fastapi
from fastapi.middleware.cors import CORSMiddleware

from controllers import users

import database as _database

app = _fastapi.FastAPI()

_database.Base.metadata.create_all(bind=_database.engine)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

