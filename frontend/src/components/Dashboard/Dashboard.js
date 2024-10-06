import React from "react"; // Import React
import { Link } from "react-router-dom"; // Import Link for navigation
import "./Dashboard.css"; // Import CSS for styling

const Dashboard = () => {
  return (
    <div className="dashboard">
      {" "}
      {/* Main dashboard container */}
      <h1>Welcome to FitForge</h1> {/* Welcome heading */}
      <p>Your fitness journey starts here!</p> {/* Subheading */}
      <div className="dashboard-links">
        {" "}
        {/* Container for navigation links */}
        <Link to="/exercises" className="dashboard-link">
          {" "}
          {/* Link to Exercise Library */}
          Exercise Library
        </Link>
        <Link to="/workouts" className="dashboard-link">
          {" "}
          {/* Link to Workout Library */}
          Workout Library
        </Link>
        <Link to="/splits" className="dashboard-link">
          {" "}
          {/* Link to Split Library */}
          Split Library
        </Link>
      </div>
    </div>
  );
};

export default Dashboard; // Export the Dashboard component
