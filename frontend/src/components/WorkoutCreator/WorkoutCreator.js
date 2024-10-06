import React, { useEffect, useState } from "react"; // Import React and hooks
import { triggerExerciseFetch, fetchExercises } from "../../apis/exerciseApi"; // API functions for fetching exercises
import { createWorkout, updateWorkout } from "../../apis/workoutApi"; // API functions for workout management
import { useLocation, useNavigate } from "react-router-dom"; // Hooks for routing
import "./WorkoutCreator.css"; // Import CSS for styling

const WorkoutCreator = () => {
  const location = useLocation(); // Get location object
  const navigate = useNavigate(); // Initialize navigation

  // Destructure state from location or set defaults
  const {
    workoutId = null,
    workoutName = "",
    selectedExercises = [],
  } = location.state || {};

  // State variables
  const [exercises, setExercises] = useState([]); // Available exercises
  const [selected, setSelected] = useState(selectedExercises); // Selected exercises
  const [workoutNameState, setWorkoutNameState] = useState(workoutName); // Workout name
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [page, setPage] = useState(1); // Pagination
  const [limit] = useState(16); // Number of exercises per page

  // Fetch exercises based on search term and pagination
  useEffect(() => {
    const getExercises = async () => {
      try {
        await triggerExerciseFetch(); // Trigger exercise fetch
        const data = await fetchExercises(searchTerm, page, limit); // Fetch exercises
        setExercises(data); // Update state with fetched exercises
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    getExercises(); // Execute fetch function
  }, [searchTerm, page, limit]);

  // Handle selection of an exercise
  const handleExerciseSelect = (exercise) => {
    if (!selected.includes(exercise)) {
      setSelected([...selected, exercise]); // Add exercise to selected
    }
  };

  // Handle removal of an exercise
  const handleExerciseRemove = (exercise) => {
    setSelected(selected.filter((ex) => ex !== exercise)); // Remove exercise from selected
  };

  // Create or update workout based on presence of workoutId
  const handleCreateOrUpdateWorkout = async () => {
    const workoutData = {
      name: workoutNameState,
      exercises: selected.map((ex) => ex.id), // Map selected exercises to their IDs
    };

    if (workoutId) {
      await updateWorkout(workoutId, workoutData); // Update existing workout
    } else {
      await createWorkout(workoutData); // Create new workout
    }

    // Reset state and navigate to workouts page
    setWorkoutNameState("");
    setSelected([]);
    navigate("/workouts");
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term
    setPage(1); // Reset to first page
  };

  return (
    <div className="workout-creator">
      {" "}
      {/* Main container */}
      <h2>{workoutId ? "Edit Workout" : "Create a New Workout"}</h2>{" "}
      {/* Title */}
      <input
        type="text"
        placeholder="Workout Name"
        value={workoutNameState}
        onChange={(e) => setWorkoutNameState(e.target.value)} // Update workout name
      />
      <h3>Select Exercises</h3>
      <input
        type="text"
        placeholder="Search Exercises"
        value={searchTerm}
        onChange={handleSearchChange} // Handle search input changes
      />
      <div className="exercise-list">
        {exercises.map(
          (
            exercise // Map through exercises
          ) => (
            <div key={exercise.id} className="exercise-box">
              <img src={exercise.gifUrl} alt={exercise.name} />{" "}
              {/* Exercise GIF */}
              <p>{exercise.name}</p> {/* Exercise name */}
              <button onClick={() => handleExerciseSelect(exercise)}>
                Add
              </button>{" "}
              {/* Add exercise */}
            </div>
          )
        )}
      </div>
      <div className="pagination">
        {" "}
        {/* Pagination controls */}
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
      <h3>Selected Exercises</h3>
      <div className="selected-exercises">
        {" "}
        {/* Display selected exercises */}
        {selected.map((exercise) => (
          <div key={exercise.id} className="selected-exercise">
            <p>{exercise.name}</p> {/* Selected exercise name */}
            <button onClick={() => handleExerciseRemove(exercise)}>
              Remove
            </button>{" "}
            {/* Remove exercise */}
          </div>
        ))}
      </div>
      <button onClick={handleCreateOrUpdateWorkout}>
        {" "}
        {/* Create or update workout button */}
        {workoutId ? "Update Workout" : "Create Workout"}
      </button>
    </div>
  );
};

export default WorkoutCreator; // Export the WorkoutCreator component
