import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import axios from "axios";
import "./Login.css";

function Signup() {
  const [values, setValues] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [signupError, setSignupError] = useState("");
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const err = Validation(values);
    setErrors(err);
    if (
      err.username === "" &&
      err.password === "" &&
      err.confirmPassword === ""
    ) {
      axios
        .post("http://localhost:8081/signup", values)
        .then((res) => {
          navigate("/"); // Redirect to home or login page on successful sign up
        })
        .catch((err) => {
          if (err.response) {
            setSignupError(err.response.data.message);
          } else {
            console.log(err);
          }
        });
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2>Sign-Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              placeholder="Enter Username"
              name="username"
              onChange={handleInput}
              className="text-input"
            />
            {errors.username && (
              <span className="error"> {errors.username}</span>
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
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              placeholder="Re-enter Password"
              name="confirmPassword"
              onChange={handleInput}
              className="text-input"
            />
            {errors.confirmPassword && (
              <span className="error"> {errors.confirmPassword}</span>
            )}
          </div>
          {signupError && <span className="error">{signupError}</span>}
          <button type="submit" className="submit-button">
            Sign up
          </button>
          <Link to="/" className="alt-link">
            Already have an account? Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Signup;
