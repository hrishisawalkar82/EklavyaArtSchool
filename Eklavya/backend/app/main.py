import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, SessionLocal, engine
from app.routes import auth, contact, images, payments, students
from app.seed import seed_default_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_default_users(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: DB initialization failed at startup: {e}")
    yield


# Make app/email-service logging visible in `docker logs` (INFO and above).
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(title="Eklavya Art School API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(students.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Eklavya Art School API"}
