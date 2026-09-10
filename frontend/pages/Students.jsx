import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Students() {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState("");
    const [f, setF] = useState({ name: "", email: "", password: "123456", rollNumber: "", course: "", semester: 1 });
    const [message, setMessage] = useState("");

    const load = () => api.get("/students", { params: { search } }).then(r => setList(r.data.students || []));
    useEffect(() => { load(); }, [search]);

    const add = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            await api.post("/students", f);
            setF({ name: "", email: "", password: "123456", rollNumber: "", course: "", semester: 1 });
            setMessage("Student added successfully.");
            load();
        } catch (e) {
            setMessage(e.response?.data?.message || "Unable to add student.");
        }
    };

    const del = async (id) => {
        if (window.confirm("Delete student and attendance?")) {
            try { await api.delete(`/students/${id}`); load(); } catch (e) { setMessage(e.response?.data?.message || "Unable to delete student."); }
        }
    };

    const update = (key, value) => setF({ ...f, [key]: value });

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading-row"><div><span className="eyebrow">ADMIN PANEL</span><h1>Manage Students</h1><p>Add, search and manage all registered students.</p></div><Link to="/admin" className="btn secondary-btn">← Dashboard</Link></div>
                {message && <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"} modern-alert`}>{message}</div>}

                <div className="panel-card mb-4">
                    <div className="panel-header"><div><h3>Add New Student</h3><p>Create a student account from the admin panel.</p></div></div>
                    <form onSubmit={add} className="p-3 p-lg-4"><div className="row g-3">
                        {[["name","Full Name","text"],["email","Email Address","email"],["password","Password","password"],["rollNumber","Roll Number","text"],["course","Course","text"],["semester","Semester","number"]].map(([key, label, type]) => <div className="col-md-4" key={key}><label>{label}</label><input className="form-control modern-input" type={type} placeholder={label} value={f[key]} onChange={e => update(key, e.target.value)} required={['name','email','password'].includes(key)} /></div>)}
                        <div className="col-12"><button className="btn success-btn">+ Add Student</button></div>
                    </div></form>
                </div>

                <div className="panel-card">
                    <div className="panel-header"><div><h3>Student Directory</h3><p>{list.length} student record(s)</p></div><div className="search-box"><span>⌕</span><input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>
                    <div className="table-responsive"><table className="professional-table"><thead><tr><th>Student</th><th>Roll Number</th><th>Email</th><th>Course</th><th>Semester</th><th>Action</th></tr></thead><tbody>
                        {list.map(s => <tr key={s._id}><td><div className="student-cell"><span className="student-avatar">{s.name.charAt(0).toUpperCase()}</span><div><strong>{s.name}</strong><small>Student</small></div></div></td><td>{s.rollNumber || '-'}</td><td>{s.email}</td><td>{s.course || '-'}</td><td>{s.semester || '-'}</td><td><button className="delete-btn" onClick={() => del(s._id)}>Delete</button></td></tr>)}
                        {list.length === 0 && <tr><td colSpan="6" className="empty-state">No students found.</td></tr>}
                    </tbody></table></div>
                </div>
            </div>
        </div>
    );
}
