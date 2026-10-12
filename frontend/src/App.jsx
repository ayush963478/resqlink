import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import RequesterDashboard from "./pages/RequesterDashboard.jsx";
import CreateRequest from "./pages/CreateRequest.jsx";
import ResourceSearch from "./pages/ResourceSearch.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import CoordinatorDashboard from "./pages/CoordinatorDashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Notifications from "./pages/Notifications.jsx";
import History from "./pages/History.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function RoleHome() {
  const { user } = useAuth();
  switch (user?.role) {
    case "provider":
      return <ProviderDashboard />;
    case "coordinator":
      return <CoordinatorDashboard />;
    case "administrator":
      return <AdminPanel />;
    default:
      return <RequesterDashboard />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout>
              <RoleHome />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/requests/new"
        element={
          <ProtectedRoute roles={["requester"]}>
            <Layout>
              <CreateRequest />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/resources"
        element={
          <ProtectedRoute roles={["requester"]}>
            <Layout>
              <ResourceSearch />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
