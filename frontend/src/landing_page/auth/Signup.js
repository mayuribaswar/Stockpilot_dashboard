import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("");
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

    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/dashboard";
      } else {
        setLoading(false);
        setError(response.data?.message || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to register. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <img
          src="/media/images/signup.png"
          alt="signup"
        />
      </div>

      <div className="signup-right">
        <h1>Open a free demat and trading account online</h1>

        <p>
          Start investing brokerage free and join millions of investors.
        </p>

        {error && (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="phone-box">
            <span>Name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <small>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#387ed1", fontWeight: 600 }}>
            Login here
          </Link>
        </small>
      </div>
    </div>
  );
}

export default Signup;
