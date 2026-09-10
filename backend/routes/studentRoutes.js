const express = require("express");

const {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    adminOnly
} = require("../middleware/roleMiddleware");


const router =
    express.Router();


router.get(
    "/",
    protect,
    adminOnly,
    getStudents
);


router.post(
    "/",
    protect,
    adminOnly,
    addStudent
);


router.put(
    "/:id",
    protect,
    adminOnly,
    updateStudent
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteStudent
);


module.exports = router;