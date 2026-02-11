const express = require("express");
const Recipe = require("../models/Recipe");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all recipes (PUBLIC - no auth required)
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 }).select("-__v"); // Exclude version key

    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Error fetching recipes" });
  }
});

// Get single recipe by ID (PUBLIC - no auth required)
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).select("-__v");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Invalid recipe ID" });
    }
    res.status(500).json({ message: "Error fetching recipe" });
  }
});

// Create new recipe (ADMIN ONLY - requires authentication)
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, ingredients, instructions } = req.body;

  // Validate all required fields
  if (!title || !description || !ingredients || !instructions) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newRecipe = await Recipe.create({
      title: title.trim(),
      description: description.trim(),
      ingredients: ingredients.trim(),
      instructions: instructions.trim(),
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ message: "Error creating recipe" });
  }
});

// Update recipe (ADMIN ONLY - requires authentication)
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, ingredients, instructions } = req.body;

  // Validate all required fields
  if (!title || !description || !ingredients || !instructions) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        ingredients: ingredients.trim(),
        instructions: instructions.trim(),
      },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Invalid recipe ID" });
    }
    res.status(500).json({ message: "Error updating recipe" });
  }
});

// Delete recipe (ADMIN ONLY - requires authentication)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      message: "Recipe deleted successfully",
      deletedRecipe,
    });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Invalid recipe ID" });
    }
    res.status(500).json({ message: "Error deleting recipe" });
  }
});

module.exports = router;
