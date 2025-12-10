from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import models, schemas, auth
import random
from datetime import datetime, timedelta
from beanie.operators import In

router = APIRouter(
    prefix="/cards",
    tags=["cards"],
)

@router.get("/", response_model=list[schemas.Card])
async def get_cards(current_user: models.User = Depends(auth.get_current_user)):
    return await models.Card.find(models.Card.user_id == str(current_user.id)).sort(-models.Card.created_at).to_list()

@router.get("/credit-card-options")
async def get_credit_card_options():
    """Returns available credit card varieties"""
    return [
        {"id": "platinum_rewards", "name": "Platinum Rewards", "description": "Earn 3x points on travel & dining", "annual_fee": 2499, "cashback": "3%", "color": "from-slate-600 to-slate-800"},
        {"id": "gold_cashback", "name": "Gold Cashback", "description": "5% cashback on all purchases", "annual_fee": 1499, "cashback": "5%", "color": "from-amber-600 to-amber-800"},
        {"id": "travel_elite", "name": "Travel Elite", "description": "Airport lounge access & travel insurance", "annual_fee": 4999, "cashback": "2%", "color": "from-sky-600 to-sky-800"},
        {"id": "student_starter", "name": "Student Starter", "description": "Zero annual fee, perfect for students", "annual_fee": 0, "cashback": "1%", "color": "from-emerald-600 to-emerald-800"},
        {"id": "business_pro", "name": "Business Pro", "description": "High credit limit with expense tracking", "annual_fee": 3999, "cashback": "2%", "color": "from-purple-600 to-purple-800"},
        {"id": "signature_black", "name": "Signature Black", "description": "Premium perks with concierge service", "annual_fee": 9999, "cashback": "4%", "color": "from-gray-900 to-black"}
    ]

@router.post("/generate")
async def generate_card(card_type: str, card_name: str = "", current_user: models.User = Depends(auth.get_current_user)):
    # Logic: One Debit Card per user. Up to 4 Credit Cards allowed.
    
    # Ensure user has a PIN set
    if not current_user.pin_hash:
        raise HTTPException(status_code=400, detail="Please set a transaction PIN in your profile/settings before applying for a card.")

    if card_type.lower() == "debit":
        # Check if user has any active or pending debit card
        existing_debit = await models.Card.find_one(
            models.Card.user_id == str(current_user.id), 
            models.Card.card_type == "debit",
            In(models.Card.status, ["active", "pending"])
        )
        if existing_debit:
            raise HTTPException(status_code=400, detail="You can only have one Debit Card.")
    
    if card_type.lower() == "credit":
        # Check if user already has 4 active or pending credit cards
        existing_credit_cards = await models.Card.find(
            models.Card.user_id == str(current_user.id),
            models.Card.card_type == "credit",
            In(models.Card.status, ["active", "pending"])
        ).to_list()
        if len(existing_credit_cards) >= 4:
            raise HTTPException(status_code=400, detail="You can have a maximum of 4 Credit Cards.")
    
    try:
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
            card_name=card_name if card_type.lower() == "credit" else "Debit Card",
            pin_hash=current_user.pin_hash,
            status="pending" # Default to pending
        )
        
        await new_card.create()
        return {"message": "Card application submitted successfully", "card": new_card}
    except Exception as e:
        print(f"Error generating card: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Admin Endpoints

@router.get("/admin/all")
async def get_all_cards_admin(current_user: models.User = Depends(auth.get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    cards = await models.Card.find_all().sort(-models.Card.created_at).to_list()
    
    # Enrich with user details manually since we don't have populate
    enriched_cards = []
    for card in cards:
        user = await models.User.get(card.user_id)
        card_dict = card.dict()
        card_dict['id'] = str(card.id)
        card_dict['user_name'] = user.full_name if user else "Unknown User"
        enriched_cards.append(card_dict)
        
    return enriched_cards

@router.post("/{card_id}/approve")
async def approve_card(card_id: str, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_card_status_email
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    card = await models.Card.get(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    card.status = "active"
    await card.save()
    
    # Send email notification
    card_user = await models.User.get(card.user_id)
    if card_user:
        background_tasks.add_task(
            send_card_status_email,
            card_user.email,
            card_user.full_name,
            card.card_type,
            card.card_name,
            "active",
            card.card_number[-4:]
        )
    
    return {"message": "Card approved"}

@router.post("/{card_id}/reject")
async def reject_card(card_id: str, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_card_status_email
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    card = await models.Card.get(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    card.status = "rejected"
    await card.save()
    
    # Send email notification
    card_user = await models.User.get(card.user_id)
    if card_user:
        background_tasks.add_task(
            send_card_status_email,
            card_user.email,
            card_user.full_name,
            card.card_type,
            card.card_name,
            "rejected",
            card.card_number[-4:]
        )
    
    return {"message": "Card rejected"}

@router.post("/{card_id}/revoke")
async def revoke_card(card_id: str, background_tasks: BackgroundTasks, current_user: models.User = Depends(auth.get_current_user)):
    from utils.email_service import send_card_status_email
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    card = await models.Card.get(card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
        
    card.status = "revoked"
    await card.save()
    
    # Send email notification
    card_user = await models.User.get(card.user_id)
    if card_user:
        background_tasks.add_task(
            send_card_status_email,
            card_user.email,
            card_user.full_name,
            card.card_type,
            card.card_name,
            "revoked",
            card.card_number[-4:]
        )
    
    return {"message": "Card revoked"}
