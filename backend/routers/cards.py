from fastapi import APIRouter, Depends, HTTPException
import models, schemas, auth
import random
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
)

@router.get("/", response_model=list[schemas.Card])
async def get_cards(current_user: models.User = Depends(auth.get_current_user)):
    return await models.Card.find(models.Card.user_id == str(current_user.id)).to_list()

@router.post("/generate")
async def generate_card(card_type: str, current_user: models.User = Depends(auth.get_current_user)):
    # Check if user already has a card of this type
    existing_card = await models.Card.find_one(models.Card.user_id == str(current_user.id), models.Card.card_type == card_type)
    if existing_card:
        raise HTTPException(status_code=400, detail=f"User already has a {card_type} card")
    
    # Generate card details
    card_number = "4" + "".join([str(random.randint(0, 9)) for _ in range(15)])
    cvv = "".join([str(random.randint(0, 9)) for _ in range(3)])
    expiry_date = (datetime.now() + timedelta(days=365*3)).strftime("%m/%y")
    
    new_card = models.Card(
        user_id=str(current_user.id),
        card_number=card_number,
        expiry_date=expiry_date,
        cvv=cvv,
        card_type=card_type,
        pin_hash=current_user.pin_hash # Use same pin for simplicity or ask for new one
    )
    
    await new_card.create()
    
    return {"message": "Card generated successfully", "card": new_card}
