import React, { useEffect, useState } from "react";
import { fetchSplits, deleteSplit } from "../../apis/splitApi"; // Ensure these are correctly implemented in splitApi.js
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./SplitLibrary.css"; // Import CSS for styling

const SplitLibrary = () => {
  const [splits, setSplits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const getSplits = async () => {
      try {
        const fetchedSplits = await fetchSplits(); // Fetch all splits
        setSplits(fetchedSplits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSplits();
  }, []);

  // Handle delete function for a split
  const handleDeleteSplit = async (id) => {
    try {
      await deleteSplit(id); // Delete the split by ID
      setSplits(splits.filter((split) => split._id !== id)); // Remove the deleted split from state
    } catch (err) {
      console.error("Error deleting split:", err);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle programmatic navigation for editing split
  const handleEditSplit = (split) => {
    navigate("/split-planner", {
      state: {
        splitId: split._id,
        splitName: split.name,
        selectedWorkouts: split.workouts,
      },
    });
  };

  // Filter splits based on search term
  const filteredSplits = splits.filter((split) =>
    split.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="split-library-container">
      <h1>Your Splits</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search splits..."
        className="search-input"
      />
      <div className="splits-list">
        {filteredSplits.length === 0 ? (
          <p>No splits found</p>
        ) : (
          filteredSplits.map((split) => (
            <div className="split-box" key={split._id}>
              <h2>{split.name}</h2>
              <h3>Workouts:</h3>
              {split.workouts.length === 0 ? (
                <p>No workouts in this split</p>
              ) : (
                <ul>
                  {split.workouts.map((workout) => (
                    <li key={workout._id}>{workout.name}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => handleEditSplit(split)} // Use programmatic navigation
                className="edit-button"
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteSplit(split._id)}
                aria-label="Delete Split"
              >
                &times; {/* X character */}
              </button>
            </div>
          ))
        )}
      </div>
      <Link to="/split-planner" className="create-split-button">
        Create Split
      </Link>
    </div>
  );
};

export default SplitLibrary;
