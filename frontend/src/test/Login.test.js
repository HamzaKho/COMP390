import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { act } from "react-dom/test-utils";
import Modal from "react-modal";

Modal.setAppElement(document.body);

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn().mockImplementation(() => ({})),
}));

describe("Login Component Tests", () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Login onLoginSuccess={() => {}} />
      </BrowserRouter>
    );
  });

  test("renders Login form", () => {
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("input fields update on user input", async () => {
    await act(async () => {
      // Wrap in act
      const usernameInput = screen.getByPlaceholderText("Enter Username");
      const passwordInput = screen.getByPlaceholderText("Enter Password");
      await userEvent.type(usernameInput, "testuser");
      await userEvent.type(passwordInput, "password");
    });

    const usernameInput = screen.getByPlaceholderText("Enter Username");
    const passwordInput = screen.getByPlaceholderText("Enter Password");
    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password");
  });

  test("displays validation errors", async () => {
    await act(async () => {
      // Wrap in act
      const submitButton = screen.getByRole("button", { name: /login/i });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText("Username shouldn't be empty")).toBeInTheDocument();
    expect(screen.getByText("Password shouldn't be empty")).toBeInTheDocument();
  });

  test("submits valid data", async () => {
    await act(async () => {
      // Wrap in act
      const usernameInput = screen.getByPlaceholderText("Enter Username");
      const passwordInput = screen.getByPlaceholderText("Enter Password");
      await userEvent.type(usernameInput, "testuser");
      await userEvent.type(passwordInput, "passwordWith1Upper");

      axios.post.mockResolvedValue({ data: { user: { id: 1 } } });

      const submitButton = screen.getByRole("button", { name: /login/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://localhost:8081/login", {
        username: "testuser",
        password: "passwordWith1Upper",
      });
    });
  });

  test("handles API error", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Invalid username or password" } },
    });

    await act(async () => {
      // Wrap in act
      const usernameInput = screen.getByPlaceholderText("Enter Username");
      const passwordInput = screen.getByPlaceholderText("Enter Password");
      await userEvent.type(usernameInput, "testuser");
      await userEvent.type(passwordInput, "wrongPassword");

      const submitButton = screen.getByRole("button", { name: /login/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Invalid username or password")
      ).toBeInTheDocument();
    });
  });
});
