from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.complaints import router as complaints_router


app = FastAPI(
    title="AI Complaint Management System",
    description="AI-powered customer complaint management system",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(complaints_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}