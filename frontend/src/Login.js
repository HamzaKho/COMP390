import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import axios from "axios";
import "./Login.css";

function Login(props) {
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoginError("");
    const err = Validation(values);
    setErrors(err);
    if (err.username === "" && err.password === "") {
      console.log("Valid username and password");
      console.log("Sending:", values);
      axios
        .post("http://localhost:8081/login", values)
        .then((res) => {
          props.onLoginSuccess(res.data.user.id);
          navigate("/home");
        })
        .catch((err) => {
          if (err.response) {
            setLoginError(err.response.data.message);
          } else {
            console.log(err);
          }
        });
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="username"
              placeholder="Enter Username"
              name="username"
              onChange={handleInput}
              className="text-input"
            />
            {errors.username && (
              <span className="error">{errors.username}</span>
            )}
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              onChange={handleInput}
              className="text-input"
            />
            {errors.password && (
              <span className="error">{errors.password}</span>
            )}
          </div>
          {loginError && <span className="error">{loginError}</span>}
          <button type="submit" className="submit-button">
            Login
          </button>
          <Link to="/signup" className="alt-link">
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
