from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse

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
    from utils.email_service import send_transfer_email, send_credit_email
    
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(transfer.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
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
    
    # Send email notifications
    # Get receiver user for their email
    receiver_user = await models.User.get(receiver_account.user_id)
    
    # Email to sender (debit notification)
    background_tasks.add_task(
        send_transfer_email,
        current_user.email,
        current_user.full_name,
        transfer.amount,
        receiver_account.account_number,
        sender_account.balance
    )
    
    # Email to receiver (credit notification)
    if receiver_user:
        background_tasks.add_task(
            send_credit_email,
            receiver_user.email,
            receiver_user.full_name,
            transfer.amount,
            sender_account.account_number,
            receiver_account.balance
        )

    return {"message": "Transfer successful"}

@router.post("/fixed-deposit")
async def create_fixed_deposit(fd: schemas.FixedDepositCreate, current_user: models.User = Depends(auth.get_current_user)):
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(fd.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
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

@router.get("/{account_id}/statement")
async def download_statement(
    account_id: str, 
    background_tasks: BackgroundTasks,
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None, 
    current_user: models.User = Depends(auth.get_current_user)
):
    from utils.pdf_generator import generate_statement_pdf
    
    # Verify account ownership
    account = await models.Account.find_one(
        models.Account.id == PydanticObjectId(account_id), 
        models.Account.user_id == str(current_user.id)
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Set default date range (last 30 days if not specified)
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Get transactions for the period
    transactions = await models.Transaction.find(
        models.Transaction.account_id == account_id,
        models.Transaction.timestamp >= start_date,
        models.Transaction.timestamp <= end_date
    ).sort("-timestamp").to_list()
    
    # Calculate opening and closing balance
    # For simplicity, we'll use current balance as closing
    closing_balance = account.balance
    
    # Calculate net change from transactions in period
    net_change = sum(txn.amount for txn in transactions)
    opening_balance = closing_balance - net_change
    
    # Convert transactions to dict format
    txn_list = [
        {
            'timestamp': txn.timestamp,
            'description': txn.description,
            'transaction_type': txn.transaction_type,
            'amount': txn.amount
        } 
        for txn in transactions
    ]
    
    # Generate PDF
    pdf_buffer = generate_statement_pdf(
        account_holder=current_user.full_name,
        account_number=account.account_number,
        opening_balance=opening_balance,
        closing_balance=closing_balance,
        transactions=txn_list,
        start_date=start_date.strftime('%d %b %Y'),
        end_date=end_date.strftime('%d %b %Y')
    )
    
    filename = f"Vitta_Bank_Statement_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.pdf"
    
    # Get PDF bytes for email
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.seek(0)  # Reset buffer for response
    
    # Send email with PDF in background
    from utils.email_service import send_statement_email
    background_tasks.add_task(
        send_statement_email,
        current_user.email,
        current_user.full_name,
        start_date.strftime('%d %b %Y'),
        end_date.strftime('%d %b %Y'),
        pdf_bytes,
        filename
    )
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
