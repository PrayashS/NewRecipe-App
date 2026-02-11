import React, { useEffect } from "react";
import "../styles/RecipeModal.css";

const RecipeModal = ({ recipe, onClose }) => {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 className="modal-title">{recipe.title}</h2>

        <div className="modal-section">
          <h3>📝 Description</h3>
          <p>{recipe.description}</p>
        </div>

        <div className="modal-section">
          <h3>🥘 Ingredients</h3>
          <p className="whitespace-pre-line">{recipe.ingredients}</p>
        </div>

        <div className="modal-section">
          <h3>👨‍🍳 Instructions</h3>
          <p className="whitespace-pre-line">{recipe.instructions}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
