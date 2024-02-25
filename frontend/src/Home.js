import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";
import "./Sidebar.css";
import "./Modal.css";

const Home = ({ onLogout, loggedInUserId }) => {
  const [popularGames, setPopularGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState([]);
  const [recommendedGames, setRecommendedGames] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchedGames, setSearchedGames] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const currentDate = new Date();
  const lastMonthDate = new Date(
    new Date().setMonth(currentDate.getMonth() - 1)
  );
  const endDate = currentDate.toISOString().split("T")[0];
  const startDate = lastMonthDate.toISOString().split("T")[0];

  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true); // Start loading
      try {
        // RAWG API
        const popularResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=2023-01-01,2024-01-01&ordering=-rating`
          //`https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&ordering=-popularity`
        );
        const newReleasesResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=${startDate},${endDate}&ordering=-added`
        );

        setPopularGames(popularResponse.data.results);
        setNewReleases(newReleasesResponse.data.results);
      } catch (error) {
        console.error("Error fetching data from RAWG API", error);
      }

      const fetchRecommendations = async () => {
        if (loggedInUserId) {
          setIsRecommendationLoading(true);
          try {
            const response = await axios.get(
              `http://localhost:5000/recommendations/${loggedInUserId}`
            );
            const gameIds = response.data;
            const gameDetailsPromises = gameIds.map((gameId) =>
              axios.get(
                `https://api.rawg.io/api/games/${gameId}?key=32d80d72ca6b4f50836ace2da6d74fb8`
              )
            );
            const gameDetailsResponses = await Promise.all(gameDetailsPromises);
            const detailedGames = gameDetailsResponses.map((response) => ({
              id: response.data.id,
              name: response.data.name,
              background_image: response.data.background_image,
              released: response.data.released,
              rating: response.data.rating,
              short_screenshots: response.data.short_screenshots,
            }));
            setRecommendedGames(detailedGames);
          } catch (error) {
            console.error("Error fetching recommendations", error);
          }
          setIsRecommendationLoading(false);
        }
      };

      fetchRecommendations();
      setIsLoading(false); // End loading
    };

    fetchGames();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      fetchSearchedGames();
    } else {
      setIsSearching(false);
      setSearchedGames([]);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const fetchSearchedGames = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setIsSearching(true);
      try {
        const response = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&search=${searchQuery}&ordering=-popularity`
        );
        setSearchedGames(response.data.results);
      } catch (error) {
        console.error("Error fetching search results from RAWG API", error);
      }
      setIsLoading(false);
    } else {
      setIsSearching(false);
      setSearchedGames([]);
    }
  };

  function GameDetailsModal({ game, onClose }) {
    const [mainImage, setMainImage] = useState("");
    const [isFavourite, setIsFavourite] = useState(false);
    const [showReviews, setShowReviews] = useState(false);
    useEffect(() => {
      fetch(`http://localhost:8081/isFavourite/${loggedInUserId}/${game.id}`)
        .then((response) => response.json())
        .then((data) => {
          setIsFavourite(data.isFavourite);
        })
        .catch((error) => console.error("Error checking favourite:", error));

      if (game && game.background_image) {
        setMainImage(game.background_image);
      }
    }, [game, loggedInUserId]);
    const addToFavourites = async () => {
      console.log("Adding to favourites:", game.name);
      console.log(loggedInUserId);
      try {
        const fetchResponse = await fetch(
          "http://localhost:8081/addFavourite",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              loggedInUserId: loggedInUserId,
              gameId: game.id,
            }),
          }
        );
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
    const handleThumbnailClick = (imageUrl) => {
      setMainImage(imageUrl);
    };
    const fetchRecommendedGames = async (userId) => {
      const data = {
        user_id: userId,
        ratings: [], // Your logic to define or get these ratings
        item_to_predict: game.id, // The item ID you want to predict the rating for
      };

      try {
        const response = await axios.post(
          "http://localhost:5000/predict",
          data
        ); // Adjust the URL/port as necessary
        if (response.data && response.data.predicted_rating) {
          // Assuming the response contains the predicted rating,
          // you can then fetch game details based on this rating or item ID.
          // For demonstration, let's just log the predicted rating:
          console.log("Predicted Rating:", response.data.predicted_rating);

          // Here you would typically fetch the game details based on the item ID
          // or use the rating in some way to recommend games.
          // For now, let's assume you fetch and set recommended games accordingly:
          // setRecommendedGames(fetchedGames);
        }
      } catch (error) {
        console.error("Error fetching recommended games:", error);
      }
    };

    const toggleReviewsModal = () => {
      setShowReviews(!showReviews);
    };

    function ReviewsModal({ game, onClose }) {
      const [starRating, setStarRating] = useState(0);
      const [reviewText, setReviewText] = useState("");
      const [reviews, setReviews] = useState([]);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [viewingReviews, setViewingReviews] = useState(true);

      const fetchReviews = async () => {
        try {
          const reviewsResponse = await axios.get(
            `http://localhost:8081/reviews/${game.id}`
          );
          const reviewsWithUsernames = await Promise.all(
            reviewsResponse.data.map(async (review) => {
              const usernameResponse = await axios.get(
                `http://localhost:8081/getUsername/${review.user_id}`
              );
              return { ...review, username: usernameResponse.data.username };
            })
          );
          setReviews(reviewsWithUsernames);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      };

      useEffect(() => {
        fetchReviews();
      }, [game.id]);

      const handleRatingChange = (e) => {
        setStarRating(e.target.value);
      };

      const handleReviewChange = (e) => {
        setReviewText(e.target.value);
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
          const response = await axios.post(
            "http://localhost:8081/postReview",
            {
              game_id: game.id,
              user_id: loggedInUserId,
              star_rating: starRating,
              review_text: reviewText,
            }
          );

          if (response.status === 200) {
            console.log("Review posted successfully");
            fetchReviews(); // Refresh the reviews list
            setReviewText(""); // Clear the form
            setStarRating(0); // Reset the rating
            setViewingReviews(true); // Switch to viewing reviews after posting
          } else {
            console.error("Failed to post review", response.data);
          }
        } catch (error) {
          console.error("Error submitting review", error);
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="reviews-modal-backdrop">
          <div className="reviews-modal-content">
            <button onClick={onClose} className="close-button">
              ×
            </button>
            <div className="reviews-modal-header">
              <h3>
                {viewingReviews ? "Reviews" : `Post a Review for ${game.name}`}
              </h3>
              <button
                onClick={() => setViewingReviews(!viewingReviews)}
                className="view-toggle-button"
              >
                {viewingReviews ? "Post Review" : "View Reviews"}
              </button>
            </div>
            {viewingReviews ? (
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.review_id} className="review-item">
                      <div className="review-user">
                        Reviewed by: {review.username}
                      </div>
                      <div className="review-rating">
                        Rating: {review.star_rating} stars
                      </div>
                      <div className="review-text">{review.review_text}</div>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="review-form">
                <div className="reviews-modal-body">
                  <div>
                    <label>Star Rating:</label>
                    <select
                      value={starRating}
                      onChange={handleRatingChange}
                      required
                    >
                      <option value="">Select a rating</option>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Review:</label>
                    <textarea
                      value={reviewText}
                      onChange={handleReviewChange}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="reviews-modal-footer">
                  <button type="submit" disabled={isSubmitting}>
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }

    if (!game) return null; // Don't render if there's no game data
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="modal-header">
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <img src={mainImage} alt={game.name} className="main-image" />
            <div className="thumbnail-container">
              {game.short_screenshots?.map((screenshot) => (
                <img
                  key={screenshot.id}
                  src={screenshot.image}
                  alt="Game Screenshot Thumbnail"
                  onClick={() => handleThumbnailClick(screenshot.image)}
                  className="thumbnail-image"
                />
              ))}
            </div>
            {/* The rest of your modal content goes here */}
            <h3>{game.name}</h3>
            <p>Release Date: {game.released}</p>
            {/* Display more game details here */}
            <p>Rating: {game.rating} / 5</p>
            <p>Genres: {game.genres?.map((genre) => genre.name).join(", ")}</p>
            <p>
              Platforms:{" "}
              {game.platforms
                ?.map((platform) => platform.platform.name)
                .join(", ")}
            </p>
          </div>
          <div className="modal-footer">
            <button
              onClick={isFavourite ? removeFromFavourites : addToFavourites}
              className={`button-favourite ${
                isFavourite ? "button-favourite-remove" : "button-favourite-add"
              }`}
            >
              {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
            </button>
            <button onClick={toggleReviewsModal} className="button-reviews">
              Reviews
            </button>
          </div>
        </div>
        {showReviews && (
          <ReviewsModal game={game} onClose={toggleReviewsModal} />
        )}
      </div>
    );
  }

  const openModal = (game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
    document.body.classList.add("active-modal"); // Prevent background scrolling
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGame(null);
    document.body.classList.remove("active-modal"); // Re-enable background scrolling
  };
  return (
    <div className="home">
      <div className="sidebar">
        {/* Other links */}
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/gamerecommender">Game Recommender</Link>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="content">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search for games..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          <button onClick={handleSearchClick} className="search-button">
            Search
          </button>
        </div>

        {/* Search Results Section */}
        {isSearching && searchedGames.length > 0 && (
          <div className="games-section">
            <h2>Search Results</h2>
            <div className="games-list">
              {searchedGames.map((game) => (
                <div
                  key={game.id}
                  className="game"
                  onClick={() => openModal(game)}
                >
                  <img src={game.background_image} alt={game.name} />
                  <h3>{game.name}</h3>
                  {/* Other game details */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Games Section */}
        <div className="games-section">
          <h2>Popular Games</h2>
          <div className="games-list">
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="game loading-placeholder"></div>
                ))
              : popularGames.map((game) => (
                  <div
                    key={game.id}
                    className="game"
                    onClick={() => openModal(game)}
                  >
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                    {/* Other game details */}
                  </div>
                ))}
          </div>
        </div>
        <div className="games-section">
          <h2>Recommended for You</h2>
          <div className="games-list">
            {isRecommendationLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="game loading-placeholder"></div>
              ))
            ) : recommendedGames.length > 0 ? (
              recommendedGames.map((game) => (
                <div
                  key={game.id}
                  className="game"
                  onClick={() => openModal(game)}
                >
                  <img src={game.background_image} alt={game.name} />
                  <h3>{game.name}</h3>
                </div>
              ))
            ) : (
              <p>
                No recommendations available :/, try using "Games Recommender"
                so we can learn your preferences!
              </p>
            )}
          </div>
        </div>
        <div className="games-section">
          <h2>Latest Releases</h2>
          <div className="games-list">
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="game loading-placeholder"></div>
                ))
              : newReleases.map((game) => (
                  <div
                    key={game.id}
                    className="game"
                    onClick={() => openModal(game)}
                  >
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                  </div>
                ))}
          </div>
        </div>
        {isModalOpen && (
          <GameDetailsModal game={selectedGame} onClose={closeModal} />
        )}
      </div>
    </div>
  );
};

export default Home;
