from fastapi import APIRouter, Depends, HTTPException
import models, schemas, auth

router = APIRouter(
    prefix="/investments",
    tags=["investments"],
)

MOCK_MARKET_DATA = [
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 150.0, "type": "stock", "change": 1.2},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 2800.0, "type": "stock", "change": -0.5},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 305.0, "type": "stock", "change": 0.8},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": 3400.0, "type": "stock", "change": 1.5},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 750.0, "type": "stock", "change": -2.1},
    {"symbol": "VTSAX", "name": "Vanguard Total Stock Market", "price": 110.0, "type": "mutual_fund", "change": 0.3},
    {"symbol": "VFIAX", "name": "Vanguard 500 Index Fund", "price": 400.0, "type": "mutual_fund", "change": 0.4},
    {"symbol": "VGSLX", "name": "Vanguard REIT Index Fund", "price": 145.0, "type": "mutual_fund", "change": -0.2},
    {"symbol": "VTIAX", "name": "Vanguard Total Intl Stock", "price": 30.0, "type": "mutual_fund", "change": 0.1},
    {"symbol": "VBTLX", "name": "Vanguard Total Bond Market", "price": 11.0, "type": "mutual_fund", "change": 0.05},
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF Trust", "price": 440.0, "type": "etf", "change": 0.4},
    {"symbol": "QQQ", "name": "Invesco QQQ Trust", "price": 370.0, "type": "etf", "change": 0.6},
]

@router.get("/market")
def get_market_data():
    return MOCK_MARKET_DATA

@router.get("/", response_model=list[schemas.Investment])
async def get_investments(current_user: models.User = Depends(auth.get_current_user)):
    return await models.Investment.find(models.Investment.user_id == str(current_user.id)).to_list()

@router.post("/invest")
async def invest(investment: schemas.InvestmentCreate, current_user: models.User = Depends(auth.get_current_user)):
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(investment.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
    if investment.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum investment amount is 500")
    
    account = await models.Account.find_one(models.Account.user_id == str(current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="No account found")
        
    if account.balance < investment.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Deduct balance
    account.balance -= investment.amount
    await account.save()
    
    # Create investment record
    # Find price from mock data
    price = next((item["price"] for item in MOCK_MARKET_DATA if item["symbol"] == investment.symbol), 100.0)
    quantity = investment.amount / price
    
    new_investment = models.Investment(
        user_id=str(current_user.id),
        investment_type=investment.investment_type,
        symbol=investment.symbol,
        quantity=quantity,
        purchase_price=price,
        current_value=price # Initial value
    )
    
    # Transaction
    txn = models.Transaction(
        account_id=str(account.id),
        amount=-investment.amount,
        transaction_type="withdrawal",
        description=f"Investment in {investment.symbol}"
    )
    
    await new_investment.create()
    await txn.create()
    
    return {"message": "Investment successful"}

@router.post("/sell")
async def sell(sell_request: schemas.InvestmentSell, current_user: models.User = Depends(auth.get_current_user)):
    # Verify transaction PIN
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Transaction PIN not set. Please set your PIN first.")
    if not auth.verify_password(sell_request.pin, current_user.pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect transaction PIN")
    
    if sell_request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    # Find the investment
    investment = await models.Investment.find_one(
        models.Investment.user_id == str(current_user.id),
        models.Investment.symbol == sell_request.symbol
    )

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    if investment.quantity < sell_request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient quantity")

    # Get current market price
    price = next((item["price"] for item in MOCK_MARKET_DATA if item["symbol"] == sell_request.symbol), 100.0)
    
    # Calculate total value
    total_value = sell_request.quantity * price

    # Update investment quantity
    investment.quantity -= sell_request.quantity
    
    if investment.quantity <= 0.000001: # Floating point tolerance
        await investment.delete()
    else:
        await investment.save()

    # Credit user account
    account = await models.Account.find_one(models.Account.user_id == str(current_user.id))
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    account.balance += total_value
    await account.save()

    # Create transaction record
    txn = models.Transaction(
        account_id=str(account.id),
        amount=total_value,
        transaction_type="deposit",
        description=f"Sold {sell_request.quantity:.4f} {sell_request.symbol}"
    )
    await txn.create()

    return {"message": "Sale successful", "amount_credited": total_value}
