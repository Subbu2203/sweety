const express = require("express");
const router = express.Router();

const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

// Add Blood Glucose Reading
router.post("/", verifyToken, async (req, res) => {
    try {
        const { reading_value, reading_date, time_slot } = req.body;

        // Validate input
        if (!reading_value || !reading_date || !time_slot) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate glucose value
        if (!Number.isInteger(reading_value) ||
            reading_value < 40 || reading_value > 600) {
            return res.status(400).json({
                success: false,
                message: "Reading must be between 40 and 600"
            });
        }

        // Save reading
        const result = await pool.query(
            `INSERT INTO readings
             (user_id, reading_value, reading_date, time_slot)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                req.user.id,
                reading_value,
                reading_date,
                time_slot
            ]
        );

        res.status(201).json({
            success: true,
            message: "Reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Add reading error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Reading already exists for this date and time slot"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get All Blood Glucose Readings
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            message: "Readings fetched successfully",
            readings: result.rows
        });

    } catch (error) {
        console.error("Fetch readings error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

console.log("REPORT ROUTE LOADED");

// Get Blood Glucose Reports
console.log("REPORT ROUTE REGISTERED");
router.get("/reports", verifyToken, async (req, res) => {
    try {
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());

        const [year, month] = today.split("-").map(Number);

        const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

        const tomorrow = new Date(Date.UTC(year, month - 1, Number(today.slice(8, 10)) + 1))
            .toISOString().slice(0, 10);
        // const nextMonthStart = new Date(Date.UTC(year, month, 1))
        //     .toISOString().slice(0, 10);

        const previousMonthStart = new Date(Date.UTC(year, month - 2, 1))
            .toISOString().slice(0, 10);

        const getReport = async (startDate, endDate) => {
            const result = await pool.query(
                `SELECT
                    COUNT(*)::INTEGER AS count,
                    MIN(reading_value) AS min,
                    MAX(reading_value) AS max,
                    ROUND(AVG(reading_value), 1) AS average
                 FROM readings
                 WHERE user_id = $1
                 AND reading_date >= $2
                 AND reading_date < $3`,
                [req.user.id, startDate, endDate]
            );

            return result.rows[0];
        };

        const [daily, monthToDate, previousMonth] = await Promise.all([
            getReport(today, tomorrow),
            getReport(monthStart, tomorrow),
            getReport(previousMonthStart, monthStart)
        ]);

        res.status(200).json({
            success: true,
            reports: {
                daily,
                monthToDate,
                previousMonth
            }
        });

    } catch (error) {
        console.error("Reports error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch reports"
        });
    }
});

// Update Blood Glucose Reading
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { reading_value, reading_date, time_slot } = req.body;
        const { id } = req.params;

        if (!reading_value || !reading_date || !time_slot) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!Number.isInteger(reading_value) ||
            reading_value < 40 || reading_value > 600) {
            return res.status(400).json({
                success: false,
                message: "Reading must be between 40 and 600"
            });
        }

        const result = await pool.query(
            `UPDATE readings
             SET reading_value = $1,
                 reading_date = $2,
                 time_slot = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_value, reading_date, time_slot, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Reading not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Update reading error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Reading already exists for this date and time slot"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Delete Blood Glucose Reading
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Reading not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Reading deleted successfully"
        });

    } catch (error) {
        console.error("Delete reading error:", error.message);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


module.exports = router;