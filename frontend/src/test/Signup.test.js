import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "../Signup";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { act } from "react-dom/test-utils";

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn().mockImplementation(() => ({})),
}));

describe("Signup Component Tests", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );
  });

  test("renders Signup form", () => {
    expect(screen.getByText(/sign-up/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Re-enter Password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("input fields update on user input", async () => {
    await act(async () => {
      const usernameInput = screen.getByPlaceholderText("Enter Username");
      const passwordInput = screen.getByPlaceholderText("Enter Password");
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-enter Password");
      await userEvent.type(usernameInput, "newuser");
      await userEvent.type(passwordInput, "newPassword1");
      await userEvent.type(confirmPasswordInput, "newPassword1");
    });

    const usernameInput = screen.getByPlaceholderText("Enter Username");
    const passwordInput = screen.getByPlaceholderText("Enter Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-enter Password");
    expect(usernameInput.value).toBe("newuser");
    expect(passwordInput.value).toBe("newPassword1");
    expect(confirmPasswordInput.value).toBe("newPassword1");
  });

  test("displays validation errors when fields are empty", async () => {
    await act(async () => {
      const submitButton = screen.getByRole("button", { name: /sign up/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText("Username shouldn't be empty")).toBeInTheDocument();
    expect(screen.getByText("Password shouldn't be empty")).toBeInTheDocument();
    expect(
      screen.getByText("Confirm password shouldn't be empty")
    ).toBeInTheDocument();
  });

  test("submits valid data via axios post request", async () => {
    const mockNavigate = jest.fn();
    jest.mock("react-router-dom", () => ({
      ...jest.requireActual("react-router-dom"),
      useNavigate: () => mockNavigate,
    }));

    // Setup the mock function with resolved value
    axios.post.mockResolvedValue({
      data: {
        message: "Signup successful",
      },
    });

    await act(async () => {
      const usernameInput = screen.getByPlaceholderText("Enter Username");
      const passwordInput = screen.getByPlaceholderText("Enter Password");
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-enter Password");
      await userEvent.type(usernameInput, "testuser");
      await userEvent.type(passwordInput, "Testpass123");
      await userEvent.type(confirmPasswordInput, "Testpass123");

      const submitButton = screen.getByRole("button", { name: /sign up/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Check if axios.post was called correctly
      expect(axios.post).toHaveBeenCalledWith("http://localhost:8081/signup", {
        username: "testuser",
        password: "Testpass123",
        confirmPassword: "Testpass123",
      });
    });
  });
});
