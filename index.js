// index.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 8000;

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: "repsrealmsecret",
  resave: false,
  saveUninitialized: true
}));

// ------------------------------------------------------------
// MySQL Connection
// ------------------------------------------------------------
const db = mysql.createConnection({
  host: process.env.HEALTH_HOST || "localhost",
  user: process.env.HEALTH_USER || "root",
  password: process.env.HEALTH_PASSWORD || "",
  database: process.env.HEALTH_DATABASE || "health"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Error connecting to DB:", err);
  } else {
    console.log("✅ Connected to MySQL database.");
  }
});

// ------------------------------------------------------------
// EJS Setup
// ------------------------------------------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------------------------------------------------
// Login Protection Middleware
// ------------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// ------------------------------------------------------------
// Public Routes (No Login Required)
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/about", (req, res) => {
  res.render("about", { user: req.session.user });
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login", { error: null, user: null });
});

// HANDLE LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, rows) => {
    if (err) return res.send("DB error.");

    if (rows.length === 0) {
      return res.render("login", { error: "Invalid login.", user: null });
    }

    req.session.user = rows[0];
    res.redirect("/");
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ------------------------------------------------------------
// PROTECTED ROUTES (User Must Be Logged In)
// ------------------------------------------------------------

// SHOW Add Workout Form
app.get("/add-workout", requireLogin, (req, res) => {
  res.render("add-workout", { user: req.session.user });
});

// HANDLE Add Workout Form Submission
app.post("/add-workout", requireLogin, (req, res) => {
  const { exercise, weight, reps, notes } = req.body;

  const sql = "INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [req.session.user.id, exercise, weight, reps, notes],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send("Error saving workout.");
      }

      res.send(`
        <h2>Workout saved successfully!</h2>
        <a href='/'>Back Home</a>
      `);
    }
  );
});

// VIEW WORKOUT HISTORY
app.get("/view-workouts", requireLogin, (req, res) => {
  const sql = "SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [req.session.user.id], (err, rows) => {
    if (err) return res.send("Error fetching workouts.");

    res.render("view-workouts", { workouts: rows, user: req.session.user });
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
