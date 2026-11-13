require("dotenv").config();

const pool = require("./db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
    try {
        const name = "Demo User";
        const email = "demo@sweety.com";
        const password = "Demo@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id`,
            [name, email, hashedPassword]
        );

        let userId;

        if (userResult.rows.length > 0) {
            userId = userResult.rows[0].id;
        } else {
            const existingUser = await pool.query(
                "SELECT id FROM users WHERE email = $1",
                [email]
            );
            userId = existingUser.rows[0].id;
        }

        const readings = [
            [150, "2026-11-10", "morning_fasting"],
            [180, "2026-11-10", "after_breakfast"],
            [160, "2026-11-10", "after_lunch"],
            [140, "2026-11-10", "after_dinner"],
            [130, "2026-11-11", "morning_fasting"],
            [170, "2026-11-11", "after_lunch"],
            [120, "2026-11-12", "morning_fasting"]
        ];

        for (const [value, date, slot] of readings) {
            await pool.query(
                `INSERT INTO readings
                (user_id, reading_value, reading_date, time_slot)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, reading_date, time_slot)
                DO NOTHING`,
                [userId, value, date, slot]
            );
        }

        console.log("Demo user and readings created successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.error("Seeding failed:", error.message);
    } finally {
        await pool.end();
    }
};

seedDatabase();