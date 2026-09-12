from app.agents.llm import llm
from app.agents.state import ComplaintState
from app.models.schemas import RiskAssessment


def assess_risk(
    state: ComplaintState,
    model=None,
) -> ComplaintState:

    extracted = state["extracted_data"]

    prompt = f"""
You are an AI assistant supporting pharmaceutical complaint triage.

Assess the initial risk of the following customer complaint.

Complaint information:
Customer: {extracted.customer_name}
Product: {extracted.product_name}
Strength: {extracted.product_strength}
Batch: {extracted.batch_number}
Complaint Type: {extracted.complaint_type}
Description: {extracted.description}

Return a structured risk assessment.

Consider:
- Potential impact on patient safety
- Potential product quality impact
- Nature and seriousness of the complaint
- Urgency of investigation

Rules:
- Do not invent facts that are not present.
- This is an initial AI assessment only.
- The final quality/risk decision must be made by the responsible quality team.
"""

    if model is None:
        model = llm.with_structured_output(RiskAssessment)

    risk_assessment = model.invoke(prompt)

    state["risk_assessment"] = risk_assessment

    return state