import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 180000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ API Request URL:", config.url);
    console.log("➡️ API Method:", config.method);
    console.log("➡️ API Data:", config.data);

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Response Error");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);

      if (error.response.status === 401) {
        localStorage.removeItem("token");
        console.warn("⚠️ Unauthorized. Please login again.");
      }
    } else if (error.request) {
      console.error("No response received from backend:", error.request);
    } else {
      console.error("Axios Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;