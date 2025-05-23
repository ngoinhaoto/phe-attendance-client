import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../api/authService";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, thunkAPI) => {
    try {
      const user = await authService.login(username, password);
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  authService.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
