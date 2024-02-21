import React, { useState, useEffect } from "react";
import "./Friends.css";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import FriendModal from "./FriendModal";

const Friends = ({ onLogout, loggedInUserId }) => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/friendRequests/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          setFriendRequests(data);
        } else {
          console.error("Error fetching friend requests:", response.staus);
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    const fetchSentRequests = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/sentFriendRequests/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          setSentRequests(data);
        } else {
          console.error(
            "Error fetching sent friend requests:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching sent friend requests:", error);
      }
    };

    const fetchUserFriends = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/userFriends/${loggedInUserId}`
        );
        if (response.ok) {
          const data = await response.json();
          setUserFriends(data);
          console.log(data);
        } else {
          console.error("Error fetching user's friends:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user's friends:", error);
      }
    };

    const clearAcceptedRequests = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/clearAcceptedRequests",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(result.message);
        } else {
          console.error(
            "Failed to clear accepted friend requests:",
            response.status
          );
        }
      } catch (error) {
        console.error(
          "Error when attempting to clear accepted friend requests:",
          error
        );
      }
    };

    fetchIncomingRequests();
    fetchSentRequests();
    fetchUserFriends();
    clearAcceptedRequests();
  }, [loggedInUserId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setHasSearched(true);
    try {
      const response = await fetch("http://localhost:8081/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm, loggedInUserId }), // Include loggedInUserId in the body
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Error fetching search results:", response.status);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleAddFriend = async (friendId) => {
    console.log("Sending Friend Request:", {
      senderId: loggedInUserId,
      receiverId: friendId,
    });
    const friendUsername = searchResults.find(
      (user) => user.id === friendId
    )?.username;
    const optimisticRequest = {
      id: Date.now().toString(),
      receiverUsername: friendUsername,
      status: "Pending",
    };
    setSentRequests((prevRequests) => [...prevRequests, optimisticRequest]);
    try {
      const response = await fetch("http://localhost:8081/sendFriendRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: loggedInUserId,
          receiverId: friendId,
        }),
      });
      if (response.ok) {
        console.log("Friend request sent successfully");
        setSentRequests((prevRequests) => [...prevRequests]);
        setSearchResults((prevResults) =>
          prevResults.filter((user) => user.id !== friendId)
        );
        /*window.location.reload();*/
      } else {
        console.error("Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const handleRespondToRequest = async (requestId, response) => {
    try {
      const fetchResponse = await fetch(
        "http://localhost:8081/respondToFriendRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId, response }), // Just use 'response' here
        }
      );
      if (fetchResponse.ok) {
        console.log("Friend request response sent successfully");
        // Update the state to filter out the friend request that has been responded to
        //setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
        window.location.reload();
      } else {
        console.error("Failed to send friend request response");
      }
    } catch (error) {
      console.error("Error sending friend request response:", error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const fetchResponse = await fetch(
        "http://localhost:8081/deleteFriendRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requestId }),
        }
      );
      if (fetchResponse.ok) {
        console.log("Deleted friend request succesfully");
        setSentRequests((currentSentRequests) =>
          currentSentRequests.filter((request) => request.id !== requestId)
        );
      } else {
        console.error("Failed to Delete Friend Request");
      }
    } catch (error) {
      console.error("Error deleting friend request", error);
    }
  };

  const handleRemoveFriend = async (friendUsername) => {
    console.log("Sending Request Body:", { loggedInUserId, friendUsername });
    try {
      const fetchResponse = await fetch("http://localhost:8081/removeFriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loggedInUserId, friendUsername }),
      });
      if (fetchResponse.ok) {
        console.log("Removed Friend successfully");
        /*setUserFriends((currentFriends) =>
          currentFriends.filter((friend) => friend.id !== friend)
        );*/
        window.location.reload();
      } else {
        console.log("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend", error);
    }
  };

  const openModal = (friend) => {
    console.log("Opening modal for friend:", friend);
    setSelectedFriend(friend.friendUsername);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFriend(null);
  };

  const handleSelectFriend = (friendUsername) => {
    console.log("Selected friend: " + friendUsername);
    setSelectedFriend(friendUsername);
    fetchMessages(loggedInUserId, friendUsername);
  };

  const fetchMessages = async (senderId, receiverUsername) => {
    try {
      // Fetch receiver ID
      const receiverResponse = await fetch(
        `http://localhost:8081/getUserId/${receiverUsername}`
      );
      const receiverData = await receiverResponse.json();
      if (!receiverResponse.ok) throw new Error("Failed to fetch receiver ID");
      const receiverId = receiverData.userId;

      // Fetch the messages
      const messagesResponse = await fetch(
        `http://localhost:8081/messages/${senderId}/${receiverId}`
      );
      if (messagesResponse.ok) {
        const data = await messagesResponse.json();
        setMessages(data); // Set fetched messages to state
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    // Check if selectedFriend is defined and has a username
    if (!selectedFriend) {
      console.error("Selected friend or username is undefined.");
      return; // Exit the function if no selectedFriend or username is provided
    }

    try {
      // Fetch the friend's user ID based on the username
      const userIdResponse = await fetch(
        `http://localhost:8081/getUserId/${selectedFriend}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (userIdResponse.ok) {
        const { userId } = await userIdResponse.json();

        // Construct the new message with the retrieved userId as receiverId
        const newMessage = {
          id: Date.now().toString(), //temp id
          text: currentMessage,
          senderId: loggedInUserId,
          receiverId: userId, // Use the retrieved userId
          timestamp: new Date().toISOString(),
        };

        const response = await fetch("http://localhost:8081/sendMessage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newMessage),
        });

        if (response.ok) {
          const savedMessage = await response.json();
          setMessages((prevMessages) => [...prevMessages, savedMessage]);
          setCurrentMessage("");
        } else {
          console.error("Failed to send message", await response.text());
        }
      } else {
        console.error(
          "Failed to fetch user ID for the selected friend",
          await userIdResponse.text()
        );
      }
    } catch (error) {
      console.error("Error fetching user ID or sending message:", error);
    }
  };

  return (
    <div className="friends-container">
      {" "}
      {/* This is the flex container */}
      <div className="sidebar">
        {/* Sidebar content */}
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/gamerecommender">Game Recommender</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="friends-page">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search Friend's Username"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit">🔍</button>
        </form>
        <div className="search-results">
          {hasSearched &&
            (Array.isArray(searchResults) && searchResults.length > 0 ? (
              searchResults.map((friend) => (
                <div key={friend.id} className="search-result">
                  {friend.username}
                  <button onClick={() => handleAddFriend(friend.id)}>
                    Add Friend
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">No results found.</div>
            ))}
        </div>
        <div className="friend-requests">
          <h3>Incoming Friend Requests</h3>
          {friendRequests.length === 0 ? (
            <p>No incoming friend requests</p>
          ) : (
            friendRequests.map((request) => (
              <div key={request.id} className="friend-request">
                {request.senderUsername}
                <button
                  className="green-button"
                  onClick={() => handleRespondToRequest(request.id, "accepted")}
                >
                  Accept
                </button>
                <button
                  className="red-button"
                  onClick={() => handleRespondToRequest(request.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sent-requests">
          <h3>Sent Friend Requests</h3>
          {sentRequests.length === 0 ? (
            <p>No sent friend requests</p>
          ) : (
            sentRequests.map((request) => (
              <div key={request.id} className="sent-request">
                {request.receiverUsername}
                <span
                  className={`status-${request.status?.toLowerCase() || ""}`}
                >
                  {request.status || "Loading..."}
                </span>
                <button
                  className="red-button"
                  onClick={() => handleDeleteRequest(request.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
        <div className="user-friends">
          <h3>Your Friends</h3>
          {userFriends.length === 0 ? (
            <p>No friends found</p>
          ) : (
            userFriends.map((friend) => {
              return (
                <div key={friend.id} className="friend">
                  {friend.friendUsername}
                  <button
                    className="green-button"
                    onClick={() => openModal(friend)}
                  >
                    View Profile
                  </button>
                  <button
                    className="message-button"
                    onClick={() => handleSelectFriend(friend.friendUsername)}
                  >
                    View Messages
                  </button>
                  <button
                    className="red-button"
                    onClick={() => {
                      handleRemoveFriend(friend.friendUsername);
                    }}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
        {selectedFriend && (
          <div className="messages-box">
            <h3>Messages with {selectedFriend} </h3>
            <div className="messages-list">
              {messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`message ${
                    message.sender_id == loggedInUserId ? "sent" : "received"
                  }`}
                >
                  {message.message}
                </div>
              ))}
            </div>
            <form className="send-message-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Enter message here..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
        {/* Rest of the main content */}
      </div>
      <FriendModal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        friend={selectedFriend}
        loggedInUserId={loggedInUserId}
      />
    </div>
  );
};

export default Friends;
