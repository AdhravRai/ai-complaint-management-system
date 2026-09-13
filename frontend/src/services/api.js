const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeComplaintText(text) {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/analyze-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || "Failed to analyze complaint."
    );
  }

  return response.json();
}
export async function analyzeComplaintPdf(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/complaints/analyze-pdf`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail || "Failed to analyze PDF."
    );
  }

  return response.json();
}
export async function saveComplaint(data) {
  const response = await fetch(`${API_BASE_URL}/api/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to save complaint.");
  }

  return response.json();
}
export async function askCopilot(data) {
  const response = await fetch(`${API_BASE_URL}/api/complaints/copilot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to get AI Copilot response.");
  }

  return response.json();
}