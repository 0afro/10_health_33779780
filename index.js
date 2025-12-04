// index.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 8000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.HEALTH_HOST || "localhost",
  user: process.env.HEALTH_USER || "root",
  password: process.env.HEALTH_PASSWORD || "",
  database: process.env.HEALTH_DATABASE || "health"
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to DB:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
