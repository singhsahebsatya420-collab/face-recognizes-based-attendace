import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

export default function Attendance() {
    const [date, setDate] = useState(getTodayDateString());
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notify, setNotify] = useState(true);
    const [message, setMessage] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/attendance/date/${date}`);
            setRows(res.data || []);
        } catch (e) {
            setMessage(e.response?.data?.message || "Unable to load attendance records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [date]);

    // Update single student status
    const setStatus = (id, status) => {
        setRows((prev) =>
            prev.map((x) =>
                x.student._id === id
                    ? { ...x, attendance: { ...x.attendance, status } }
                    : x
            )
        );
    };

    // Mark all students present
    const markAllPresent = () => {
        setRows((prev) =>
            prev.map((x) => ({
                ...x,
                attendance: { ...x.attendance, status: "present" }
            }))
        );
    };

    // Mark all students absent
    const markAllAbsent = () => {
        setRows((prev) =>
            prev.map((x) => ({
                ...x,
                attendance: { ...x.attendance, status: "absent" }
            }))
        );
    };

    const save = async () => {
        setSaving(true);
        setMessage("");
        try {
            await api.post("/attendance/mark", {
                date,
                notify,
                attendance: rows.map((x) => ({
                    studentId: x.student._id,
                    status: x.attendance?.status === "present" ? "present" : "absent"
                }))
            });
            setMessage(notify ? "Attendance saved and email/SMS notifications sent to students!" : "Attendance saved successfully.");
            load();
        } catch (e) {
            setMessage(e.response?.data?.message || "Unable to save attendance.");
        } finally {
            setSaving(false);
        }
    };

    // Total registered students
    const totalStudents = rows.length;
    // Present students: max can only be totalStudents
    const presentCount = Math.min(
        rows.filter((x) => x.attendance?.status === "present").length,
        totalStudents
    );
    // Absent students: all who are not present
    const absentCount = Math.max(totalStudents - presentCount, 0);
    // Percentage
    const percentage = totalStudents === 0 ? 0 : ((presentCount / totalStudents) * 100).toFixed(1);

    // Filter rows by search
    const filteredRows = rows.filter((x) => {
        const query = search.toLowerCase();
        return (
            x.student?.name?.toLowerCase().includes(query) ||
            x.student?.rollNumber?.toLowerCase().includes(query) ||
            x.student?.email?.toLowerCase().includes(query) ||
            x.student?.course?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading-row">
                    <div>
                        <span className="eyebrow">ADMIN PANEL</span>
                        <h1>Mark Attendance</h1>
                        <p>Record and update daily attendance for registered students.</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="date-control">
                            <span>Date:</span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <Link to="/admin" className="btn secondary-btn">
                            ← Dashboard
                        </Link>
                    </div>
                </div>

                {message && (
                    <div
                        className={`alert ${message.includes("saved") ? "alert-success" : "alert-danger"} modern-alert alert-dismissible fade show`}
                    >
                        {message}
                    </div>
                )}

                {/* Metric Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-sm-6 col-xl-3">
                        <div className="mini-stat">
                            <span className="metric-icon blue">👥</span>
                            <div>
                                <small>Total Students</small>
                                <strong>{totalStudents}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="mini-stat">
                            <span className="metric-icon green">✓</span>
                            <div>
                                <small>Present (Max {totalStudents})</small>
                                <strong className="green-text">{presentCount}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="mini-stat">
                            <span className="metric-icon red">×</span>
                            <div>
                                <small>Absent (Not Present)</small>
                                <strong className="red-text">{absentCount}</strong>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-xl-3">
                        <div className="mini-stat">
                            <span className="metric-icon purple">%</span>
                            <div>
                                <small>Attendance Rate</small>
                                <strong>{percentage}%</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="panel-card">
                    <div className="panel-header flex-wrap gap-3">
                        <div>
                            <h3>Student Attendance List</h3>
                            <p>Date: {date} • Total: {totalStudents} Student(s)</p>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    style={{ fontSize: "11px", fontWeight: "700" }}
                                    onClick={markAllPresent}
                                    disabled={rows.length === 0}
                                >
                                    ✓ All Present
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    style={{ fontSize: "11px", fontWeight: "700" }}
                                    onClick={markAllAbsent}
                                    disabled={rows.length === 0}
                                >
                                    × All Absent
                                </button>
                            </div>
                            <div className="search-box">
                                <span>⌕</span>
                                <input
                                    placeholder="Search student..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="professional-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Roll Number</th>
                                    <th>Course</th>
                                    <th>Attendance Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            Loading student attendance...
                                        </td>
                                    </tr>
                                ) : filteredRows.length > 0 ? (
                                    filteredRows.map((x, index) => {
                                        const isPresent = x.attendance?.status === "present";
                                        return (
                                            <tr key={x.student._id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="student-cell">
                                                        <span className="student-avatar">
                                                            {(x.student.name || "S").charAt(0).toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <strong>{x.student.name}</strong>
                                                            <small>{x.student.email}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{x.student.rollNumber || "-"}</td>
                                                <td>{x.student.course || "-"}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`status-button present-button ${isPresent ? "selected" : ""}`}
                                                        onClick={() => setStatus(x.student._id, "present")}
                                                    >
                                                        ✓ Present
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`status-button absent-button ${!isPresent ? "selected" : ""}`}
                                                        onClick={() => setStatus(x.student._id, "absent")}
                                                    >
                                                        × Absent
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="panel-footer-action">
                        <div className="d-flex align-items-center justify-content-between w-100 flex-wrap gap-3">
                            <label className="d-flex align-items-center gap-2 m-0" style={{ fontSize: "12px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input mt-0"
                                    style={{ width: "17px", height: "17px", cursor: "pointer" }}
                                    checked={notify}
                                    onChange={(e) => setNotify(e.target.checked)}
                                />
                                <span>🔔 Send instant Email (Gmail) & Phone notifications to students</span>
                            </label>
                            <button
                                className="btn primary-btn"
                                onClick={save}
                                disabled={saving || rows.length === 0}
                            >
                                {saving ? "Saving & Notifying..." : "Save Attendance"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
