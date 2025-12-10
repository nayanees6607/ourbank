from fastapi import APIRouter, Depends, HTTPException
import models, schemas, auth

router = APIRouter(
    prefix="/insurance",
    tags=["insurance"],
)

MOCK_POLICIES = [
    {"id": 1, "name": "Life Secure Plus", "type": "life", "premium": 1000, "coverage": 1000000},
    {"id": 2, "name": "Vehicle Protect", "type": "vehicle", "premium": 500, "coverage": 50000},
    {"id": 3, "name": "Home Shield", "type": "home", "premium": 2000, "coverage": 5000000},
    {"id": 4, "name": "Health Guard", "type": "health", "premium": 1500, "coverage": 500000},
    {"id": 5, "name": "Travel Safe", "type": "travel", "premium": 200, "coverage": 100000},
    {"id": 6, "name": "Critical Illness Cover", "type": "health", "premium": 3000, "coverage": 2000000},
    {"id": 7, "name": "Term Life Max", "type": "life", "premium": 5000, "coverage": 10000000},
    {"id": 8, "name": "Bike Rider Pro", "type": "vehicle", "premium": 150, "coverage": 10000},
    {"id": 9, "name": "Gadget Protect", "type": "gadget", "premium": 100, "coverage": 5000},
    {"id": 10, "name": "Retirement Plan A", "type": "life", "premium": 10000, "coverage": 5000000},
]

@router.get("/policies")
def get_available_policies():
    return MOCK_POLICIES

@router.get("/", response_model=list[schemas.Insurance])
async def get_my_policies(current_user: models.User = Depends(auth.get_current_user)):
    return await models.Insurance.find(models.Insurance.user_id == str(current_user.id)).to_list()

@router.post("/buy")
async def buy_policy(purchase: schemas.PolicyPurchase, current_user: models.User = Depends(auth.get_current_user)):
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(purchase.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
    policy_id = purchase.policy_id
    policy = next((p for p in MOCK_POLICIES if p["id"] == policy_id), None)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    account = await models.Account.find_one(models.Account.user_id == str(current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="No account found")
        
    if account.balance < policy["premium"]:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Deduct premium
    account.balance -= policy["premium"]
    await account.save()
    
    new_insurance = models.Insurance(
        user_id=str(current_user.id),
        policy_name=policy["name"],
        policy_type=policy["type"],
        premium=policy["premium"],
        coverage=policy["coverage"]
    )
    
    txn = models.Transaction(
        account_id=str(account.id),
        amount=-policy["premium"],
        transaction_type="withdrawal",
        description=f"Insurance Premium: {policy['name']}"
    )
    
    await new_insurance.create()
    await txn.create()
    
    return {"message": "Policy purchased successfully", "insurance": new_insurance}
