import React, { useEffect, useState } from "react"; // Import React and hooks
import { fetchWorkouts, deleteWorkout } from "../../apis/workoutApi"; // API functions for workouts
import { Link, useNavigate } from "react-router-dom"; // Hooks for routing
import "./WorkoutLibrary.css"; // Import CSS for styling

const WorkoutLibrary = () => {
  const [workouts, setWorkouts] = useState([]); // State for storing workouts
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Initialize navigation

  // Fetch workouts on component mount
  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const fetchedWorkouts = await fetchWorkouts(); // Fetch workouts from API
        setWorkouts(fetchedWorkouts); // Update state with fetched workouts
      } catch (err) {
        setError(err.message); // Capture any errors
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    getWorkouts(); // Execute fetch function
  }, []);

  // Delete a workout by ID
  const handleDeleteWorkout = async (id) => {
    try {
      await deleteWorkout(id); // Call API to delete workout
      setWorkouts(workouts.filter((workout) => workout._id !== id)); // Update state to remove deleted workout
    } catch (err) {
      console.error("Error deleting workout:", err); // Log any errors
    }
  };

  // Update search term based on input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search state
  };

  // Navigate to workout creator with selected workout data
  const handleEditWorkout = (workout) => {
    navigate("/workout-creator", {
      state: {
        workoutId: workout._id,
        workoutName: workout.name,
        selectedExercises: workout.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          gifUrl: exercise.gifUrl || "", // Provide default for gifUrl
        })),
      },
    });
  };

  // Filter workouts based on search term
  const filteredWorkouts = workouts.filter((workout) =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Conditional rendering for loading and error states
  if (loading) return <div>Loading...</div>; // Show loading message
  if (error) return <div>Error: {error}</div>; // Show error message

  return (
    <div className="workout-library-container">
      {" "}
      {/* Main container */}
      <h1>Your Workouts</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange} // Handle search input changes
        placeholder="Search workouts..."
        className="search-input" // CSS class for styling
      />
      <div className="workouts-list">
        {filteredWorkouts.length === 0 ? ( // Conditional rendering for workouts
          <p>No workouts found</p>
        ) : (
          filteredWorkouts.map(
            (
              workout // Map through filtered workouts
            ) => (
              <div className="workout-box" key={workout._id}>
                <h2>{workout.name}</h2>
                <h3>Exercises:</h3>
                {workout.exercises.length === 0 ? ( // Conditional rendering for exercises
                  <p>No exercises in this workout</p>
                ) : (
                  <ul>
                    {workout.exercises.map(
                      (
                        exercise // Map through exercises
                      ) => (
                        <li key={exercise._id}>{exercise.name}</li>
                      )
                    )}
                  </ul>
                )}
                <button
                  onClick={() => handleEditWorkout(workout)} // Edit workout button
                  className="edit-button"
                >
                  Edit
                </button>

                <button
                  className="delete-button" // Delete workout button
                  onClick={() => handleDeleteWorkout(workout._id)}
                  aria-label="Delete Workout" // Accessibility label
                >
                  &times; {/* Close icon for delete */}
                </button>
              </div>
            )
          )
        )}
      </div>
      <Link to="/workout-creator" className="create-workout-button">
        {" "}
        {/* Link to create workout */}
        Create Workout
      </Link>
    </div>
  );
};

export default WorkoutLibrary; // Export the WorkoutLibrary component
