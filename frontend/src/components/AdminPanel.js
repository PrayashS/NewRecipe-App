import React, { useState, useEffect } from "react";
import { recipeAPI } from "../api/api";
import "../styles/AdminPanel.css";

const AdminPanel = ({ onClose, onUpdate }) => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    // Filter recipes based on search query
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = recipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query),
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const fetchRecipes = async () => {
    try {
      const response = await recipeAPI.getAll();
      setRecipes(response.data);
      setFilteredRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setError("Failed to load recipes");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editingId) {
        await recipeAPI.update(editingId, formData);
      } else {
        await recipeAPI.create(formData);
      }

      setFormData({
        title: "",
        description: "",
        ingredients: "",
        instructions: "",
      });
      setEditingId(null);
      await fetchRecipes();
      onUpdate();
    } catch (error) {
      console.error("Error saving recipe:", error);
      setError(error.response?.data?.message || "Error saving recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipe) => {
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    });
    setEditingId(recipe._id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await recipeAPI.delete(id);
        await fetchRecipes();
        onUpdate();
      } catch (error) {
        console.error("Error deleting recipe:", error);
        setError("Error deleting recipe");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      ingredients: "",
      instructions: "",
    });
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    onClose();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const username = localStorage.getItem("username");

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div>
            <h2>⚙️ Admin Panel</h2>
            <p className="admin-user">
              Logged in as: <strong>{username}</strong>
            </p>
          </div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close admin panel"
            >
              ×
            </button>
          </div>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "✏️ Edit Recipe" : "➕ Add New Recipe"}</h3>

          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Chocolate Chip Cookies"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Brief description of the recipe"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="3"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ingredients">Ingredients * (one per line)</label>
            <textarea
              id="ingredients"
              placeholder="2 cups flour&#10;1 cup sugar&#10;3 eggs"
              value={formData.ingredients}
              onChange={(e) =>
                setFormData({ ...formData, ingredients: e.target.value })
              }
              rows="6"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Instructions *</label>
            <textarea
              id="instructions"
              placeholder="Step-by-step cooking instructions"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              rows="7"
              required
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Recipe"
                  : "Add Recipe"}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="recipes-list">
          <div className="recipes-list-header">
            <h3>📋 Manage Recipes ({recipes.length})</h3>

            {/* Admin Search Bar */}
            {recipes.length > 0 && (
              <div className="admin-search-box">
                <span className="admin-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="admin-search-input"
                />
                {searchQuery && (
                  <button className="admin-clear-search" onClick={clearSearch}>
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>

          {searchQuery && (
            <p className="admin-search-results">
              Found {filteredRecipes.length} recipe
              {filteredRecipes.length !== 1 ? "s" : ""}
            </p>
          )}

          {recipes.length === 0 ? (
            <p className="empty-message">
              No recipes yet. Add your first recipe above!
            </p>
          ) : filteredRecipes.length === 0 ? (
            <div className="admin-no-results">
              <p>No recipes found matching "{searchQuery}"</p>
              <button className="admin-clear-btn" onClick={clearSearch}>
                Clear Search
              </button>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div key={recipe._id} className="recipe-item">
                <div className="recipe-info">
                  <h4>{recipe.title}</h4>
                  <p>
                    {recipe.description.substring(0, 80)}
                    {recipe.description.length > 80 ? "..." : ""}
                  </p>
                </div>
                <div className="recipe-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(recipe)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(recipe._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
