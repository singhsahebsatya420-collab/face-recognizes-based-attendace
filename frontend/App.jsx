import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import ManageAdmins from "./pages/ManageAdmins";
import FaceScan from "./pages/FaceScan";
import RegisterFace from "./pages/RegisterFace";

function Layout() {
    const location = useLocation();
    const isAuthPage = ["/login", "/admin-login", "/student-login", "/register", "/register-face", "/scan-face"].includes(location.pathname);

    return (
        <div className="app-shell">
            {!isAuthPage && <Navbar />}
            <main className={isAuthPage ? "app-main auth-main" : "app-main"}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/student-login" element={<StudentLogin />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/register-face" element={<RegisterFace />} />
                    <Route path="/scan-face" element={<FaceScan />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute role="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/students"
                        element={
                            <ProtectedRoute role="admin">
                                <Students />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/attendance"
                        element={
                            <ProtectedRoute role="admin">
                                <Attendance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/admins"
                        element={
                            <ProtectedRoute role="admin">
                                <ManageAdmins />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student"
                        element={
                            <ProtectedRoute role="student">
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            localStorage.getItem("token") ? (
                                JSON.parse(localStorage.getItem("user") || "null")?.role === "admin" ? (
                                    <Navigate to="/admin" replace />
                                ) : (
                                    <Navigate to="/student" replace />
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout />
        </BrowserRouter>
    );
}
