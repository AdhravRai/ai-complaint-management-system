import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAnalysisResult,
  setError,
  setLoading,
  updateFormField,
  resetComplaint,
} from "./store/complaintSlice";
import {
  analyzeComplaintText,
  analyzeComplaintPdf,
  saveComplaint,
} from "./services/api";

function App() {
  const complaint = useSelector((state) => state.complaint);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [complaintText, setComplaintText] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!complaintText.trim()) {
      dispatch(setError("Please enter a complaint before analyzing."));
      return;
    }

    try {
      dispatch(setLoading(true));
      const result = await analyzeComplaintText(complaintText);
      dispatch(setAnalysisResult(result));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handlePdfAnalyze = async () => {
    if (!selectedFile) {
      dispatch(setError("Please choose a PDF first."));
      return;
    }

    try {
      dispatch(setLoading(true));
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleSave = async () => {
    setSaveMessage("");

    const requiredFields = [
      ["customer_name", "Customer name"],
      ["product_name", "Product name"],
      ["batch_number", "Batch / Lot number"],
      ["complaint_type", "Complaint type"],
      ["description", "Complaint description"],
    ];

    const missingField = requiredFields.find(
      ([field]) => !complaint.formData[field]?.toString().trim()
    );

    if (missingField) {
      dispatch(setError(`Please provide ${missingField[1]} before saving.`));
      return;
    }

    try {
      dispatch(setLoading(true));

      const result = await saveComplaint({
        complaint: complaint.formData,
        risk_assessment: complaint.riskAssessment,
        recommendations: complaint.recommendations,
      });

      setSaveMessage(`Complaint saved successfully. ID: ${result.complaint_id}`);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setError(error.message));
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>AI Complaint Management</h1>
          <p>AI-powered complaint intake and triage</p>
        </div>

        <div className="status-badge">
          <span className="status-dot"></span>
          AI Assistant Ready
        </div>
      </header>

      <main className="main-content">
        <section className="panel complaint-panel">
          <div className="panel-header">
            <div>
              <h2>Complaint Details</h2>
              <p>Review and complete the complaint information</p>
            </div>
          </div>

          <div className="form-section">
            <h3>Origin & Customer Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Complaint Source</label>
                <input
                  type="text"
                  value={complaint.formData.complaint_source}
                  placeholder="e.g. Email, Phone, Portal"
                  onChange={(event) =>
                    handleFieldChange("complaint_source", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={complaint.formData.customer_name}
                  placeholder="Customer name"
                  onChange={(event) =>
                    handleFieldChange("customer_name", event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product & Batch Identification</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={complaint.formData.product_name}
                  placeholder="Product name"
                  onChange={(event) =>
                    handleFieldChange("product_name", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Product Strength / Grade</label>
                <input
                  type="text"
                  value={complaint.formData.product_strength}
                  placeholder="e.g. 500 mg"
                  onChange={(event) =>
                    handleFieldChange("product_strength", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Batch / Lot Number</label>
                <input
                  type="text"
                  value={complaint.formData.batch_number}
                  placeholder="Batch number"
                  onChange={(event) =>
                    handleFieldChange("batch_number", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Quantity Affected</label>
                <div className="quantity-row">
                  <input
                    type="text"
                    value={complaint.formData.quantity_affected}
                    placeholder="Quantity"
                    onChange={(event) =>
                      handleFieldChange(
                        "quantity_affected",
                        event.target.value
                      )
                    }
                  />
                  <input
                    type="text"
                    value={complaint.formData.quantity_unit}
                    placeholder="Unit"
                    onChange={(event) =>
                      handleFieldChange("quantity_unit", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Manufacturing Date</label>
                <input
                  type="text"
                  value={complaint.formData.manufacturing_date}
                  placeholder="Not provided"
                  onChange={(event) =>
                    handleFieldChange(
                      "manufacturing_date",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={complaint.formData.expiry_date}
                  placeholder="Not provided"
                  onChange={(event) =>
                    handleFieldChange("expiry_date", event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Complaint Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Complaint Type</label>
                <input
                  type="text"
                  value={complaint.formData.complaint_type}
                  placeholder="Complaint type"
                  onChange={(event) =>
                    handleFieldChange("complaint_type", event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Complaint Date</label>
                <input
                  type="text"
                  value={complaint.formData.complaint_date}
                  placeholder="Not provided"
                  onChange={(event) =>
                    handleFieldChange("complaint_date", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Detailed Complaint Description</label>
              <textarea
                value={complaint.formData.description}
                placeholder="Complaint description will appear here after AI analysis..."
                rows="5"
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Initial Assessment</h3>

            <div className="assessment-grid">
              <div className="assessment-card">
                <span>Severity</span>
                <strong>
                  {complaint.riskAssessment.severity || "Not assessed"}
                </strong>
              </div>

              <div className="assessment-card">
                <span>Priority</span>
                <strong>
                  {complaint.riskAssessment.priority || "Not assessed"}
                </strong>
              </div>

              <div className="assessment-card">
                <span>Risk Level</span>
                <strong>
                  {complaint.riskAssessment.risk_level || "Not assessed"}
                </strong>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="secondary-button" onClick={handleReset}>
              Reset Form
            </button>
            <button
              className="primary-button"
              onClick={handleSave}
              disabled={complaint.loading}
            >
              {complaint.loading ? "Saving..." : "Save Complaint"}
            </button>
          </div>
          {saveMessage && <div className="success-message">{saveMessage}</div>}
        </section>

        <aside className="panel assistant-panel">
          <div className="assistant-header">
            <div className="assistant-icon">✦</div>
            <div>
              <h2>AI Intake Assistant</h2>
              <p>Extract and assess complaint information</p>
            </div>
          </div>

          <div className="upload-box">
            <div className="upload-icon">↑</div>
            <h3>Upload Complaint</h3>
            <p>Upload a PDF or paste complaint text below</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              hidden
              onChange={(event) => {
                setSelectedFile(event.target.files[0] || null);
              }}
            />

            <button
              className="upload-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose PDF
            </button>

            {selectedFile && (
              <p className="selected-file">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              className="analyze-button"
              onClick={handlePdfAnalyze}
              disabled={complaint.loading || !selectedFile}
            >
              {complaint.loading ? "Analyzing PDF..." : "✦ Analyze PDF"}
            </button>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="form-group">
            <label>Complaint Text</label>
            <textarea
              placeholder="Paste the customer complaint here..."
              rows="7"
              value={complaintText}
              onChange={(event) => setComplaintText(event.target.value)}
            />
          </div>

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={complaint.loading}
          >
            {complaint.loading ? "Analyzing..." : "✦ Analyze Complaint"}
          </button>

          {complaint.error && (
            <div className="error-message">{complaint.error}</div>
          )}

          <div className="ai-section">
            <h3>AI Assessment</h3>

            <div className="risk-box">
              <div className="risk-header">
                <span>Risk Level</span>
                <strong>
                  {complaint.riskAssessment.risk_level || "Pending"}
                </strong>
              </div>

              <p>
                {complaint.riskAssessment.reason ||
                  "Submit a complaint to generate an initial AI risk assessment."}
              </p>
            </div>
          </div>

          <div className="ai-section">
            <h3>Recommendations</h3>

            {complaint.recommendations.length === 0 ? (
              <p className="empty-text">
                Recommendations will appear after AI analysis.
              </p>
            ) : (
              <ul className="recommendation-list">
                {complaint.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;