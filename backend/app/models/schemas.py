from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class ComplaintExtraction(BaseModel):
    complaint_source: str | None = None
    customer_name: str | None = None

    product_name: str | None = None
    product_strength: str | None = None
    batch_number: str | None = None
    manufacturing_date: str | None = None
    expiry_date: str | None = None
    quantity_affected: float | None = None
    quantity_unit: str | None = None

    complaint_type: str | None = None
    complaint_date: str | None = None
    description: str | None = None
class RiskAssessment(BaseModel):
    severity: Literal["Minor", "Major", "Critical"] | None = None
    priority: Literal["Low", "Medium", "High"] | None = None
    risk_level: Literal["Low", "Medium", "High", "Critical"] | None = None
    reason: str | None = None

class AIAnalysisResult(BaseModel):
    complaint: ComplaintExtraction
    risk_assessment: RiskAssessment
    recommendations: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
class ComplaintAnalysisRequest(BaseModel):
    text: str = Field(min_length=1)
class RecommendationResult(BaseModel):
    recommendations: list[str] = Field(default_factory=list)

class ComplaintCreate(BaseModel):
    complaint: ComplaintExtraction
    risk_assessment: RiskAssessment = Field(default_factory=RiskAssessment)
    recommendations: list[str] = Field(default_factory=list)
class CopilotRequest(BaseModel):
    complaint: ComplaintExtraction
    risk_assessment: RiskAssessment
    recommendations: list[str] = Field(default_factory=list)
    question: str = Field(min_length=1)


class CopilotResponse(BaseModel):
    answer: str