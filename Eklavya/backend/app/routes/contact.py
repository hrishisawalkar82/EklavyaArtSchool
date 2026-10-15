from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db import get_db
from app.email_service import notify_admin_new_contact, send_contact_autoreply
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

    # Fire-and-forget: never let email failures break the form submission.
    notify_admin_new_contact(
        name=form.name,
        email=form.email,
        phone=form.phone or "",
        message=form.message,
        contact_id=contact.id,
    )
    send_contact_autoreply(name=form.name, email=form.email)

    return {"message": "Contact form submitted successfully"}
