from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db import get_db
from app.models.contact import Contact

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str = None
    message: str

@router.post("/contact")
def submit_contact(form: ContactForm, db: Session = Depends(get_db)):
    contact = Contact(
        name=form.name,
        email=form.email,
        phone=form.phone,
        message=form.message
    )
    db.add(contact)
    db.commit()
    return {"message": "Contact form submitted successfully"}
