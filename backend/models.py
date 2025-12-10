from typing import Optional, List
from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"

class AccountType(str, Enum):
    SAVINGS = "savings"
    CURRENT = "current"

class User(Document):
    email: Indexed(str, unique=True)
    full_name: str
    hashed_password: str
    pin_hash: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False
    
    class Settings:
        name = "users"

class Account(Document):
    user_id: str  # Store User ID as string for manual linking
    account_number: Indexed(str, unique=True)
    balance: float = 0.0
    account_type: str = AccountType.SAVINGS
    
    class Settings:
        name = "accounts"

class Transaction(Document):
    account_id: str
    amount: float
    transaction_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: str
    related_account_id: Optional[str] = None
    
    class Settings:
        name = "transactions"

class Card(Document):
    user_id: str
    card_number: Indexed(str, unique=True)
    expiry_date: str
    cvv: str
    card_type: str
    card_name: str = ""  # For credit card varieties (e.g., "Platinum Rewards")
    pin_hash: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "cards"

class FixedDeposit(Document):
    account_id: str
    amount: float
    interest_rate: float
    start_date: datetime = Field(default_factory=datetime.utcnow)
    maturity_date: datetime
    
    class Settings:
        name = "fixed_deposits"

class Loan(Document):
    user_id: str
    amount: float
    loan_type: str
    interest_rate: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "loans"

class Insurance(Document):
    user_id: str
    policy_name: str
    policy_type: str
    premium: float
    coverage: float
    
    class Settings:
        name = "insurances"

class Investment(Document):
    user_id: str
    investment_type: str
    symbol: str
    quantity: float
    purchase_price: float
    current_value: float
    
    class Settings:
        name = "investments"

class DeletionRequest(Document):
    user_id: str
    user_email: str
    user_name: str
    reason: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    
    class Settings:
        name = "deletion_requests"
