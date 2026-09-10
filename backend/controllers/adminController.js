const User =
    require("../models/user");


// GET ALL USERS
const getAllUsers = async (
    req,
    res
) => {

    try {

        const users =
            await User.find()

                .select(
                    "-password"
                )

                .sort({
                    createdAt: -1
                });


        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// MAKE ADMIN
const makeAdmin = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });
        }


        user.role = "admin";

        await user.save();


        res.json({

            message:
                `${user.name} is now an admin`

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// REMOVE ADMIN
const removeAdmin = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });
        }


        // Admin khud ko remove nahi kar sakta

        if (
            user._id.toString() ===
            req.user._id.toString()
        ) {

            return res.status(400).json({

                message:
                    "You cannot remove yourself"

            });
        }


        user.role = "student";

        await user.save();


        res.json({

            message:
                `${user.name} is now a student`

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// CREATE NEW ADMIN
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: "admin"
        });

        res.status(201).json({
            message: `Admin ${user.name} created successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const fs = require("fs");
const path = require("path");
const { testEmailConnection } = require("../services/notificationService");

// TEST EMAIL CONFIGURATION
const testEmailConfig = async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        const targetEmail = recipientEmail || req.user?.email;

        const result = await testEmailConnection(targetEmail);
        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET CURRENT EMAIL CONFIG STATUS
const getEmailConfig = (req, res) => {
    const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    res.json({
        isConfigured,
        emailUser: process.env.EMAIL_USER ? process.env.EMAIL_USER.replace(/(.{2})(.*)(@.*)/, "$1***$3") : "",
        fullEmailUser: process.env.EMAIL_USER || "",
        emailService: process.env.EMAIL_SERVICE || "gmail"
    });
};

// SAVE EMAIL CONFIG
const saveEmailConfig = async (req, res) => {
    try {
        const { emailUser, emailPass, emailService = "gmail" } = req.body;

        if (!emailUser || !emailPass) {
            return res.status(400).json({
                success: false,
                message: "Please enter both your Gmail address and 16-character Google App Password."
            });
        }

        const cleanEmail = emailUser.trim();
        const cleanPass = emailPass.trim().replace(/[\s-]+/g, ""); // Strip all spaces and hyphens

        // Set in current process runtime
        process.env.EMAIL_USER = cleanEmail;
        process.env.EMAIL_PASS = cleanPass;
        process.env.EMAIL_SERVICE = emailService;

        // Persist to .env file
        const envPath = path.resolve(__dirname, "../.env");
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, "utf-8");
            
            if (envContent.includes("EMAIL_USER=")) {
                envContent = envContent.replace(/EMAIL_USER=.*/g, `EMAIL_USER=${cleanEmail}`);
            } else {
                envContent += `\nEMAIL_USER=${cleanEmail}`;
            }

            if (envContent.includes("EMAIL_PASS=")) {
                envContent = envContent.replace(/EMAIL_PASS=.*/g, `EMAIL_PASS=${cleanPass}`);
            } else {
                envContent += `\nEMAIL_PASS=${cleanPass}`;
            }

            if (envContent.includes("EMAIL_SERVICE=")) {
                envContent = envContent.replace(/EMAIL_SERVICE=.*/g, `EMAIL_SERVICE=${emailService}`);
            } else {
                envContent += `\nEMAIL_SERVICE=${emailService}`;
            }

            fs.writeFileSync(envPath, envContent, "utf-8");
        }

        // Test connection
        const verifyResult = await testEmailConnection(null);
        if (!verifyResult.success) {
            return res.status(400).json({
                success: false,
                isConfigured: true,
                message: `Credentials saved, but Google SMTP error: ${verifyResult.message}. (Tip: Make sure 2-Step Verification is ON in Google Account, and generate a 16-letter code from myaccount.google.com/apppasswords).`
            });
        }

        res.json({
            success: true,
            isConfigured: true,
            emailUser: cleanEmail,
            message: `Gmail connected successfully for ${cleanEmail}! Student notifications are now active.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    makeAdmin,
    removeAdmin,
    createAdmin,
    testEmailConfig,
    getEmailConfig,
    saveEmailConfig
};