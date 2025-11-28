import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import models

async def init_db():
    # Get MongoDB URL from env or use default local
    # For Atlas, the user will provide the full connection string in env
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "banking_app")

    client = AsyncIOMotorClient(MONGO_URL)
    database = client[DB_NAME]
    
    # Initialize Beanie with the Document classes
    await init_beanie(
        database=database,
        document_models=[
            models.User,
            models.Account,
            models.Transaction,
            models.Card,
            models.FixedDeposit,
            models.Loan,
            models.Insurance,
            models.Investment
        ]
    )
