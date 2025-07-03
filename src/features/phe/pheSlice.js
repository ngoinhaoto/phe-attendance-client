import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import pheService from "../../api/pheService";

export const checkPHEStatus = createAsyncThunk("phe/checkStatus", async () => {
  try {
    const isEnabled = await pheService.isPHEEnabled();
    return isEnabled ? "enabled" : "disabled";
  } catch (error) {
    console.error("Error checking PHE status:", error);
    return "error";
  }
});

const pheSlice = createSlice({
  name: "phe",
  initialState: {
    status: "checking",
    lastChecked: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkPHEStatus.pending, (state) => {
        state.status = "checking";
      })
      .addCase(checkPHEStatus.fulfilled, (state, action) => {
        state.status = action.payload;
        state.lastChecked = Date.now();
      })
      .addCase(checkPHEStatus.rejected, (state) => {
        state.status = "error";
      });
  },
});

export default pheSlice.reducer;
