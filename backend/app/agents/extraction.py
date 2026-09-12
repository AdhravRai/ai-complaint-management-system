from app.agents.llm import llm
from app.agents.state import ComplaintState
from app.models.schemas import ComplaintExtraction


def extract_complaint(
    state: ComplaintState,
    model=None,
) -> ComplaintState:

    prompt = f"""
You are a pharmaceutical customer complaint intake assistant.

Extract complaint information from the following customer complaint.
For dates, return them in YYYY-MM-DD format when a date is explicitly provided. If a date is not provided, return null.

Rules:
- Extract only information explicitly present in the complaint.
- Do not invent or assume missing information.
- If a field is not available, return null.
- Preserve the meaning of the customer's complaint.
- Return the information according to the provided structured schema.

Customer complaint:
{state["raw_text"]}
"""

    if model is None:
        model = llm.with_structured_output(ComplaintExtraction)

    extracted_data = model.invoke(prompt)

    state["extracted_data"] = extracted_data

    return state