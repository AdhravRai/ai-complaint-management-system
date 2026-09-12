from app.agents.extraction import extract_complaint
from app.agents.fake_llm import FakeStructuredLLM
from app.models.schemas import ComplaintExtraction


def test_complaint_extraction():
    fake_response = ComplaintExtraction(
        complaint_source="Email",
        customer_name="ABC Pharma",
        product_name="Paracetamol Tablets",
        product_strength="500 mg",
        batch_number="PCM240812",
        quantity_affected=25,
        quantity_unit="bottles",
        complaint_type="Packaging Defect",
        description="Customer reported damaged packaging on 25 bottles.",
    )

    fake_llm = FakeStructuredLLM(fake_response)

    state = {
        "raw_text": (
            "ABC Pharma reported damaged packaging on "
            "25 bottles of Paracetamol Tablets 500 mg "
            "from batch PCM240812."
        ),
        "extracted_data": None,
        "validation_errors": [],
        "risk_assessment": None,
        "recommendations": [],
        "missing_information": [],
    }

    result = extract_complaint(state, fake_llm)

    assert result["extracted_data"].customer_name == "ABC Pharma"
    assert result["extracted_data"].product_name == "Paracetamol Tablets"
    assert result["extracted_data"].batch_number == "PCM240812"