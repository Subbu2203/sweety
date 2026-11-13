require("./db");

const readingsRoutes = require("./routes/readingsRoutes");
const authRoutes = require("./routes/authRoutes");
console.log(readingsRoutes.stack.map(r => r.route?.path));
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/readings", (req, res, next) => {
    console.log("READINGS API HIT:", req.originalUrl);
    next();
});
app.use("/api/readings", readingsRoutes);

// Test API
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sweety Backend is running!"
    });
});

// Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
