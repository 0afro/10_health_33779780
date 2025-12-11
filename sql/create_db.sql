-- Recreate the RepsRealm database and tables from scratch

DROP DATABASE IF EXISTS health;
CREATE DATABASE health;
USE health;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);

--Workouts table
CREATE TABLE workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  exercise VARCHAR(255),
  weight INT,
  reps INT,
  notes TEXT,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
