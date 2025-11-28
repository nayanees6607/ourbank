from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

db = SessionLocal()
accounts = db.query(models.Account).all()
for acc in accounts:
    print(f"ID: {acc.id}, Number: {acc.account_number}, Balance: {acc.balance}, UserID: {acc.user_id}")
db.close()
