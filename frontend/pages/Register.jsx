import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        course: "MCA",
        semester: 1,
        phone: ""
    });
    const [err, setErr] = useState("");

    const update = (key, value) => setForm({ ...form, [key]: value });

    const handleNext = (e) => {
        e.preventDefault();
        setErr("");

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setErr("Please fill in all required fields (Name, Email, and Password).");
            return;
        }

        if (form.password.length < 6) {
            setErr("Password must be at least 6 characters long.");
            return;
        }

        // Save to sessionStorage as fallback in case state is lost on refresh
        try {
            sessionStorage.setItem("pending_student_reg", JSON.stringify(form));
        } catch (err) {
            console.error(err);
        }

        navigate("/register-face", { state: { formData: form } });
    };

    return (
        <div className="auth-page register-page">
            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>
            <div className="auth-layout register-layout">
                <div className="auth-intro d-none d-lg-block">
                    <div className="intro-badge">STUDENT PORTAL</div>
                    <h1>Start tracking<br /><span>your attendance.</span></h1>
                    <p>Create your student account and configure your face ID for instant touchless attendance.</p>
                    <div className="intro-points">
                        <span>✓ Step 1: Account & academic details</span>
                        <span>✓ Step 2: One-time face scan registration</span>
                        <span>✓ Instant access to your personal dashboard</span>
                    </div>
                </div>

                <div className="auth-card-modern register-card">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="auth-logo mb-0">OA</div>
                        <div className="steps-pill">
                            <span className="step-badge active">1</span> Details
                            <span className="step-arrow">→</span>
                            <span className="step-badge">2</span> Face Scan
                        </div>
                    </div>

                    <h2 className="mt-3">Create Student Account</h2>
                    <p className="auth-muted">Step 1: Enter your personal and academic details</p>
                    {err && <div className="alert alert-danger modern-alert">{err}</div>}

                    <form onSubmit={handleNext}>
                        <div className="row g-3">
                            <div className="col-12">
                                <label>Full Name <span className="text-danger">*</span></label>
                                <input
                                    className="form-control modern-input"
                                    placeholder="e.g. John Doe"
                                    value={form.name}
                                    onChange={e => update("name", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Email Address <span className="text-danger">*</span></label>
                                <input
                                    className="form-control modern-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => update("email", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Password (min 6 chars) <span className="text-danger">*</span></label>
                                <input
                                    className="form-control modern-input"
                                    type="password"
                                    minLength="6"
                                    placeholder="Create password"
                                    value={form.password}
                                    onChange={e => update("password", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Roll Number</label>
                                <input
                                    className="form-control modern-input"
                                    placeholder="e.g. MCA202401"
                                    value={form.rollNumber}
                                    onChange={e => update("rollNumber", e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label>Phone Number</label>
                                <input
                                    className="form-control modern-input"
                                    placeholder="e.g. +91 9876543210"
                                    value={form.phone}
                                    onChange={e => update("phone", e.target.value)}
                                />
                            </div>
                            <div className="col-md-7">
                                <label>Course</label>
                                <input
                                    className="form-control modern-input"
                                    placeholder="e.g. MCA, B.Tech, BCA"
                                    value={form.course}
                                    onChange={e => update("course", e.target.value)}
                                />
                            </div>
                            <div className="col-md-5">
                                <label>Semester</label>
                                <input
                                    className="form-control modern-input"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={form.semester}
                                    onChange={e => update("semester", e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn success-btn w-100 mt-4 d-flex align-items-center justify-content-center gap-2">
                            <span>Continue to Face Scan</span>
                            <span>→</span>
                        </button>
                    </form>

                    <p className="text-center auth-switch mt-4">Already registered? <Link to="/student-login">Student Login</Link></p>
                    <p className="text-center auth-switch"><Link to="/login">Back to options</Link></p>
                </div>
            </div>
        </div>
    );
}
