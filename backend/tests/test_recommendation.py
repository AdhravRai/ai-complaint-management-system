from app.agents.fake_llm import FakeStructuredLLM
from app.agents.recommendation import generate_recommendations
from app.models.schemas import (
    ComplaintExtraction,
    RecommendationResult,
    RiskAssessment,
)


def test_recommendation_generation():

    fake_response = RecommendationResult(
    recommendations=[
        "Review the batch manufacturing records.",
        "Inspect retained samples from the affected batch.",
        "Check for similar complaints involving the same batch.",
     ]
    )

    fake_llm = FakeStructuredLLM(fake_response)

    state = {
        "raw_text": "Customer reported damaged packaging.",
        "extracted_data": ComplaintExtraction(
            customer_name="ABC Pharma",
            product_name="Paracetamol Tablets",
            product_strength="500 mg",
            batch_number="PCM240812",
            complaint_type="Packaging Defect",
            description="Damaged packaging was reported.",
        ),
        "validation_errors": [],
        "risk_assessment": RiskAssessment(
            severity="Major",
            priority="High",
            risk_level="High",
            reason="The complaint involves a product quality issue.",
        ),
        "recommendations": [],
        "missing_information": [],
    }

    result = generate_recommendations(state, fake_llm)

    assert len(result["recommendations"]) == 3
    assert "Review the batch manufacturing records." in result["recommendations"]