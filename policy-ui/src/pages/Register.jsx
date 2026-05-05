import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem("register_dark_mode"));
    if (typeof savedMode === "boolean") {
      setDarkMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("register_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await API.post("/register", form);
      alert("Registration Successful");
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.detail || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={darkMode ? styles.pageDark : styles.pageLight}>
      <div style={darkMode ? styles.bgOrbOneDark : styles.bgOrbOneLight}></div>
      <div style={darkMode ? styles.bgOrbTwoDark : styles.bgOrbTwoLight}></div>
      <div style={darkMode ? styles.bgOrbThreeDark : styles.bgOrbThreeLight}></div>

      <div style={styles.topBar}>
        <div style={darkMode ? styles.brandDark : styles.brandLight}>
          <span style={styles.brandIcon}>🛡️</span>
          <span>RBAC Portal</span>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={darkMode ? styles.modeBtnDark : styles.modeBtnLight}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={darkMode ? styles.cardDark : styles.cardLight}>
        <div style={styles.left}>
          <div style={styles.heroBadge}>Create Enterprise Account</div>

          <h1 style={styles.title}>
            Register for <br />
            Secure Role Access
          </h1>

          <p style={styles.subtitle}>
            Create your account and get access to the right dashboard based on
            your assigned role. Built for secure, professional enterprise use.
          </p>

          <div style={styles.roleGrid}>
            <div style={styles.roleCard}>
              <div style={styles.roleIcon}>👨‍💼</div>
              <div>
                <div style={styles.roleTitle}>Employee</div>
                <div style={styles.roleText}>Access personal workspace</div>
              </div>
            </div>

            <div style={styles.roleCard}>
              <div style={styles.roleIcon}>📊</div>
              <div>
                <div style={styles.roleTitle}>Manager</div>
                <div style={styles.roleText}>Team and performance access</div>
              </div>
            </div>

            <div style={styles.roleCard}>
              <div style={styles.roleIcon}>🧑‍💻</div>
              <div>
                <div style={styles.roleTitle}>HR</div>
                <div style={styles.roleText}>Policy and employee management</div>
              </div>
            </div>
          </div>

          <div style={styles.featureStrip}>
            <div style={styles.featureChip}>Smart UI</div>
            <div style={styles.featureChip}>Secure Access</div>
            <div style={styles.featureChip}>Role Control</div>
          </div>
        </div>

        <div style={darkMode ? styles.rightDark : styles.rightLight}>
          <div style={styles.formHeader}>
            <h2 style={darkMode ? styles.formTitleDark : styles.formTitleLight}>
              Create Account
            </h2>
            <p style={darkMode ? styles.formSubDark : styles.formSubLight}>
              Fill in your details to register
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={darkMode ? styles.labelDark : styles.labelLight}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                style={darkMode ? styles.inputDark : styles.inputLight}
                required
              />
            </div>

            <div>
              <label style={darkMode ? styles.labelDark : styles.labelLight}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                style={darkMode ? styles.inputDark : styles.inputLight}
                required
              />
            </div>

            <div>
              <label style={darkMode ? styles.labelDark : styles.labelLight}>
                Password
              </label>
              <div
                style={
                  darkMode ? styles.passwordWrapDark : styles.passwordWrapLight
                }
              >
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  style={darkMode ? styles.passwordInputDark : styles.passwordInputLight}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={darkMode ? styles.showBtnDark : styles.showBtnLight}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label style={darkMode ? styles.labelDark : styles.labelLight}>
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={darkMode ? styles.inputDark : styles.inputLight}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
              </select>
            </div>

            {message && (
              <div style={darkMode ? styles.errorBoxDark : styles.errorBoxLight}>
                {message}
              </div>
            )}

            <button
              type="submit"
              style={loading ? styles.buttonDisabled : styles.button}
              disabled={loading}
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>

          <p style={darkMode ? styles.loginTextDark : styles.loginTextLight}>
            Already have an account?{" "}
            <Link to="/" style={styles.link}>
              Login
            </Link>
          </p>

          <div style={darkMode ? styles.infoBoxDark : styles.infoBoxLight}>
            <p style={darkMode ? styles.infoTitleDark : styles.infoTitleLight}>
              Role-Based Registration
            </p>
            <p style={darkMode ? styles.infoTextDark : styles.infoTextLight}>
              Select a role during registration. After login, the system will
              route the user to the correct dashboard automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageDark: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #0f172a, #111827)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  pageLight: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eff6ff, #f8fafc, #eef2ff)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  bgOrbOneDark: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(124, 58, 237, 0.30)",
    filter: "blur(90px)",
  },

  bgOrbOneLight: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(124, 58, 237, 0.16)",
    filter: "blur(90px)",
  },

  bgOrbTwoDark: {
    position: "absolute",
    bottom: "-120px",
    right: "-100px",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(6, 182, 212, 0.28)",
    filter: "blur(100px)",
  },

  bgOrbTwoLight: {
    position: "absolute",
    bottom: "-120px",
    right: "-100px",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(6, 182, 212, 0.16)",
    filter: "blur(100px)",
  },

  bgOrbThreeDark: {
    position: "absolute",
    top: "35%",
    left: "45%",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.18)",
    filter: "blur(100px)",
  },

  bgOrbThreeLight: {
    position: "absolute",
    top: "35%",
    left: "45%",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.12)",
    filter: "blur(100px)",
  },

  topBar: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "1200px",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
    boxSizing: "border-box",
  },

  brandDark: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "18px",
  },

  brandLight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#0f172a",
    fontWeight: "700",
    fontSize: "18px",
  },

  brandIcon: {
    fontSize: "22px",
  },

  modeBtnDark: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    backdropFilter: "blur(10px)",
  },

  modeBtnLight: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  cardDark: {
    width: "100%",
    maxWidth: "1120px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    borderRadius: "28px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    position: "relative",
    zIndex: 2,
  },

  cardLight: {
    width: "100%",
    maxWidth: "1120px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    borderRadius: "28px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 60px rgba(15,23,42,0.10)",
    position: "relative",
    zIndex: 2,
  },

  left: {
    padding: "55px 42px",
    background: "linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroBadge: {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "22px",
    width: "fit-content",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  title: {
    margin: 0,
    fontSize: "38px",
    lineHeight: "1.2",
    fontWeight: "800",
  },

  subtitle: {
    marginTop: "18px",
    fontSize: "16px",
    lineHeight: "1.7",
    opacity: 0.95,
    maxWidth: "500px",
  },

  roleGrid: {
    marginTop: "28px",
    display: "grid",
    gap: "14px",
  },

  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.14)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  roleIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    flexShrink: 0,
  },

  roleTitle: {
    fontSize: "16px",
    fontWeight: "700",
  },

  roleText: {
    fontSize: "13px",
    opacity: 0.9,
    marginTop: "2px",
  },

  featureStrip: {
    marginTop: "26px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  featureChip: {
    padding: "9px 14px",
    background: "rgba(255,255,255,0.16)",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.14)",
  },

  rightDark: {
    padding: "50px 38px",
    background: "rgba(2,6,23,0.45)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  rightLight: {
    padding: "50px 38px",
    background: "rgba(255,255,255,0.70)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  formHeader: {
    marginBottom: "24px",
  },

  formTitleDark: {
    margin: 0,
    fontSize: "30px",
    color: "#ffffff",
    fontWeight: "800",
  },

  formTitleLight: {
    margin: 0,
    fontSize: "30px",
    color: "#111827",
    fontWeight: "800",
  },

  formSubDark: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#cbd5e1",
    fontSize: "14px",
  },

  formSubLight: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  labelDark: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#e5e7eb",
  },

  labelLight: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  inputDark: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.10)",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
  },

  inputLight: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
  },

  passwordWrapDark: {
    display: "flex",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "14px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.06)",
  },

  passwordWrapLight: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#ffffff",
  },

  passwordInputDark: {
    flex: 1,
    padding: "15px 16px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "transparent",
    color: "#ffffff",
  },

  passwordInputLight: {
    flex: 1,
    padding: "15px 16px",
    border: "none",
    outline: "none",
    fontSize: "15px",
    background: "transparent",
    color: "#111827",
  },

  showBtnDark: {
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    padding: "15px 16px",
    cursor: "pointer",
    fontWeight: "700",
  },

  showBtnLight: {
    border: "none",
    background: "#f3f4f6",
    color: "#111827",
    padding: "15px 16px",
    cursor: "pointer",
    fontWeight: "700",
  },

  button: {
    marginTop: "6px",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(37,99,235,0.28)",
  },

  buttonDisabled: {
    marginTop: "6px",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: "#64748b",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "not-allowed",
  },

  errorBoxDark: {
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(239,68,68,0.14)",
    border: "1px solid rgba(239,68,68,0.30)",
    color: "#fecaca",
    fontSize: "14px",
  },

  errorBoxLight: {
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: "14px",
  },

  loginTextDark: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#cbd5e1",
  },

  loginTextLight: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#4b5563",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "700",
  },

  infoBoxDark: {
    marginTop: "24px",
    padding: "18px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  infoBoxLight: {
    marginTop: "24px",
    padding: "18px",
    background: "#f8fafc",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
  },

  infoTitleDark: {
    margin: 0,
    fontWeight: "800",
    color: "#ffffff",
  },

  infoTitleLight: {
    margin: 0,
    fontWeight: "800",
    color: "#111827",
  },

  infoTextDark: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#cbd5e1",
    lineHeight: "1.6",
  },

  infoTextLight: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
  },
};

export default Register;