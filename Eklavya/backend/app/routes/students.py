from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import require_admin, require_parent
from app.db import get_db
from app.models.payment_due import PaymentDue
from app.models.student import Student
from app.models.user import User

router = APIRouter()


# ---------- Schemas ----------

class StudentCreate(BaseModel):
    # Optional — if omitted, the backend auto-generates a unique code (e.g. STU-0001)
    student_code: Optional[str] = Field(None, min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    parent_user_id: int


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    parent_user_id: Optional[int] = None


class StudentOut(BaseModel):
    id: int
    student_code: str
    name: str
    parent_user_id: int
    parent_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentDueCreate(BaseModel):
    student_id: int
    title: str = Field(..., min_length=1, max_length=200)
    amount: Decimal = Field(..., gt=0)
    due_date: Optional[datetime] = None


class PaymentDueUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(due|waiting_confirmation|paid)$")


class PaymentDueOut(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    student_code: Optional[str] = None
    title: str
    amount: Decimal
    due_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ParentOption(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


# ---------- Helpers ----------

def _student_out(student: Student, db: Session) -> StudentOut:
    parent = db.query(User).filter(User.id == student.parent_user_id).first()
    return StudentOut(
        id=student.id,
        student_code=student.student_code,
        name=student.name,
        parent_user_id=student.parent_user_id,
        parent_name=parent.name if parent else None,
        created_at=student.created_at,
    )


def _due_out(due: PaymentDue, db: Session) -> PaymentDueOut:
    student = db.query(Student).filter(Student.id == due.student_id).first()
    return PaymentDueOut(
        id=due.id,
        student_id=due.student_id,
        student_name=student.name if student else None,
        student_code=student.student_code if student else None,
        title=due.title,
        amount=due.amount,
        due_date=due.due_date,
        status=due.status,
        created_at=due.created_at,
        updated_at=due.updated_at,
        paid_at=due.paid_at,
    )


# ---------- Parent options (admin) ----------

@router.get("/parents", response_model=List[ParentOption])
def list_parents(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return (
        db.query(User)
        .filter(User.role == "parent")
        .order_by(User.name.asc())
        .all()
    )


# ---------- Students (admin) ----------

STUDENT_CODE_PREFIX = "STU-"


def _generate_student_code(db: Session) -> str:
    """Auto-generate the next unique student code, e.g. STU-0001, STU-0002, ..."""
    existing_codes = (
        db.query(Student.student_code)
        .filter(Student.student_code.like(f"{STUDENT_CODE_PREFIX}%"))
        .order_by(Student.id.desc())
        .all()
    )
    max_num = 0
    for (code,) in existing_codes:
        suffix = code[len(STUDENT_CODE_PREFIX):]
        if suffix.isdigit():
            max_num = int(suffix)
            break  # ordered by newest first, so the first numeric suffix is the highest

    while True:
        candidate = f"{STUDENT_CODE_PREFIX}{max_num + 1:04d}"
        taken = db.query(Student).filter(Student.student_code == candidate).first()
        if not taken:
            return candidate
        max_num += 1


@router.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    body: StudentCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if body.student_code and body.student_code.strip():
        code = body.student_code.strip()
        existing = db.query(Student).filter(Student.student_code == code).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student ID already exists")
    else:
        code = _generate_student_code(db)

    parent = db.query(User).filter(User.id == body.parent_user_id, User.role == "parent").first()
    if not parent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent not found")

    student = Student(
        student_code=code,
        name=body.name.strip(),
        parent_user_id=parent.id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return _student_out(student, db)


@router.get("/students", response_model=List[StudentOut])
def list_students(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    students = db.query(Student).order_by(Student.created_at.desc()).all()
    return [_student_out(s, db) for s in students]


@router.patch("/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    body: StudentUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if body.parent_user_id is not None:
        parent = db.query(User).filter(User.id == body.parent_user_id, User.role == "parent").first()
        if not parent:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent not found")
        student.parent_user_id = parent.id
    if body.name is not None:
        student.name = body.name.strip()

    db.commit()
    db.refresh(student)
    return _student_out(student, db)


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    db.query(PaymentDue).filter(PaymentDue.student_id == student.id).delete()
    db.delete(student)
    db.commit()
    return None


# ---------- Payment dues (admin) ----------

@router.post("/payment-dues", response_model=PaymentDueOut, status_code=status.HTTP_201_CREATED)
def create_payment_due(
    body: PaymentDueCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == body.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student not found")

    due = PaymentDue(
        student_id=student.id,
        title=body.title.strip(),
        amount=body.amount,
        due_date=body.due_date,
        status="due",
        created_by_id=admin.id,
    )
    db.add(due)
    db.commit()
    db.refresh(due)
    return _due_out(due, db)


@router.get("/payment-dues", response_model=List[PaymentDueOut])
def list_payment_dues(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    dues = db.query(PaymentDue).order_by(PaymentDue.created_at.desc()).all()
    return [_due_out(d, db) for d in dues]


@router.patch("/payment-dues/{due_id}", response_model=PaymentDueOut)
def update_payment_due(
    due_id: int,
    body: PaymentDueUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    due = db.query(PaymentDue).filter(PaymentDue.id == due_id).first()
    if not due:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment due not found")

    if body.status is not None:
        due.status = body.status
        if body.status == "paid":
            due.paid_at = datetime.utcnow()
        else:
            due.paid_at = None
        due.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(due)
    return _due_out(due, db)


@router.delete("/payment-dues/{due_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment_due(
    due_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    due = db.query(PaymentDue).filter(PaymentDue.id == due_id).first()
    if not due:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment due not found")
    db.delete(due)
    db.commit()
    return None


# ---------- Parent view ----------

class ParentStudentDues(BaseModel):
    student: StudentOut
    dues: List[PaymentDueOut]
    total_due: Decimal
    total_paid: Decimal


@router.get("/students/mine", response_model=List[ParentStudentDues])
def list_my_students(user: User = Depends(require_parent), db: Session = Depends(get_db)):
    students = (
        db.query(Student)
        .filter(Student.parent_user_id == user.id)
        .order_by(Student.created_at.desc())
        .all()
    )
    result = []
    for student in students:
        dues = (
            db.query(PaymentDue)
            .filter(PaymentDue.student_id == student.id)
            .order_by(PaymentDue.created_at.desc())
            .all()
        )
        total_due = sum((d.amount for d in dues if d.status == "due"), Decimal("0"))
        total_paid = sum((d.amount for d in dues if d.status == "paid"), Decimal("0"))
        result.append(
            ParentStudentDues(
                student=_student_out(student, db),
                dues=[_due_out(d, db) for d in dues],
                total_due=total_due,
                total_paid=total_paid,
            )
        )
    return result