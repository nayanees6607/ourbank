from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database, models, schemas, auth

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
def get_investments(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    return current_user.investments

@router.post("/invest")
def invest(investment: schemas.InvestmentCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    if investment.amount < 500:
        raise HTTPException(status_code=400, detail="Minimum investment amount is 500")
    
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first() # Default to first account
    if not account:
        raise HTTPException(status_code=404, detail="No account found")
        
    if account.balance < investment.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
        
    # Deduct balance
    account.balance -= investment.amount
    
    # Create investment record
    # Find price from mock data
    price = next((item["price"] for item in MOCK_MARKET_DATA if item["symbol"] == investment.symbol), 100.0)
    quantity = investment.amount / price
    
    new_investment = models.Investment(
        user_id=current_user.id,
        investment_type=investment.investment_type,
        symbol=investment.symbol,
        quantity=quantity,
        purchase_price=price,
        current_value=price # Initial value
    )
    
    # Transaction
    txn = models.Transaction(
        account_id=account.id,
        amount=-investment.amount,
        transaction_type="withdrawal",
        description=f"Investment in {investment.symbol}"
    )
    
    db.add(new_investment)
    db.add(txn)
    db.commit()
    
    return {"message": "Investment successful"}
