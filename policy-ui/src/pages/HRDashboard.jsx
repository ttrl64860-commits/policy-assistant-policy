import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function HRDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDashboard();

    const savedDarkMode = JSON.parse(localStorage.getItem("hr_dark_mode"));
    if (typeof savedDarkMode === "boolean") {
      setDarkMode(savedDarkMode);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("hr_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/hr/dashboard");
      setDashboardData(res.data.data);
    } catch {
      setDashboardData("Failed to load HR dashboard");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadPDF = async () => {
    if (!selectedFile) {
      alert("Select PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);

      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data.message || "PDF Uploaded Successfully");
    } catch (error) {
      alert(error.response?.data?.detail || "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question.trim();

    const userMsg = {
      sender: "user",
      text: currentQuestion,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");

    try {
      setLoading(true);

      const res = await API.post("/ask", { question: currentQuestion });

      const botMsg = {
        sender: "bot",
        text: res.data.response || "No response received",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: error.response?.data?.detail || "Failed to get response",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const fillQuestion = (text) => {
    setQuestion(text);
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
                HR Policy Assistant
              </h1>
              <p style={darkMode ? styles.heroSubtitleDark : styles.heroSubtitleLight}>
                Upload company policy documents and ask intelligent HR questions in a clean, modern workspace.
              </p>
            </div>

            <div style={styles.heroRight}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={darkMode ? styles.toggleButtonDark : styles.toggleButtonLight}
              >
                {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
              </button>
              <div style={styles.heroBadge}>HR Panel</div>
            </div>
          </div>

          {dashboardData && (
            <div style={darkMode ? styles.dashboardBoxDark : styles.dashboardBoxLight}>
              <div style={styles.sectionTop}>
                <span style={styles.sectionIcon}>📊</span>
                <h3 style={darkMode ? styles.sectionTitleDark : styles.sectionTitleLight}>
                  Dashboard Status
                </h3>
              </div>
              <p style={darkMode ? styles.dashboardTextDark : styles.dashboardTextLight}>
                {typeof dashboardData === "string"
                  ? dashboardData
                  : JSON.stringify(dashboardData)}
              </p>
            </div>
          )}

          <div style={styles.grid}>
            <div style={darkMode ? styles.uploadSectionDark : styles.uploadSectionLight}>
              <div style={styles.sectionTop}>
                <span style={styles.sectionIcon}>📄</span>
                <h3 style={darkMode ? styles.sectionTitleDark : styles.sectionTitleLight}>
                  Upload Policy PDF
                </h3>
              </div>

              <p
                style={
                  darkMode ? styles.sectionDescriptionDark : styles.sectionDescriptionLight
                }
              >
                Upload your HR policy document so the assistant can answer questions from it.
              </p>

              <div style={styles.uploadInner}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={darkMode ? styles.fileInputDark : styles.fileInputLight}
                />

                <button
                  onClick={uploadPDF}
                  style={
                    uploading
                      ? styles.uploadButtonDisabled
                      : styles.uploadButton
                  }
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload PDF"}
                </button>
              </div>

              {selectedFile && (
                <div style={darkMode ? styles.filePreviewDark : styles.filePreviewLight}>
                  <span style={styles.filePreviewIcon}>✅</span>
                  <span
                    style={
                      darkMode
                        ? styles.filePreviewTextDark
                        : styles.filePreviewTextLight
                    }
                  >
                    {selectedFile.name}
                  </span>
                </div>
              )}
            </div>

            <div style={darkMode ? styles.tipCardDark : styles.tipCardLight}>
              <div style={styles.sectionTop}>
                <span style={styles.sectionIcon}>💡</span>
                <h3 style={darkMode ? styles.sectionTitleDark : styles.sectionTitleLight}>
                  Suggested Questions
                </h3>
              </div>

              <div style={styles.tipList}>
                <div
                  style={darkMode ? styles.tipItemDark : styles.tipItemLight}
                  onClick={() => fillQuestion("What is the leave policy?")}
                >
                  What is the leave policy?
                </div>
                <div
                  style={darkMode ? styles.tipItemDark : styles.tipItemLight}
                  onClick={() => fillQuestion("What is the dress code?")}
                >
                  What is the dress code?
                </div>
                <div
                  style={darkMode ? styles.tipItemDark : styles.tipItemLight}
                  onClick={() => fillQuestion("Can employees work overtime?")}
                >
                  Can employees work overtime?
                </div>
                <div
                  style={darkMode ? styles.tipItemDark : styles.tipItemLight}
                  onClick={() => fillQuestion("What are work from home rules?")}
                >
                  What are work from home rules?
                </div>
              </div>
            </div>
          </div>

          <div style={darkMode ? styles.chatSectionDark : styles.chatSectionLight}>
            <div style={styles.chatHeader}>
              <div style={styles.sectionTop}>
                <span style={styles.sectionIcon}>🤖</span>
                <h3 style={darkMode ? styles.sectionTitleDark : styles.sectionTitleLight}>
                  HR Chat Assistant
                </h3>
              </div>

              <button onClick={clearChat} style={styles.clearButton}>
                Clear Chat
              </button>
            </div>

            <div style={darkMode ? styles.chatBoxDark : styles.chatBoxLight}>
              {messages.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>✨</div>
                  <h2 style={darkMode ? styles.emptyTitleDark : styles.emptyTitleLight}>
                    Start Your HR Conversation
                  </h2>
                  <p style={darkMode ? styles.emptyTextDark : styles.emptyTextLight}>
                    Upload a PDF, then ask questions about leave, attendance, dress code, overtime, and company policies.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={
                      msg.sender === "user"
                        ? styles.userMessageWrapper
                        : styles.botMessageWrapper
                    }
                  >
                    <div
                      style={
                        msg.sender === "user"
                          ? styles.userMessage
                          : darkMode
                          ? styles.botMessageDark
                          : styles.botMessageLight
                      }
                    >
                      <div style={styles.messageLabel}>
                        {msg.sender === "user" ? "You" : "Assistant"}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div style={styles.botMessageWrapper}>
                  <div style={darkMode ? styles.botMessageDark : styles.botMessageLight}>
                    <div style={styles.messageLabel}>Assistant</div>
                    <div style={styles.typingWrap}>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                      <span style={styles.thinkingText}>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef}></div>
            </div>

            <div style={styles.inputArea}>
              <input
                type="text"
                placeholder="Ask HR question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askQuestion()}
                style={darkMode ? styles.inputDark : styles.inputLight}
              />
              <button
                onClick={askQuestion}
                style={loading ? styles.sendButtonDisabled : styles.sendButton}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send"}
              </button>
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
    width: "280px",
    height: "280px",
    background: "rgba(59, 130, 246, 0.22)",
    borderRadius: "50%",
    filter: "blur(80px)",
  },

  bgBlurOneLight: {
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "280px",
    height: "280px",
    background: "rgba(59, 130, 246, 0.16)",
    borderRadius: "50%",
    filter: "blur(80px)",
  },

  bgBlurTwoDark: {
    position: "absolute",
    bottom: "-80px",
    right: "-80px",
    width: "300px",
    height: "300px",
    background: "rgba(168, 85, 247, 0.22)",
    borderRadius: "50%",
    filter: "blur(90px)",
  },

  bgBlurTwoLight: {
    position: "absolute",
    bottom: "-80px",
    right: "-80px",
    width: "300px",
    height: "300px",
    background: "rgba(168, 85, 247, 0.14)",
    borderRadius: "50%",
    filter: "blur(90px)",
  },

  container: {
    maxWidth: "1100px",
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
    padding: "28px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(16px)",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
  },

  heroCardLight: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    padding: "28px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(16px)",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
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
    maxWidth: "700px",
    lineHeight: "1.6",
  },

  heroSubtitleLight: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#475569",
    maxWidth: "700px",
    lineHeight: "1.6",
  },

  heroRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  heroBadge: {
    padding: "10px 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
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

  dashboardBoxDark: {
    marginBottom: "20px",
    padding: "22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  dashboardBoxLight: {
    marginBottom: "20px",
    padding: "22px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  },

  dashboardTextDark: {
    color: "#e2e8f0",
    margin: "12px 0 0",
    lineHeight: "1.6",
  },

  dashboardTextLight: {
    color: "#334155",
    margin: "12px 0 0",
    lineHeight: "1.6",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
    marginBottom: "20px",
  },

  uploadSectionDark: {
    padding: "24px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  uploadSectionLight: {
    padding: "24px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  },

  tipCardDark: {
    padding: "24px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  tipCardLight: {
    padding: "24px",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  },

  sectionTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  sectionIcon: {
    fontSize: "20px",
  },

  sectionTitleDark: {
    margin: 0,
    color: "#ffffff",
    fontSize: "20px",
  },

  sectionTitleLight: {
    margin: 0,
    color: "#0f172a",
    fontSize: "20px",
  },

  sectionDescriptionDark: {
    color: "#cbd5e1",
    marginTop: "12px",
    lineHeight: "1.6",
  },

  sectionDescriptionLight: {
    color: "#475569",
    marginTop: "12px",
    lineHeight: "1.6",
  },

  uploadInner: {
    marginTop: "18px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  fileInputDark: {
    flex: 1,
    minWidth: "240px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
  },

  fileInputLight: {
    flex: 1,
    minWidth: "240px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px dashed #94a3b8",
    background: "#ffffff",
    color: "#0f172a",
  },

  uploadButton: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
  },

  uploadButtonDisabled: {
    background: "#64748b",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "not-allowed",
    fontWeight: "700",
  },

  filePreviewDark: {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(16,185,129,0.12)",
    border: "1px solid rgba(16,185,129,0.35)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  filePreviewLight: {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#ecfdf5",
    border: "1px solid #86efac",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  filePreviewIcon: {
    fontSize: "18px",
  },

  filePreviewTextDark: {
    color: "#d1fae5",
    wordBreak: "break-word",
  },

  filePreviewTextLight: {
    color: "#166534",
    wordBreak: "break-word",
  },

  tipList: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  tipItemDark: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    cursor: "pointer",
  },

  tipItemLight: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    cursor: "pointer",
  },

  chatSectionDark: {
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  chatSectionLight: {
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148,163,184,0.18)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
  },

  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    gap: "12px",
    flexWrap: "wrap",
  },

  clearButton: {
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  chatBoxDark: {
    height: "460px",
    overflowY: "auto",
    borderRadius: "20px",
    background: "rgba(15,23,42,0.65)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "20px",
    marginBottom: "18px",
  },

  chatBoxLight: {
    height: "460px",
    overflowY: "auto",
    borderRadius: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "20px",
    marginBottom: "18px",
  },

  emptyState: {
    textAlign: "center",
    marginTop: "100px",
  },

  emptyIcon: {
    fontSize: "52px",
    marginBottom: "10px",
  },

  emptyTitleDark: {
    margin: 0,
    color: "#ffffff",
    fontSize: "28px",
  },

  emptyTitleLight: {
    margin: 0,
    color: "#0f172a",
    fontSize: "28px",
  },

  emptyTextDark: {
    marginTop: "10px",
    color: "#cbd5e1",
    lineHeight: "1.6",
    maxWidth: "500px",
    marginInline: "auto",
  },

  emptyTextLight: {
    marginTop: "10px",
    color: "#475569",
    lineHeight: "1.6",
    maxWidth: "500px",
    marginInline: "auto",
  },

  userMessageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "14px",
  },

  botMessageWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "14px",
  },

  userMessage: {
    maxWidth: "75%",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    color: "white",
    padding: "14px 16px",
    borderRadius: "18px 18px 6px 18px",
    wordBreak: "break-word",
    boxShadow: "0 8px 18px rgba(59,130,246,0.25)",
  },

  botMessageDark: {
    maxWidth: "75%",
    background: "rgba(255,255,255,0.1)",
    color: "#f8fafc",
    padding: "14px 16px",
    borderRadius: "18px 18px 18px 6px",
    wordBreak: "break-word",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  botMessageLight: {
    maxWidth: "75%",
    background: "#ffffff",
    color: "#0f172a",
    padding: "14px 16px",
    borderRadius: "18px 18px 18px 6px",
    wordBreak: "break-word",
    border: "1px solid #e2e8f0",
  },

  messageLabel: {
    fontSize: "12px",
    fontWeight: "700",
    opacity: 0.8,
    marginBottom: "6px",
  },

  inputArea: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  inputDark: {
    flex: 1,
    minWidth: "250px",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.12)",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "15px",
  },

  inputLight: {
    flex: 1,
    minWidth: "250px",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    outline: "none",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "15px",
  },

  sendButton: {
    background: "linear-gradient(135deg, #10b981, #06b6d4)",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 8px 18px rgba(16,185,129,0.28)",
  },

  sendButtonDisabled: {
    background: "#64748b",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "14px",
    cursor: "not-allowed",
    fontWeight: "700",
  },

  typingWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#60a5fa",
    display: "inline-block",
  },

  thinkingText: {
    marginLeft: "8px",
    fontSize: "14px",
    opacity: 0.85,
  },
};

export default HRDashboard;