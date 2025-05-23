import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// import classesReducer from "../features/classes/classesSlice";
// import attendanceReducer from "../features/attendance/attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
