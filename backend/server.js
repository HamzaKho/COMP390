const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "comp390",
});

app.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hashing the password
    let sqlQuery = "SELECT * FROM users WHERE `username` = ?";
    db.query(sqlQuery, [req.body.username], (error, data) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "An error has occurred, please try again later." });
      }
      if (data.length === 0) {
        // No user with the same username
        sqlQuery = "INSERT INTO users (username, hashed_password) VALUES (?)";
        const insertValues = [req.body.username, hashedPassword];
        db.query(sqlQuery, [insertValues], (error, data) => {
          if (error) {
            return res.status(500).json({ message: "Database error", error });
          } else {
            return res
              .status(200)
              .json({ message: "User registered successfully", data });
          }
        });
      } else {
        return res.status(401).json({ message: "Username already registered" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Error hashing password", error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM users WHERE `username` = ?";
    const values = [req.body.username];
    db.query(sqlQuery, values, async (error, users) => {
      if (error) {
        return res.status(500).json({ message: "Database error", error });
      }
      if (users.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      const user = users[0];
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.hashed_password
      );
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      return res.status(200).json({ message: "Successfully signed in", user });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

app.listen(8081, () => {
  console.log("Listening");
});
