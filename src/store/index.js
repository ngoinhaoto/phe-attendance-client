import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
// import classesReducer from "../features/classes/classesSlice";
// import attendanceReducer from "../features/attendance/attendanceSlice";
import pheReducer from "../features/phe/pheSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    phe: pheReducer,
  },
});

export default store;
