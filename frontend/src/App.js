import React, { useState, useEffect, useCallback, useRef } from "react";
import RecipeCard from "./components/RecipeCard";
import RecipeModal from "./components/RecipeModal";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import { recipeAPI } from "./api/api";
import "./App.css";

// Inactivity settings
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CHECK_INTERVAL = 60 * 1000; // Check every minute
const LAST_ACTIVITY_KEY = "lastActivityTime";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWakeup, setShowWakeup] = useState(false);
  const [wakeupSeconds, setWakeupSeconds] = useState(0);
  const intervalRef = useRef(null);
  const wakeupTimerRef = useRef(null);
  const wakeupCounterRef = useRef(null);

  useEffect(() => {
    fetchRecipes();
    checkAuth();
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
          recipe.description.toLowerCase().includes(query) ||
          recipe.ingredients.toLowerCase().includes(query),
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setWakeupSeconds(0);

      // Show wakeup screen if request takes more than 3 seconds
      wakeupTimerRef.current = setTimeout(() => {
        setShowWakeup(true);

        // Start countdown
        wakeupCounterRef.current = setInterval(() => {
          setWakeupSeconds((prev) => prev + 1);
        }, 1000);
      }, 3000);

      const response = await recipeAPI.getAll();

      // Clear timers and hide wakeup screen
      clearTimeout(wakeupTimerRef.current);
      clearInterval(wakeupCounterRef.current);
      setShowWakeup(false);
      setWakeupSeconds(0);

      setRecipes(response.data);
      setFilteredRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      clearTimeout(wakeupTimerRef.current);
      clearInterval(wakeupCounterRef.current);
      setShowWakeup(false);
      setWakeupSeconds(0);
    } finally {
      setLoading(false);
    }
  };

  // Update last activity time
  const updateActivity = useCallback(() => {
    if (isAuthenticated) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, [isAuthenticated]);

  // Check if user has been inactive for 24 hours
  const checkInactivity = useCallback(() => {
    if (!isAuthenticated) return;

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!lastActivity) {
      updateActivity();
      return;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      // Auto logout after 24 hours of inactivity
      console.log("🔒 Auto-logout: 24 hours of inactivity");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      setIsAuthenticated(false);
      setShowAdmin(false);
      alert("You have been logged out due to 24 hours of inactivity.");
    }
  }, [isAuthenticated, updateActivity]);

  // Setup inactivity tracking
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear activity tracking when logged out
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Set initial activity time
    updateActivity();

    // Track user activity events
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity);
    });

    // Check inactivity periodically
    intervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL);

    // Check immediately
    checkInactivity();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkInactivity]);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowAdmin(true);
  };

  const handleAdminClose = () => {
    setShowAdmin(false);
    checkAuth();
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="app">
      {/* Backend Wakeup Screen */}
      {showWakeup && (
        <div className="wakeup-overlay">
          <div className="wakeup-container">
            <div className="wakeup-icon">☕</div>
            <h2>Waking up the kitchen...</h2>
            <p>Recipebaxa is just waking up from a nap!</p>
            <p>It usually takes about a minute. Hang tight!</p>

            <div className="countdown-container">
              <div className="countdown-circle">
                <svg className="countdown-svg" viewBox="0 0 100 100">
                  <circle className="countdown-bg" cx="50" cy="50" r="45" />
                  <circle
                    className="countdown-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDashoffset:
                        283 - 283 * Math.min(wakeupSeconds / 30, 1),
                    }}
                  />
                </svg>
                <div className="countdown-text">{wakeupSeconds}s</div>
              </div>
            </div>

            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <p className="wakeup-thanks">Thanks for your patience! 🙏</p>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <h1>🍳 Recipe Baxa</h1>
          <button className="admin-btn" onClick={handleAdminClick}>
            {isAuthenticated ? "⚙️ Admin Panel" : "🔐 Admin Login"}
          </button>
        </div>
      </header>

      <main className="app-main">
        {loading && !showWakeup ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading recipes...</p>
          </div>
        ) : recipes.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h2>No recipes yet</h2>
            <p>Add your first delicious recipe using the admin panel!</p>
            <button className="cta-btn" onClick={handleAdminClick}>
              {isAuthenticated ? "Go to Admin Panel" : "Login as Admin"}
            </button>
          </div>
        ) : !loading ? (
          <>
            <div className="recipes-header">
              <h2>Discover Delicious Recipes</h2>
              <p>
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>

            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search recipes by title, description, or ingredients..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="clear-search" onClick={clearSearch}>
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="search-results-text">
                  Found {filteredRecipes.length} recipe
                  {filteredRecipes.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {filteredRecipes.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No recipes found</h3>
                <p>Try searching with different keywords</p>
                <button className="clear-search-btn" onClick={clearSearch}>
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="recipes-grid">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onView={setSelectedRecipe}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>

      <footer className="app-footer">
        <p>
          © {new Date().getFullYear()} Recipe Collection by Prayash Shrestha
        </p>
      </footer>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {showLogin && <Login onLogin={handleLogin} onClose={handleLoginClose} />}

      {showAdmin && (
        <AdminPanel onClose={handleAdminClose} onUpdate={fetchRecipes} />
      )}
    </div>
  );
}

export default App;
