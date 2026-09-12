from app.agents.fake_llm import FakeStructuredLLM
from app.agents.graph import build_graph
from app.models.schemas import ComplaintExtraction, RiskAssessment


def test_complaint_graph():

    fake_extraction_response = ComplaintExtraction(
        customer_name="ABC Pharma",
        product_name="Paracetamol Tablets",
        product_strength="500 mg",
        batch_number="PCM240812",
        complaint_type="Packaging Defect",
        description="Damaged packaging was reported.",
    )

    fake_risk_response = RiskAssessment(
        severity="Major",
        priority="High",
        risk_level="High",
        reason="The complaint involves a product quality issue.",
    )

    fake_recommendation_response = [
        "Review the batch manufacturing records.",
        "Inspect retained samples from the affected batch.",
        "Check for similar complaints involving the same batch.",
    ]

    fake_extraction_llm = FakeStructuredLLM(
        fake_extraction_response
    )

    fake_risk_llm = FakeStructuredLLM(
        fake_risk_response
    )

    fake_recommendation_llm = FakeStructuredLLM(
        fake_recommendation_response
    )

    def fake_extraction_node(state):
        return {
            **state,
            "extracted_data": fake_extraction_llm.invoke(
                state["raw_text"]
            ),
        }

    def fake_risk_node(state):
        return {
            **state,
            "risk_assessment": fake_risk_llm.invoke(
                state["raw_text"]
            ),
        }

    def fake_recommendation_node(state):
        return {
            **state,
            "recommendations": fake_recommendation_llm.invoke(
                state["raw_text"]
            ),
        }

    graph = build_graph(
        extraction_node=fake_extraction_node,
        risk_node=fake_risk_node,
        recommendation_node=fake_recommendation_node,
    )

    initial_state = {
        "raw_text": "ABC Pharma reported damaged packaging.",
        "extracted_data": None,
        "validation_errors": [],
        "risk_assessment": None,
        "recommendations": [],
        "missing_information": [],
    }

    result = graph.invoke(initial_state)

    assert result["extracted_data"].customer_name == "ABC Pharma"
    assert result["extracted_data"].batch_number == "PCM240812"

    assert result["risk_assessment"].risk_level == "High"
    assert result["risk_assessment"].priority == "High"

    assert len(result["recommendations"]) == 3