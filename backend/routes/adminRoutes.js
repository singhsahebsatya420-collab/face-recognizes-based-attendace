const express = require("express");

const {
    getAllUsers,
    makeAdmin,
    removeAdmin,
    createAdmin,
    testEmailConfig,
    getEmailConfig,
    saveEmailConfig
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// GET all users
router.get("/users", protect, adminOnly, getAllUsers);

// CREATE new admin directly
router.post("/create-admin", protect, adminOnly, createAdmin);

// EMAIL CONFIGURATION
router.get("/email-config", protect, adminOnly, getEmailConfig);
router.post("/email-config", protect, adminOnly, saveEmailConfig);
router.post("/test-email", protect, adminOnly, testEmailConfig);

// PROMOTE to admin
router.put("/make-admin/:id", protect, adminOnly, makeAdmin);
router.put("/users/:id/make-admin", protect, adminOnly, makeAdmin);

// REMOVE admin role
router.put("/remove-admin/:id", protect, adminOnly, removeAdmin);
router.put("/users/:id/remove-admin", protect, adminOnly, removeAdmin);

module.exports = router;