import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import {
  resetComplaint,
  setAnalysisResult,
  setError,
  setLoading,
  updateFormField,
} from "./store/complaintSlice";
import {
  analyzeComplaintPdf,
  analyzeComplaintText,
  askCopilot,
  saveComplaint,
} from "./services/api";

function App() {
  const dispatch = useDispatch();
  const complaint = useSelector((state) => state.complaint);
  const fileInputRef = useRef(null);

  const [complaintText, setComplaintText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [copilotQuestion, setCopilotQuestion] = useState("");
  const [copilotAnswer, setCopilotAnswer] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!complaintText.trim()) {
      dispatch(setError("Please enter a complaint before analyzing."));
      return;
    }

    dispatch(setLoading(true));
    setSaveMessage("");

    try {
      const result = await analyzeComplaintText(complaintText);
      dispatch(setAnalysisResult(result));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handlePdfAnalyze = async () => {
    if (!selectedFile) {
      dispatch(setError("Please select a PDF file first."));
      return;
    }

    dispatch(setLoading(true));
    setSaveMessage("");

    try {
      const result = await analyzeComplaintPdf(selectedFile);
      dispatch(setAnalysisResult(result));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleFieldChange = (field, value) => {
    dispatch(updateFormField({ field, value }));
  };

  const handleReset = () => {
    dispatch(resetComplaint());
    setComplaintText("");
    setSelectedFile(null);
    setSaveMessage("");
    setCopilotQuestion("");
    setCopilotAnswer("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const requiredFields = [
      ["customer_name", "Customer Name"],
      ["product_name", "Product Name"],
      ["batch_number", "Batch Number"],
      ["complaint_type", "Complaint Type"],
      ["description", "Description"],
    ];

    const missingFields = requiredFields
      .filter(([field]) => !complaint.formData[field])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      setSaveMessage(`Please complete: ${missingFields.join(", ")}`);
      return;
    }

    dispatch(setLoading(true));
    setSaveMessage("");

    try {
      const result = await saveComplaint({
        complaint: complaint.formData,
        risk_assessment: complaint.riskAssessment,
        recommendations: complaint.recommendations,
      });

      setSaveMessage(`Complaint saved successfully. ID: ${result.complaint_id}`);
      dispatch(setLoading(false));
    } catch (error) {
      setSaveMessage(error.message);
      dispatch(setLoading(false));
    }
  };
  const handleCopilot = async () => {
    if (!copilotQuestion.trim()) {
      setCopilotAnswer("Please enter a question about this complaint.");
      return;
    }

    if (!complaint.formData.description) {
      setCopilotAnswer("Please analyze a complaint before using the AI Copilot.");
      return;
    }

    setCopilotLoading(true);
    setCopilotAnswer("");

    try {
      const result = await askCopilot({
        complaint: complaint.formData,
        risk_assessment: complaint.riskAssessment,
        recommendations: complaint.recommendations,
        question: copilotQuestion,
      });

      setCopilotAnswer(result.answer);
    } catch (error) {
      setCopilotAnswer(error.message);
    } finally {
      setCopilotLoading(false);
    }
  };
  const totalRequiredFields = 11;
  const hasAnalysis =
    complaint.formData.customer_name ||
    complaint.formData.product_name ||
    complaint.formData.product_strength ||
    complaint.formData.batch_number ||
    complaint.formData.manufacturing_date ||
    complaint.formData.expiry_date ||
    complaint.formData.quantity_affected ||
    complaint.formData.quantity_unit ||
    complaint.formData.complaint_type ||
    complaint.formData.complaint_date ||
    complaint.formData.description ||
    complaint.riskAssessment.risk_level;

  const missingCount = complaint.missingInformation.length;
  const completedCount = totalRequiredFields - missingCount;
  const completenessPercentage = hasAnalysis
    ? Math.max(0, Math.round((completedCount / totalRequiredFields) * 100))
    : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>AI Complaint Management System</h1>
          <p>Pharmaceutical Customer Complaint Intake</p>
        </div>

        <button className="secondary-button" onClick={handleReset}>
          New Complaint
        </button>
      </header>

      <main className="main-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Complaint Intake</span>
              <h2>Log Customer Complaint</h2>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Complaint Source
              <input
                value={complaint.formData.complaint_source || ""}
                onChange={(event) =>
                  handleFieldChange("complaint_source", event.target.value)
                }
                placeholder="Email, phone, portal..."
              />
            </label>

            <label>
              Customer Name
              <input
                value={complaint.formData.customer_name || ""}
                onChange={(event) =>
                  handleFieldChange("customer_name", event.target.value)
                }
                placeholder="Customer name"
              />
            </label>

            <label>
              Product Name
              <input
                value={complaint.formData.product_name || ""}
                onChange={(event) =>
                  handleFieldChange("product_name", event.target.value)
                }
                placeholder="Product name"
              />
            </label>

            <label>
              Product Strength
              <input
                value={complaint.formData.product_strength || ""}
                onChange={(event) =>
                  handleFieldChange("product_strength", event.target.value)
                }
                placeholder="e.g. 500 mg"
              />
            </label>

            <label>
              Batch Number
              <input
                value={complaint.formData.batch_number || ""}
                onChange={(event) =>
                  handleFieldChange("batch_number", event.target.value)
                }
                placeholder="Batch number"
              />
            </label>

            <label>
              Manufacturing Date
              <input
                value={complaint.formData.manufacturing_date || ""}
                onChange={(event) =>
                  handleFieldChange(
                    "manufacturing_date",
                    event.target.value
                  )
                }
                placeholder="YYYY-MM-DD"
              />
            </label>

            <label>
              Expiry Date
              <input
                value={complaint.formData.expiry_date || ""}
                onChange={(event) =>
                  handleFieldChange("expiry_date", event.target.value)
                }
                placeholder="YYYY-MM-DD"
              />
            </label>

            <label>
              Quantity Affected
              <input
                value={complaint.formData.quantity_affected || ""}
                onChange={(event) =>
                  handleFieldChange("quantity_affected", event.target.value)
                }
                placeholder="Quantity"
              />
            </label>

            <label>
              Quantity Unit
              <input
                value={complaint.formData.quantity_unit || ""}
                onChange={(event) =>
                  handleFieldChange("quantity_unit", event.target.value)
                }
                placeholder="bottles, packs..."
              />
            </label>

            <label>
              Complaint Type
              <input
                value={complaint.formData.complaint_type || ""}
                onChange={(event) =>
                  handleFieldChange("complaint_type", event.target.value)
                }
                placeholder="Packaging defect, quality issue..."
              />
            </label>

            <label>
              Complaint Date
              <input
                value={complaint.formData.complaint_date || ""}
                onChange={(event) =>
                  handleFieldChange("complaint_date", event.target.value)
                }
                placeholder="YYYY-MM-DD"
              />
            </label>
          </div>

          <label className="full-width">
            Complaint Description
            <textarea
              value={complaint.formData.description || ""}
              onChange={(event) =>
                handleFieldChange("description", event.target.value)
              }
              placeholder="Describe the customer complaint..."
              rows="5"
            />
          </label>

          <div className="assessment-card">
            <div className="assessment-heading">
              <div>
                <span className="eyebrow">Initial Assessment</span>
                <h3>AI Copilot — Risk Assessment</h3>
              </div>

              <span className={`risk-badge ${complaint.riskAssessment.risk_level?.toLowerCase() || ""}`}>
                {complaint.riskAssessment.risk_level || "Pending"}
              </span>
            </div>
            <div className="copilot-chat">
              <div className="copilot-header">
                <div>
                  <span className="eyebrow">AI Copilot</span>
                  <h4>Ask about this complaint</h4>
                </div>
              </div>

              <div className="copilot-input-row">
                <input
                  value={copilotQuestion}
                  onChange={(event) => setCopilotQuestion(event.target.value)}
                  placeholder="Why is this complaint classified as high risk?"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleCopilot();
                    }
                  }}
                />

                <button
                  className="secondary-button"
                  onClick={handleCopilot}
                  disabled={copilotLoading}
                >
                  {copilotLoading ? "Asking..." : "Ask AI"}
                </button>
              </div>

              {copilotAnswer && (
                <div className="copilot-answer">
                  <span>AI Copilot</span>
                  <p>{copilotAnswer}</p>
                </div>
              )}
            </div>

            <div className="risk-grid">
              <div>
                <span>Severity</span>
                <strong>
                  {complaint.riskAssessment.severity || "Pending"}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {complaint.riskAssessment.priority || "Pending"}
                </strong>
              </div>

              <div>
                <span>Risk Level</span>
                <strong>
                  {complaint.riskAssessment.risk_level || "Pending"}
                </strong>
              </div>
            </div>

            <div className="reason-box">
              <span>AI Reasoning</span>
              <p>
                {complaint.riskAssessment.reason ||
                  "Analyze a complaint to generate the initial AI risk assessment."}
              </p>
            </div>
          </div>

          <div className="completeness-card">
            <div className="assessment-heading">
              <div>
                <span className="eyebrow">Bonus Feature</span>
                <h3>Complaint Completeness Checker</h3>
              </div>

              <strong>
                {completenessPercentage === null
                  ? "Not analyzed"
                  : `${completenessPercentage}%`}
              </strong>
            </div>

            <div className="completeness-progress">
              <div
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>

            {completenessPercentage === null ? (
                <p className="completeness-note">
                  Analyze a complaint to check whether the required information is complete.
                </p>
              ) : complaint.missingInformation.length === 0 ? (
                <p className="complete-message">
                  ✓ All required complaint information is available.
                </p>
              ) : (
                <div className="missing-information">
                  <span>Information Needed for Completenes</span>
                  <ul>
                    {complaint.missingInformation.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            <p className="completeness-note">
              The checker identifies complaint information that may be needed for a
              complete quality review.
            </p>
          </div>

          <div className="recommendation-card">
            <span className="eyebrow">AI Guidance</span>
            <h3>Recommended Actions</h3>

            {complaint.recommendations.length === 0 ? (
              <p>
                Analyze a complaint to generate recommended follow-up actions.
              </p>
            ) : (
              <ul>
                {complaint.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            )}
          </div>

          {saveMessage && (
            <div className="save-message">
              {saveMessage}
            </div>
          )}

          <button
            className="primary-button"
            onClick={handleSave}
            disabled={complaint.loading}
          >
            {complaint.loading ? "Saving..." : "Log Customer Complaint"}
          </button>
        </section>

        <section className="panel assistant-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">AI Assistant</span>
              <h2>Complaint Analysis</h2>
            </div>
          </div>

          <div className="upload-card">
            <h3>Analyze Complaint PDF</h3>
            <p>
              Upload a pharmaceutical complaint PDF and let the AI extract
              the relevant information.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] || null)
              }
            />

            <button
              className="secondary-button full-button"
              onClick={handlePdfAnalyze}
              disabled={complaint.loading}
            >
              {complaint.loading ? "Analyzing..." : "Analyze PDF"}
            </button>
          </div>

          <div className="text-analysis-card">
            <h3>Analyze Complaint Text</h3>

            <textarea
              value={complaintText}
              onChange={(event) => setComplaintText(event.target.value)}
              placeholder="Paste the customer complaint here..."
              rows="12"
            />

            <button
              className="primary-button full-button"
              onClick={handleAnalyze}
              disabled={complaint.loading}
            >
              {complaint.loading ? "Analyzing..." : "Analyze Complaint"}
            </button>
          </div>

          {complaint.error && (
            <div className="error-message">
              {complaint.error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;