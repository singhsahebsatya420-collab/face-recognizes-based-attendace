const User = require("../models/user");
const Attendance = require("../models/attendece");

// Euclidean distance between two 128-value face descriptors.
const distance = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const d = Number(a[i]) - Number(b[i]);
        sum += d * d;
    }
    return Math.sqrt(sum);
};

// Public face attendance endpoint.
// The browser sends a face descriptor; the server matches it against
// registered student descriptors and records attendance for the match.
const scanFaceAttendance = async (req, res) => {
    try {
        const { descriptor } = req.body;

        if (!Array.isArray(descriptor) || descriptor.length !== 128) {
            return res.status(400).json({
                message: "Invalid face scan. Please keep your full face inside the camera."
            });
        }

        const students = await User.find({
            role: "student",
            faceDescriptor: { $exists: true, $ne: [] }
        }).select("+faceDescriptor name email rollNumber");

        if (!students.length) {
            return res.status(404).json({
                message: "No registered face found. Please register first."
            });
        }

        let bestStudent = null;
        let bestDistance = Infinity;

        for (const student of students) {
            const d = distance(descriptor, student.faceDescriptor);
            if (d < bestDistance) {
                bestDistance = d;
                bestStudent = student;
            }
        }

        // Conservative threshold for face-api.js 128D descriptors.
        const MATCH_THRESHOLD = 0.48;

        if (!bestStudent || bestDistance > MATCH_THRESHOLD) {
            return res.status(401).json({
                message: "Face not recognized. Please try again in good lighting."
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existing = await Attendance.findOne({
            student: bestStudent._id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existing) {
            return res.json({
                success: true,
                alreadyMarked: true,
                message: "Done — attendance is already marked for today.",
                student: {
                    name: bestStudent.name,
                    rollNumber: bestStudent.rollNumber
                }
            });
        }

        await Attendance.create({
            student: bestStudent._id,
            date: today,
            status: "present",
            markedBy: bestStudent._id
        });

        return res.json({
            success: true,
            alreadyMarked: false,
            message: "Done — attendance marked successfully.",
            student: {
                name: bestStudent.name,
                rollNumber: bestStudent.rollNumber
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { scanFaceAttendance };
