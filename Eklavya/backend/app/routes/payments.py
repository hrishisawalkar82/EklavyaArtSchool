from datetime import datetime
from decimal import Decimal
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import require_admin, require_parent
from app.db import get_db
from app.email_service import notify_admin_new_payment
from app.models.payment import PaymentSubmission
from app.models.payment_due import PaymentDue
from app.models.user import User

router = APIRouter()

PaymentMode = Literal["venmo", "bank_transfer", "check", "cash", "other"]
PaymentStatus = Literal["pending", "received"]


class PaymentCreate(BaseModel):
    student_name: str = Field(..., min_length=1, max_length=100)
    parent_name: str = Field(..., min_length=1, max_length=100)
    amount: Decimal = Field(..., gt=0)
    payment_mode: PaymentMode
    due_id: Optional[int] = None


class PaymentOut(BaseModel):
    id: int
    student_name: str
    parent_name: str
    amount: Decimal
    payment_mode: str
    status: str
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.post("/payments", response_model=PaymentOut)
def create_payment(
    body: PaymentCreate,
    user: User = Depends(require_parent),
    db: Session = Depends(get_db),
):
    payment = PaymentSubmission(
        parent_user_id=user.id,
        student_name=body.student_name.strip(),
        parent_name=body.parent_name.strip(),
        amount=body.amount,
        payment_mode=body.payment_mode,
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    notify_admin_new_payment(
        student_name=payment.student_name,
        parent_name=payment.parent_name,
        amount=f"{payment.amount:.2f}",
        payment_mode=payment.payment_mode,
        submission_id=payment.id,
    )

    # If this notification is for a specific assigned due, move it to
    # "waiting for confirmation" until an admin marks it received/paid.
    if body.due_id is not None:
        due = db.query(PaymentDue).filter(PaymentDue.id == body.due_id).first()
        if due and due.status == "due":
            due.status = "waiting_confirmation"
            due.updated_at = datetime.utcnow()
            db.commit()

    return payment


@router.get("/payments/mine", response_model=List[PaymentOut])
def list_my_payments(user: User = Depends(require_parent), db: Session = Depends(get_db)):
    return (
        db.query(PaymentSubmission)
        .filter(PaymentSubmission.parent_user_id == user.id)
        .order_by(PaymentSubmission.created_at.desc())
        .all()
    )


@router.get("/payments", response_model=List[PaymentOut])
def list_all_payments(
    status_filter: Optional[PaymentStatus] = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(PaymentSubmission).order_by(PaymentSubmission.created_at.desc())
    if status_filter:
        q = q.filter(PaymentSubmission.status == status_filter)
    return q.all()


@router.patch("/payments/{payment_id}/approve", response_model=PaymentOut)
def approve_payment(
    payment_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    payment = db.query(PaymentSubmission).filter(PaymentSubmission.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if payment.status == "received":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already marked as received")
    payment.status = "received"
    payment.approved_at = datetime.utcnow()
    payment.approved_by_id = admin.id
    payment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(payment)
    return payment
