const express = require("express");

const { scanFaceAttendance } = require("../controllers/faceAttendanceController");

const {
    markAttendance,
    getMyAttendance,
    getAllAttendance,
    getAttendanceSummary,
    getAttendanceByDate
} =
    require(
        "../controllers/attendenceController"
    );


const {
    protect
} =
    require(
        "../middleware/authMiddleware"
    );


const {
    adminOnly
} =
    require(
        "../middleware/roleMiddleware"
    );


const router =
    express.Router();

// Face based student attendance (no login required; face identifies the student)
router.post(
    "/face-scan",
    scanFaceAttendance
);



router.get(
    "/summary",
    protect,
    adminOnly,
    getAttendanceSummary
);


router.get(
    "/date/:date",
    protect,
    getAttendanceByDate
);


router.get(
    "/my",
    protect,
    getMyAttendance
);


router.get(
    "/all",
    protect,
    adminOnly,
    getAllAttendance
);


router.post(
    "/mark",
    protect,
    adminOnly,
    markAttendance
);


module.exports = router;