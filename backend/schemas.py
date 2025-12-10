from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional, List, Annotated, Any
from datetime import datetime
from beanie import PydanticObjectId

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
    is_admin: bool

class TokenData(BaseModel):
    email: Optional[str] = None

class User(UserBase):
    id: Optional[Any] = None
    is_active: bool
    is_admin: bool
    
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class PinSetup(BaseModel):
    pin: str

class PinVerify(BaseModel):
    pin: str

class PromoteUser(BaseModel):
    user_id: str
    admin_password: str

class Account(BaseModel):
    id: Optional[Any] = None
    account_number: str
    balance: float
    account_type: str
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class Transaction(BaseModel):
    id: Optional[Any] = None
    amount: float
    transaction_type: str
    timestamp: datetime
    description: str
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    from_account_id: str
    to_account_number: str
    amount: float
    pin: str  # 4-digit transaction PIN

class FixedDepositCreate(BaseModel):
    account_id: str
    amount: float
    pin: str  # 4-digit transaction PIN

class Card(BaseModel):
    id: Optional[Any] = None
    card_number: str
    expiry_date: str
    cvv: str
    card_type: str
    status: str
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class Investment(BaseModel):
    id: Optional[Any] = None
    symbol: str
    quantity: float
    purchase_price: float
    current_value: float
    investment_type: str
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class InvestmentCreate(BaseModel):
    symbol: str
    amount: float
    investment_type: str
    pin: str  # 4-digit transaction PIN

class InvestmentSell(BaseModel):
    symbol: str
    quantity: float
    pin: str  # 4-digit transaction PIN

class Loan(BaseModel):
    id: Optional[Any] = None
    amount: float
    loan_type: str
    interest_rate: float
    status: str
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    amount: float
    loan_type: str
    pin: str  # 4-digit transaction PIN

class Insurance(BaseModel):
    id: Optional[Any] = None
    policy_name: str
    policy_type: str
    premium: float
    coverage: float
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True

class PolicyPurchase(BaseModel):
    policy_id: int  # Keep as int for mock ID
    pin: str  # 4-digit transaction PIN

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyResetOTP(BaseModel):
    email: EmailStr
    otp: str

class ResetPassword(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class PasswordChangeWithOTP(BaseModel):
    otp: str
    new_password: str

class DeletionRequestCreate(BaseModel):
    reason: Optional[str] = None

class DeletionRequest(BaseModel):
    id: Optional[Any] = None
    user_id: str
    user_email: str
    user_name: str
    reason: Optional[str] = None
    status: str
    created_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, id: Any, _info):
        return str(id) if id else None

    class Config:
        from_attributes = True
