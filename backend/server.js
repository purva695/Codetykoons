require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ===============================
// UPLOADS
// ===============================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);


// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "CodeTykoons Blog API is running"
    });
});


// ===============================
// CREATE / UPDATE ADMIN
// ===============================

async function setupAdmin() {
    try {
        const email = String(process.env.ADMIN_EMAIL || "")
            .trim()
            .toLowerCase();

        const password = String(
            process.env.ADMIN_PASSWORD || ""
        );

        if (!email || !password) {
            console.log(
                "ADMIN_EMAIL or ADMIN_PASSWORD missing in .env"
            );
            return;
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const existingAdmin = await Admin.findOne({
            email
        });

        if (!existingAdmin) {

            await Admin.create({
                email,
                password: hashedPassword
            });

            console.log(
                `Admin account created: ${email}`
            );

        } else {

            existingAdmin.password = hashedPassword;

            await existingAdmin.save();

            console.log(
                `Admin account ready: ${email}`
            );
        }

    } catch (error) {
        console.error(
            "Admin setup failed:",
            error.message
        );
    }
}


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

async function startServer() {

    try {

        await connectDB();

        await setupAdmin();

        app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT}`
            );
        });

    } catch (error) {

        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
}

startServer();