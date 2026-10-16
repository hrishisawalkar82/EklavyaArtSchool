from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db import get_db
from app.email_service import send_email_async, ADMIN_NOTIFICATION_EMAIL
from app.models.contact import Contact

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: str = None
    message: str

@router.post("/contact")
def submit_contact(form: ContactForm, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    contact = Contact(
        name=form.name,
        email=form.email,
        phone=form.phone,
        message=form.message
    )
    db.add(contact)
    db.commit()

    # Send emails in background so they never block the request
    background_tasks.add_task(
        send_email_async,
        subject=f"[Eklavya] New contact message #{contact.id} from {form.name}",
        body=(
            f"A visitor submitted the contact form.\n\n"
            f"Contact ID: {contact.id}\n"
            f"Name: {form.name}\n"
            f"Email: {form.email}\n"
            f"Phone: {form.phone or '—'}\n\n"
            f"Message:\n{form.message}"
        ),
        to_address=ADMIN_NOTIFICATION_EMAIL,
    )
    background_tasks.add_task(
        send_email_async,
        subject="We received your message — Eklavya Art School",
        body=(
            f"Hi {form.name},\n\n"
            f"Thank you for reaching out to Eklavya Art School! "
            f"We've received your message and will get back to you as soon as possible.\n\n"
            f"— Eklavya Art School"
        ),
        to_address=form.email,
    )

    return {"message": "Contact form submitted successfully"}
