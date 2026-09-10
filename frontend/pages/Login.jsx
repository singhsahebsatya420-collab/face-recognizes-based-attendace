import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <div className="auth-page">
            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>
            <div className="auth-layout login-choice-layout">
                <div className="auth-intro d-none d-lg-block">
                    <div className="intro-badge">SMART ATTENDANCE</div>
                    <h1>Online Attendance<br /><span>Management System.</span></h1>
                    <p>Choose the correct option to access the system or mark attendance with face recognition.</p>
                    <div className="intro-points">
                        <span>✓ Separate admin and student access</span>
                        <span>✓ Face-based attendance</span>
                        <span>✓ Secure role-based dashboard</span>
                    </div>
                </div>

                <div className="auth-card-modern login-choice-card">
                    <div className="auth-logo">OA</div>
                    <h2>Welcome</h2>
                    <p className="auth-muted">Select what you want to do</p>

                    <Link to="/admin-login" className="portal-choice admin-choice">
                        <span className="portal-choice-icon">🛡️</span>
                        <span><strong>Admin Login</strong><small>Access administration dashboard</small></span>
                        <b>→</b>
                    </Link>

                    <Link to="/student-login" className="portal-choice student-choice">
                        <span className="portal-choice-icon">🎓</span>
                        <span><strong>Student Login</strong><small>Login to your attendance dashboard</small></span>
                        <b>→</b>
                    </Link>

                    <Link to="/scan-face" className="portal-choice face-choice">
                        <span className="portal-choice-icon">📷</span>
                        <span><strong>Scan Face for Attendance</strong><small>Mark today's attendance without logging in</small></span>
                        <b>→</b>
                    </Link>

                    <p className="text-center auth-switch mt-4 mb-0">
                        New Student? <Link to="/register">Register Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
