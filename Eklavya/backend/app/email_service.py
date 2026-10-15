import logging
import os
import smtplib
from email.message import EmailMessage

logger = logging.getLogger(__name__)

# Recipient for admin notifications
ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", os.getenv("ADMIN_EMAIL", ""))

# Azure Communication Services - Email
AZURE_COMMUNICATION_CONNECTION_STRING = os.getenv("AZURE_COMMUNICATION_CONNECTION_STRING", "")
# Must be a verified "From" address on your Email Communication Service domain,
# e.g. "DoNotReply@xxxxxxxx.azurecomm.net" or "no-reply@yourdomain.com"
AZURE_COMMUNICATION_SENDER = os.getenv("AZURE_COMMUNICATION_SENDER", "")

# SMTP fallback (optional)
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "noreply@eklavyaart.com")


def _send_via_azure(subject: str, body: str, to_address: str) -> bool:
    """Send an email using Azure Communication Services. Returns True on success."""
    if not AZURE_COMMUNICATION_CONNECTION_STRING or not AZURE_COMMUNICATION_SENDER:
        return False

    try:
        from azure.communication.email import EmailClient

        client = EmailClient.from_connection_string(AZURE_COMMUNICATION_CONNECTION_STRING)

        message = {
            "senderAddress": AZURE_COMMUNICATION_SENDER,
            "recipients": {"to": [{"address": to_address}]},
            "content": {
                "subject": subject,
                "plainText": body,
            },
        }

        poller = client.begin_send(message)
        result = poller.result()
        logger.info("Azure email sent to %s (status=%s, id=%s)", to_address, result.get("status"), result.get("id"))
        return True
    except Exception as e:
        logger.exception("Azure Communication Services email failed: %s", e)
        return False


def _send_via_smtp(subject: str, body: str, to_address: str) -> bool:
    """Send an email using SMTP. Returns True on success."""
    if not SMTP_HOST:
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_address
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        logger.info("SMTP email sent to %s", to_address)
        return True
    except Exception as e:
        logger.exception("SMTP email failed: %s", e)
        return False


def send_email(subject: str, body: str, to_address: str) -> bool:
    """Send an email using the best available transport.

    Priority: Azure Communication Services -> SMTP -> log-only (dev).
    Returns True if an email was actually dispatched.
    """
    if not to_address:
        logger.warning("No recipient provided; skipping email. Subject: %s", subject)
        return False

    if _send_via_azure(subject, body, to_address):
        return True

    if _send_via_smtp(subject, body, to_address):
        return True

    logger.info(
        "Email transport not configured (dev). Would send to %s | Subject: %s\n%s",
        to_address,
        subject,
        body,
    )
    return False


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
    send_email(subject, body, ADMIN_NOTIFICATION_EMAIL)


def notify_admin_new_contact(
    *,
    name: str,
    email: str,
    phone: str,
    message: str,
    contact_id: int,
) -> None:
    subject = f"[Eklavya] New contact message #{contact_id} from {name}"
    body = (
        f"A visitor submitted the contact form.\n\n"
        f"Contact ID: {contact_id}\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Phone: {phone or '—'}\n\n"
        f"Message:\n{message}"
    )
    send_email(subject, body, ADMIN_NOTIFICATION_EMAIL)


def send_contact_autoreply(*, name: str, email: str) -> None:
    """Send a confirmation auto-reply to the visitor who submitted the form."""
    subject = "We received your message — Eklavya Art School"
    body = (
        f"Hi {name},\n\n"
        f"Thank you for reaching out to Eklavya Art School! "
        f"We've received your message and will get back to you as soon as possible.\n\n"
        f"— Eklavya Art School"
    )
    send_email(subject, body, email)