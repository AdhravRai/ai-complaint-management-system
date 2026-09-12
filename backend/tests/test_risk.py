from app.agents.fake_llm import FakeStructuredLLM
from app.agents.risk import assess_risk
from app.models.schemas import ComplaintExtraction, RiskAssessment


def test_risk_assessment():

    fake_response = RiskAssessment(
        severity="Major",
        priority="High",
        risk_level="High",
        reason="The complaint involves a product quality issue that requires prompt investigation.",
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
        "risk_assessment": None,
        "recommendations": [],
        "missing_information": [],
    }

    result = assess_risk(state, fake_llm)

    assert result["risk_assessment"].severity == "Major"
    assert result["risk_assessment"].priority == "High"
    assert result["risk_assessment"].risk_level == "High"