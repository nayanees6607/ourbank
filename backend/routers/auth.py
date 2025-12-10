from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
import models, schemas, auth
from typing import List
from datetime import timedelta
import random

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.get("/users", response_model=List[schemas.User])
async def get_users(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    users = await models.User.find_all().to_list()
    return users

@router.get("/me", response_model=schemas.User)
async def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/stats")
async def get_stats(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    total_users = await models.User.find_all().count()
    total_transactions = await models.Transaction.find_all().count()
    return {
        "total_users": total_users,
        "total_transactions": total_transactions
    }

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, background_tasks: BackgroundTasks):
    from utils.email_service import send_welcome_email
    
    # Check if user exists
    db_user = await models.User.find_one(models.User.email == user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.opening_balance < 500:
        raise HTTPException(status_code=400, detail="Opening balance must be at least 500")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, full_name=user.full_name, hashed_password=hashed_password)
    await new_user.create()

    # Create initial account
    account_number = str(random.randint(1000000000, 9999999999))
    new_account = models.Account(
        user_id=str(new_user.id), 
        account_number=account_number, 
        balance=user.opening_balance,
        account_type=user.account_type
    )
    await new_account.create()
    
    # Add initial transaction
    transaction = models.Transaction(
        account_id=str(new_account.id), 
        amount=user.opening_balance, 
        transaction_type="deposit", 
        description="Opening Balance"
    )
    await transaction.create()
    
    # Send welcome email
    background_tasks.add_task(send_welcome_email, new_user.email, new_user.full_name, account_number, user.opening_balance)
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_name": new_user.full_name, "is_admin": new_user.is_admin}

@router.post("/login", response_model=schemas.Token)
async def login(user: schemas.UserLogin):
    db_user = await models.User.find_one(models.User.email == user.email)
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_name": db_user.full_name, "is_admin": db_user.is_admin}

@router.post("/set-pin")
async def set_pin(pin_data: schemas.PinSetup, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_pin_change_email
    
    if len(pin_data.pin) != 4 or not pin_data.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    
    current_user.pin_hash = auth.get_password_hash(pin_data.pin)
    await current_user.save()
    
    # Send email notification
    background_tasks.add_task(send_pin_change_email, current_user.email, current_user.full_name)
    
    return {"message": "PIN set successfully"}

@router.post("/verify-pin")
async def verify_pin(pin_data: schemas.PinVerify, current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="PIN not set")
    if not auth.verify_password(pin_data.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    return {"message": "PIN verified"}

@router.post("/change-password")
async def change_password(password_data: schemas.PasswordChange, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_password_change_email
    
    if not auth.verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    await current_user.save()
    
    # Send email notification
    background_tasks.add_task(send_password_change_email, current_user.email, current_user.full_name)
    
    return {"message": "Password changed successfully"}

# In-memory store for password change OTPs (for logged-in users)
password_change_otps = {}

@router.post("/request-password-change-otp")
async def request_password_change_otp(background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_otp_email
    import time
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (10 minutes)
    password_change_otps[current_user.email] = {
        "otp": otp,
        "expires": time.time() + 600,  # 10 minutes
    }
    
    # Send OTP email
    background_tasks.add_task(send_otp_email, current_user.email, current_user.full_name, otp, "Password Change Verification")
    
    return {"message": "OTP sent to your registered email"}

@router.post("/change-password-with-otp")
async def change_password_with_otp(password_data: schemas.PasswordChangeWithOTP, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_password_change_email
    import time
    
    # Verify OTP
    stored = password_change_otps.get(current_user.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    if time.time() > stored["expires"]:
        del password_change_otps[current_user.email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    if stored["otp"] != password_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Update password
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    await current_user.save()
    
    # Clear OTP
    del password_change_otps[current_user.email]
    
    # Send confirmation email
    background_tasks.add_task(send_password_change_email, current_user.email, current_user.full_name)
    
    return {"message": "Password changed successfully"}

@router.post("/promote-user")
async def promote_user(promote_data: schemas.PromoteUser, current_user: models.User = Depends(auth.get_current_user)):
    # Verify current user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized - Admin only")
    
    # Verify admin's password for security
    if not auth.verify_password(promote_data.admin_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Find the user to promote
    target_user = await models.User.get(promote_data.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user.is_admin:
        raise HTTPException(status_code=400, detail="User is already an admin")
    
    # Promote the user
    target_user.is_admin = True
    await target_user.save()
    
    return {"message": f"{target_user.full_name} has been promoted to admin"}

@router.post("/demote-user")
async def demote_user(demote_data: schemas.PromoteUser, current_user: models.User = Depends(auth.get_current_user)):
    # Verify current user is admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized - Admin only")
    
    # Verify admin's password for security
    if not auth.verify_password(demote_data.admin_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Find the user to demote
    target_user = await models.User.get(demote_data.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not target_user.is_admin:
        raise HTTPException(status_code=400, detail="User is not an admin")
    
    # Prevent self-demotion
    if str(target_user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
    
    # Demote the user
    target_user.is_admin = False
    await target_user.save()
    
    return {"message": f"{target_user.full_name} has been demoted to regular user"}

# In-memory store for password reset OTPs (in production, use Redis)
password_reset_otps = {}

@router.post("/forgot-password")
async def forgot_password(request: schemas.ForgotPasswordRequest, background_tasks: BackgroundTasks):
    from utils.email_service import send_otp_email
    import time
    
    # Check if user exists
    user = await models.User.find_one(models.User.email == request.email)
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If this email exists, an OTP has been sent"}
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with expiry (10 minutes)
    password_reset_otps[request.email] = {
        "otp": otp,
        "expires": time.time() + 600,  # 10 minutes
        "verified": False
    }
    
    # Send OTP email
    background_tasks.add_task(send_otp_email, request.email, user.full_name, otp, "Password Reset")
    
    return {"message": "If this email exists, an OTP has been sent"}

@router.post("/verify-reset-otp")
async def verify_reset_otp(request: schemas.VerifyResetOTP):
    import time
    
    # Check if OTP exists
    stored = password_reset_otps.get(request.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP request found. Please request a new OTP.")
    
    # Check expiry
    if time.time() > stored["expires"]:
        del password_reset_otps[request.email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
    
    # Verify OTP
    if stored["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Mark as verified
    stored["verified"] = True
    
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
async def reset_password(request: schemas.ResetPassword, background_tasks: BackgroundTasks):
    from utils.email_service import send_password_change_email
    import time
    
    # Check if OTP exists and is verified
    stored = password_reset_otps.get(request.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP request found. Please start over.")
    
    if time.time() > stored["expires"]:
        del password_reset_otps[request.email]
        raise HTTPException(status_code=400, detail="Session expired. Please start over.")
    
    if not stored["verified"]:
        raise HTTPException(status_code=400, detail="OTP not verified. Please verify OTP first.")
    
    if stored["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # Find user and update password
    user = await models.User.find_one(models.User.email == request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    user.hashed_password = auth.get_password_hash(request.new_password)
    await user.save()
    
    # Clear OTP
    del password_reset_otps[request.email]
    
    # Send confirmation email
    background_tasks.add_task(send_password_change_email, user.email, user.full_name)
    
    return {"message": "Password reset successfully"}

# ============= ACCOUNT DELETION REQUESTS =============

@router.post("/deletion-request")
async def request_account_deletion(request: schemas.DeletionRequestCreate, current_user: models.User = Depends(auth.get_current_user)):
    # Check if user already has a pending request
    existing = await models.DeletionRequest.find_one(
        models.DeletionRequest.user_id == str(current_user.id),
        models.DeletionRequest.status == "pending"
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending deletion request")
    
    # Create deletion request
    deletion_request = models.DeletionRequest(
        user_id=str(current_user.id),
        user_email=current_user.email,
        user_name=current_user.full_name,
        reason=request.reason
    )
    await deletion_request.create()
    
    return {"message": "Account deletion request submitted. An admin will review it shortly."}

@router.get("/deletion-request/status")
async def get_deletion_request_status(current_user: models.User = Depends(auth.get_current_user)):
    # Get the user's latest deletion request
    request = await models.DeletionRequest.find_one(
        models.DeletionRequest.user_id == str(current_user.id)
    )
    if not request:
        return {"has_request": False}
    
    return {
        "has_request": True,
        "status": request.status,
        "created_at": request.created_at,
        "reason": request.reason
    }

@router.delete("/deletion-request")
async def cancel_deletion_request(current_user: models.User = Depends(auth.get_current_user)):
    # Find and delete the user's pending deletion request
    request = await models.DeletionRequest.find_one(
        models.DeletionRequest.user_id == str(current_user.id),
        models.DeletionRequest.status == "pending"
    )
    if not request:
        raise HTTPException(status_code=404, detail="No pending deletion request found")
    
    await request.delete()
    return {"message": "Deletion request cancelled"}

@router.get("/deletion-requests", response_model=list[schemas.DeletionRequest])
async def get_all_deletion_requests(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized - Admin only")
    
    requests = await models.DeletionRequest.find_all().to_list()
    return requests

@router.post("/deletion-requests/{request_id}/approve")
async def approve_deletion_request(request_id: str, current_user: models.User = Depends(auth.get_current_user)):
    from datetime import datetime
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized - Admin only")
    
    deletion_request = await models.DeletionRequest.get(request_id)
    if not deletion_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if deletion_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    user_name = deletion_request.user_name
    user_id = deletion_request.user_id
    
    # Get the user to delete
    user_to_delete = await models.User.get(user_id)
    if user_to_delete:
        # Get all account IDs for this user to delete transactions
        accounts = await models.Account.find(models.Account.user_id == user_id).to_list()
        account_ids = [str(acc.id) for acc in accounts]
        
        # Delete all transactions for user's accounts
        for acc_id in account_ids:
            await models.Transaction.find(models.Transaction.account_id == acc_id).delete()
        
        # Delete all user-related data
        await models.Account.find(models.Account.user_id == user_id).delete()
        await models.Card.find(models.Card.user_id == user_id).delete()
        await models.Loan.find(models.Loan.user_id == user_id).delete()
        await models.Investment.find(models.Investment.user_id == user_id).delete()
        await models.Insurance.find(models.Insurance.user_id == user_id).delete()
        await models.FixedDeposit.find(models.FixedDeposit.account_id.in_(account_ids)).delete() if account_ids else None
        
        # Delete the user
        await user_to_delete.delete()
    
    # Delete the deletion request itself
    await deletion_request.delete()
    
    return {"message": f"Account for {user_name} and all related data has been permanently deleted"}

@router.post("/deletion-requests/{request_id}/reject")
async def reject_deletion_request(request_id: str, current_user: models.User = Depends(auth.get_current_user)):
    from datetime import datetime
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized - Admin only")
    
    deletion_request = await models.DeletionRequest.get(request_id)
    if not deletion_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if deletion_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")
    
    deletion_request.status = "rejected"
    deletion_request.processed_at = datetime.utcnow()
    await deletion_request.save()
    
    return {"message": "Deletion request rejected"}
