from app.agents.llm import llm
from app.agents.state import ComplaintState
from app.models.schemas import RecommendationResult


def generate_recommendations(
    state: ComplaintState,
    model=None,
) -> ComplaintState:

    extracted = state["extracted_data"]
    risk = state["risk_assessment"]

    prompt = f"""
You are an AI assistant supporting a pharmaceutical quality team.

Based on the complaint information and initial AI risk assessment,
generate practical recommendations for the QA team to consider.

Complaint:
Customer: {extracted.customer_name}
Product: {extracted.product_name}
Batch: {extracted.batch_number}
Complaint Type: {extracted.complaint_type}
Description: {extracted.description}

Initial Risk Assessment:
Severity: {risk.severity}
Priority: {risk.priority}
Risk Level: {risk.risk_level}
Reason: {risk.reason}

Return a list of concise recommendations.

Rules:
- Recommendations should be relevant to the complaint.
- Do not invent facts.
- Do not claim that a product is unsafe or defective as a final decision.
- Recommendations are advisory and must be reviewed by the responsible QA team.
"""

    if model is None:
        model = llm.with_structured_output(RecommendationResult)

    result = model.invoke(prompt)

    state["recommendations"] = result.recommendations

    return state