// setupTests.js
import "@testing-library/jest-dom";
import Modal from "react-modal";

// Create a div with #root id for react-modal
const root = global.document.createElement("div");
root.setAttribute("id", "root");
const body = global.document.querySelector("body");
body.appendChild(root);

// Set the root for the Modal as well
Modal.setAppElement(root);
