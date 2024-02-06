import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = ({ onLogout }) => {
  const [popularGames, setPopularGames] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedGames, setSearchedGames] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const currentDate = new Date();
  const lastMonthDate = new Date(
    new Date().setMonth(currentDate.getMonth() - 1)
  );
  const endDate = currentDate.toISOString().split("T")[0];
  const startDate = lastMonthDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true); // Start loading
      try {
        const searchParam = searchQuery ? `&search=${searchQuery}` : "";
        // RAWG API
        const popularResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=2023-01-01,2024-01-01&ordering=-rating`
        );
        const newReleasesResponse = await axios.get(
          `https://api.rawg.io/api/games?key=32d80d72ca6b4f50836ace2da6d74fb8&dates=${startDate},${endDate}&ordering=-added`
        );

        setPopularGames(popularResponse.data.results);
        setNewReleases(newReleasesResponse.data.results);
      } catch (error) {
        console.error("Error fetching data from RAWG API", error);
      }
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

  return (
    <div className="home">
      <div className="sidebar">
        {/* Other links */}
        <Link to="/">Home</Link>
        <Link to="/friends">Friends</Link>
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
                <div key={game.id} className="game">
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
                  <div key={game.id} className="game">
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                    {/* Other game details */}
                  </div>
                ))}
          </div>
        </div>
        <div className="games-section">
          <h2>Our Picks For You</h2>
          <div className="games-list">
            {isRecommendationLoading ? (
              Array.from({ length: 10 }, (_, index) => (
                <div key={index} className="game loading-placeholder"></div>
              ))
            ) : (
              <p>Featured games go here.</p>
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
                  <div key={game.id} className="game">
                    <img src={game.background_image} alt={game.name} />
                    <h3>{game.name}</h3>
                    {/* Other game details */}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
