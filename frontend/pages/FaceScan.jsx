import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { getFaceDescriptor, loadFaceModels } from "../utils/face";

export default function FaceScan() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [status, setStatus] = useState("Starting camera...");
    const [busy, setBusy] = useState(true);
    const [done, setDone] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const start = async () => {
            try {
                await loadFaceModels();
                if (!active) return;
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 640, height: 480 }
                });
                streamRef.current = stream;
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setStatus("Camera ready — center your face and click Scan.");
            } catch (e) {
                setError("Camera permission is required. Please allow camera access and refresh this page.");
                setStatus("Camera unavailable");
            } finally {
                if (active) setBusy(false);
            }
        };
        start();
        return () => {
            active = false;
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const scan = async () => {
        setError("");
        setDone(false);
        setResult(null);
        setBusy(true);
        try {
            setStatus("Scanning face...");
            const descriptor = await getFaceDescriptor(videoRef.current);
            if (!descriptor) {
                throw new Error("Face not detected. Keep your face fully visible and try again.");
            }
            setStatus("Verifying face...");
            const { data } = await api.post("/attendance/face-scan", { descriptor });
            setResult(data);
            setDone(true);
            setStatus(data.message || "Done");
        } catch (e) {
            setError(e.message || e.response?.data?.message || "Face attendance failed");
            setStatus("Try again");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="auth-page face-scan-page">
            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>
            <div className="face-scan-card">
                <div className="auth-logo">OA</div>
                <div className="intro-badge">FACE ATTENDANCE</div>
                <h2 className="mt-3">Scan Face for Attendance</h2>
                <p className="auth-muted">Look at the camera. Your registered face will be matched automatically.</p>

                <div className={`face-scanner ${done ? "face-done" : ""}`}>
                    <video ref={videoRef} autoPlay muted playsInline className="face-video-large" />
                    {done && <div className="scan-done-overlay"><div className="done-check">✓</div><strong>DONE</strong><span>Attendance marked</span></div>}
                </div>

                <div className="scan-status mt-3">{status}</div>
                {error && <div className="alert alert-danger modern-alert mt-3">{error}</div>}



                {!done && <button className="btn success-btn w-100 mt-3" onClick={scan} disabled={busy || !!error && status === "Camera unavailable"}>📷 Scan Face</button>}
                {done && <button className="btn primary-btn w-100 mt-3" onClick={() => window.location.reload()}>Scan Again</button>}

                <div className="d-flex gap-2 mt-3">
                    <Link to="/login" className="btn btn-outline-secondary w-50">Back to Login</Link>
                    <Link to="/student-login" className="btn btn-outline-primary w-50">Student Login</Link>
                </div>
                <p className="small text-muted mt-3 mb-0">For privacy, this screen does not open or display the student profile. A successful match only records attendance.</p>
            </div>
        </div>
    );
}
