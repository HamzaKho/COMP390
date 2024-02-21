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

  useEffect(() => {
    if (isOpen && friend) {
      fetchFavoriteGames(friend);
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
          <p>No favorite games found.</p>
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
