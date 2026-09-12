from langgraph.graph import END, START, StateGraph

from app.agents.extraction import extract_complaint
from app.agents.recommendation import generate_recommendations
from app.agents.risk import assess_risk
from app.agents.state import ComplaintState
from app.agents.validation import validate_complaint


def build_graph(
    extraction_node=extract_complaint,
    risk_node=assess_risk,
    recommendation_node=generate_recommendations,
):
    graph = StateGraph(ComplaintState)

    graph.add_node("extract_complaint", extraction_node)
    graph.add_node("validate_complaint", validate_complaint)
    graph.add_node("assess_risk", risk_node)
    graph.add_node("generate_recommendations", recommendation_node)

    graph.add_edge(START, "extract_complaint")
    graph.add_edge("extract_complaint", "validate_complaint")
    graph.add_edge("validate_complaint", "assess_risk")
    graph.add_edge("assess_risk", "generate_recommendations")
    graph.add_edge("generate_recommendations", END)

    return graph.compile()


complaint_graph = build_graph()