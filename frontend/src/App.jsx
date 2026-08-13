import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";

// Auth & Admin Pages
import { LoginPage } from "./pages/auth/LoginPage.jsx";
import { BootstrapAdminPage } from "./pages/auth/BootstrapAdminPage.jsx";
import { PlatformAdminPage } from "./pages/admin/PlatformAdminPage.jsx";

// App Pages
import { DashboardPage } from "./pages/app/DashboardPage.jsx";
import { OrganizationsPage } from "./pages/app/OrganizationsPage.jsx";
import { WorkspacesPage } from "./pages/app/WorkspacesPage.jsx";
import { MembersPage } from "./pages/app/MembersPage.jsx";
import { RolesPage } from "./pages/app/RolesPage.jsx";
import { SettingsPage } from "./pages/app/SettingsPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth & Setup Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup/admin" element={<BootstrapAdminPage />} />

          {/* Protected Platform Admin Route */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<PlatformAdminPage />} />

            {/* Main Application Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="organizations" element={<OrganizationsPage />} />
              <Route path="workspaces" element={<WorkspacesPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
