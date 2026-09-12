# AI Complaint Management System

An AI-powered Customer Complaint Management System for pharmaceutical
manufacturing.

The system helps convert unstructured customer complaints into a
structured complaint record, checks whether important information is
missing, performs an initial AI risk assessment, and generates
investigation recommendations. The user can review and edit the
extracted information before saving the complaint to PostgreSQL.

## Problem

Customer complaints in pharmaceutical manufacturing can arrive through
emails, documents, or free-form text. Manually reading every complaint
and entering the information into a QMS form can be time-consuming and
can lead to incomplete intake information.

This project focuses on the complaint intake and initial triage stage:

-   Extract important complaint fields from unstructured text.
-   Check required complaint information.
-   Classify initial severity, priority, and risk level.
-   Generate investigation-oriented recommendations.
-   Present the AI output in an editable complaint form.
-   Save the reviewed complaint to PostgreSQL.

The system is intended as an AI-assisted intake and triage workflow, not
as a replacement for QA or regulatory decision-making.

## Features

### Core Features

-   Complaint text analysis
-   PDF complaint upload
-   PDF text extraction using PyMuPDF
-   Structured complaint information extraction
-   Complaint completeness validation
-   AI risk assessment
-   Severity and priority assessment
-   Investigation recommendations
-   Editable complaint form
-   Redux state management
-   PostgreSQL persistence
-   FastAPI REST API
-   LangGraph orchestration

### AI Capabilities

The LangGraph workflow currently contains:

1.  Complaint Extraction
2.  Complaint Validation
3.  Risk Assessment
4.  Recommendation Generation

The validation step identifies missing information such as customer
name, product name, batch number, complaint type, and complaint
description.

The recommendation step provides advisory investigation actions such as
reviewing packaging records, inspecting affected inventory, checking
storage and handling conditions, and investigating potential root
causes.

## Architecture

``` text
                    React + Redux
                         |
                         v
                 FastAPI REST API
                         |
                         v
                  LangGraph Workflow
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Extraction     Validation      Risk Assessment
                                         |
                                         v
                                  Recommendations
                         |
                         v
                    Structured JSON
                         |
                         v
                  React Complaint Form
                         |
                  User Review / Edit
                         |
                         v
                    Save Complaint
                         |
                         v
                    SQLAlchemy
                         |
                         v
                    PostgreSQL
```

## LangGraph Workflow

The graph is intentionally simple and sequential for the complaint
intake use case:

``` text
START
  |
  v
Extract Complaint
  |
  v
Validate Complaint
  |
  v
Assess Risk
  |
  v
Generate Recommendations
  |
  v
END
```

### 1. Extract Complaint

The extraction node sends the complaint text to the Groq-hosted LLM
using LangChain structured output.

It extracts fields such as:

-   Customer
-   Product
-   Product strength
-   Batch number
-   Manufacturing date
-   Expiry date
-   Quantity affected
-   Complaint type
-   Complaint date
-   Description

The prompt instructs the model to only use information explicitly
present in the complaint and return null for unavailable information.

### 2. Validate Complaint

The validation node checks whether important complaint intake fields are
present.

Required fields currently include:

-   Customer name
-   Product name
-   Batch number
-   Complaint type
-   Description

Missing information is returned to the frontend so the user knows what
should be completed before saving.

### 3. Assess Risk

The risk node generates an initial:

-   Severity
-   Priority
-   Risk level
-   Reason

The output is advisory and intended to support initial triage. Final
quality and regulatory decisions remain with the appropriate human
QA/QMS process.

### 4. Generate Recommendations

The recommendation node generates investigation-oriented actions based
on the complaint and risk assessment.

## Technology Stack

### Frontend

-   React
-   Redux Toolkit
-   React Redux
-   Vite
-   CSS
-   Google Inter font

### Backend

-   Python
-   FastAPI
-   LangGraph
-   LangChain
-   Groq
-   Pydantic
-   PyMuPDF

### Database

-   PostgreSQL
-   SQLAlchemy
-   Psycopg

## LLM Model Note

The original assignment specifies the Groq `gemma2-9b-it` model.

During implementation, that model was no longer available on the Groq
platform. The application therefore uses the currently configured Groq
model:

``` text
openai/gpt-oss-20b
```

The application still uses Groq as the LLM provider and keeps the same
structured-output workflow.

## API Endpoints

### Health Check

``` text
GET /health
```

### Analyze Complaint Text

``` text
POST /api/complaints/analyze-text
```

Request:

``` json
{
  "text": "Customer complaint text..."
}
```

The endpoint runs the complete LangGraph workflow and returns structured
complaint information, risk assessment, recommendations, and missing
information.

### Analyze Complaint PDF

``` text
POST /api/complaints/analyze-pdf
```

Accepts a PDF file, extracts its text using PyMuPDF, and sends the
extracted text through the same LangGraph workflow.

### Save Complaint

``` text
POST /api/complaints
```

Saves the reviewed complaint, risk assessment, and recommendations into
PostgreSQL.

## Database

The main database table is:

``` text
complaints
```

It stores:

-   Complaint source
-   Customer
-   Product information
-   Batch number
-   Dates
-   Quantity
-   Complaint type
-   Description
-   Severity
-   Priority
-   Risk level
-   Risk reason
-   Recommendations
-   Created timestamp

Example verification query:

``` sql
SELECT id, customer_name, product_name, batch_number,
       quantity_affected, risk_level
FROM complaints;
```

## Project Structure

``` text
ai-complaint-management-system/
|
+-- backend/
|   +-- app/
|       +-- agents/
|       |   +-- extraction.py
|       |   +-- validation.py
|       |   +-- risk.py
|       |   +-- recommendation.py
|       |   +-- graph.py
|       |   +-- state.py
|       |   +-- llm.py
|       |
|       +-- api/
|       |   +-- complaints.py
|       |
|       +-- database/
|       |   +-- database.py
|       |   +-- models.py
|       |   +-- init_db.py
|       |
|       +-- models/
|       |   +-- schemas.py
|       |
|       +-- services/
|           +-- pdf_parser.py
|       |
|       +-- main.py
|       +-- config.py
|   +-- tests/
|   +-- .env
|   +-- pyproject.toml
|
+-- frontend/
    +-- src/
        +-- store/
        |   +-- store.js
        |   +-- complaintSlice.js
        |
        +-- services/
        |   +-- api.js
        |
        +-- App.jsx
        +-- main.jsx
        +-- index.css
```

## Setup

### Backend

Go to the backend directory:

``` powershell
cd backend
```

Install dependencies using the project's configured environment:

``` powershell
uv sync
```

Create a `.env` file:

``` env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/ai_complaints
```

If the PostgreSQL password contains special URL characters such as `@`,
encode them. For example:

``` text
@ -> %40
```

Create the database if it does not already exist:

``` sql
CREATE DATABASE ai_complaints;
```

Initialize the complaint table:

``` powershell
uv run python -m app.database.init_db
```

Start the backend:

``` powershell
uv run uvicorn app.main:app --reload
```

Backend API:

``` text
http://127.0.0.1:8000
```

FastAPI documentation:

``` text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

``` powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

``` text
http://localhost:5173
```

## Example Complaint

The following complaint can be pasted into the application:

``` text
ABC Pharma reported that 25 bottles of Paracetamol Tablets 500 mg from batch PCM240812 arrived with damaged packaging. The customer noticed broken seals on several bottles and requested an investigation. The complaint was received through email on 10 September 2026. The affected product is currently being held for investigation.
```

Expected behavior:

-   Extract the product and batch information.
-   Identify the affected quantity.
-   Identify the packaging complaint.
-   Generate an initial risk assessment.
-   Generate investigation recommendations.
-   Show missing information when applicable.
-   Allow the user to review and edit the result.
-   Save the reviewed complaint to PostgreSQL.

## PDF Testing

A sample complaint PDF can be used to test the PDF workflow.

The PDF flow is:

``` text
PDF Upload
   |
   v
FastAPI
   |
   v
PyMuPDF Text Extraction
   |
   v
LangGraph
   |
   v
Groq
   |
   v
Structured Complaint Result
   |
   v
React Form
```

## Testing

The backend includes unit tests for the main workflow components.

Run:

``` powershell
cd backend
uv run pytest
```

The project also supports using a fake structured LLM in tests so that
the test suite does not require a real Groq API request for every test.

## Product / Engineering Decisions

### Why LangGraph?

LangGraph provides an explicit workflow where each stage has a focused
responsibility. This makes the extraction, validation, risk assessment,
and recommendation steps easier to understand and modify.

### Why structured output?

The frontend and database require predictable fields. Structured output
allows the LLM response to be mapped into a Pydantic schema instead of
relying on free-form text parsing.

### Why Redux?

The complaint form contains data produced by AI but editable by the
user. Redux provides a central state for the extracted complaint, risk
assessment, recommendations, loading state, and errors.

### Why PostgreSQL?

PostgreSQL provides relational persistence for structured complaint
records and is suitable for a system where complaint fields need to be
queried and stored consistently.

### Why human review before saving?

AI extraction and risk assessment can contain errors. The workflow
therefore keeps a human in the loop: AI proposes the information, the
user reviews or edits it, and only then is the complaint persisted.

## Scope

This implementation focuses on the complaint intake and initial triage
workflow required for the assignment.

Production-grade OCR, authentication, regulatory workflow approvals,
CAPA lifecycle management, audit trails, duplicate detection, and
enterprise QMS integrations are outside the current MVP scope.

## Security

Do not commit `.env` or API keys to GitHub.

The frontend does not contain the Groq API key. LLM access is handled by
the backend.

## Demo Flow

The recommended demonstration flow is:

1.  Open the application.
2.  Paste a pharmaceutical customer complaint.
3.  Run AI analysis.
4.  Show the extracted complaint fields.
5.  Show missing information if any.
6.  Show AI risk assessment.
7.  Show recommendations.
8.  Edit a field to demonstrate human review.
9.  Save the complaint.
10. Show the saved record in PostgreSQL.
11. Upload a complaint PDF and demonstrate the PDF workflow.
12. Walk through the React, FastAPI, LangGraph, and database code.

## Disclaimer

This project is an internship assignment prototype demonstrating
AI-assisted complaint intake and triage. AI-generated risk assessments
and recommendations are advisory and should not replace qualified QA,
regulatory, or QMS decisions.
