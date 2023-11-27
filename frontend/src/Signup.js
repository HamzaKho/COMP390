import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import axios from "axios";

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
          navigate("/");
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
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2>Sign-Up</h2>
        <form action="" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username">
              <strong>Username</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              name="username"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.username && (
              <span className="text-danger"> {errors.username}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.password && Array.isArray(errors.password) ? (
              <div className="text-danger">
                {errors.password.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            ) : (
              <span className="text-danger">{errors.password}</span>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="comfirm password">
              <strong>Confirm Password</strong>
            </label>
            <input
              type="password"
              placeholder="Re-enter Password"
              name="confirmPassword"
              onChange={handleInput}
              className="form-control rounded-0"
            />
            {errors.confirmPassword && (
              <span className="text-danger"> {errors.confirmPassword}</span>
            )}
          </div>
          {signupError && <span className="text-danger">{signupError}</span>}
          <button type="submit" className="btn btn-success w-100">
            {" "}
            Sign up
          </button>
          <p></p>
          <Link
            to="/"
            className="btn btn-default border w-100 bg-light text-decoration-none"
          >
            Login
          </Link>
        </form>
      </div>
    </div>
  );
}
export default Signup;
