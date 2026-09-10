const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ["student", "admin"],
            default: "student"
        },

        rollNumber: {
            type: String,
            unique: true,
            sparse: true
        },

        course: {
            type: String,
            default: "MCA"
        },

        semester: {
            type: Number,
            default: 1
        },

        phone: {
            type: String,
            default: ""
        },

        // Face embedding captured during registration.
        // Store the numeric face descriptor, not the raw camera image.
        faceDescriptor: {
            type: [Number],
            default: undefined,
            select: false
        }

    },
    {
        timestamps: true
    }
);


// Password Hash
userSchema.pre(
    "save",
    async function (next) {

        if (!this.isModified("password")) {
            return next();
        }

        const salt =
            await bcrypt.genSalt(10);

        this.password =
            await bcrypt.hash(
                this.password,
                salt
            );

        next();
    }
);


// Compare Password
userSchema.methods.matchPassword =
    async function (enteredPassword) {

        return await bcrypt.compare(
            enteredPassword,
            this.password
        );
    };


module.exports =
    mongoose.model("User", userSchema);