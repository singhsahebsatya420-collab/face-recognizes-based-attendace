import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", form);
            if (data.user.role !== "student") {
                setErr("Please use Admin Login for an administrator account.");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/student");
        } catch (e) {
            setErr(e.response?.data?.message || "Student login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-decoration auth-decoration-one"></div><div className="auth-decoration auth-decoration-two"></div>
            <div className="auth-layout single-auth-layout">
                <div className="auth-card-modern">
                    <div className="auth-logo">OA</div>
                    <div className="intro-badge">STUDENT PORTAL</div>
                    <h2 className="mt-3">Student Login</h2>
                    <p className="auth-muted">Sign in to view your personal attendance</p>
                    {err && <div className="alert alert-danger modern-alert">{err}</div>}
                    <form onSubmit={submit}>
                        <label>Email Address</label>
                        <input className="form-control modern-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label className="mt-3">Password</label>
                        <input className="form-control modern-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <button className="btn primary-btn w-100 mt-4" disabled={loading}>{loading ? "Signing in..." : "Student Sign In"}</button>
                    </form>
                    <div className="auth-divider"><span>OR</span></div>
                    <Link to="/register" className="btn btn-outline-primary w-100">🎓 New Student? Register</Link>
                    <Link to="/scan-face" className="btn btn-outline-success w-100 face-attendance-btn mt-2">📷 Scan Face for Attendance</Link>
                    <Link to="/login" className="btn btn-link w-100 mt-2">← Back to options</Link>
                </div>
            </div>
        </div>
    );
}
