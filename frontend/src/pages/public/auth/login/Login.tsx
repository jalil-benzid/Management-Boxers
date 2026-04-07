import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";

import logo from "../../../../assets/logo.png";
import "../../../../styles/global.scss";
import "../../../../styles/typography.scss";
import "./index.css";

import { API_BASE_URL } from "../../../../api/config";

export default function LoginPage() {
  const bgRef = useRef<HTMLDivElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      bgRef.current.style.setProperty("--x", `${e.clientX}px`);
      bgRef.current.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-dismiss alert
  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [alert]);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.detail && data.detail.length > 0) {
          setAlert({
            type: "error",
            message: data.detail[0].msg,
          });
        } else {
          setAlert({
            type: "error",
            message: data.message || "Login failed",
          });
        }
        return;
      }

      // Success
      localStorage.setItem("token", data.data.access_token);

      setAlert({
        type: "success",
        message: "Login successful",
      });

      setTimeout(() => {
        navigate("/coach/dashboard");
      }, 1000);
    } catch {
      setAlert({
        type: "error",
        message: "Network error. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden animate-fadeIn"
      style={{
        backgroundColor: "var(--color-black)",
        color: "var(--color-white)",
      }}
    >
      {/* ALERT TOP RIGHT */}
      {alert && (
        <div className="fixed top-5 right-5 z-50 w-[300px]">
          <Alert severity={alert.type}>{alert.message}</Alert>
        </div>
      )}

      {/* Background */}
      <div ref={bgRef} className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
            maskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
            WebkitMaskImage:
              "radial-gradient(circle at var(--x) var(--y), white 150px, transparent 300px)",
          }}
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-6 animate-slideUp">
        {/* Header */}
        <div className="text-center mb-10">
          <img src={logo} className="mx-auto w-10 h-10 mb-2 opacity-90" />
          <div className="text-brand mb-12">Zephyr</div>
          <h1 className="text-title mb-2">Welcome Back</h1>
          <p className="text-subtitle">Log in to your account</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-label block mb-1">Email</label>
            <input
              type="email"
              placeholder="panic@thedis.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full px-4 py-2 rounded-md bg-transparent border outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-label block mb-1">Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full px-4 py-2 rounded-md bg-transparent border outline-none"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-btn w-full py-2 rounded-md font-medium"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

