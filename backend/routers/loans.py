from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import models, schemas, auth

router = APIRouter(
    prefix="/loans",
    tags=["loans"],
)

MOCK_LOAN_OFFERS = [
    {"type": "personal", "name": "Personal Loan", "rate": 10.5, "max_amount": 500000},
    {"type": "home", "name": "Home Loan", "rate": 8.5, "max_amount": 10000000},
    {"type": "car", "name": "Car Loan", "rate": 9.0, "max_amount": 2000000},
    {"type": "education", "name": "Education Loan", "rate": 7.5, "max_amount": 4000000},
    {"type": "gold", "name": "Gold Loan", "rate": 6.5, "max_amount": 1000000},
    {"type": "business", "name": "Business Loan", "rate": 12.0, "max_amount": 5000000},
    {"type": "travel", "name": "Travel Loan", "rate": 11.0, "max_amount": 300000},
    {"type": "wedding", "name": "Wedding Loan", "rate": 11.5, "max_amount": 1000000},
    {"type": "medical", "name": "Medical Loan", "rate": 9.5, "max_amount": 1500000},
    {"type": "debt_consolidation", "name": "Debt Consolidation", "rate": 10.0, "max_amount": 2000000},
]

@router.get("/offers")
def get_loan_offers():
    return MOCK_LOAN_OFFERS

@router.get("/", response_model=list[schemas.Loan])
async def get_loans(current_user: models.User = Depends(auth.get_current_user)):
    return await models.Loan.find(models.Loan.user_id == str(current_user.id)).to_list()

@router.post("/apply")
async def apply_loan(loan: schemas.LoanCreate, current_user: models.User = Depends(auth.get_current_user)):
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(loan.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
    # Find active loan offer to get interest rate
    offer = next((o for o in MOCK_LOAN_OFFERS if o["type"] == loan.loan_type), None)
    rate = offer["rate"] if offer else 10.5

    new_loan = models.Loan(
        user_id=str(current_user.id),
        amount=loan.amount,
        loan_type=loan.loan_type,
        interest_rate=rate,
        status="pending"
    )
    
    await new_loan.create()
    return {"message": "Loan application submitted for review", "loan": new_loan}

@router.get("/admin/all")
async def get_all_loans(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch all loans, sort by status (pending first) then date
    loans = await models.Loan.find_all().sort("-created_at").to_list()
    
    # Enrich with user details manually if needed, or just return basic list
    # For now, we returns loans. Frontend might need to fetch user names if not in loan doc.
    # Beanie doesn't auto-populate linked docs easily without Link type.
    # We will just return loans and let frontend handle it or fetch users.
    
    # Ideally we join with users. 
    # Let's fetch all users to map names since this is a small app
    users = await models.User.find_all().to_list()
    user_map = {str(u.id): u.full_name for u in users}
    
    loans_with_names = []
    for l in loans:
        l_dict = l.dict()
        l_dict['user_name'] = user_map.get(l.user_id, "Unknown User")
        l_dict['id'] = str(l.id) # Ensure ID is string
        loans_with_names.append(l_dict)
        
    return loans_with_names

@router.post("/{loan_id}/approve")
async def approve_loan(loan_id: str, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_loan_status_email
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    loan = await models.Loan.get(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    if loan.status != "pending":
        raise HTTPException(status_code=400, detail="Loan is not pending")
        
    loan.status = "active"
    await loan.save()
    
    # Credit the loan amount to account
    account = await models.Account.find_one(models.Account.user_id == loan.user_id)
    if account:
        account.balance += loan.amount
        await account.save()
        
        txn = models.Transaction(
            account_id=str(account.id),
            amount=loan.amount,
            transaction_type="deposit",
            description=f"Loan Disbursement: {loan.loan_type}"
        )
        await txn.create()
    
    # Send email notification
    loan_user = await models.User.get(loan.user_id)
    if loan_user:
        background_tasks.add_task(
            send_loan_status_email,
            loan_user.email,
            loan_user.full_name,
            loan.loan_type,
            loan.amount,
            "active"
        )
        
    return {"message": "Loan approved and disbursed"}

@router.post("/{loan_id}/reject")
async def reject_loan(loan_id: str, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_loan_status_email
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    loan = await models.Loan.get(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
        
    loan.status = "rejected"
    await loan.save()
    
    # Send email notification
    loan_user = await models.User.get(loan.user_id)
    if loan_user:
        background_tasks.add_task(
            send_loan_status_email,
            loan_user.email,
            loan_user.full_name,
            loan.loan_type,
            loan.amount,
            "rejected"
        )
    
    return {"message": "Loan rejected"}

