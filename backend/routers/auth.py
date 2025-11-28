from fastapi import APIRouter, Depends, HTTPException, status
import models, schemas, auth
from datetime import timedelta
import random

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate):
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
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_name": new_user.full_name}

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
    return {"access_token": access_token, "token_type": "bearer", "user_name": db_user.full_name}

@router.post("/set-pin")
async def set_pin(pin_data: schemas.PinSetup, current_user: models.User = Depends(auth.get_current_user)):
    if len(pin_data.pin) != 4 or not pin_data.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    
    current_user.pin_hash = auth.get_password_hash(pin_data.pin)
    await current_user.save()
    return {"message": "PIN set successfully"}

@router.post("/verify-pin")
async def verify_pin(pin_data: schemas.PinVerify, current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="PIN not set")
    if not auth.verify_password(pin_data.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    return {"message": "PIN verified"}

@router.post("/change-password")
async def change_password(password_data: schemas.PasswordChange, current_user: models.User = Depends(auth.get_current_user)):
    if not auth.verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    await current_user.save()
    return {"message": "Password changed successfully"}
