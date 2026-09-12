from fastapi import APIRouter, Depends, File, UploadFile
from datetime import date
from app.agents.graph import complaint_graph
from app.models.schemas import (
    AIAnalysisResult,
    ComplaintAnalysisRequest,
)
from app.services.pdf_parser import extract_text_from_pdf
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import Complaint
from app.models.schemas import ComplaintCreate


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
)


def run_complaint_analysis(text: str):
    initial_state = {
        "raw_text": text,
        "extracted_data": None,
        "validation_errors": [],
        "risk_assessment": None,
        "recommendations": [],
        "missing_information": [],
    }

    return complaint_graph.invoke(initial_state)


@router.post("/analyze-text", response_model=AIAnalysisResult)
def analyze_complaint(request: ComplaintAnalysisRequest):

    result = run_complaint_analysis(request.text)

    return AIAnalysisResult(
        complaint=result["extracted_data"],
        risk_assessment=result["risk_assessment"],
        recommendations=result["recommendations"],
        missing_information=result["missing_information"],
    )


@router.post("/analyze-pdf", response_model=AIAnalysisResult)
async def analyze_pdf(file: UploadFile = File(...)):

    file_bytes = await file.read()

    text = extract_text_from_pdf(file_bytes)

    if not text:
        raise ValueError("Could not extract text from PDF.")

    result = run_complaint_analysis(text)

    return AIAnalysisResult(
        complaint=result["extracted_data"],
        risk_assessment=result["risk_assessment"],
        recommendations=result["recommendations"],
        missing_information=result["missing_information"],
    )
def parse_date(value):
    if not value:
        return None

    try:
        return date.fromisoformat(value)
    except ValueError:
        return None
@router.post("", response_model=dict)
def save_complaint(data: ComplaintCreate, db: Session = Depends(get_db)):
    complaint = Complaint(
        complaint_source=data.complaint.complaint_source,
        customer_name=data.complaint.customer_name,
        product_name=data.complaint.product_name,
        product_strength=data.complaint.product_strength,
        batch_number=data.complaint.batch_number,
        manufacturing_date=parse_date(data.complaint.manufacturing_date),
        expiry_date=parse_date(data.complaint.expiry_date),
        quantity_affected=data.complaint.quantity_affected,
        quantity_unit=data.complaint.quantity_unit,
        complaint_type=data.complaint.complaint_type,
        complaint_date=parse_date(data.complaint.complaint_date),
        description=data.complaint.description,
        severity=data.risk_assessment.severity,
        priority=data.risk_assessment.priority,
        risk_level=data.risk_assessment.risk_level,
        risk_reason=data.risk_assessment.reason,
        recommendations="\n".join(data.recommendations),
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint saved successfully.",
        "complaint_id": complaint.id,
    }