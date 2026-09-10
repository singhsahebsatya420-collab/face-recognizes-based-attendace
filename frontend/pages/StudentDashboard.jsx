import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function StudentDashboard() {
    const [info, setInfo] = useState(null);
    const [err, setErr] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        api.get("/attendance/my")
            .then(r => {
                const { records, summary } = r.data;
                setInfo({ records, ...summary });
            })
            .catch(e => setErr(e.response?.data?.message || "Error"));
    }, []);

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading-row"><div><span className="eyebrow">STUDENT PORTAL</span><h1>My Attendance</h1><p>Welcome, {user?.name || "Student"}. Here is your attendance overview.</p></div></div>
                {err && <div className="alert alert-danger modern-alert">{err}</div>}
                {info && <>
                    <div className="row g-3 mb-4">
                        <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon blue">📚</div><div><span>Total Classes</span><strong>{info.total}</strong><small>Total marked classes</small></div></div></div>
                        <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon green">✓</div><div><span>Present</span><strong>{info.present}</strong><small className="green-text">Classes attended</small></div></div></div>
                        <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon red">×</div><div><span>Absent</span><strong>{info.absent}</strong><small className="red-text">Classes missed</small></div></div></div>
                        <div className="col-sm-6 col-xl-3"><div className="metric-card"><div className="metric-icon purple">%</div><div><span>Attendance</span><strong>{info.percentage}%</strong><small>Overall percentage</small></div></div></div>
                    </div>
                    <div className="panel-card"><div className="panel-header"><div><h3>Attendance History</h3><p>Your complete attendance records.</p></div><span className="attendance-score">{info.percentage}%</span></div><div className="table-responsive"><table className="professional-table"><thead><tr><th>Date</th><th>Status</th><th>Marked By</th></tr></thead><tbody>{info.records && info.records.length > 0 ? info.records.map(r => <tr key={r._id}><td>{new Date(r.date).toLocaleDateString()}</td><td><span className={`status-badge ${r.status === "present" ? "status-present" : "status-absent"}`}>{r.status === "present" ? "Present" : "Absent"}</span></td><td>{r.markedBy?.name || "-"}</td></tr>) : <tr><td colSpan="3" className="empty-state">No attendance records available.</td></tr>}</tbody></table></div></div>
                </>}
            </div>
        </div>
    );
}
