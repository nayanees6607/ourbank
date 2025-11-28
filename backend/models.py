from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"

class AccountType(str, enum.Enum):
    SAVINGS = "savings"
    CURRENT = "current"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    pin_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    accounts = relationship("Account", back_populates="owner")
    cards = relationship("Card", back_populates="owner")
    loans = relationship("Loan", back_populates="owner")
    insurances = relationship("Insurance", back_populates="owner")
    investments = relationship("Investment", back_populates="owner")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_number = Column(String, unique=True, index=True)
    balance = Column(Float, default=0.0)
    account_type = Column(String, default=AccountType.SAVINGS)
    
    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")
    fixed_deposits = relationship("FixedDeposit", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Float)
    transaction_type = Column(String) # deposit, withdrawal, transfer
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    description = Column(String)
    related_account_id = Column(Integer, nullable=True) # For transfers
    
    account = relationship("Account", back_populates="transactions")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_number = Column(String, unique=True)
    expiry_date = Column(String)
    cvv = Column(String)
    card_type = Column(String) # debit, credit
    pin_hash = Column(String)
    
    owner = relationship("User", back_populates="cards")

class FixedDeposit(Base):
    __tablename__ = "fixed_deposits"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    amount = Column(Float)
    interest_rate = Column(Float)
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    maturity_date = Column(DateTime(timezone=True))
    
    account = relationship("Account", back_populates="fixed_deposits")

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    loan_type = Column(String) # personal, gold, property
    interest_rate = Column(Float)
    status = Column(String, default="active")
    
    owner = relationship("User", back_populates="loans")

class Insurance(Base):
    __tablename__ = "insurances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_name = Column(String)
    policy_type = Column(String) # life, vehicle
    premium = Column(Float)
    coverage = Column(Float)
    
    owner = relationship("User", back_populates="insurances")

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    investment_type = Column(String) # stock, mutual_fund
    symbol = Column(String)
    quantity = Column(Float)
    purchase_price = Column(Float)
    current_value = Column(Float) # Should be updated via async task
    
    owner = relationship("User", back_populates="investments")
