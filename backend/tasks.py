from celery_app import celery_app
import time

@celery_app.task(name="tasks.send_welcome_email")
def send_welcome_email(email: str):
    # Simulate email sending
    print(f"Sending welcome email to {email}...")
    time.sleep(2)
    print(f"Welcome email sent to {email}!")
    return f"Welcome email sent to {email}"

@celery_app.task(name="tasks.generate_report")
def generate_report(user_id: str):
    # Simulate heavy processing
    print(f"Generating report for user {user_id}...")
    time.sleep(5)
    print(f"Report generated for user {user_id}!")
    return f"Report generated for user {user_id}"
