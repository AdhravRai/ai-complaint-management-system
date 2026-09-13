from app.agents.state import ComplaintState


REQUIRED_FIELDS = [
    ("customer_name", "Customer Name"),
    ("product_name", "Product Name"),
    ("product_strength", "Product Strength"),
    ("batch_number", "Batch Number"),
    ("manufacturing_date", "Manufacturing Date"),
    ("expiry_date", "Expiry Date"),
    ("quantity_affected", "Quantity Affected"),
    ("quantity_unit", "Quantity Unit"),
    ("complaint_type", "Complaint Type"),
    ("complaint_date", "Complaint Date"),
    ("description", "Description"),
]


def validate_complaint(state: ComplaintState) -> ComplaintState:
    extracted_data = state["extracted_data"]

    missing_information = []

    for field_name, display_name in REQUIRED_FIELDS:
        value = getattr(extracted_data, field_name, None)

        if value is None or value == "":
            missing_information.append(display_name)

    state["missing_information"] = missing_information

    if missing_information:
        state["validation_errors"] = [
            f"Missing required information: {', '.join(missing_information)}"
        ]
    else:
        state["validation_errors"] = []

    return state