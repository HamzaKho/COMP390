const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const axios = require("axios");

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
  const { searchTerm, loggedInUserId } = req.body;
  if (!searchTerm) {
    return res.status(400).json({ message: "Search term is required" });
  }

  const sqlQuery = `
    SELECT u.id, u.username 
    FROM users u
    LEFT JOIN friend_requests fr 
    ON u.id = fr.receiver_id AND fr.sender_id = ?
    WHERE u.username LIKE ? AND u.id != ? AND fr.id IS NULL`;

  db.query(
    sqlQuery,
    [loggedInUserId, `%${searchTerm}%`, loggedInUserId],
    (error, results) => {
      if (error) {
        return res.status(500).json({ message: "Database error", error });
      }
      return res.status(200).json(results);
    }
  );
});

app.get("/getUsername/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT username FROM users WHERE id = ?;`;

  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: "Database error", error });
    }
    if (results.length > 0) {
      const username = results[0].username;
      return res.status(200).json({ username });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

app.get("/getUserId/:username", (req, res) => {
  const { username } = req.params; // Extract the username from the request parameters

  const query = `SELECT id FROM users WHERE username = ? LIMIT 1;`; // Prepare your SQL query

  db.query(query, [username], (error, results) => {
    if (error) {
      console.error("Database error finding user ID", error);
      return res.status(500).json({ message: "Database error", error });
    }

    if (results.length > 0) {
      res.status(200).json({ userId: results[0].id });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

app.post("/updateUsername/:userId", (req, res) => {
  const userId = req.params.userId;
  const { newUsername } = req.body;

  // Check if the username is taken
  db.query(
    "SELECT id FROM users WHERE username = ?",
    [newUsername],
    (error, results) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Database error", error });
      }
      if (results.length > 0) {
        return res.json({ success: false, message: "Username is taken." });
      } else {
        // Update the username
        db.query(
          "UPDATE users SET username = ? WHERE id = ?",
          [newUsername, userId],
          (error, results) => {
            if (error) {
              return res
                .status(500)
                .json({ success: false, message: "Database error", error });
            }
            return res.json({
              success: true,
              message: "Username updated successfully.",
            });
          }
        );
      }
    }
  );
});

app.post("/sendFriendRequest", (req, res) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and receiver IDs are required" });
  }
  if (senderId == receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and reciever ID is the same" });
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

app.post("/deleteFriendRequest", (req, res) => {
  const requestId = req.body.requestId;
  const query = "DELETE FROM friend_requests WHERE id = ?";
  db.query(query, [requestId], (error) => {
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }
    return res.status(200).json({ message: "Friend request deleted" });
  });
});

app.delete("/clearAcceptedRequests", (req, res) => {
  const deleteAcceptedRequestsQuery =
    "DELETE FROM friend_requests WHERE status = 'accepted'";

  db.query(deleteAcceptedRequestsQuery, (error, results) => {
    if (error) {
      console.error(
        "Database error while deleting accepted friend requests:",
        error
      );
      res.status(500).json({ message: "Database error", error });
    } else {
      console.log(
        `Cleared all accepted friend requests. Rows affected: ${results.affectedRows}`
      );
      res.status(200).json({
        message: "Cleared all accepted friend requests",
        rowsAffected: results.affectedRows,
      });
    }
  });
});

app.post("/removeFriend", (req, res) => {
  const { loggedInUserId, friendUsername } = req.body;
  console.log("Received IDs:", loggedInUserId, friendUsername);

  if (!loggedInUserId || !friendUsername) {
    return res
      .status(400)
      .json({ message: "User ID and friend's username are required" });
  }

  // First, find the ID of the friend username
  const findFriendIdQuery = "SELECT id FROM users WHERE username = ?";
  db.query(findFriendIdQuery, [friendUsername], (findError, findResults) => {
    if (findError) {
      console.error("Database error while finding friend ID:", findError);
      return res.status(500).json({ message: "Database error", findError });
    }
    if (findResults.length === 0) {
      console.log("Friend username not found.");
      return res.status(404).json({ message: "Friend username not found" });
    }

    const friendId = findResults[0].id;
    console.log(
      `Found friend ID for username '${friendUsername}': ${friendId}`
    );

    // Now proceed with the deletion
    const deleteQuery = `
      DELETE FROM friendships 
      WHERE (user1_id = ? AND user2_id = ?) 
      OR (user1_id = ? AND user2_id = ?)`;

    db.query(
      deleteQuery,
      [loggedInUserId, friendId, friendId, loggedInUserId],
      (deleteError, deleteResults) => {
        if (deleteError) {
          console.error("Database error during deletion:", deleteError);
          return res
            .status(500)
            .json({ message: "Database error", deleteError });
        }
        if (deleteResults.affectedRows === 0) {
          console.log(
            "No rows affected, check the friend IDs and the database integrity."
          );
          return res.status(404).json({ message: "Friendship not found" });
        }
        console.log(
          `Friendship between ${loggedInUserId} and ${friendId} removed`
        );
        return res.status(200).json({ message: "Friend removed" });
      }
    );
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

app.post("/addFavourite", (req, res) => {
  const { loggedInUserId, gameId } = req.body;
  console.log("Request Body:", req.body);
  console.log("Received:", loggedInUserId, gameId);

  if (!loggedInUserId || !gameId) {
    return res
      .status(400)
      .json({ message: "User ID and game ID are required" });
  }

  // First, insert the game into user favorites
  const favoriteQuery = `
    INSERT INTO user_favorites (user_id, game_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE game_id = VALUES(game_id);`;

  db.query(
    favoriteQuery,
    [loggedInUserId, gameId],
    (favoriteError, favoriteResults) => {
      if (favoriteError) {
        console.error(
          "Database error while adding to favorites:",
          favoriteError
        );
        return res
          .status(500)
          .json({ message: "Database error", favoriteError });
      }

      if (favoriteResults.affectedRows === 0) {
        console.log("Favorite game already added.");
        return res.status(409).json({ message: "Favorite game already added" });
      }

      console.log(
        `Game ID ${gameId} added to favorites for user ID ${loggedInUserId}`
      );

      // Then, insert a 'like' preference
      const preferenceQuery = `INSERT INTO user_game_preferences (user_id, game_id, preference) VALUES (?, ?, 'like')
    ON DUPLICATE KEY UPDATE preference = VALUES(preference);`;

      db.query(
        preferenceQuery,
        [loggedInUserId, gameId],
        (preferenceError, preferenceResults) => {
          if (preferenceError) {
            console.error(
              "Database error while adding preference:",
              preferenceError
            );
            return res
              .status(500)
              .json({ message: "Database error", preferenceError });
          }
          return res.status(200).json({
            message: "Game added to favorites and liked successfully",
          });
        }
      );
    }
  );
});

app.get("/isFavourite/:userId/:gameId", (req, res) => {
  const { userId, gameId } = req.params;
  const query = `SELECT 1 FROM user_favorites WHERE user_id = ? AND game_id = ? LIMIT 1;`;
  db.query(query, [userId, gameId], (error, results) => {
    if (error) {
      console.error("Database error checking favourite:", error);
      return res.status(500).json({ message: "Database error", error });
    }
    const isFavourite = results.length > 0;
    return res.status(200).json({ isFavourite });
  });
});

app.delete("/removeFavourite", (req, res) => {
  const { loggedInUserId, gameId } = req.body;
  const query = `DELETE FROM user_favorites WHERE user_id = ? AND game_id = ?;`;
  db.query(query, [loggedInUserId, gameId], (error, results) => {
    if (error) {
      console.error("Database error removing favourite:", error);
      return res.status(500).json({ message: "Database error", error });
    }
    if (results.affectedRows > 0) {
      console.log(
        `Game ID ${gameId} removed from favourites for user ID ${loggedInUserId}`
      );
      return res
        .status(200)
        .json({ message: "Game removed from favourites successfully" });
    } else {
      return res.status(404).json({ message: "Game not found in favourites" });
    }
  });
});

app.get("/getFavouriteGames/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;
  const query = `SELECT game_id FROM user_favorites WHERE user_id = ?;`;
  db.query(query, [loggedInUserId], async (error, results) => {
    if (error) {
      console.error("Database error finding favourites", error);
      return res.status(500).json({ message: "Database error", error });
    }
    const gameIds = results.map((result) => result.game_id);
    res.status(200).json({ favouriteGames: gameIds });
  });
});

app.get("/getFavouriteGamesFromUsername/:username", (req, res) => {
  const username = req.params.username;
  const findQuery = `SELECT id FROM users WHERE username = ?;`;
  db.query(findQuery, [username], async (error, result) => {
    if (error) {
      console.error("Database error finding username", error);
      return res.status(500).json({ message: "Database error", error });
    }
    const userId = result[0].id;
    const query = `SELECT game_id FROM user_favorites WHERE user_id = ?;`;
    db.query(query, [userId], async (error, results) => {
      if (error) {
        console.error("Database error finding favourites", error);
        return res.status(500).json({ message: "Database error", error });
      }
      const gameIds = results.map((result) => result.game_id);
      res.status(200).json({ favouriteGames: gameIds });
    });
  });
});

app.post("/addPreference", (req, res) => {
  const { loggedInUserId, gameId, preference } = req.body;
  const sqlQuery = `INSERT INTO user_game_preferences (user_id, game_id, preference) VALUES (?, ?, ?)`;

  if (!loggedInUserId || !gameId) {
    return res
      .status(400)
      .json({ message: "User ID and game ID are required" });
  }

  db.query(
    sqlQuery,
    [loggedInUserId, gameId, preference],
    (insertError, insertResults) => {
      if (insertError) {
        return res.status(500).json({ message: "Database error", insertError });
      }
      if (insertResults.affectedRows === 0) {
        return res.status(409).json({
          message: "Preference already added or error in adding preference.",
        });
      }
      return res
        .status(200)
        .json({ message: "Game preference added successfully" });
    }
  );
});

app.get("/userPreferences/:userId", (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const sqlQuery = `SELECT game_id FROM user_game_preferences WHERE user_id = ?`;

  db.query(sqlQuery, [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Database error", error });
    }
    return res.status(200).json(results.map((row) => row.game_id));
  });
});

app.get("/messages/:senderId/:receiverId", (req, res) => {
  console.log(req.params);
  const { senderId, receiverId } = req.params;
  const query = `
    SELECT * FROM messages 
    WHERE 
      (sender_id = ? AND receiver_id = ?) 
      OR 
      (sender_id = ? AND receiver_id = ?) 
    ORDER BY timestamp ASC;
  `;

  db.query(
    query,
    [senderId, receiverId, receiverId, senderId],
    (error, results) => {
      if (error) {
        console.error("Database error fetching messages", error);
        return res.status(500).json({ message: "Database error", error });
      }

      // Send back the fetched messages
      res.status(200).json(results);
    }
  );
});

app.post("/sendMessage", (req, res) => {
  const { senderId, receiverId, text, timestamp } = req.body;

  // Assuming your table column names match the variable names closely
  const insertQuery = `
    INSERT INTO messages (sender_id, receiver_id, message, timestamp)
    VALUES (?, ?, ?, ?);
  `;

  db.query(
    insertQuery,
    [senderId, receiverId, text, timestamp],
    (error, result) => {
      if (error) {
        console.error("Database error inserting message", error);
        return res.status(500).json({ message: "Database error", error });
      }
      const fetchInsertedMessageQuery = `
      SELECT * FROM messages WHERE message_id = ?;
    `;
      db.query(
        fetchInsertedMessageQuery,
        [result.insertId],
        (error, result) => {
          if (error) {
            console.error("Database error fetching inserted message", error);
            return res.status(500).json({ message: "Database error", error });
          }

          // Assuming the message is correctly fetched and you have the result
          if (result.length > 0) {
            res.status(200).json(result[0]);
          } else {
            res
              .status(404)
              .json({ message: "Message not found after insert." });
          }
        }
      );
    }
  );
});

app.listen(8081, () => {
  console.log("Listening");
});
