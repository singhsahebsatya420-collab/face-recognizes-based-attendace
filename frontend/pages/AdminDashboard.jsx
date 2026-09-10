import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [recent, setRecent] = useState([]);
    const [error, setError] = useState("");
    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        const load = async () => {
            try {
                const [summaryRes, attendanceRes] = await Promise.all([
                    api.get("/attendance/summary"),
                    api.get(`/attendance/date/${today}`)
                ]);
                setSummary(summaryRes.data);
                setRecent(attendanceRes.data || []);
            } catch (e) {
                setError(e.response?.data?.message || "Unable to load dashboard");
            }
        };
        load();
    }, [today]);

    const total = summary?.totalStudents || 0;
    const present = Math.min(summary?.present || 0, total);
    const absent = Math.max(total - present, 0);
    const percentage = total === 0 ? 0 : ((present / total) * 100).toFixed(2);

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading-row">
                    <div>
                        <span className="eyebrow">ADMIN PANEL</span>
                        <h1>Dashboard</h1>
                        <p>Overview of students and today's attendance activity.</p>
                    </div>
                    <Link to="/admin/attendance" className="btn primary-btn">+ Mark Attendance</Link>
                </div>

                {error && <div className="alert alert-danger modern-alert">{error}</div>}

                <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon blue">👨‍🎓</div><div><span>Total Students</span><strong>{total}</strong><small>Registered students</small></div></div></div>
                    <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon green">✓</div><div><span>Present Today</span><strong>{present}</strong><small className="green-text">Max: {total} students</small></div></div></div>
                    <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon red">×</div><div><span>Absent Today</span><strong>{absent}</strong><small className="red-text">Not present ({absent}/{total})</small></div></div></div>
                    <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon purple">%</div><div><span>Attendance Rate</span><strong>{percentage}%</strong><small>Overall present rate</small></div></div></div>
                </div>

                <div className="row g-4 mb-4">
                    <div className="col-xl-7">
                        <div className="panel-card h-100">
                            <div className="panel-header"><div><h3>Attendance Overview</h3><p>Today's attendance distribution</p></div><span className="live-pill">● Live</span></div>
                            <div className="overview-content">
                                <div className="donut" style={{ "--progress": `${percentage}%` }}><div><strong>{percentage}%</strong><span>Attendance</span></div></div>
                                <div className="legend-list">
                                    <div><span className="legend-dot present-dot"></span><div><strong>{present}</strong><small>Present (Max {total})</small></div></div>
                                    <div><span className="legend-dot absent-dot"></span><div><strong>{absent}</strong><small>Absent</small></div></div>
                                    <div><span className="legend-dot pending-dot"></span><div><strong>{total}</strong><small>Total Students</small></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-5">
                        <div className="panel-card h-100">
                            <div className="panel-header"><div><h3>Quick Actions</h3><p>Frequently used controls</p></div></div>
                            <div className="quick-actions">
                                <Link to="/admin/attendance" className="quick-action"><span className="quick-icon blue">📝</span><div><strong>Mark Attendance</strong><small>Record today's attendance</small></div><b>→</b></Link>
                                <Link to="/admin/students" className="quick-action"><span className="quick-icon green">👥</span><div><strong>Manage Students</strong><small>Add, search or remove students</small></div><b>→</b></Link>
                                <Link to="/admin/admins" className="quick-action"><span className="quick-icon purple">⚙</span><div><strong>Manage Admins</strong><small>Control administrator access</small></div><b>→</b></Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel-card">
                    <div className="panel-header"><div><h3>Recent Attendance</h3><p>Latest records for {today}</p></div><Link to="/admin/attendance" className="view-link">View all →</Link></div>
                    <div className="table-responsive">
                        <table className="professional-table">
                            <thead><tr><th>Student</th><th>Roll Number</th><th>Course</th><th>Status</th><th>Marked By</th></tr></thead>
                            <tbody>
                                {recent.slice(0, 8).map((row) => (
                                    <tr key={row.student?._id}>
                                        <td><div className="student-cell"><span className="student-avatar">{(row.student?.name || "S").charAt(0).toUpperCase()}</span><div><strong>{row.student?.name || "-"}</strong><small>{row.student?.email || ""}</small></div></div></td>
                                        <td>{row.student?.rollNumber || "-"}</td>
                                        <td>{row.student?.course || "-"}</td>
                                        <td><span className={`status-badge ${row.attendance?.status === "present" ? "status-present" : "status-absent"}`}>{row.attendance?.status === "present" ? "✓ Present" : "✗ Absent"}</span></td>
                                        <td>{row.markedBy?.name || "-"}</td>
                                    </tr>
                                ))}
                                {recent.length === 0 && <tr><td colSpan="5" className="empty-state">No attendance records found for today.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
