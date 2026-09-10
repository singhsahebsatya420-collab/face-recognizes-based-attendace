import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function ManageAdmins() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [actionId, setActionId] = useState(null);

    // Form state for creating a new Admin
    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    // State for Gmail Configuration
    const [emailConfig, setEmailConfig] = useState({
        emailUser: "",
        emailPass: ""
    });
    const [emailStatus, setEmailStatus] = useState({
        isConfigured: false,
        emailUser: "",
        fullEmailUser: ""
    });
    const [showAppPass, setShowAppPass] = useState(false);
    const [savingEmailConfig, setSavingEmailConfig] = useState(false);

    // State for Testing Email Configuration
    const [testEmail, setTestEmail] = useState("");
    const [testingEmail, setTestingEmail] = useState(false);

    // Get current logged-in user
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/users");
            setUsers(res.data || []);
        } catch (err) {
            setNotification({
                type: "danger",
                message: err.response?.data?.message || "Failed to load user list."
            });
        } finally {
            setLoading(false);
        }
    };

    const loadEmailConfig = async () => {
        try {
            const res = await api.get("/admin/email-config");
            setEmailStatus(res.data || {});
            if (res.data?.fullEmailUser) {
                setEmailConfig((prev) => ({ ...prev, emailUser: res.data.fullEmailUser }));
            }
        } catch (err) {
            console.error("Failed to load email config status", err);
        }
    };

    useEffect(() => {
        loadUsers();
        loadEmailConfig();
    }, []);

    // Create New Admin direct handler
    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setNotification({ type: "", message: "" });
        setCreatingAdmin(true);

        try {
            const res = await api.post("/admin/create-admin", newAdmin);
            setNotification({
                type: "success",
                message: res.data?.message || `Admin ${newAdmin.name} created successfully!`
            });
            setNewAdmin({ name: "", email: "", password: "", phone: "" });
            loadUsers();
        } catch (err) {
            setNotification({
                type: "danger",
                message: err.response?.data?.message || "Failed to create new admin."
            });
        } finally {
            setCreatingAdmin(false);
        }
    };

    // Save Email Configuration handler
    const handleSaveEmailConfig = async (e) => {
        e.preventDefault();
        setNotification({ type: "", message: "" });
        setSavingEmailConfig(true);

        try {
            const res = await api.post("/admin/email-config", emailConfig);
            setNotification({
                type: "success",
                message: res.data?.message || "Gmail configuration connected and verified successfully!"
            });
            setEmailConfig({ emailUser: emailConfig.emailUser, emailPass: "" });
        } catch (err) {
            setNotification({
                type: "danger",
                message: err.response?.data?.message || "Failed to save and verify Gmail configuration. Please check your App Password."
            });
        } finally {
            loadEmailConfig();
            setSavingEmailConfig(false);
        }
    };

    // Test Email direct handler
    const handleTestEmail = async (e) => {
        e.preventDefault();
        if (!testEmail) return;
        setTestingEmail(true);
        setNotification({ type: "", message: "" });
        try {
            const res = await api.post("/admin/test-email", { recipientEmail: testEmail });
            setNotification({
                type: "success",
                message: res.data?.message || "Test email sent successfully! Please check your inbox."
            });
        } catch (err) {
            setNotification({
                type: "danger",
                message: err.response?.data?.message || "Email test failed. Please verify your Gmail ID and App Password."
            });
        } finally {
            setTestingEmail(false);
        }
    };

    // Make or Remove Admin role handler
    const toggleAdminRole = async (user) => {
        const isAdmin = user.role === "admin";
        const isSelf = user._id === currentUser.id || user._id === currentUser._id || user.email === currentUser.email;

        if (isAdmin && isSelf) {
            setNotification({
                type: "warning",
                message: "You cannot remove admin rights from your own account."
            });
            return;
        }

        if (isAdmin) {
            const confirmed = window.confirm(`Are you sure you want to remove administrator privileges from ${user.name}?`);
            if (!confirmed) return;
        }

        setActionId(user._id);
        setNotification({ type: "", message: "" });

        try {
            const endpoint = isAdmin 
                ? `/admin/remove-admin/${user._id}` 
                : `/admin/make-admin/${user._id}`;

            const res = await api.put(endpoint);
            setNotification({
                type: "success",
                message: res.data?.message || (isAdmin ? `${user.name} is now a student.` : `${user.name} is now an admin.`)
            });
            loadUsers();
        } catch (err) {
            setNotification({
                type: "danger",
                message: err.response?.data?.message || "Failed to update user role."
            });
        } finally {
            setActionId(null);
        }
    };

    // Calculate Stats
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const totalStudents = users.filter((u) => u.role === "student").length;

    // Filter and search
    const filteredUsers = users.filter((u) => {
        const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
        const query = search.toLowerCase();
        const matchesSearch =
            u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.rollNumber?.toLowerCase().includes(query);
        return matchesRole && matchesSearch;
    });

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-lg-4 py-4">
                {/* Page Heading */}
                <div className="page-heading-row">
                    <div>
                        <span className="eyebrow">ADMIN PANEL</span>
                        <h1>Manage Admins & System Settings</h1>
                        <p>Configure administrators, setup Gmail alerts, and manage user roles.</p>
                    </div>
                    <Link to="/admin" className="btn secondary-btn">
                        ← Dashboard
                    </Link>
                </div>

                {/* Notifications */}
                {notification.message && (
                    <div
                        className={`alert alert-${notification.type === "success" ? "success" : notification.type === "warning" ? "warning" : "danger"} modern-alert alert-dismissible fade show d-flex align-items-center justify-content-between`}
                        role="alert"
                    >
                        <div>
                            <strong>
                                {notification.type === "success" ? "✓ Success: " : notification.type === "warning" ? "⚠ Notice: " : "✗ Error: "}
                            </strong>
                            {notification.message}
                        </div>
                        <button
                            type="button"
                            className="btn-close ms-2"
                            style={{ position: "static", padding: "0.25rem 0.5rem" }}
                            onClick={() => setNotification({ type: "", message: "" })}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Metric Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-sm-4">
                        <div className="metric-card">
                            <div className="metric-icon purple">👥</div>
                            <div>
                                <span>Total Users</span>
                                <strong>{totalUsers}</strong>
                                <small>Registered accounts</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="metric-card">
                            <div className="metric-icon blue">🛡️</div>
                            <div>
                                <span>Administrators</span>
                                <strong>{totalAdmins}</strong>
                                <small className="text-primary font-weight-bold">System admins</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="metric-card">
                            <div className="metric-icon green">🎓</div>
                            <div>
                                <span>Students</span>
                                <strong>{totalStudents}</strong>
                                <small className="green-text">Student accounts</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create New Admin Panel */}
                <div className="panel-card mb-4">
                    <div className="panel-header">
                        <div>
                            <h3>Create New Admin</h3>
                            <p>Directly register a new administrator account with full privileges.</p>
                        </div>
                        <span className="badge bg-primary text-white px-3 py-2" style={{ borderRadius: "20px", fontSize: "11px" }}>
                            Admin Access
                        </span>
                    </div>

                    <form onSubmit={handleCreateAdmin} className="p-3 p-lg-4">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                    Full Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control modern-input"
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                    Email Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    className="form-control modern-input"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                    Password <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        className="form-control modern-input"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min 6 characters"
                                        minLength="6"
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        style={{ borderColor: "#dbe3ef", fontSize: "11px" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                    Phone Number (Optional)
                                </label>
                                <input
                                    className="form-control modern-input"
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={newAdmin.phone}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <button className="btn success-btn" disabled={creatingAdmin}>
                                    {creatingAdmin ? "Creating Admin..." : "+ Create Administrator"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Email Notification Setup & Live Test Panel */}
                <div className="panel-card mb-4">
                    <div className="panel-header flex-wrap gap-2">
                        <div>
                            <h3>📧 Gmail Attendance Alerts Configuration</h3>
                            <p>Connect your Gmail address to send real-time attendance emails to students.</p>
                        </div>
                        <div>
                            {emailStatus.isConfigured ? (
                                <span className="badge bg-success text-white px-3 py-2" style={{ borderRadius: "20px", fontSize: "11px" }}>
                                    ● Connected: {emailStatus.emailUser}
                                </span>
                            ) : (
                                <span className="badge bg-warning text-dark px-3 py-2" style={{ borderRadius: "20px", fontSize: "11px" }}>
                                    ⚠ Not Connected Yet
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-3 p-lg-4">
                        <div className="row g-4">
                            {/* Step 1: Configure Credentials */}
                            <div className="col-lg-7 border-end-lg pe-lg-4">
                                <h5 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                                    Step 1: Enter Gmail ID & 16-Digit App Password
                                </h5>
                                <p className="text-muted mb-3" style={{ fontSize: "11px" }}>
                                    Save your Gmail credentials directly here without manually editing any code or files.
                                </p>

                                <form onSubmit={handleSaveEmailConfig}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                                Your Gmail Address
                                            </label>
                                            <input
                                                className="form-control modern-input"
                                                type="email"
                                                placeholder="e.g. yourname@gmail.com"
                                                value={emailConfig.emailUser}
                                                onChange={(e) => setEmailConfig({ ...emailConfig, emailUser: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                                16-Digit Google App Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    className="form-control modern-input"
                                                    type={showAppPass ? "text" : "password"}
                                                    placeholder="e.g. abcd efgh ijkl mnop"
                                                    value={emailConfig.emailPass}
                                                    onChange={(e) => setEmailConfig({ ...emailConfig, emailPass: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    style={{ borderColor: "#dbe3ef", fontSize: "11px" }}
                                                    onClick={() => setShowAppPass(!showAppPass)}
                                                >
                                                    {showAppPass ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-12 mt-3">
                                            <button className="btn success-btn" disabled={savingEmailConfig}>
                                                {savingEmailConfig ? "Verifying & Saving..." : "💾 Save & Connect Gmail"}
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-3 p-3 bg-light rounded-3 border" style={{ fontSize: "11px", color: "#475569" }}>
                                    <strong>📌 How to get 16-digit Google App Password:</strong><br />
                                    1. Google Account &gt; <strong>Security</strong> &gt; Enable <strong>2-Step Verification</strong>.<br />
                                    2. Search <strong>App Passwords</strong> (or visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">myaccount.google.com/apppasswords</a>).<br />
                                    3. Name it <em>"AttendanceApp"</em> &amp; click <strong>Create</strong>. Copy the 16-letter code and paste above.
                                </div>
                            </div>

                            {/* Step 2: Live Test Email */}
                            <div className="col-lg-5 ps-lg-4">
                                <h5 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>
                                    Step 2: Send a Live Test Email
                                </h5>
                                <p className="text-muted mb-3" style={{ fontSize: "11px" }}>
                                    Test sending an instant verification email to make sure everything is working.
                                </p>

                                <form onSubmit={handleTestEmail}>
                                    <div className="mb-3">
                                        <label className="form-label" style={{ fontSize: "11px", fontWeight: "700", color: "#334155" }}>
                                            Recipient Test Email Address
                                        </label>
                                        <input
                                            className="form-control modern-input"
                                            type="email"
                                            placeholder="Enter your email to receive test"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="btn primary-btn w-100" disabled={testingEmail || !testEmail}>
                                        {testingEmail ? "Sending Test Email..." : "⚡ Send Test Email Now"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List & Admin Role Controls */}
                <div className="panel-card">
                    <div className="panel-header flex-wrap gap-3">
                        <div>
                            <h3>All Users & Permissions</h3>
                            <p>Promote students to Admin or revoke Admin access.</p>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {/* Role Filter Tabs */}
                            <div className="btn-group" role="group">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${roleFilter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                                    style={{ fontSize: "11px", fontWeight: "600", borderRadius: "8px 0 0 8px" }}
                                    onClick={() => setRoleFilter("all")}
                                >
                                    All ({totalUsers})
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${roleFilter === "admin" ? "btn-primary" : "btn-outline-secondary"}`}
                                    style={{ fontSize: "11px", fontWeight: "600" }}
                                    onClick={() => setRoleFilter("admin")}
                                >
                                    Admins ({totalAdmins})
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-sm ${roleFilter === "student" ? "btn-primary" : "btn-outline-secondary"}`}
                                    style={{ fontSize: "11px", fontWeight: "600", borderRadius: "0 8px 8px 0" }}
                                    onClick={() => setRoleFilter("student")}
                                >
                                    Students ({totalStudents})
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="search-box">
                                <span>⌕</span>
                                <input
                                    placeholder="Search users..."
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
                                    <th>User Account</th>
                                    <th>Email Address</th>
                                    <th>Role</th>
                                    <th>Account Status</th>
                                    <th>Role Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => {
                                        const isSelf =
                                            u._id === currentUser.id ||
                                            u._id === currentUser._id ||
                                            u.email === currentUser.email;
                                        const isAdmin = u.role === "admin";
                                        const isProcessing = actionId === u._id;

                                        return (
                                            <tr key={u._id}>
                                                <td>
                                                    <div className="student-cell">
                                                        <span className={`student-avatar ${isAdmin ? "admin-avatar-bg" : ""}`}>
                                                            {(u.name || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <strong>{u.name}</strong>
                                                            <small>{isAdmin ? "Administrator" : "Student User"}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`role-badge ${isAdmin ? "role-admin" : "role-student"}`}>
                                                        {isAdmin ? "🛡️ Admin" : "🎓 Student"}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isSelf ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: "10px", borderRadius: "6px" }}>
                                                            ● You (Active Admin)
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: "11px" }}>
                                                            Standard User
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isAdmin ? (
                                                        isSelf ? (
                                                            <button
                                                                className="role-action warning"
                                                                disabled
                                                                title="You cannot remove your own admin access"
                                                                style={{ opacity: 0.5, cursor: "not-allowed" }}
                                                            >
                                                                Cannot Remove Self
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="role-action warning"
                                                                onClick={() => toggleAdminRole(u)}
                                                                disabled={isProcessing}
                                                            >
                                                                {isProcessing ? "Updating..." : "Remove Admin"}
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button
                                                            className="role-action success"
                                                            onClick={() => toggleAdminRole(u)}
                                                            disabled={isProcessing}
                                                        >
                                                            {isProcessing ? "Updating..." : "Make Admin"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-state">
                                            No matching users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
