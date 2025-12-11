// index.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 8000;

// ------------------------------------------------------------
// Password validation
// ------------------------------------------------------------
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
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  port: process.env.HEALTH_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    return console.log("❌ Error connecting to DB:", err);
  }
  console.log("✅ Connected to MySQL");
});

// ------------------------------------------------------------
// EJS Setup
// ------------------------------------------------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ------------------------------------------------------------
// Login Check Middleware
// ------------------------------------------------------------
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// ------------------------------------------------------------
// Public Pages
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

app.get("/about", (req, res) => {
  res.render("about", { user: req.session.user });
});

// ------------------------------------------------------------
// LOGIN ROUTES
// ------------------------------------------------------------
app.get("/login", (req, res) => {
  res.render("login", { error: null, user: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, rows) => {
    if (err) return res.send("Database error.");

    if (rows.length === 0) {
      return res.render("login", {
        error: "Invalid username or password.",
        user: null,
      });
    }

    req.session.user = rows[0];
    res.redirect("/");
  });
});

// ------------------------------------------------------------
// REGISTER ROUTES
// ------------------------------------------------------------
app.get("/register", (req, res) => {
  res.render("register", { error: null, user: req.session.user });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Reserved user for marking
  if (username === "gold") {
    return res.render("register", {
      error: "This username is reserved for marking.",
      user: null,
    });
  }

  // Validate password
  if (!isValidPassword(password)) {
    return res.render("register", {
      error:
        "Password must be 8+ characters, include 2 numbers and 1 uppercase letter.",
      user: null,
    });
  }

  // Check if username exists
  const checkUserSql = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserSql, [username], (err, rows) => {
    if (rows.length > 0) {
      return res.render("register", {
        error: "Username already taken.",
        user: null,
      });
    }

    // Insert new user
    const insertSql =
      "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertSql, [username, password], (err2, result) => {
      if (err2) return res.send("Registration error.");

      // Auto login new user
      req.session.user = {
        id: result.insertId,
        username: username,
      };

      res.redirect("/");
    });
  });
});

// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ------------------------------------------------------------
// ADD WORKOUT
// ------------------------------------------------------------
app.get("/add-workout", requireLogin, (req, res) => {
  res.render("add-workout", { user: req.session.user });
});

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

// ------------------------------------------------------------
// VIEW WORKOUT HISTORY
// ------------------------------------------------------------
app.get("/view-workouts", requireLogin, (req, res) => {
  const sql =
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC";

  db.query(sql, [req.session.user.id], (err, rows) => {
    if (err) return res.send("Error fetching workouts.");

    res.render("view-workouts", {
      workouts: rows,
      user: req.session.user,
    });
  });
});

// ------------------------------------------------------------
// EDIT WORKOUT - SHOW FORM
// ------------------------------------------------------------
app.get("/edit-workout/:id", requireLogin, (req, res) => {
  const sql = "SELECT * FROM workouts WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, req.session.user.id], (err, rows) => {
    if (err || rows.length === 0) {
      return res.send("Workout not found or no permission.");
    }

    res.render("edit-workout", {
      workout: rows[0],
      user: req.session.user
    });
  });
});

// ------------------------------------------------------------
// EDIT WORKOUT - SAVE CHANGES
// ------------------------------------------------------------
app.post("/edit-workout/:id", requireLogin, (req, res) => {
  const { exercise, weight, reps, notes } = req.body;

  const sql = `
    UPDATE workouts
    SET exercise = ?, weight = ?, reps = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `;

  db.query(
    sql,
    [exercise, weight, reps, notes, req.params.id, req.session.user.id],
    (err) => {
      if (err) return res.send("Error updating workout.");

      res.redirect("/view-workouts");
    }
  );
});

// ------------------------------------------------------------
// DELETE WORKOUT
// ------------------------------------------------------------
app.get("/delete-workout/:id", requireLogin, (req, res) => {
  const sql = "DELETE FROM workouts WHERE id = ? AND user_id = ?";

  db.query(sql, [req.params.id, req.session.user.id], (err) => {
    if (err) return res.send("Error deleting workout.");

    res.redirect("/view-workouts");
  });
});


// ------------------------------------------------------------
// SEARCH WORKOUTS
// ------------------------------------------------------------
app.get("/search", requireLogin, (req, res) => {
  res.render("search", { user: req.session.user, results: null });
});

app.post("/search", requireLogin, (req, res) => {
  const searchTerm = "%" + req.body.query + "%";

  const sql =
    "SELECT * FROM workouts WHERE user_id = ? AND exercise LIKE ? ORDER BY created_at DESC";

  db.query(sql, [req.session.user.id, searchTerm], (err, rows) => {
    if (err) return res.send("Search error.");

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
  console.log(`🚀 Server running at http://localhost:${port}`);
});
