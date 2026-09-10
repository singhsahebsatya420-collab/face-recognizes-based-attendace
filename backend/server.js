const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();


// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// Routes
app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/students",
    require("./routes/studentRoutes")
);

app.use(
    "/api/attendance",
    require("./routes/attendenceRoutes")
);

app.use(
    "/api/admin",
    require("./routes/adminRoutes")
);


// Home Route
app.get("/", (req, res) => {

    res.json({
        message:
            "Online Attendance API Running"
    });
});


// Error Handler
app.use((err, req, res, next) => {

    console.log(err);

    res.status(500).json({
        message: "Server Error"
    });
});


const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});