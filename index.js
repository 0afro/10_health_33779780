// index.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 8000;

// Password validation helper
function isValidPassword(password) {
  const hasMinLength = password.length >= 8;
  const hasTwoNumbers = (password.match(/\d/g) || []).length >= 2;
  const hasUppercase = /[A-Z]/.test(password);
  return hasMinLength && hasTwoNumbers && hasUppercase;
}

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "repsrealmsecret",
    resave: false,
    saveUninitialized: true,
  })
);

// ------------------------------------------------------------
// MySQL Connection
// ------------------------------------------------------------
const db = mysql.createConnection({
  host: process.env.HEALTH_HOST || "localhost",
  user: process.env.HEALTH_USER || "root",
  password: process.env.HEALTH_PASSWORD || "",
  database: process.env.HEALTH_DATABASE || "health",
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
    return res.redirect("/user/login");
  }
  next();
}

// ------------------------------------------------------------
// PUBLIC ROUTES
// ------------------------------------------------------------

// Home
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});

// About
app.get("/about", (req, res) => {
  res.render("about", { user: req.session.user || null });
});

// LOGIN PAGE
app.get("/user/login", (req, res) => {
  res.render("login", { error: null, user: null });
});

// LOGIN HANDLER
app.post("/user/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, rows) => {
    if (err) return res.send("DB error.");

    if (rows.length === 0) {
      return res.render("login", {
        error: "Invalid login.",
        user: null,
      });
    }

    req.session.user = rows[0];
    res.redirect("/");
  });
});

// REGISTER PAGE
app.get("/user/register", (req, res) => {
  res.render("register", { error: null, user: null });
});

// REGISTER HANDLER
app.post("/user/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValidPassword(password)) {
    return res.render("register", {
      error: "Password must be 8+ chars, include 2 numbers and 1 uppercase.",
      user: null,
    });
  }

  const checkSql = "SELECT * FROM users WHERE username = ?";
  db.query(checkSql, [username], (err, rows) => {
    if (rows.length > 0) {
      return res.render("register", {
        error: "Username already taken.",
        user: null,
      });
    }

    const insertSql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertSql, [username, password], (err2, result) => {
      if (err2) return res.send("Registration error.");

      req.session.user = {
        id: result.insertId,
        username: username,
      };

      res.redirect("/");
    });
  });
});

// LOGOUT
app.get("/user/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/user/login");
  });
});

// ------------------------------------------------------------
// PROTECTED ROUTES
// ------------------------------------------------------------

// ADD WORKOUT FORM
app.get("/add-workout", requireLogin, (req, res) => {
  res.render("add-workout", { user: req.session.user });
});

// ADD WORKOUT HANDLER
app.post("/add-workout", requireLogin, (req, res) => {
  const { exercise, weight, reps, notes } = req.body;
  const sql =
    "INSERT INTO workouts (user_id, exercise, weight, reps, notes) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [req.session.user.id, exercise, weight, reps, notes],
    (err) => {
      if (err) return res.send("Error saving workout.");

      res.redirect("/view-workouts");
    }
  );
});

// VIEW WORKOUTS
app.get("/view-workouts", requireLogin, (req, res) => {
  const sql =
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [req.session.user.id], (err, rows) => {
    res.render("view-workouts", {
      workouts: rows,
      user: req.session.user,
    });
  });
});

// SEARCH
app.get("/search", requireLogin, (req, res) => {
  res.render("search", { user: req.session.user });
});

app.post("/search", requireLogin, (req, res) => {
  const query = `%${req.body.query}%`;

  const sql =
    "SELECT * FROM workouts WHERE user_id = ? AND exercise LIKE ? ORDER BY created_at DESC";

  db.query(sql, [req.session.user.id, query], (err, rows) => {
    res.render("search", {
      results: rows,
      user: req.session.user,
    });
  });
});

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
