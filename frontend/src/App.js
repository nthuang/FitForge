
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import ExerciseLibrary from "./components/ExerciseLibrary/ExerciseLibrary";
import WorkoutLibrary from "./components/WorkoutLibrary/WorkoutLibrary";
import WorkoutCreator from "./components/WorkoutCreator/WorkoutCreator";
import SplitPlanner from "./components/SplitPlanner/SplitPlanner";
import SplitLibrary from "./components/SplitLibrary/SplitLibrary";
import "./App.css";

const App = () => {
  return (
    <Router basename="/FitForge">
      <div>
        <header>
          <nav>
            <ul>
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
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/workouts" element={<WorkoutLibrary />} />
            <Route path="/workout-creator" element={<WorkoutCreator />} />
            <Route path="/splits" element={<SplitLibrary />} />
            <Route path="/split-planner" element={<SplitPlanner />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
