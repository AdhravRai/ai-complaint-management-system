from app.agents.state import ComplaintState


def validate_complaint(state: ComplaintState) -> ComplaintState:
    extracted = state["extracted_data"]

    if extracted is None:
        state["validation_errors"].append(
            "Complaint information could not be extracted."
        )
        return state

    missing_information = []

    required_fields = {
        "customer_name": extracted.customer_name,
        "product_name": extracted.product_name,
        "batch_number": extracted.batch_number,
        "complaint_type": extracted.complaint_type,
        "description": extracted.description,
    }

    for field_name, value in required_fields.items():
        if value is None or not str(value).strip():
            missing_information.append(field_name)

    state["missing_information"] = missing_information

    if missing_information:
        state["validation_errors"].append(
            "Required complaint information is missing."
        )

    return state