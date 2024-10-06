import React, { useState, useEffect } from "react"; // Import React and hooks
import { triggerExerciseFetch, fetchExercises } from "../../apis/exerciseApi"; // Import API functions
import "./ExerciseLibrary.css"; // Import CSS for styling

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]); // State to hold exercises
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [page, setPage] = useState(1); // State for current page
  const [limit] = useState(24); // Set the number of exercises per page

  useEffect(() => {
    const getExercises = async () => {
      try {
        await triggerExerciseFetch(); // Fetch exercises from the API
        const data = await fetchExercises(searchTerm, page, limit); // Get exercises based on search and pagination
        setExercises(data); // Update state with fetched exercises
      } catch (error) {
        console.error("Error fetching exercises:", error); // Log errors
      }
    };

    getExercises(); // Call the fetch function
  }, [searchTerm, page, limit]); // Dependencies to trigger effect

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term
    setPage(1); // Reset to the first page on new search
  };

  const handlePageChange = (newPage) => {
    setPage(newPage); // Update current page
  };

  return (
    <div className="exercise-library">
      <h1>Exercise Library</h1> {/* Main heading */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange} // Handle input change for search
        placeholder="Search exercises..."
        className="search-input" // CSS class for styling
      />
      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <div key={exercise._id} className="exercise-card">
            {" "}
            {/* Unique key for each exercise card */}
            <img src={exercise.gifUrl} alt={exercise.name} />{" "}
            {/* Exercise image */}
            <h3>{exercise.name}</h3> {/* Exercise name */}
            <p>Body Part: {exercise.bodyPart}</p> {/* Body part targeted */}
            <p>Equipment: {exercise.equipment}</p> {/* Equipment used */}
            <p>Target: {exercise.target}</p> {/* Target muscle group */}
          </div>
        ))}
      </div>
      <div className="pagination">
        {" "}
        {/* Pagination controls */}
        <button
          disabled={page === 1} // Disable if on first page
          onClick={() => handlePageChange(page - 1)} // Navigate to previous page
        >
          Previous
        </button>
        <button onClick={() => handlePageChange(page + 1)}>Next</button>{" "}
        {/* Navigate to next page */}
      </div>
    </div>
  );
};

export default ExerciseLibrary; // Export the component
