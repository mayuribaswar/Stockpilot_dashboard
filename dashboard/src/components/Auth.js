import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp && !trimmedName) {
      setError("Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      const endpoint = isSignUp ? "/register" : "/login";
      const payload = isSignUp
        ? { name: trimmedName, email: trimmedEmail, password: trimmedPassword }
        : { email: trimmedEmail, password: trimmedPassword };

      const res = await axios.post(endpoint, payload);

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user, res.data.token);
      } else {
        setError(res.data?.message || "Authentication failed.");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to authenticate. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);

    const demoEmail = "demo@stockpilot.com";
    const demoPassword = "password123";

    try {
      // Try login first
      const loginRes = await axios.post("/login", {
        email: demoEmail,
        password: demoPassword,
      });

      if (loginRes.data && loginRes.data.token) {
        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        onAuthSuccess(loginRes.data.user, loginRes.data.token);
        return;
      }
    } catch {
      // If user doesn't exist yet, auto-register demo user
      try {
        const regRes = await axios.post("/register", {
          name: "Demo Investor",
          email: demoEmail,
          password: demoPassword,
        });

        if (regRes.data && regRes.data.token) {
          localStorage.setItem("token", regRes.data.token);
          localStorage.setItem("user", JSON.stringify(regRes.data.user));
          onAuthSuccess(regRes.data.user, regRes.data.token);
          return;
        }
      } catch (regErr) {
        setError(regErr.response?.data?.message || "Demo login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-logo-circle">
            <TrendingUpRoundedIcon fontSize="large" />
          </div>
          <div className="auth-brand-text">
            <h2>StockPilot</h2>
            <span>Portfolio & Stock Trading Dashboard</span>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${!isSignUp ? "active" : ""}`}
            onClick={() => {
              setIsSignUp(false);
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${isSignUp ? "active" : ""}`}
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }}
          >
            Create Account
          </button>
        </div>

        <div className="auth-heading">
          <h3>{isSignUp ? "Create your account" : "Welcome back"}</h3>
          <p>
            {isSignUp
              ? "Register to access your personal stock portfolio & holdings"
              : "Enter your credentials to access your trading dashboard"}
          </p>
        </div>

        {/* Demo Fast Access Button */}
        <button
          type="button"
          className="demo-login-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <BoltRoundedIcon className="demo-icon" />
          <span>Quick Demo Access (1-Click)</span>
        </button>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-container">
                <PersonOutlineRoundedIcon className="auth-field-icon" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-container">
              <MailOutlineRoundedIcon className="auth-field-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-container">
              <LockOutlinedIcon className="auth-field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner">Loading...</span>
            ) : isSignUp ? (
              "Create Account & Open Dashboard"
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="auth-footer-note">
          <CheckCircleRoundedIcon className="check-icon" fontSize="small" />
          <span>Real-time holdings, interactive charts, and live order execution</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
