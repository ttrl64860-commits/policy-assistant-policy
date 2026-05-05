import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goDashboard = () => {
    if (role === "EMPLOYEE") navigate("/employee");
    else if (role === "HR") navigate("/hr");
    else if (role === "MANAGER") navigate("/manager");
  };

  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <h3 style={styles.logo}>Policy AI</h3>

        <div style={styles.links}>
          <span
            onClick={goDashboard}
            style={
              location.pathname.includes(role?.toLowerCase())
                ? styles.activeLink
                : styles.link
            }
          >
            Dashboard
          </span>

          <span
            onClick={() => navigate("/chat")}
            style={
              location.pathname === "/chat"
                ? styles.activeLink
                : styles.link
            }
          >
            Chat
          </span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.userBox}>
          <div style={styles.avatar}>
            {name ? name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div style={styles.name}>{name}</div>
            <div style={styles.role}>{role}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 25px",
    background: "#111827",
    color: "#fff",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },

  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
  },

  links: {
    display: "flex",
    gap: "20px",
  },

  link: {
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: "14px",
  },

  activeLink: {
    cursor: "pointer",
    color: "#fff",
    fontWeight: "600",
    borderBottom: "2px solid #06b6d4",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#06b6d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  name: {
    fontSize: "14px",
    fontWeight: "600",
  },

  role: {
    fontSize: "12px",
    color: "#9ca3af",
  },

  button: {
    padding: "8px 14px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Navbar;