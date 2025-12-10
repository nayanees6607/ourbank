# Email Service for Vitta Bank
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

# SMTP Configuration - set these in environment variables or use defaults
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "vittabankpvt@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "nmytjvfuuhxaczzd")
BANK_NAME = "Vitta Bank"

def send_email(to_email: str, subject: str, html_content: str):
    """Send email synchronously (use in background tasks)"""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Email credentials not configured. Skipping email.")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{BANK_NAME} <{SMTP_USER}>"
        msg["To"] = to_email
        
        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        
        print(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

def send_email_with_attachment(to_email: str, subject: str, html_content: str, attachment_data: bytes, attachment_filename: str):
    """Send email with PDF attachment"""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("Email credentials not configured. Skipping email.")
        return False
    
    try:
        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = f"{BANK_NAME} <{SMTP_USER}>"
        msg["To"] = to_email
        
        # HTML body
        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)
        
        # PDF attachment
        pdf_attachment = MIMEBase("application", "pdf")
        pdf_attachment.set_payload(attachment_data)
        encoders.encode_base64(pdf_attachment)
        pdf_attachment.add_header("Content-Disposition", f"attachment; filename={attachment_filename}")
        msg.attach(pdf_attachment)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        
        print(f"Email with attachment sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"Failed to send email with attachment: {e}")
        return False

def send_statement_email(to_email: str, user_name: str, start_date: str, end_date: str, pdf_data: bytes, filename: str):
    """Send account statement PDF via email"""
    content = f"""
    <h2 style="color: #00D4FF; margin-top: 0;">📄 Your Account Statement</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Please find attached your account statement for the period:</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Statement Period</td><td style="text-align: right;">{start_date} to {end_date}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Generated On</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">The statement is attached as a PDF file. Keep this document for your records.</p>
    """
    
    from utils.email_service import email_template
    return send_email_with_attachment(
        to_email, 
        "📄 Your Account Statement - Vitta Bank", 
        email_template(content),
        pdf_data,
        filename
    )

def get_email_header():
    return """
    <div style="background: linear-gradient(135deg, #0B1221 0%, #132F4C 100%); padding: 30px; text-align: center;">
        <h1 style="color: #00D4FF; margin: 0; font-family: 'Segoe UI', Arial, sans-serif;">🏦 Vitta Bank</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">Your trusted banking partner</p>
    </div>
    """

def get_email_footer():
    return f"""
    <div style="background: #0B1221; padding: 20px; text-align: center; border-top: 1px solid #1e3a5f;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
            This is an automated message from Vitta Bank. Please do not reply to this email.
        </p>
        <p style="color: #64748b; font-size: 11px; margin: 10px 0 0 0;">
            © {datetime.now().year} Vitta Bank Pvt. Ltd. All rights reserved.
        </p>
    </div>
    """

def email_template(content: str):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B1221;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #132F4C; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            {get_email_header()}
            <div style="padding: 30px; color: #e2e8f0;">
                {content}
            </div>
            {get_email_footer()}
        </div>
    </body>
    </html>
    """

# Transaction Emails
def send_transfer_email(to_email: str, user_name: str, amount: float, to_account: str, balance: float):
    """Send email for outgoing transfer"""
    content = f"""
    <h2 style="color: #f87171; margin-top: 0;">💸 Money Transferred</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>A transfer has been made from your account:</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Amount</td><td style="text-align: right; font-size: 18px; color: #f87171;">-₹{amount:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">To Account</td><td style="text-align: right;">{to_account}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Available Balance</td><td style="text-align: right; color: #00D4FF;">₹{balance:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Date & Time</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <p style="color: #94a3b8; font-size: 13px;">If you did not authorize this transaction, please contact us immediately.</p>
    """
    return send_email(to_email, "💸 Money Transfer Alert - Vitta Bank", email_template(content))

def send_credit_email(to_email: str, user_name: str, amount: float, from_account: str, balance: float):
    """Send email for incoming transfer"""
    content = f"""
    <h2 style="color: #4ade80; margin-top: 0;">💰 Money Received</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Your account has been credited:</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Amount</td><td style="text-align: right; font-size: 18px; color: #4ade80;">+₹{amount:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">From Account</td><td style="text-align: right;">{from_account}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">New Balance</td><td style="text-align: right; color: #00D4FF;">₹{balance:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Date & Time</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    """
    return send_email(to_email, "💰 Money Credited - Vitta Bank", email_template(content))

# Loan Emails
def send_loan_status_email(to_email: str, user_name: str, loan_type: str, amount: float, status: str):
    """Send email for loan status change"""
    is_approved = status.lower() == "active"
    emoji = "✅" if is_approved else "❌"
    color = "#4ade80" if is_approved else "#f87171"
    status_text = "Approved" if is_approved else "Rejected"
    
    content = f"""
    <h2 style="color: {color}; margin-top: 0;">{emoji} Loan Application {status_text}</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Your loan application has been <strong style="color: {color};">{status_text.lower()}</strong>.</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Loan Type</td><td style="text-align: right; text-transform: capitalize;">{loan_type.replace('_', ' ')}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Amount</td><td style="text-align: right; font-size: 18px;">₹{amount:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Status</td><td style="text-align: right; color: {color};">{status_text}</td></tr>
        </table>
    </div>
    {"<p>The loan amount will be credited to your account shortly.</p>" if is_approved else "<p>Please contact us for more information about this decision.</p>"}
    """
    return send_email(to_email, f"{emoji} Loan {status_text} - Vitta Bank", email_template(content))

# Card Emails
def send_card_status_email(to_email: str, user_name: str, card_type: str, card_name: str, status: str, last_four: str):
    """Send email for card status change"""
    status_config = {
        "active": ("✅", "#4ade80", "Approved"),
        "rejected": ("❌", "#f87171", "Rejected"),
        "revoked": ("🚫", "#f97316", "Revoked")
    }
    emoji, color, status_text = status_config.get(status.lower(), ("ℹ️", "#94a3b8", status.title()))
    
    content = f"""
    <h2 style="color: {color}; margin-top: 0;">{emoji} Card {status_text}</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Your card application has been updated:</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Card Type</td><td style="text-align: right; text-transform: capitalize;">{card_type}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Card Name</td><td style="text-align: right;">{card_name or 'Standard'}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Card Number</td><td style="text-align: right;">**** **** **** {last_four}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Status</td><td style="text-align: right; color: {color};">{status_text}</td></tr>
        </table>
    </div>
    """
    return send_email(to_email, f"{emoji} Card {status_text} - Vitta Bank", email_template(content))

# Security Emails
def send_password_change_email(to_email: str, user_name: str):
    """Send email for password change"""
    content = f"""
    <h2 style="color: #fbbf24; margin-top: 0;">🔐 Password Changed</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Your account password has been successfully changed.</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Action</td><td style="text-align: right;">Password Changed</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Date & Time</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <p style="color: #f87171; font-size: 13px;">⚠️ If you did not make this change, please contact us immediately and reset your password.</p>
    """
    return send_email(to_email, "🔐 Password Changed - Vitta Bank", email_template(content))

def send_pin_change_email(to_email: str, user_name: str):
    """Send email for PIN change"""
    content = f"""
    <h2 style="color: #fbbf24; margin-top: 0;">🔑 Transaction PIN Changed</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Your transaction PIN has been successfully changed.</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Action</td><td style="text-align: right;">PIN Changed</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Date & Time</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <p style="color: #f87171; font-size: 13px;">⚠️ If you did not make this change, please contact us immediately.</p>
    """
    return send_email(to_email, "🔑 PIN Changed - Vitta Bank", email_template(content))

def send_otp_email(to_email: str, user_name: str, otp: str, purpose: str = "Password Reset"):
    """Send OTP email for password reset or other verification"""
    content = f"""
    <h2 style="color: #00D4FF; margin-top: 0;">🔐 {purpose} OTP</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>You have requested to reset your password. Use the OTP below to verify your identity:</p>
    <div style="background: #0B1221; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Your One-Time Password</p>
        <h1 style="color: #00D4FF; font-size: 42px; letter-spacing: 10px; margin: 0; font-family: monospace;">{otp}</h1>
        <p style="color: #64748b; margin: 15px 0 0 0; font-size: 12px;">Valid for 10 minutes</p>
    </div>
    <div style="background: #0B1221; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Purpose</td><td style="text-align: right;">{purpose}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Date & Time</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <p style="color: #f87171; font-size: 13px;">⚠️ Do not share this OTP with anyone. Vitta Bank will never ask for your OTP.</p>
    <p style="color: #94a3b8; font-size: 13px;">If you did not request this, please ignore this email or contact support.</p>
    """
    return send_email(to_email, f"🔐 Your {purpose} OTP - Vitta Bank", email_template(content))

def send_welcome_email(to_email: str, user_name: str, account_number: str, opening_balance: float):
    """Send welcome email to new users"""
    content = f"""
    <h2 style="color: #4ade80; margin-top: 0;">🎉 Welcome to Vitta Bank!</h2>
    <p>Dear <strong>{user_name}</strong>,</p>
    <p>Thank you for choosing Vitta Bank. Your account has been created successfully!</p>
    <div style="background: #0B1221; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; color: #e2e8f0;">
            <tr><td style="padding: 8px 0; color: #94a3b8;">Account Number</td><td style="text-align: right; font-family: monospace; font-size: 16px;">****{account_number[-4:]}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Opening Balance</td><td style="text-align: right; font-size: 18px; color: #4ade80;">₹{opening_balance:,.2f}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Account Status</td><td style="text-align: right; color: #4ade80;">Active</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Registration Date</td><td style="text-align: right;">{datetime.now().strftime('%d %b %Y, %I:%M %p')}</td></tr>
        </table>
    </div>
    <h3 style="color: #00D4FF; margin-top: 30px;">🚀 Get Started</h3>
    <ul style="color: #e2e8f0; padding-left: 20px; line-height: 1.8;">
        <li>Set up your <strong>Transaction PIN</strong> for secure transfers</li>
        <li>Explore our <strong>Investment</strong> options to grow your wealth</li>
        <li>Apply for a <strong>Credit/Debit Card</strong> for easy transactions</li>
        <li>Check out our <strong>Loan</strong> offerings for your financial needs</li>
    </ul>
    <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">If you have any questions, our support team is available 24/7 to assist you.</p>
    """
    return send_email(to_email, "🎉 Welcome to Vitta Bank!", email_template(content))
