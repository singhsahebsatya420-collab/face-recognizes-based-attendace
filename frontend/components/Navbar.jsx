import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin = user?.role === "admin";

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const linkClass = ({ isActive }) =>
        `nav-item-link ${isActive ? "active" : ""}`;

    return (
        <header className="topbar">
            <div className="container-fluid px-3 px-lg-4">
                <nav className="navbar navbar-expand-lg p-0">
                    <NavLink className="brand" to={isAdmin ? "/admin" : "/student"}>
                        <span className="brand-mark">OA</span>
                        <span>
                            <strong>Online Attendance</strong>
                            <small>Management System</small>
                        </span>
                    </NavLink>

                    <button
                        className="navbar-toggler border-0 shadow-none"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainNav">
                        <div className="ms-auto d-flex align-items-lg-center flex-column flex-lg-row gap-2 gap-lg-1 mt-3 mt-lg-0">
                            {isAdmin ? (
                                <>
                                    <NavLink to="/admin" className={linkClass}>Dashboard</NavLink>
                                    <NavLink to="/admin/students" className={linkClass}>Students</NavLink>
                                    <NavLink to="/admin/attendance" className={linkClass}>Attendance</NavLink>
                                    <NavLink to="/admin/admins" className={linkClass}>Admins</NavLink>
                                </>
                            ) : (
                                <NavLink to="/student" className={linkClass}>My Attendance</NavLink>
                            )}

                            <div className="user-menu ms-lg-2">
                                <div className="user-avatar">
                                    {(user?.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info">
                                    <strong>{user?.name || "User"}</strong>
                                    <span>{user?.role === "admin" ? "Administrator" : "Student"}</span>
                                </div>
                                <button className="logout-btn" onClick={logout}>Logout</button>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    );
}
