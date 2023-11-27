import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import axios from "axios";
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
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Sign In</h2>
        <form action="" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username">Username:</label>
            <input
              type="username"
              placeholder="Enter Username"
              name="username"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.username && (
              <span className="text-danger">{errors.username}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.password && (
              <span className="text-danger">{errors.password}</span>
            )}
          </div>
          {loginError && <span className="text-danger">{loginError}</span>}
          <button type="submit" className="btn btn-success w-100">
            Login
          </button>
          <p></p>
          <Link
            to="/signup"
            className="btn btn-default border w-100 text-decoration-none"
          >
            Create Account
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
