import React, { useState, useEffect } from "react"; // Import React and hooks
import { fetchWorkouts } from "../../apis/workoutApi"; // API to fetch workouts
import { createSplit, updateSplit } from "../../apis/splitApi"; // APIs for split management
import { useLocation, useNavigate } from "react-router-dom"; // Hooks for routing
import "./SplitPlanner.css"; // Import CSS for styling

const SplitPlanner = () => {
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Initialize navigation

  // Destructure state from location or set defaults
  const {
    splitId,
    splitName = "",
    selectedWorkouts = [],
  } = location.state || {};

  // State variables
  const [allWorkouts, setAllWorkouts] = useState([]); // All workouts
  const [workouts, setWorkouts] = useState([]); // Filtered workouts for display
  const [selected, setSelected] = useState(selectedWorkouts); // Selected workouts
  const [splitNameState, setSplitNameState] = useState(splitName); // Split name
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [page, setPage] = useState(1); // Pagination
  const [limit] = useState(16); // Number of workouts per page

  // Fetch workouts on component mount
  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const data = await fetchWorkouts(); // Fetch workout data
        setAllWorkouts(data); // Set all workouts in state
      } catch (error) {
        console.error("Error fetching workouts:", error);
      }
    };

    getWorkouts();
  }, []);

  // Filter workouts based on search term and pagination
  useEffect(() => {
    const filteredWorkouts = allWorkouts.filter((workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (page - 1) * limit; // Calculate start index
    const endIndex = startIndex + limit; // Calculate end index
    setWorkouts(filteredWorkouts.slice(startIndex, endIndex)); // Update displayed workouts
  }, [allWorkouts, searchTerm, page, limit]);

  // Handle selection of a workout
  const handleWorkoutSelect = (workout) => {
    if (!selected.includes(workout)) {
      setSelected([...selected, workout]); // Add workout to selected
    }
  };

  // Handle removal of a workout
  const handleWorkoutRemove = (workout) => {
    setSelected(selected.filter((w) => w !== workout)); // Remove workout from selected
  };

  // Create or update split based on presence of splitId
  const handleCreateOrUpdateSplit = async () => {
    const splitData = {
      name: splitNameState,
      workouts: selected.map((w) => w._id), // Map selected workouts to their IDs
    };

    if (splitId) {
      await updateSplit(splitId, splitData); // Update existing split
    } else {
      await createSplit(splitData); // Create new split
    }

    // Reset state and navigate to splits page
    setSplitNameState("");
    setSelected([]);
    navigate("/splits");
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term
    setPage(1); // Reset to first page
  };

  return (
    <div className="split-planner">
      {" "}
      {/* Main container */}
      <h2>{splitId ? "Edit Split" : "Create a New Split"}</h2> {/* Title */}
      <input
        type="text"
        placeholder="Split Name"
        value={splitNameState}
        onChange={(e) => setSplitNameState(e.target.value)} // Update split name
      />
      <h3>Select Workouts</h3>
      <input
        type="text"
        placeholder="Search Workouts"
        value={searchTerm}
        onChange={handleSearchChange} // Handle search input changes
      />
      <div className="workout-list">
        {workouts.map((workout) => (
          <div key={workout._id} className="workout-box">
            <h4>{workout.name}</h4>
            <ul>
              {workout.exercises.map((exercise) => (
                <li key={exercise._id}>
                  <p>{exercise.name}</p> {/* Exercise name */}
                </li>
              ))}
            </ul>
            <button onClick={() => handleWorkoutSelect(workout)}>Add</button>{" "}
            {/* Add workout */}
          </div>
        ))}
      </div>
      <div className="pagination">
        {" "}
        {/* Pagination controls */}
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <button
          disabled={workouts.length < limit} // Disable next button if less than limit
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      <h3>Selected Workouts</h3>
      <div className="selected-workouts">
        {" "}
        {/* Display selected workouts */}
        {selected.map((workout) => (
          <div key={workout._id} className="selected-workout">
            <h4>{workout.name}</h4>
            <button onClick={() => handleWorkoutRemove(workout)}>
              Remove
            </button>{" "}
            {/* Remove workout */}
          </div>
        ))}
      </div>
      <button onClick={handleCreateOrUpdateSplit}>
        {" "}
        {/* Create or update split button */}
        {splitId ? "Update Split" : "Create Split"}
      </button>
    </div>
  );
};

export default SplitPlanner; // Export the SplitPlanner component
