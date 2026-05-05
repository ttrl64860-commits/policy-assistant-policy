import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import Unauthorized from "./pages/Unauthorized";
import ChatAssistant from "./pages/ChatAssistant";

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/employee"
          element={
            <PrivateRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/hr"
          element={
            <PrivateRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute allowedRoles={["EMPLOYEE", "HR", "MANAGER"]}>
              <ChatAssistant />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
}

export default App;