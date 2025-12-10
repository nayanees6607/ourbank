from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, accounts, cards, investments, loans, insurance
import models, database
from websocket_manager import manager
from prometheus_fastapi_instrumentator import Instrumentator
import logging
from logstash_async.handler import AsynchronousLogstashHandler
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Setup Logging
host = os.getenv('LOGSTASH_HOST', 'localhost')
port = int(os.getenv('LOGSTASH_PORT', 5000))

logger = logging.getLogger('python-logstash-logger')
logger.setLevel(logging.INFO)
# Avoid adding multiple handlers if reloaded
if not logger.handlers:
    logger.addHandler(AsynchronousLogstashHandler(host, port, database_path=None))

app = FastAPI(title="Real-Time Banking API")

# Instrument Prometheus
Instrumentator().instrument(app).expose(app)

@app.on_event("startup")
async def on_startup():
    await database.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    print(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {e}")
        print(f"Request failed: {e}")
        raise e

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(cards.router)
app.include_router(investments.router)
app.include_router(loans.router)
app.include_router(insurance.router)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Real-Time Banking API"}
