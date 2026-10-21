import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import "./index.css";
import Home from "./components/Home";
import Auth from "./components/Auth";

// Attach JWT token to all backend API requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const App = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkUserAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const res = await axios.get("/me");
      if (res.data && res.data.success && res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthenticated(false);
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();

    const handleAuthChange = () => {
      checkUserAuth();
    };
    window.addEventListener("stockpilot_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("stockpilot_auth_changed", handleAuthChange);
    };
  }, [checkUserAuth]);

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>Loading StockPilot Dashboard...</span>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Auth
        onAuthSuccess={() => {
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
