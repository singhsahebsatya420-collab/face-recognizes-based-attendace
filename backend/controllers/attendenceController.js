const Attendance = require("../models/attendece");
const User = require("../models/user");
const { sendBulkAttendanceNotifications } = require("../services/notificationService");

// MARK BULK ATTENDANCE
const markAttendance = async (req, res) => {
    try {
        const { date, attendance, notify = true } = req.body;

        if (!date || !Array.isArray(attendance)) {
            return res.status(400).json({
                message: "Invalid attendance data"
            });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        for (const item of attendance) {
            await Attendance.findOneAndUpdate(
                {
                    student: item.studentId,
                    date: attendanceDate
                },
                {
                    student: item.studentId,
                    date: attendanceDate,
                    status: item.status,
                    markedBy: req.user._id
                },
                {
                    upsert: true,
                    new: true
                }
            );
        }

        // Trigger Notifications (Email & SMS) asynchronously
        if (notify && attendance.length > 0) {
            const studentIds = attendance.map((a) => a.studentId);
            const studentDocs = await User.find({ _id: { $in: studentIds } }).select("name email phone rollNumber course");

            const notificationPayload = attendance.map((item) => {
                const student = studentDocs.find((s) => s._id.toString() === item.studentId.toString());
                return {
                    student,
                    status: item.status
                };
            }).filter((n) => n.student && n.student.email);

            sendBulkAttendanceNotifications(
                notificationPayload,
                req.user?.name || "Admin",
                attendanceDate
            );
        }

        res.json({
            message: "Attendance saved and notifications sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// STUDENT OWN ATTENDANCE
const getMyAttendance = async (
    req,
    res
) => {

    try {

        const records =
            await Attendance.find({

                student:
                    req.user._id

            })

                .populate(
                    "markedBy",
                    "name"
                )

                .sort({
                    date: -1
                });


        const total =
            records.length;


        const present =
            records.filter(
                record =>
                    record.status ===
                    "present"
            ).length;


        const absent =
            records.filter(
                record =>
                    record.status ===
                    "absent"
            ).length;


        const percentage =
            total === 0
                ? 0
                : (
                    present /
                    total *
                    100
                ).toFixed(2);


        res.json({

            records,

            summary: {

                total,

                present,

                absent,

                percentage

            }

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// ADMIN ALL ATTENDANCE
const getAllAttendance = async (
    req,
    res
) => {

    try {

        const {
            date
        } = req.query;


        let query = {};


        if (date) {

            const start =
                new Date(date);

            start.setHours(
                0,
                0,
                0,
                0
            );


            const end =
                new Date(date);

            end.setHours(
                23,
                59,
                59,
                999
            );


            query.date = {

                $gte: start,

                $lte: end

            };
        }


        const records =
            await Attendance.find(query)

                .populate(
                    "student",
                    "name email rollNumber course"
                )

                .populate(
                    "markedBy",
                    "name"
                )

                .sort({
                    date: -1
                });


        res.json(records);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// GET ATTENDANCE SUMMARY FOR DASHBOARD
const getAttendanceSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get all active registered students
        const students = await User.find({ role: "student" }).select("_id");
        const studentIds = students.map(s => s._id.toString());
        const totalStudents = studentIds.length;

        // Get today's attendance records for valid students only
        const attendanceToday = await Attendance.find({
            date: { $gte: today, $lt: tomorrow },
            student: { $in: students.map(s => s._id) }
        });

        // Count unique students marked present (capped at totalStudents)
        const presentStudentIds = new Set(
            attendanceToday
                .filter(a => a.status === "present")
                .map(a => a.student.toString())
        );

        const presentToday = Math.min(presentStudentIds.size, totalStudents);
        // All students who are not present are absent
        const absentToday = Math.max(totalStudents - presentToday, 0);
        const percentage = totalStudents === 0 ? 0 : Number(((presentToday / totalStudents) * 100).toFixed(2));

        res.json({
            totalStudents,
            totalMarked: attendanceToday.length,
            present: presentToday,
            absent: absentToday,
            percentage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET ATTENDANCE FOR SPECIFIC DATE
const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // Get all active registered students sorted by name
        const students = await User.find({ role: "student" }).select("-password").sort({ name: 1 });

        // Get attendance records for this date
        const attendanceRecords = await Attendance.find({
            date: { $gte: start, $lte: end },
            student: { $in: students.map(s => s._id) }
        });

        // Map students with their attendance status
        const records = students.map(student => {
            const attendance = attendanceRecords.find(a => a.student.toString() === student._id.toString());
            return {
                student: {
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                    rollNumber: student.rollNumber,
                    course: student.course,
                    semester: student.semester
                },
                attendance: attendance ? {
                    _id: attendance._id,
                    status: attendance.status,
                    date: attendance.date
                } : {
                    status: "absent"
                },
                isMarked: !!attendance
            };
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getMyAttendance,
    getAllAttendance,
    getAttendanceSummary,
    getAttendanceByDate
};