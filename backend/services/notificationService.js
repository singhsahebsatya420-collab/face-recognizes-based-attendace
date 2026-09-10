const nodemailer = require("nodemailer");

// Create Transporter using SMTP (e.g. Gmail)
const createTransporter = () => {
    const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send Attendance Notification Email & SMS to Student
 * @param {Object} payload
 * @param {Object} payload.student - Student document (name, email, phone, rollNumber, course)
 * @param {string} payload.status - "present" | "absent"
 * @param {string|Date} payload.date - Attendance Date
 * @param {string} payload.markedByName - Name of the admin who marked attendance
 */
const sendAttendanceNotification = async ({ student, status, date, markedByName }) => {
    if (!student || !student.email) return;

    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });

    const isPresent = status === "present";
    const statusColor = isPresent ? "#16a34a" : "#dc2626";
    const statusBg = isPresent ? "#dcfce7" : "#fee2e2";
    const statusText = isPresent ? "✓ PRESENT" : "✗ ABSENT";

    // 1. Email Notification
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Online Attendance System" <${process.env.EMAIL_USER || "noreply@attendance.edu"}>`,
        to: student.email,
        subject: `📢 Attendance Notification: ${statusText} on ${formattedDate}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                <div style="background: linear-gradient(135deg, #0f172a, #1d4ed8); padding: 24px; text-align: center; color: #ffffff;">
                    <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">Online Attendance System</h2>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd;">Official Student Attendance Alert</p>
                </div>
                
                <div style="padding: 28px 24px; background: #ffffff;">
                    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px;">
                        Hello <strong>${student.name}</strong>,
                    </p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px;">
                        Your attendance has been recorded for <strong>${formattedDate}</strong>.
                    </p>
                    
                    <div style="background: ${statusBg}; border: 1px solid ${statusColor}33; border-radius: 8px; padding: 16px 20px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; display: block; margin-bottom: 4px;">Status</span>
                        <span style="font-size: 20px; font-weight: 800; color: ${statusColor};">${statusText}</span>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; margin-bottom: 20px;">
                        ${student.rollNumber ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Roll Number</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${student.rollNumber}</td></tr>` : ""}
                        ${student.course ? `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Course</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${student.course}</td></tr>` : ""}
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${formattedDate}</td></tr>
                        <tr><td style="padding: 8px 0; color: #64748b;">Recorded By</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${markedByName || "System Admin"}</td></tr>
                    </table>

                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                        You can view your complete attendance history anytime by logging into your student portal.
                    </p>
                </div>

                <div style="background: #f1f5f9; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    © ${new Date().getFullYear()} Online Attendance System. All rights reserved.
                </div>
            </div>
        `
    };

    if (transporter) {
        try {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SENT] Live notification sent to ${student.email} (${status})`);
        } catch (err) {
            console.warn(`[EMAIL ERROR] Failed sending to ${student.email}: ${err.message}`);
        }
    } else {
        // Fallback Development Mode Simulation
        console.log(`[EMAIL NOTIFICATION (Simulated)]
To: ${student.email} (${student.name})
Subject: ${mailOptions.subject}
Status: ${statusText} | Date: ${formattedDate} | Marked By: ${markedByName || "Admin"}
(Note: Set EMAIL_USER and EMAIL_PASS in backend/.env to send real Gmail emails)`);
    }

    // 2. SMS / Phone Notification Simulation / Gateway
    if (student.phone) {
        const smsMessage = `[Attendance Alert] Dear ${student.name}, your attendance for ${formattedDate} has been marked as ${status.toUpperCase()}. - Online Attendance Management`;
        console.log(`[SMS NOTIFICATION (Simulated)]
To: ${student.phone} (${student.name})
Message: ${smsMessage}`);
    }
};

/**
 * Bulk send notifications without blocking API response
 */
const sendBulkAttendanceNotifications = (items, markedByName, date) => {
    // Process asynchronously in background
    setImmediate(async () => {
        for (const item of items) {
            try {
                await sendAttendanceNotification({
                    student: item.student,
                    status: item.status,
                    date,
                    markedByName
                });
            } catch (err) {
                console.error(`[NOTIFICATION ERROR]`, err);
            }
        }
    });
};

/**
 * Test SMTP connection and optionally send a test email
 */
const testEmailConnection = async (testRecipient) => {
    const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "";
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";

    if (!user || !pass) {
        return {
            success: false,
            message: "EMAIL_USER or EMAIL_PASS is empty in backend/.env. Please enter your Gmail ID and App Password."
        };
    }

    const transporter = createTransporter();

    try {
        await transporter.verify();
        if (testRecipient) {
            const info = await transporter.sendMail({
                from: `"Online Attendance System" <${user}>`,
                to: testRecipient,
                subject: "✅ Test Email - Attendance Notification System",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #1d4ed8; margin-top: 0;">Online Attendance System</h2>
                        <p style="color: #16a34a; font-weight: bold; font-size: 16px;">✓ Email Configuration is Working Perfectly!</p>
                        <p style="color: #475569;">Your Gmail SMTP setup is verified and ready to send live attendance alerts to students.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                        <small style="color: #94a3b8;">Sent via ${user} at ${new Date().toLocaleString()}</small>
                    </div>
                `
            });
            console.log(`[TEST EMAIL SUCCESS] Sent to ${testRecipient}, MessageId: ${info.messageId}`);
            return {
                success: true,
                message: `Test email sent successfully to ${testRecipient} (Message ID: ${info.messageId})`
            };
        }
        return {
            success: true,
            message: "SMTP Connection verified successfully!"
        };
    } catch (err) {
        console.error(`[SMTP ERROR]`, err);
        return {
            success: false,
            message: `SMTP Connection failed: ${err.message}`
        };
    }
};

module.exports = {
    sendAttendanceNotification,
    sendBulkAttendanceNotifications,
    testEmailConnection
};
