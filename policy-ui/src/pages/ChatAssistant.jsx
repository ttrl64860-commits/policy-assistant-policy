import React, { useState, useRef, useEffect } from "react";
import API from "../api";
import Navbar from "../components/Navbar";

function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [provider, setProvider] = useState(
    localStorage.getItem("llmProvider") || "ollama"
  );

  const chatEndRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatHistory"));
    const savedDarkMode = JSON.parse(localStorage.getItem("darkMode"));

    if (savedMessages && Array.isArray(savedMessages)) {
      setMessages(savedMessages);
    }

    if (typeof savedDarkMode === "boolean") {
      setDarkMode(savedDarkMode);
    }

    fetchSuggestions();
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("llmProvider", provider);
  }, [provider]);

  useEffect(() => {
    return () => {
      if (typingRef.current) {
        clearInterval(typingRef.current);
      }
    };
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await API.get("/suggestions");
      setSampleQuestions(res.data.questions || []);
    } catch (error) {
      console.error("Failed to load suggestions", error);
      setSampleQuestions([
        "What is the leave policy?",
        "What is the attendance policy?",
        "What is the dress code policy?",
        "What is the notice period?",
      ]);
    }
  };

  const getTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeEffect = (text, time, usedProvider = provider) => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
    }

    let i = 0;
    let temp = "";

    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "", time, provider: usedProvider },
    ]);

    typingRef.current = setInterval(() => {
      if (i < text.length) {
        temp += text[i];

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (lastIndex >= 0 && updated[lastIndex].role === "bot") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: temp,
              provider: usedProvider,
            };
          }

          return updated;
        });

        i++;
      } else {
        clearInterval(typingRef.current);
      }
    }, 12);
  };

  const askAI = async (customQuestion = null) => {
    const currentInput = customQuestion || input.trim();

    if (!currentInput || loading) return;

    const userMessage = {
      role: "user",
      text: currentInput,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/ask", {
        question: currentInput,
        provider: provider,
      });

      const reply =
        res.data?.response ||
        "The document does not contain enough information about this.";

      const usedProvider = res.data?.llm_provider || provider;

      typeEffect(reply, getTime(), usedProvider);
    } catch (error) {
      console.error("Ask API error:", error);

      const errorMessage =
        error?.response?.data?.detail ||
        "Backend error! Please check FastAPI server.";

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: errorMessage,
          time: getTime(),
          provider,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
    }
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const newChat = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
    }
    setMessages([]);
    setInput("");
  };

  return (
    <>
      <Navbar />
      <div style={darkMode ? styles.darkBg : styles.lightBg}>
        <div style={styles.appWrapper}>
          <div style={darkMode ? styles.sidebarDark : styles.sidebarLight}>
            <div style={styles.logoBox}>
              <div style={styles.logoCircle}>🤖</div>
              <div>
                <h3 style={styles.logoTitle}>Policy Assistant</h3>
                <p style={darkMode ? styles.logoSubDark : styles.logoSubLight}>
                  Smart HR Chat
                </p>
              </div>
            </div>

            <div style={styles.providerBox}>
              <div style={styles.sectionTitle}>AI Provider</div>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={darkMode ? styles.providerDark : styles.providerLight}
              >
                <option value="ollama">Ollama Offline</option>
                <option value="groq">Groq Online</option>
                <option value="openai">OpenAI Online</option>
              </select>
            </div>

            <button
              onClick={newChat}
              style={darkMode ? styles.newChatDark : styles.newChatLight}
            >
              + New Chat
            </button>

            <button
              onClick={clearAll}
              style={darkMode ? styles.clearBtnDark : styles.clearBtnLight}
            >
              Clear History
            </button>

            <button
              onClick={fetchSuggestions}
              style={darkMode ? styles.refreshBtnDark : styles.refreshBtnLight}
            >
              Refresh Questions
            </button>

            <div style={styles.sectionTitle}>Quick Questions</div>
            <div style={styles.quickList}>
              {sampleQuestions.length === 0 ? (
                <div
                  style={darkMode ? styles.emptyTextDark : styles.emptyTextLight}
                >
                  No suggestions available
                </div>
              ) : (
                sampleQuestions.map((q, index) => (
                  <div
                    key={index}
                    style={darkMode ? styles.quickItemDark : styles.quickItemLight}
                    onClick={() => askAI(q)}
                  >
                    {q}
                  </div>
                ))
              )}
            </div>

            <div style={styles.sectionTitle}>Recent History</div>
            <div style={styles.historyList}>
              {messages.length === 0 ? (
                <div
                  style={darkMode ? styles.emptyTextDark : styles.emptyTextLight}
                >
                  No chat history
                </div>
              ) : (
                messages
                  .filter((msg) => msg.role === "user")
                  .slice()
                  .reverse()
                  .map((msg, index) => (
                    <div
                      key={index}
                      style={
                        darkMode
                          ? styles.historyItemDark
                          : styles.historyItemLight
                      }
                      onClick={() => setInput(msg.text)}
                    >
                      <div style={styles.historyText}>
                        {msg.text.length > 28
                          ? msg.text.substring(0, 28) + "..."
                          : msg.text}
                      </div>
                      <div style={styles.historyTime}>{msg.time}</div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div style={styles.mainArea}>
            <div style={darkMode ? styles.headerDark : styles.headerLight}>
              <div>
                <h2 style={styles.headerTitle}>Company Policy Assistant</h2>
                <p style={darkMode ? styles.headerSubDark : styles.headerSubLight}>
                  Ask anything about leave, attendance, overtime, dress code, and
                  company rules
                </p>
              </div>

              <div style={styles.headerActions}>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  style={darkMode ? styles.providerDark : styles.providerLight}
                >
                  <option value="ollama">Ollama Offline</option>
                  <option value="groq">Groq Online</option>
                  <option value="openai">OpenAI Online</option>
                </select>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  style={darkMode ? styles.toggleDark : styles.toggleLight}
                >
                  {darkMode ? "☀ Light" : "🌙 Dark"}
                </button>
              </div>
            </div>

            <div style={darkMode ? styles.chatDark : styles.chatLight}>
              {messages.length === 0 && (
                <div style={styles.welcomeBox}>
                  <div style={styles.welcomeIcon}>✨</div>
                  <h2 style={styles.welcomeTitle}>Welcome</h2>
                  <p
                    style={
                      darkMode ? styles.welcomeSubDark : styles.welcomeSubLight
                    }
                  >
                    Start chatting with your AI policy assistant.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={
                    msg.role === "user"
                      ? styles.messageRowUser
                      : styles.messageRowBot
                  }
                >
                  <div
                    style={
                      msg.role === "user"
                        ? darkMode
                          ? styles.userBubbleDark
                          : styles.userBubbleLight
                        : darkMode
                        ? styles.botBubbleDark
                        : styles.botBubbleLight
                    }
                  >
                    <div style={styles.msgRole}>
                      {msg.role === "user" ? "You" : "Assistant"}
                    </div>

                    <div style={styles.msgText}>{msg.text}</div>

                    {msg.role === "bot" && msg.provider && (
                      <div style={styles.providerTag}>
                        ⚡ Provider: {msg.provider}
                      </div>
                    )}

                    <div style={styles.msgTime}>{msg.time}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={styles.messageRowBot}>
                  <div
                    style={darkMode ? styles.botBubbleDark : styles.botBubbleLight}
                  >
                    <div style={styles.msgRole}>Assistant</div>
                    <div style={styles.typingWrap}>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                      <span style={styles.dot}></span>
                      <span style={styles.thinkingText}>
                        Thinking with {provider}...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef}></div>
            </div>

            <div
              style={
                darkMode ? styles.inputSectionDark : styles.inputSectionLight
              }
            >
              <input
                style={darkMode ? styles.inputDark : styles.inputLight}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask policy question..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    askAI();
                  }
                }}
              />

              <button
                style={loading ? styles.buttonDisabled : styles.button}
                onClick={() => askAI()}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send 🚀"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  darkBg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #0f172a, #111827)",
    padding: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  lightBg: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #fffaf5 0%, #fdf2f8 35%, #eef4ff 70%, #f8fafc 100%)",
    padding: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },

  appWrapper: {
    display: "flex",
    gap: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "92vh",
    flexWrap: "wrap",
  },

  sidebarDark: {
    width: "290px",
    background: "rgba(15, 23, 42, 0.72)",
    color: "#e2e8f0",
    borderRadius: "26px",
    padding: "20px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  sidebarLight: {
    width: "290px",
    background: "rgba(255,255,255,0.72)",
    color: "#1e293b",
    borderRadius: "26px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(148, 163, 184, 0.18)",
    display: "flex",
    flexDirection: "column",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  logoCircle: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.35)",
  },

  logoTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "0.3px",
  },

  logoSubDark: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#cbd5e1",
  },

  logoSubLight: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  providerBox: {
    marginBottom: "14px",
  },

  providerDark: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "12px 14px",
    background: "#1e293b",
    color: "#fff",
    fontWeight: "700",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },

  providerLight: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px 14px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: "700",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  newChatDark: {
    padding: "13px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    marginBottom: "10px",
    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)",
  },

  newChatLight: {
    padding: "13px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
    marginBottom: "10px",
    boxShadow: "0 8px 22px rgba(236, 72, 153, 0.22)",
  },

  clearBtnDark: {
    padding: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    background: "rgba(30, 41, 59, 0.9)",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "10px",
  },

  clearBtnLight: {
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.85)",
    color: "#0f172a",
    cursor: "pointer",
    marginBottom: "10px",
    boxShadow: "0 4px 12px rgba(148, 163, 184, 0.12)",
  },

  refreshBtnDark: {
    padding: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "18px",
  },

  refreshBtnLight: {
    padding: "12px",
    border: "1px solid #dbeafe",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #eff6ff, #ede9fe)",
    color: "#4338ca",
    cursor: "pointer",
    marginBottom: "18px",
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "800",
    marginBottom: "10px",
    marginTop: "8px",
    letterSpacing: "0.3px",
  },

  quickList: {
    marginBottom: "18px",
  },

  quickItemDark: {
    padding: "11px 13px",
    background: "rgba(30, 41, 59, 0.95)",
    borderRadius: "14px",
    marginBottom: "8px",
    cursor: "pointer",
    color: "#e2e8f0",
    fontSize: "14px",
    border: "1px solid rgba(255,255,255,0.04)",
  },

  quickItemLight: {
    padding: "11px 13px",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    borderRadius: "14px",
    marginBottom: "8px",
    cursor: "pointer",
    color: "#0f172a",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(148, 163, 184, 0.08)",
  },

  historyList: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "4px",
  },

  historyItemDark: {
    padding: "12px",
    background: "rgba(30, 41, 59, 0.95)",
    borderRadius: "16px",
    marginBottom: "10px",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.04)",
  },

  historyItemLight: {
    padding: "12px",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    borderRadius: "16px",
    marginBottom: "10px",
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(148, 163, 184, 0.08)",
  },

  historyText: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "4px",
  },

  historyTime: {
    fontSize: "12px",
    opacity: 0.7,
  },

  emptyTextDark: {
    color: "#94a3b8",
    fontSize: "14px",
  },

  emptyTextLight: {
    color: "#64748b",
    fontSize: "14px",
  },

  mainArea: {
    flex: 1,
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
  },

  headerDark: {
    background: "rgba(15, 23, 42, 0.72)",
    color: "#fff",
    borderRadius: "26px",
    padding: "20px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
  },

  headerLight: {
    background: "rgba(255,255,255,0.72)",
    color: "#111",
    borderRadius: "26px",
    padding: "20px",
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.16)",
  },

  headerTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.3px",
  },

  headerSubDark: {
    margin: "6px 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
  },

  headerSubLight: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  toggleDark: {
    border: "none",
    borderRadius: "16px",
    padding: "12px 16px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #334155, #1e293b)",
    color: "#fff",
    fontWeight: "700",
  },

  toggleLight: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "12px 16px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    color: "#111",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(148, 163, 184, 0.12)",
  },

  chatDark: {
    flex: 1,
    background: "rgba(15, 23, 42, 0.62)",
    borderRadius: "26px",
    padding: "20px",
    overflowY: "auto",
    minHeight: "500px",
    maxHeight: "500px",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
  },

  chatLight: {
    flex: 1,
    background: "rgba(255,255,255,0.76)",
    borderRadius: "26px",
    padding: "20px",
    overflowY: "auto",
    minHeight: "500px",
    maxHeight: "500px",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.16)",
  },

  welcomeBox: {
    textAlign: "center",
    marginTop: "100px",
  },

  welcomeIcon: {
    fontSize: "52px",
    marginBottom: "10px",
  },

  welcomeTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
  },

  welcomeSubDark: {
    color: "#cbd5e1",
    marginTop: "8px",
    fontSize: "15px",
  },

  welcomeSubLight: {
    color: "#64748b",
    marginTop: "8px",
    fontSize: "15px",
  },

  messageRowUser: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "14px",
  },

  messageRowBot: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "14px",
  },

  userBubbleDark: {
    maxWidth: "75%",
    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "22px 22px 8px 22px",
    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.28)",
  },

  userBubbleLight: {
    maxWidth: "75%",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "22px 22px 8px 22px",
    boxShadow: "0 8px 20px rgba(236, 72, 153, 0.22)",
  },

  botBubbleDark: {
    maxWidth: "75%",
    background: "rgba(30, 41, 59, 0.95)",
    color: "#f8fafc",
    padding: "14px 16px",
    borderRadius: "22px 22px 22px 8px",
    border: "1px solid rgba(255,255,255,0.05)",
  },

  botBubbleLight: {
    maxWidth: "75%",
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    color: "#111827",
    padding: "14px 16px",
    borderRadius: "22px 22px 22px 8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 10px rgba(148, 163, 184, 0.08)",
  },

  msgRole: {
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "6px",
    opacity: 0.8,
  },

  msgText: {
    fontSize: "15px",
    lineHeight: "1.7",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  providerTag: {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: "700",
    opacity: 0.8,
  },

  msgTime: {
    fontSize: "11px",
    marginTop: "8px",
    opacity: 0.7,
    textAlign: "right",
  },

  inputSectionDark: {
    marginTop: "18px",
    background: "rgba(15, 23, 42, 0.72)",
    borderRadius: "26px",
    padding: "16px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
  },

  inputSectionLight: {
    marginTop: "18px",
    background: "rgba(255,255,255,0.76)",
    borderRadius: "26px",
    padding: "16px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 10px 30px rgba(148, 163, 184, 0.16)",
  },

  inputDark: {
    flex: 1,
    minWidth: "240px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    outline: "none",
    fontSize: "15px",
    background: "#1e293b",
    color: "#fff",
  },

  inputLight: {
    flex: 1,
    minWidth: "240px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: "15px",
    background: "#ffffff",
    color: "#111827",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
  },

  button: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #ec4899, #8b5cf6, #6366f1)",
    color: "#fff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    minWidth: "130px",
    boxShadow: "0 10px 24px rgba(139, 92, 246, 0.28)",
  },

  buttonDisabled: {
    padding: "14px 22px",
    border: "none",
    borderRadius: "16px",
    background: "#94a3b8",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "not-allowed",
    minWidth: "130px",
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
    background: "#8b5cf6",
    display: "inline-block",
  },

  thinkingText: {
    marginLeft: "8px",
    fontSize: "14px",
    opacity: 0.8,
  },
};

export default ChatAssistant;