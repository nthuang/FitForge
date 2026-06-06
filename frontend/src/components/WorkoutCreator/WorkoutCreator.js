import React, { useEffect, useState } from "react";
import { fetchExercises } from "../../apis/exerciseApi";
import { createWorkout, updateWorkout } from "../../apis/workoutApi";
import { useLocation, useNavigate } from "react-router-dom";
import "./WorkoutCreator.css";

const WorkoutCreator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    workoutId = null,
    workoutName = "",
    selectedExercises = [],
  } = location.state || {};

  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(selectedExercises);
  const [workoutNameState, setWorkoutNameState] = useState(workoutName);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(16);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    const getExercises = async () => {
      try {
        setLoadingExercises(true);
        setError("");

        const data = await fetchExercises(searchTerm, page, limit);
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError(error.message || "Failed to fetch exercises.");
      } finally {
        setLoadingExercises(false);
      }
    };

    getExercises();
  }, [searchTerm, page, limit]);

  const isExerciseSelected = (exercise) => {
    return selected.some((selectedExercise) => selectedExercise.id === exercise.id);
  };

  const handleExerciseSelect = (exercise) => {
    if (!isExerciseSelected(exercise)) {
      setSelected((prev) => [...prev, exercise]);
      setError("");
    }
  };

  const handleExerciseRemove = (exercise) => {
    setSelected((prev) =>
      prev.filter((selectedExercise) => selectedExercise.id !== exercise.id)
    );
  };

  const handleCreateOrUpdateWorkout = async () => {
    setError("");

    if (!workoutNameState.trim()) {
      setError("Please enter a workout name.");
      return;
    }

    if (selected.length === 0) {
      setError("Please select at least one exercise.");
      return;
    }

    const workoutData = {
      name: workoutNameState.trim(),
      exercises: selected.map((exercise) => exercise.id),
    };

    try {
      setSaving(true);

      if (workoutId) {
        await updateWorkout(workoutId, workoutData);
      } else {
        await createWorkout(workoutData);
      }

      setWorkoutNameState("");
      setSelected([]);
      navigate("/workouts");
    } catch (error) {
      console.error("Error saving workout:", error);
      setError(error.message || "Failed to save workout.");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  return (
    <div className="workout-creator">
      <h2>{workoutId ? "Edit Workout" : "Create a New Workout"}</h2>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Workout Name"
        value={workoutNameState}
        onChange={(event) => setWorkoutNameState(event.target.value)}
      />

      <h3>Select Exercises</h3>

      <input
        type="text"
        placeholder="Search Exercises"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {loadingExercises && <p>Loading exercises...</p>}

      <div className="exercise-list">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-box">
            <img src={exercise.gifUrl} alt={exercise.name} />
            <p>{exercise.name}</p>

            <button
              type="button"
              onClick={() => handleExerciseSelect(exercise)}
              disabled={isExerciseSelected(exercise)}
            >
              {isExerciseSelected(exercise) ? "Added" : "Add"}
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </button>

        <button type="button" onClick={() => setPage((prev) => prev + 1)}>
          Next
        </button>
      </div>

      <h3>Selected Exercises</h3>

      <div className="selected-exercises">
        {selected.map((exercise) => (
          <div key={exercise.id} className="selected-exercise">
            <p>{exercise.name}</p>
            <button type="button" onClick={() => handleExerciseRemove(exercise)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCreateOrUpdateWorkout}
        disabled={saving}
      >
        {saving
          ? workoutId
            ? "Updating..."
            : "Creating..."
          : workoutId
          ? "Update Workout"
          : "Create Workout"}
      </button>
    </div>
  );
};

export default WorkoutCreator;