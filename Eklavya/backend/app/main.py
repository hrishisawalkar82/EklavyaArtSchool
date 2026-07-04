from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.routes import images, contact

app = FastAPI(title="Eklavya Art School API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(images.router, prefix="/api")
app.include_router(contact.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Eklavya Art School API"}
