const User = require("../models/user");
const jwt = require("jsonwebtoken");


// Generate Token
const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                process.env.JWT_EXPIRE
        }
    );
};


// REGISTER
const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            rollNumber,
            course,
            semester,
            phone,
            faceDescriptor
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }


        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email already registered"
            });
        }


        if (!Array.isArray(faceDescriptor) || faceDescriptor.length < 64) {
            return res.status(400).json({
                message: "Face scan is required during registration"
            });
        }

        const user =
            await User.create({

                name,
                email,
                password,
                rollNumber,
                course,
                semester,
                phone,
                faceDescriptor

            });


        const token =
            generateToken(user);


        res.status(201).json({

            message:
                "Registration successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                course: user.course,
                semester: user.semester
            }

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// LOGIN
const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }


        const isMatch =
            await user.matchPassword(
                password
            );


        if (!isMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }


        const token =
            generateToken(user);


        res.json({

            message:
                "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNumber: user.rollNumber,
                course: user.course,
                semester: user.semester
            }

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Current User
const getMe = async (req, res) => {

    try {

        const user =
            await User.findById(
                req.user.id
            ).select("-password");


        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    register,
    login,
    getMe
};