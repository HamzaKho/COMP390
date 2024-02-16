import React from "react";
import Modal from "react-modal";

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

const FriendModal = ({ isOpen, onRequestClose, friend }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      contentLabel="Friend Detail Modal"
    >
      <h2>{friend?.friendUsername || "Friend Details"}</h2>
      <div>
        <p>Instant messaging section placeholder</p>
        {/* Implement the instant messaging UI here */}
      </div>
      <div>
        <p>Favorite games section placeholder</p>
        {/* Fetch and display favorite games or common games here */}
      </div>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default FriendModal;
