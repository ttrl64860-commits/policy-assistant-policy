import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import ChatAssistant from "./ChatAssistant";

function ManagerDashboard() {
  const [data, setData] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetchDashboard();

    const savedDarkMode = JSON.parse(localStorage.getItem("manager_dark_mode"));
    if (typeof savedDarkMode === "boolean") {
      setDarkMode(savedDarkMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("manager_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/manager/dashboard");
      setData(res.data.data);
    } catch (error) {
      setData("Failed to load manager dashboard");
    }
  };

  return (
    <>
      <Navbar />

      <div style={darkMode ? styles.pageDark : styles.pageLight}>
        <div style={darkMode ? styles.bgBlurOneDark : styles.bgBlurOneLight}></div>
        <div style={darkMode ? styles.bgBlurTwoDark : styles.bgBlurTwoLight}></div>

        <div style={styles.container}>
          <div style={darkMode ? styles.heroCardDark : styles.heroCardLight}>
            <div>
              <h1 style={darkMode ? styles.heroTitleDark : styles.heroTitleLight}>
                Manager Dashboard
              </h1>
              <p style={darkMode ? styles.heroSubtitleDark : styles.heroSubtitleLight}>
                View manager dashboard details and interact with the assistant in one place.
              </p>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={darkMode ? styles.toggleButtonDark : styles.toggleButtonLight}
            >
              {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>

          <div style={darkMode ? styles.infoBoxDark : styles.infoBoxLight}>
            <div style={styles.sectionTop}>
              <span style={styles.sectionIcon}>📋</span>
              <h2 style={darkMode ? styles.headingDark : styles.headingLight}>
                Dashboard Status
              </h2>
            </div>

            <p style={darkMode ? styles.textDark : styles.textLight}>
              {typeof data === "string" ? data : JSON.stringify(data)}
            </p>
          </div>

          <div style={darkMode ? styles.chatWrapperDark : styles.chatWrapperLight}>
            <div style={styles.sectionTop}>
              <span style={styles.sectionIcon}>🤖</span>
              <h2 style={darkMode ? styles.headingDark : styles.headingLight}>
                Manager Assistant
              </h2>
            </div>

            <div style={styles.chatSection}>
              <ChatAssistant />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  pageDark: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #111827, #1e293b)",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  pageLight: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eff6ff, #f8fafc, #eef2ff)",
    padding: "30px 20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
  },

  bgBlurOneDark: {
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "260px",
    height: "260px",
    background: "rgba(59, 130, 246, 0.22)",
    borderRadius: "50%",
    filter: "blur(80px)",
  },

  bgBlurOneLight: {
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "260px",
    height: "260px",
    background: "rgba(59, 130, 246, 0.14)",
    borderRadius: "50%",
    filter: "blur(80px)",
  },

  bgBlurTwoDark: {
    position: "absolute",
    bottom: "-80px",
    right: "-80px",
    width: "280px",
    height: "280px",
    background: "rgba(168, 85, 247, 0.22)",
    borderRadius: "50%",
    filter: "blur(90px)",
  },

  bgBlurTwoLight: {
    position: "absolute",
    bottom: "-80px",
    right: "-80px",
    width: "280px",
    height: "280px",
    background: "rgba(168, 85, 247, 0.12)",
    borderRadius: "50%",
    filter: "blur(90px)",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  heroCardDark: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    padding: "26px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
  },

  heroCardLight: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    padding: "26px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(15,23,42,0.07)",
  },

  heroTitleDark: {
    margin: 0,
    color: "#ffffff",
    fontSize: "32px",
    fontWeight: "700",
  },

  heroTitleLight: {
    margin: 0,
    color: "#0f172a",
    fontSize: "32px",
    fontWeight: "700",
  },

  heroSubtitleDark: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#cbd5e1",
    lineHeight: "1.6",
  },

  heroSubtitleLight: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#475569",
    lineHeight: "1.6",
  },

  toggleButtonDark: {
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  toggleButtonLight: {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  infoBoxDark: {
    marginBottom: "20px",
    padding: "22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  infoBoxLight: {
    marginBottom: "20px",
    padding: "22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.07)",
  },

  chatWrapperDark: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  chatWrapperLight: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.07)",
  },

  sectionTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  sectionIcon: {
    fontSize: "20px",
  },

  headingDark: {
    margin: 0,
    color: "#ffffff",
    fontSize: "22px",
  },

  headingLight: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
  },

  textDark: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: "1.7",
  },

  textLight: {
    margin: 0,
    color: "#334155",
    lineHeight: "1.7",
  },

  chatSection: {
    marginTop: "8px",
  },
};

export default ManagerDashboard;