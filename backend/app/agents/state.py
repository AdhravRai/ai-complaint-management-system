from typing import TypedDict

from app.models.schemas import ComplaintExtraction, RiskAssessment


class ComplaintState(TypedDict):
    raw_text: str
    extracted_data: ComplaintExtraction | None
    validation_errors: list[str]
    risk_assessment: RiskAssessment | None
    recommendations: list[str]
    missing_information: list[str]