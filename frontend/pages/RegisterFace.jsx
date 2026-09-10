import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { getFaceDescriptor, loadFaceModels } from "../utils/face";

export default function RegisterFace() {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const redirectTimerRef = useRef(null);

    // Get formData from location state or fallback to sessionStorage
    const [formData, setFormData] = useState(() => {
        if (location.state?.formData) return location.state.formData;
        try {
            const saved = sessionStorage.getItem("pending_student_reg");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [status, setStatus] = useState("Initializing camera & face models...");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [countdown, setCountdown] = useState(2);
    const [error, setError] = useState("");

    // If no form data exists, redirect back to step 1
    useEffect(() => {
        if (!formData || !formData.name || !formData.email) {
            navigate("/register", { replace: true });
        }
    }, [formData, navigate]);

    // Start camera stream and load models
    useEffect(() => {
        let isMounted = true;

        const initCamera = async () => {
            try {
                setError("");
                setStatus("Loading face recognition models...");
                await loadFaceModels();
                if (!isMounted) return;

                setStatus("Starting camera...");
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user", width: 640, height: 480 }
                });
                
                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                setStatus("Camera ready — align your face within the frame and click Register.");
            } catch (err) {
                if (isMounted) {
                    setError("Camera access is required for face registration. Please allow camera access in your browser.");
                    setStatus("Camera unavailable");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initCamera();

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    const captureAndRegister = async () => {
        if (!videoRef.current || submitting || done) return;

        setError("");
        setSubmitting(true);
        setStatus("Scanning face...");

        try {
            const descriptor = await getFaceDescriptor(videoRef.current);

            if (!descriptor || descriptor.length < 64) {
                throw new Error("No clear face detected. Please ensure your face is well-lit, centered, and try again.");
            }

            setStatus("Face detected! Creating your student account...");

            const payload = {
                ...formData,
                faceDescriptor: descriptor
            };

            const { data } = await api.post("/auth/register", payload);

            // Successfully registered!
            // Stop camera stream immediately
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }

            // Save auth tokens for auto login
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            // Clear temporary registration cache
            try {
                sessionStorage.removeItem("pending_student_reg");
            } catch (e) {
                console.error(e);
            }

            // Show DONE indicator
            setDone(true);
            setStatus("Account created successfully!");

            // 2-second countdown then open personal account dashboard
            let timeLeft = 2;
            setCountdown(timeLeft);
            const countdownInterval = setInterval(() => {
                timeLeft -= 1;
                if (timeLeft >= 0) {
                    setCountdown(timeLeft);
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);

            redirectTimerRef.current = setTimeout(() => {
                clearInterval(countdownInterval);
                navigate("/student", { replace: true });
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
            setStatus("Scan failed — please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!formData) return null;

    return (
        <div className="auth-page register-face-page">
            <div className="auth-decoration auth-decoration-one"></div>
            <div className="auth-decoration auth-decoration-two"></div>

            <div className="face-scan-card register-face-card">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="auth-logo mb-0">OA</div>
                    <div className="steps-pill">
                        <span className="step-badge completed">✓</span> Details
                        <span className="step-arrow">→</span>
                        <span className="step-badge active">2</span> Face Scan
                    </div>
                </div>

                <div className="intro-badge mt-2">STEP 2 OF 2</div>
                <h2 className="mt-2">Register Face ID</h2>
                <p className="auth-muted mb-3">
                    Hi <strong>{formData.name}</strong>, align your face in the camera to set up one-touch attendance.
                </p>

                {/* Video scanner box */}
                <div className={`face-scanner ${done ? "face-done" : ""}`}>
                    <video ref={videoRef} autoPlay muted playsInline className="face-video-large" />
                    
                    {!done && !loading && !error && (
                        <div className="face-scan-guide-overlay">
                            <div className="face-guide-oval">
                                <div className="scan-laser-line"></div>
                            </div>
                        </div>
                    )}

                    {done && (
                        <div className="scan-done-overlay done-celebrate">
                            <div className="done-check">✓</div>
                            <strong className="done-title">DONE</strong>
                            <span className="done-subtitle">Face Registered Successfully!</span>
                            <div className="redirect-countdown-badge mt-3">
                                Opening your personal account in <strong>{countdown}s</strong>...
                            </div>
                        </div>
                    )}
                </div>

                {/* Status and Error Messages */}
                <div className="scan-status mt-3">{status}</div>
                {error && <div className="alert alert-danger modern-alert mt-3">{error}</div>}

                {/* Actions */}
                {!done && (
                    <div className="mt-4 d-flex flex-column gap-2">
                        <button
                            type="button"
                            className="btn success-btn w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={captureAndRegister}
                            disabled={loading || submitting || (!!error && status === "Camera unavailable")}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span>Registering Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>📷 Scan & Complete Registration</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => navigate("/register")}
                            disabled={submitting}
                        >
                            ← Back to Edit Details
                        </button>
                    </div>
                )}

                {done && (
                    <div className="mt-3 text-center">
                        <button
                            type="button"
                            className="btn primary-btn w-100"
                            onClick={() => navigate("/student", { replace: true })}
                        >
                            Go to My Account Now →
                        </button>
                    </div>
                )}

                <div className="text-center mt-3">
                    <p className="small text-muted mb-0">
                        🔒 Your facial descriptors are encrypted and used solely for attendance verification.
                    </p>
                </div>
            </div>
        </div>
    );
}
