import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import "./Modal.css";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");

const GameDetailsModal = ({ game, onClose, loggedInUserId }) => {
  const [isFavourite, setIsFavourite] = useState(false);
  /*if (!game) return null;*/
  useEffect(() => {
    fetch(`http://localhost:8081/isFavourite/${loggedInUserId}/${game.id}`)
      .then((response) => response.json())
      .then((data) => {
        setIsFavourite(data.isFavourite);
      })
      .catch((error) => console.error("Error checking favourite:", error));
  }, [game, loggedInUserId]);
  const addToFavourites = async () => {
    console.log("Adding to favourites:", game.name);
    console.log(loggedInUserId);
    try {
      const fetchResponse = await fetch("http://localhost:8081/addFavourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loggedInUserId: loggedInUserId,
          gameId: game.id,
        }),
      });
      if (fetchResponse.ok) {
        setIsFavourite(true); //update UI
      } else {
        console.log("Failed to add favourite");
      }
    } catch (error) {
      console.error("Error adding favourite", error);
    }
  };
  const removeFromFavourites = async () => {
    // Implementation similar to `addToFavourites`, but using the DELETE method
    fetch("http://localhost:8081/removeFavourite", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loggedInUserId: loggedInUserId,
        gameId: game.id,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to remove from favourites");
        setIsFavourite(false); // Update UI to reflect the change
      })
      .catch((error) =>
        console.error("Error removing from favourites:", error)
      );
  };

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <img
            src={game.background_image}
            alt={game.name}
            className="main-image"
          />
          <h3>{game.name}</h3>
          <p>Release Date: {game.released}</p>
          <p>Rating: {game.rating}</p>
          {/* Add more game details as needed */}
          <button
            onClick={isFavourite ? removeFromFavourites : addToFavourites}
            className={`button-favourite ${
              isFavourite ? "button-favourite-remove" : "button-favourite-add"
            }`}
          >
            {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("portal-root")
  );
};

const FriendModal = ({ isOpen, onRequestClose, friend, loggedInUserId }) => {
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (isOpen && friend) {
      fetchFavoriteGames(friend);
      fetchReviews(friend);
    }
  }, [isOpen, friend]);

  const fetchFavoriteGames = async (friendId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/getFavouriteGamesFromUsername/${friend}`
      );
      if (response.ok) {
        const data = await response.json();
        const gameIds = data.favouriteGames;
        const gamesDetails = await Promise.all(
          gameIds.map(async (gameId) => {
            const gameResponse = await fetch(
              `https://api.rawg.io/api/games/${gameId}?key=32d80d72ca6b4f50836ace2da6d74fb8`
            );
            if (!gameResponse.ok)
              throw new Error("Failed to fetch game details.");
            return gameResponse.json();
          })
        );
        setFavoriteGames(gamesDetails);
      } else {
        console.error("Failed to fetch favorite games");
        setFavoriteGames([]);
      }
    } catch (error) {
      console.error("Error fetching favorite games:", error);
      setFavoriteGames([]);
    }
  };

  const fetchReviews = async (friendId) => {
    try {
      const res = await fetch(`http://localhost:8081/getUserId/${friendId}`);
      if (res.ok) {
        const friendUserId = await res.json();
        try {
          const response = await fetch(
            `http://localhost:8081/userReviews/${friendUserId.userId}`
          );
          if (response.ok) {
            const data = await response.json();
            const reviewsWithGameDetails = await Promise.all(
              data.map(async (review) => {
                const gameResponse = await fetch(
                  `https://api.rawg.io/api/games/${review.game_id}?key=32d80d72ca6b4f50836ace2da6d74fb8`
                );
                if (!gameResponse.ok)
                  throw new Error("Failed to fetch game details.");
                const gameData = await gameResponse.json();
                return {
                  ...review,
                  gameName: gameData.name,
                  gameImage: gameData.background_image,
                };
              })
            );
            setReviews(reviewsWithGameDetails);
          } else {
            console.error("error getting reviews", response.status);
          }
        } catch (error) {
          console.error("error fetching reviews", error);
        }
      } else {
        console.error("Error fetching reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews: ", error);
    }
  };

  const openGameModal = (game) => {
    setSelectedGame(game);
  };

  const closeModal = () => {
    setSelectedGame(null);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => closeModal()}
      style={customStyles}
      contentLabel="Friend Detail Modal"
    >
      <h2>{friend + "'s Favourite Games:" || "Friend's Favourite Games:"}</h2>
      <div>
        {favoriteGames.length > 0 ? (
          <div className="games-list">
            {favoriteGames.map((game) => (
              <div
                key={game.id}
                className="game"
                onClick={() => openGameModal(game)}
              >
                <img
                  src={game.background_image}
                  alt={game.name}
                  className="game-image"
                />
                <h3>{game.name}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>{friend + " has not favourited any games yet!"}</p>
        )}
      </div>
      <div className="reviews-section">
        <h2>{friend + "'s Reviews:"}</h2>
        {reviews.length === 0 ? (
          <p>{friend + " has not left any reviews yet!"}</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={index} className="review">
                <div className="review-box">
                  <img
                    src={review.gameImage}
                    alt={review.gameName}
                    className="review-game-image"
                  />
                  <div className="review-text-container">
                    <h4>{review.gameName}</h4>
                    <h5>{review.star_rating}/5 stars</h5>
                    <p>{review.review_text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="close-button" onClick={() => closeModal()}>
        X
      </button>
      {selectedGame && (
        <GameDetailsModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          loggedInUserId={loggedInUserId}
        />
      )}
    </Modal>
  );
};

export default FriendModal;
