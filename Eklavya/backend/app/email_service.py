import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", os.getenv("ADMIN_EMAIL", ""))
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "noreply@eklavyaart.com")


def notify_admin_new_payment(
    *,
    student_name: str,
    parent_name: str,
    amount: str,
    payment_mode: str,
    submission_id: int,
) -> None:
    subject = f"[Eklavya] New payment notification #{submission_id}"
    body = (
        f"A parent submitted a planned payment.\n\n"
        f"Submission ID: {submission_id}\n"
        f"Student: {student_name}\n"
        f"Parent: {parent_name}\n"
        f"Amount: ${amount}\n"
        f"Payment mode: {payment_mode}\n"
        f"Status: pending\n\n"
        f"Log in as admin to mark it as received."
    )

    if not ADMIN_NOTIFICATION_EMAIL:
        logger.warning("ADMIN_NOTIFICATION_EMAIL not set; skipping email. %s", body)
        return

    if not SMTP_HOST:
        logger.info(
            "SMTP not configured (dev). Would email %s: %s",
            ADMIN_NOTIFICATION_EMAIL,
            subject,
        )
        logger.info(body)
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = ADMIN_NOTIFICATION_EMAIL
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        logger.exception("Failed to send admin payment email: %s", e)
