import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setAccessToken } from "./slices/authSlice.js";
import workspaceReducer from "./slices/workspaceSlice.js";
import { setOnTokenRefreshed } from "../configs/api.config.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
  },
});

setOnTokenRefreshed((token) => {
  store.dispatch(setAccessToken(token));
});
