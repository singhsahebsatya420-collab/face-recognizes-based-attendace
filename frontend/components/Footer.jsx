import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container py-4">
                <div className="row g-4 align-items-center">
                    <div className="col-md-6">
                        <div className="footer-brand">
                            <span className="brand-mark">OA</span>
                            <div>
                                <h5>Online Attendance</h5>
                                <p>Simple, secure and smart attendance management.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="footer-links justify-content-md-end">
                            <Link to="/">Home</Link>
                            <Link to="/student">Student</Link>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom mt-4 pt-3">
                    <span>© {new Date().getFullYear()} Online Attendance Management System</span>
                    <span>this is my project for attendance management</span>
                </div>
            </div>
        </footer>
    );
}
