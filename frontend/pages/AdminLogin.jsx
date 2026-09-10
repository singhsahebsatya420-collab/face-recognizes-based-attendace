import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminLogin() {
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
            if (data.user.role !== "admin") {
                setErr("This account is not an administrator account.");
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/admin");
        } catch (e) {
            setErr(e.response?.data?.message || "Admin login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-decoration auth-decoration-one"></div><div className="auth-decoration auth-decoration-two"></div>
            <div className="auth-layout single-auth-layout">
                <div className="auth-card-modern">
                    <div className="auth-logo admin-auth-logo">OA</div>
                    <div className="intro-badge">ADMIN PORTAL</div>
                    <h2 className="mt-3">Admin Login</h2>
                    <p className="auth-muted">Sign in with your administrator account</p>
                    {err && <div className="alert alert-danger modern-alert">{err}</div>}
                    <form onSubmit={submit}>
                        <label>Email Address</label>
                        <input className="form-control modern-input" type="email" placeholder="admin@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        <label className="mt-3">Password</label>
                        <input className="form-control modern-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                        <button className="btn primary-btn w-100 mt-4" disabled={loading}>{loading ? "Signing in..." : "Admin Sign In"}</button>
                    </form>
                    <div className="auth-divider"><span>OR</span></div>
                    <Link to="/login" className="btn btn-outline-secondary w-100">← Back to options</Link>
                </div>
            </div>
        </div>
    );
}
