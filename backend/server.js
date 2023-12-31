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

app.post("/search", (req, res) => {
  const searchTerm = req.body.searchTerm;
  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
  }
  const sqlQuery = "SELECT id, username FROM users WHERE username LIKE ?";
  db.query(sqlQuery, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }
    return res.status(200).json(results);
  });
});

app.post("/sendFriendRequest", (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and receiver IDs are required" });
  }

  // Check if a friend request already exists
  const checkExistingRequestQuery =
    "SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ?";
  db.query(
    checkExistingRequestQuery,
    [senderId, receiverId],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Database error", error });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      // Insert the new friend request into the database
      const insertRequestQuery =
        "INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)";
      db.query(
        insertRequestQuery,
        [senderId, receiverId],
        (error, insertResults) => {
          if (error) {
            return res.status(500).json({ message: "Database error", error });
          }

          return res
            .status(200)
            .json({ message: "Friend request sent successfully" });
        }
      );
    }
  );
});

app.post("/respondToFriendRequest", (req, res) => {
  const requestId = req.body.requestId;
  const response = req.body.response; // 'accepted' or 'rejected'

  if (!requestId || !response) {
    return res
      .status(400)
      .json({ message: "Request ID and response are required" });
  }

  const getFriendRequestQuery = "SELECT * FROM friend_requests WHERE id = ?";
  db.query(getFriendRequestQuery, [requestId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    const friendRequest = results[0];
    if (response === "accepted") {
      // Ensure user1_id is always the smaller ID to prevent duplicates
      const user1Id = Math.min(
        friendRequest.sender_id,
        friendRequest.receiver_id
      );
      const user2Id = Math.max(
        friendRequest.sender_id,
        friendRequest.receiver_id
      );

      const checkExistingFriendshipQuery =
        "SELECT 1 FROM friendships WHERE user1_id = ? AND user2_id = ?";
      db.query(
        checkExistingFriendshipQuery,
        [user1Id, user2Id],
        (checkError, checkResults) => {
          if (checkError) {
            return res
              .status(500)
              .json({ message: "Database error", checkError });
          }
          if (checkResults.length > 0) {
            // Friendship already exists, handle accordingly
            return res
              .status(409)
              .json({ message: "Friendship already exists" });
          } else {
            // Insert the new friendship
            const insertFriendshipQuery =
              "INSERT INTO friendships (user1_id, user2_id) VALUES (?, ?)";
            db.query(
              insertFriendshipQuery,
              [user1Id, user2Id],
              (insertError, insertResults) => {
                if (insertError) {
                  return res
                    .status(500)
                    .json({ message: "Database error", insertError });
                }
                // Update the friend_requests table status after inserting into friendships
                const updateRequestQuery =
                  "UPDATE friend_requests SET status = ? WHERE id = ?";
                db.query(
                  updateRequestQuery,
                  [response, requestId],
                  (updateError, updateResults) => {
                    if (updateError) {
                      return res
                        .status(500)
                        .json({ message: "Database error", updateError });
                    }
                    return res
                      .status(200)
                      .json({ message: "Friend request accepted" });
                  }
                );
              }
            );
          }
        }
      );
    } else {
      // If the response is not 'accepted', you can just update the request status.
      const updateRequestQuery =
        "UPDATE friend_requests SET status = ? WHERE id = ?";
      db.query(
        updateRequestQuery,
        [response, requestId],
        (updateError, updateResults) => {
          if (updateError) {
            return res
              .status(500)
              .json({ message: "Database error", updateError });
          }
          return res.status(200).json({ message: "Friend request rejected" });
        }
      );
    }
  });
});

app.get("/friendRequests/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlQuery = `
    SELECT fr.id, u.username as senderUsername 
    FROM friend_requests fr 
    JOIN users u ON fr.sender_id = u.id 
    WHERE fr.receiver_id = ? AND fr.status = 'pending'`;

  db.query(sqlQuery, [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }
    return res.status(200).json(results);
  });
});

app.get("/sentFriendRequests/:userId", (req, res) => {
  const userId = req.params.userId;
  const sqlQuery = `
  SELECT fr.id, u.username AS receiverUsername, fr.status
  FROM friend_requests AS fr
  JOIN users AS u ON fr.receiver_id = u.id
  WHERE fr.sender_id = ? AND fr.status != 'accepted'`;

  db.query(sqlQuery, [userId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    // Check if results is empty, and send an empty array if there are no sent friend requests.
    if (results.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(results);
  });
});

app.get("/userFriends/:userId", (req, res) => {
  console.log("getting friends");
  const userId = req.params.userId;
  console.log(userId);
  const sqlQuery = `
    SELECT 
      f.id, 
      CASE 
        WHEN f.user1_id = ? THEN u2.username 
        ELSE u1.username 
      END AS friendUsername
    FROM 
      friendships f
      LEFT JOIN users u1 ON f.user1_id = u1.id
      LEFT JOIN users u2 ON f.user2_id = u2.id
    WHERE 
      f.user1_id = ? OR f.user2_id = ?;
  `;
  db.query(sqlQuery, [userId, userId, userId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(200).json([]);
    }
    console.log(results);
    return res.status(200).json(results);
  });
});

app.listen(8081, () => {
  console.log("Listening");
});
