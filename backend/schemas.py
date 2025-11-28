from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    opening_balance: float
    account_type: str = "savings"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    
    class Config:
        orm_mode = True

class PinSetup(BaseModel):
    pin: str

class PinVerify(BaseModel):
    pin: str

class Account(BaseModel):
    id: int
    account_number: str
    balance: float
    account_type: str
    
    class Config:
        orm_mode = True

class Transaction(BaseModel):
    id: int
    amount: float
    transaction_type: str
    timestamp: datetime
    description: str
    
    class Config:
        orm_mode = True

class TransferRequest(BaseModel):
    from_account_id: int
    to_account_number: str
    amount: float

class FixedDepositCreate(BaseModel):
    account_id: int
    amount: float

class Card(BaseModel):
    id: int
    card_number: str
    expiry_date: str
    cvv: str
    card_type: str
    
    class Config:
        orm_mode = True

class Investment(BaseModel):
    id: int
    symbol: str
    quantity: float
    purchase_price: float
    current_value: float
    investment_type: str
    
    class Config:
        orm_mode = True

class InvestmentCreate(BaseModel):
    symbol: str
    amount: float
    investment_type: str

class Loan(BaseModel):
    id: int
    amount: float
    loan_type: str
    interest_rate: float
    status: str
    
    class Config:
        orm_mode = True

class LoanCreate(BaseModel):
    amount: float
    loan_type: str

class Insurance(BaseModel):
    id: int
    policy_name: str
    policy_type: str
    premium: float
    coverage: float
    
    class Config:
        orm_mode = True

class PolicyPurchase(BaseModel):
    policy_id: int

class PasswordChange(BaseModel):
    old_password: str
    new_password: str
