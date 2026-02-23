import React from "react";
import "../styles/RecipeCard.css";

const RecipeCard = ({ recipe, onView }) => {
  return (
    <div className="recipe-card" onClick={() => onView(recipe)}>
      <div className="recipe-card-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-preview">
          {recipe.description.length > 100
            ? `${recipe.description.substring(0, 100)}...`
            : recipe.description}
        </p>
        <button
          className="view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onView(recipe);
          }}
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
