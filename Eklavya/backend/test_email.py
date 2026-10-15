"""Quick smoke test for the email service.

Usage:
    python test_email.py you@example.com

Loads env vars from the project-root .env (if present), then attempts to
send a test email via Azure Communication Services (or SMTP fallback).
Exits 0 on success, 1 on failure.
"""
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
except ImportError:
    pass

from app.email_service import (  # noqa: E402
    AZURE_COMMUNICATION_CONNECTION_STRING,
    AZURE_COMMUNICATION_SENDER,
    SMTP_HOST,
    send_email,
)


def main() -> int:
    to_address = sys.argv[1] if len(sys.argv) > 1 else os.getenv("ADMIN_NOTIFICATION_EMAIL", "")
    if not to_address:
        print("Usage: python test_email.py you@example.com")
        return 1

    print("Email transport config:")
    print(f"  AZURE_COMMUNICATION_CONNECTION_STRING set: {'yes' if AZURE_COMMUNICATION_CONNECTION_STRING else 'NO'}")
    print(f"  AZURE_COMMUNICATION_SENDER: {AZURE_COMMUNICATION_SENDER or '(not set)'}")
    print(f"  SMTP_HOST: {SMTP_HOST or '(not set)'}")
    print(f"  Recipient: {to_address}")
    print("-" * 60)

    ok = send_email(
        subject="[Eklavya] Test email - email service is working",
        body=(
            "Hi,\n\n"
            "This is a test email from the Eklavya Art School backend.\n"
            "If you are reading this, the Email Communication Service is configured correctly.\n\n"
            "- Eklavya Art School"
        ),
        to_address=to_address,
    )

    if ok:
        print(f"SUCCESS: test email dispatched to {to_address}")
        return 0

    print("FAILED: no email transport was available or the send failed (check logs above).")
    return 1


if __name__ == "__main__":
    sys.exit(main())