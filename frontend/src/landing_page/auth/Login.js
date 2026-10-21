import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data && res.data.success) {
            window.location.replace("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/login", {
        email: email.trim(),
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
        setError(response.data?.message || "Invalid Email or Password");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid Email or Password");
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img
          src="/media/images/signup.png"
          alt="login"
        />
      </div>

      <div className="signup-right">
        <h1>Login to StockPilot</h1>

        <p>
          Access your portfolio dashboard, holdings, orders, and positions.
        </p>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="phone-box">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="phone-box">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <small>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "#387ed1", fontWeight: 600 }}>
            Sign Up
          </Link>
        </small>
      </div>
    </div>
  );
}

export default Login;
