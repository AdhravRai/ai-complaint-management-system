from app.agents.validation import validate_complaint
from app.models.schemas import ComplaintExtraction


def test_missing_complaint_information():
    state = {
        "raw_text": "Customer reported damaged packaging.",
        "extracted_data": ComplaintExtraction(
            customer_name="ABC Pharma",
            product_name="Paracetamol Tablets",
            batch_number=None,
            complaint_type="Packaging Defect",
            description="Damaged packaging was reported.",
        ),
        "validation_errors": [],
        "risk_assessment": None,
        "recommendations": [],
        "missing_information": [],
    }

    result = validate_complaint(state)

    assert "batch_number" in result["missing_information"]
    assert len(result["validation_errors"]) == 1