import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import models

async def init_db():
    # Use local MongoDB by default, set MONGO_URL env var for Atlas
    MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME = os.getenv("DB_NAME", "vitta_bank")

    # Use certifi for SSL certificate verification (required for MongoDB Atlas on macOS)
    client = AsyncIOMotorClient(
        MONGO_URL,
        serverSelectionTimeoutMS=10000,
        tlsCAFile=certifi.where()
    )
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
            models.Investment,
            models.DeletionRequest
        ]
    )
