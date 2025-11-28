from celery_app import celery_app
import time
import random

@celery_app.task
def send_email_notification(email: str, subject: str, message: str):
    # Simulate email sending
    time.sleep(2)
    print(f"Email sent to {email}: {subject} - {message}")
    return "Email sent"

@celery_app.task
def update_investment_values():
    # Simulate updating investment values
    # In real app, fetch from external API and update DB
    print("Updating investment values...")
    time.sleep(1)
    return "Investments updated"
