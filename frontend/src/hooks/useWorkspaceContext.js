import { useContext } from "react";
import { WorkspaceContext } from "../contexts/WorkspaceContext.jsx";

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
};
