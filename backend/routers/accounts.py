from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

import models, schemas, auth
from datetime import datetime, timedelta
from typing import List, Optional
from websocket_manager import manager
from beanie import PydanticObjectId

router = APIRouter(
    prefix="/accounts",
    tags=["accounts"],
)

@router.get("/", response_model=List[schemas.Account])
async def get_accounts(current_user: models.User = Depends(auth.get_current_user)):
    # Find accounts where user_id matches current_user.id
    accounts = await models.Account.find(models.Account.user_id == str(current_user.id)).to_list()
    return accounts

@router.get("/{account_id}/transactions", response_model=List[schemas.Transaction])
async def get_transactions(account_id: str, limit: int = 10, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, current_user: models.User = Depends(auth.get_current_user)):
    # Verify account ownership
    account = await models.Account.find_one(models.Account.id == PydanticObjectId(account_id), models.Account.user_id == str(current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    query = models.Transaction.find(models.Transaction.account_id == account_id)
    
    if start_date:
        query = query.find(models.Transaction.timestamp >= start_date)
    if end_date:
        query = query.find(models.Transaction.timestamp <= end_date)
        
    return await query.sort("-timestamp").limit(limit).to_list()

@router.post("/transfer")
async def transfer_money(transfer: schemas.TransferRequest, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    # Find sender account
    sender_account = await models.Account.find_one(models.Account.id == PydanticObjectId(transfer.from_account_id), models.Account.user_id == str(current_user.id))
    if not sender_account:
        raise HTTPException(status_code=404, detail="Sender account not found")
        
    if sender_account.balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Find receiver by account number
    receiver_account = await models.Account.find_one(models.Account.account_number == transfer.to_account_number)
    if not receiver_account:
        raise HTTPException(status_code=404, detail="Receiver account not found")
    
    if str(sender_account.id) == str(receiver_account.id):
        raise HTTPException(status_code=400, detail="Cannot transfer to same account")

    # Perform transfer (Sequential updates for simplicity)
    sender_account.balance -= transfer.amount
    receiver_account.balance += transfer.amount
    
    await sender_account.save()
    await receiver_account.save()
    
    # Create transactions
    sender_txn = models.Transaction(
        account_id=str(sender_account.id),
        amount=-transfer.amount,
        transaction_type="transfer",
        description=f"Transfer to {receiver_account.account_number}",
        related_account_id=str(receiver_account.id)
    )
    receiver_txn = models.Transaction(
        account_id=str(receiver_account.id),
        amount=transfer.amount,
        transaction_type="transfer",
        description=f"Transfer from {sender_account.account_number}",
        related_account_id=str(sender_account.id)
    )
    
    await sender_txn.create()
    await receiver_txn.create()
    
    # Broadcast update
    background_tasks.add_task(manager.broadcast, "update")

    return {"message": "Transfer successful"}

@router.post("/fixed-deposit")
async def create_fixed_deposit(fd: schemas.FixedDepositCreate, current_user: models.User = Depends(auth.get_current_user)):
    account = await models.Account.find_one(models.Account.id == PydanticObjectId(fd.account_id), models.Account.user_id == str(current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
        
    if fd.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum FD amount is 500")
        
    if account.balance < fd.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Deduct from account
    account.balance -= fd.amount
    await account.save()
    
    # Create FD
    maturity_date = datetime.utcnow() + timedelta(days=365)
    
    new_fd = models.FixedDeposit(
        account_id=str(account.id),
        amount=fd.amount,
        interest_rate=5.5,
        maturity_date=maturity_date
    )
    await new_fd.create()
    
    # Transaction record
    txn = models.Transaction(
        account_id=str(account.id),
        amount=-fd.amount,
        transaction_type="withdrawal",
        description="Fixed Deposit Creation"
    )
    await txn.create()
    
    return {"message": "Fixed Deposit created successfully"}
