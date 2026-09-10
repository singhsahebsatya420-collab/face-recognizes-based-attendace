const User = require("../models/user");


// Get All Students
const getStudents = async (
    req,
    res
) => {

    try {

        const {
            search = "",
            page = 1,
            limit = 10
        } = req.query;


        const skip =
            (page - 1) * limit;


        const searchQuery = {

            role: "student",

            $or: [

                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    rollNumber: {
                        $regex: search,
                        $options: "i"
                    }
                }

            ]
        };


        const students =
            await User.find(searchQuery)

                .select("-password")

                .skip(skip)

                .limit(Number(limit))

                .sort({
                    createdAt: -1
                });


        const total =
            await User.countDocuments(
                searchQuery
            );


        res.json({

            students,

            total,

            page: Number(page),

            pages:
                Math.ceil(
                    total / limit
                )

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Add Student
const addStudent = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            password,
            rollNumber,
            course,
            semester,
            phone
        } = req.body;


        const existing =
            await User.findOne({
                email
            });


        if (existing) {

            return res.status(400).json({
                message:
                    "Email already exists"
            });
        }


        const student =
            await User.create({

                name,
                email,
                password,
                rollNumber,
                course,
                semester,
                phone,

                role: "student"

            });


        res.status(201).json({

            message:
                "Student added successfully",

            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                rollNumber:
                    student.rollNumber,
                course: student.course
            }

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Update Student
const updateStudent = async (
    req,
    res
) => {

    try {

        const {
            name,
            email,
            rollNumber,
            course,
            semester,
            phone
        } = req.body;


        const student =
            await User.findById(
                req.params.id
            );


        if (!student) {

            return res.status(404).json({
                message:
                    "Student not found"
            });
        }


        if (
            email &&
            email !== student.email
        ) {

            const existing =
                await User.findOne({
                    email,
                    _id: {
                        $ne: student._id
                    }
                });

            if (existing) {

                return res.status(400).json({
                    message:
                        "Email already exists"
                });
            }

            student.email = email;
        }


        if (name) student.name = name;
        if (rollNumber) student.rollNumber = rollNumber;
        if (course) student.course = course;
        if (semester) student.semester = semester;
        if (phone !== undefined) student.phone = phone;


        await student.save();


        res.json({

            message:
                "Student updated successfully",

            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                rollNumber:
                    student.rollNumber,
                course: student.course,
                semester:
                    student.semester,
                phone: student.phone,
                role: student.role
            }

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


// Delete Student
const deleteStudent = async (
    req,
    res
) => {

    try {

        const student =
            await User.findById(
                req.params.id
            );


        if (!student) {

            return res.status(404).json({
                message:
                    "Student not found"
            });
        }


        await student.deleteOne();


        res.json({

            message:
                "Student deleted successfully"

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent
};