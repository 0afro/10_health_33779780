DROP DATABASE IF EXISTS health;
CREATE DATABASE health;
USE health;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WORKOUTS TABLE
CREATE TABLE workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exercise VARCHAR(100),
    weight INT,
    reps INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- create the marking account (password is 'smiths')
INSERT INTO users (username, password)
VALUES ('gold', 'smiths');
