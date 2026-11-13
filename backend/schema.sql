CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_value INTEGER NOT NULL CHECK (reading_value BETWEEN 40 AND 600),
    reading_date DATE NOT NULL,
    time_slot VARCHAR(30) NOT NULL CHECK (
        time_slot IN (
            'morning_fasting',
            'after_breakfast',
            'after_lunch',
            'after_dinner'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, reading_date, time_slot)
);