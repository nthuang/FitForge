import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import ExerciseLibrary from "./components/ExerciseLibrary/ExerciseLibrary";
import WorkoutLibrary from "./components/WorkoutLibrary/WorkoutLibrary";
import WorkoutCreator from "./components/WorkoutCreator/WorkoutCreator";
import SplitPlanner from "./components/SplitPlanner/SplitPlanner";
import SplitLibrary from "./components/SplitLibrary/SplitLibrary";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import "./App.css";

const App = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <Router basename="/FitForge">
      <div>
        <header>
          <nav>
            <ul>
              {isAuthenticated && (
                <>
                  <li>
                    <Link to="/">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/exercises">Exercises</Link>
                  </li>
                  <li>
                    <Link to="/workouts">Workouts</Link>
                  </li>
                  <li>
                    <Link to="/workout-creator">Create Workout</Link>
                  </li>
                  <li>
                    <Link to="/splits">Splits</Link>
                  </li>
                  <li>
                    <Link to="/split-planner">Split Planner</Link>
                  </li>
                </>
              )}

              {isAuthenticated ? (
                <>
                  <li>
                    <span>Logged in as {user?.name}</span>
                  </li>
                  <li>
                    <button type="button" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exercises"
              element={
                <ProtectedRoute>
                  <ExerciseLibrary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workouts"
              element={
                <ProtectedRoute>
                  <WorkoutLibrary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/workout-creator"
              element={
                <ProtectedRoute>
                  <WorkoutCreator />
                </ProtectedRoute>
              }
            />

            <Route
              path="/splits"
              element={
                <ProtectedRoute>
                  <SplitLibrary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/split-planner"
              element={
                <ProtectedRoute>
                  <SplitPlanner />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;