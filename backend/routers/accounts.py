from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc
import database, models, schemas, auth
from datetime import datetime, timedelta
from typing import List, Optional
from websocket_manager import manager

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"],
)

@router.get("/", response_model=List[schemas.Account]) # Create schema for Account
def get_accounts(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return current_user.accounts

@router.get("/{account_id}/transactions", response_model=List[schemas.Transaction]) # Create schema
def get_transactions(account_id: int, limit: int = 10, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id, models.Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    query = db.query(models.Transaction).filter(models.Transaction.account_id == account_id)
    
    if start_date:
        query = query.filter(models.Transaction.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Transaction.timestamp <= end_date)
        
    return query.order_by(desc(models.Transaction.timestamp)).limit(limit).all()

@router.post("/transfer")
def transfer_money(transfer: schemas.TransferRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)): # Create schema
    sender_account = db.query(models.Account).filter(models.Account.id == transfer.from_account_id, models.Account.user_id == current_user.id).first()
    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account not found")
        
    if sender_account.balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Find receiver by account number
    receiver_account = db.query(models.Account).filter(models.Account.account_number == transfer.to_account_number).first()
    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account not found")
    
    if sender_account.id == receiver_account.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to same account")

    # Perform transfer
    sender_account.balance -= transfer.amount
    receiver_account.balance += transfer.amount
    
    # Create transactions
    sender_txn = models.Transaction(
        account_id=sender_account.id,
        amount=-transfer.amount,
        transaction_type="transfer",
        description=f"Transfer to {receiver_account.account_number}",
        related_account_id=receiver_account.id
    )
    receiver_txn = models.Transaction(
        account_id=receiver_account.id,
        amount=transfer.amount,
        transaction_type="transfer",
        description=f"Transfer from {sender_account.account_number}",
        related_account_id=sender_account.id
    )
    
    db.add(sender_txn)
    db.add(receiver_txn)
    db.commit()
    
    # Broadcast update
    background_tasks.add_task(manager.broadcast, "update")

    return {"message": "Transfer successful"}

@router.post("/fixed-deposit")
def create_fixed_deposit(fd: schemas.FixedDepositCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)): # Create schema
    account = db.query(models.Account).filter(models.Account.id == fd.account_id, models.Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if fd.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum FD amount is 500")
        
    if account.balance < fd.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Deduct from account
    account.balance -= fd.amount
    
    # Create FD
    # Calculate maturity date (simplified)
    maturity_date = datetime.utcnow() + timedelta(days=365) # 1 year default
    
    new_fd = models.FixedDeposit(
        account_id=account.id,
        amount=fd.amount,
        interest_rate=5.5, # Default rate
        maturity_date=maturity_date
    )
    
    # Transaction record
    txn = models.Transaction(
        account_id=account.id,
        amount=-fd.amount,
        transaction_type="withdrawal",
        description="Fixed Deposit Creation"
    )
    
    db.add(new_fd)
    db.add(txn)
    db.commit()
    
    return {"message": "Fixed Deposit created successfully"}
