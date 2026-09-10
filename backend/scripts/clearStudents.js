require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/user");
const Attendance = require("../models/attendece");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const students = await User.find({ role: "student" }).select("_id");
    const ids = students.map(s => s._id);
    const attendanceResult = ids.length
      ? await Attendance.deleteMany({ student: { $in: ids } })
      : { deletedCount: 0 };
    const studentResult = await User.deleteMany({ role: "student" });
    console.log(`Removed ${studentResult.deletedCount} student(s) and ${attendanceResult.deletedCount} attendance record(s).`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Could not clear students:", err.message);
    process.exitCode = 1;
  }
})();
