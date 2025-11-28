from fastapi import APIRouter, Depends, HTTPException
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
    # Simplified approval process
    new_loan = models.Loan(
        user_id=str(current_user.id),
        amount=loan.amount,
        loan_type=loan.loan_type,
        interest_rate=10.5, # Default rate
        status="active"
    )
    
    # Credit the loan amount to account
    account = await models.Account.find_one(models.Account.user_id == str(current_user.id))
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
    
    await new_loan.create()
    
    return {"message": "Loan approved and disbursed", "loan": new_loan}
