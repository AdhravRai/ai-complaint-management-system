import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    complaint_source: "",
    customer_name: "",

    product_name: "",
    product_strength: "",
    batch_number: "",
    manufacturing_date: "",
    expiry_date: "",
    quantity_affected: "",
    quantity_unit: "",

    complaint_type: "",
    complaint_date: "",
    description: "",
  },

  riskAssessment: {
    severity: "",
    priority: "",
    risk_level: "",
    reason: "",
  },

  recommendations: [],
  missingInformation: [],

  loading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,

  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    },

    setAnalysisResult: (state, action) => {
      const result = action.payload;

      state.formData = {
        ...state.formData,
        ...result.complaint,
      };

      state.riskAssessment = result.risk_assessment;
      state.recommendations = result.recommendations;
      state.missingInformation = result.missing_information;
      state.loading = false;
      state.error = null;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    resetComplaint: () => initialState,
  },
});

export const {
  updateFormField,
  setAnalysisResult,
  setLoading,
  setError,
  resetComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;