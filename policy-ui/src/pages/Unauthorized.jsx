import React from "react";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  const goDashboard = () => {
    const role = localStorage.getItem("role");

    if (role === "EMPLOYEE") {
      navigate("/employee");
    } else if (role === "HR") {
      navigate("/hr");
    } else if (role === "MANAGER") {
      navigate("/manager");
    } else {
      navigate("/");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>403</h1>
        <h2 style={styles.subtitle}>Access Denied</h2>
        <p style={styles.text}>
          You don’t have permission to access this page.
        </p>

        <div style={styles.buttonGroup}>
          <button onClick={goDashboard} style={styles.primaryBtn}>
            Go to Dashboard
          </button>

          <button onClick={goHome} style={styles.secondaryBtn}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #fef2f2, #f8fafc)",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    textAlign: "center",
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "400px",
    width: "90%",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "50px",
    color: "#dc2626",
  },
  subtitle: {
    margin: "10px 0",
    fontSize: "22px",
  },
  text: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  secondaryBtn: {
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    background: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Unauthorized;