import React, { useState, useEffect } from "react";
import { fetchWorkouts } from "../../apis/workoutApi";
import { createSplit, updateSplit } from "../../apis/splitApi";
import { useLocation, useNavigate } from "react-router-dom";
import "./SplitPlanner.css";

const SplitPlanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    splitId,
    splitName = "",
    selectedWorkouts = [],
  } = location.state || {};

  const [allWorkouts, setAllWorkouts] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selected, setSelected] = useState(selectedWorkouts);
  const [splitNameState, setSplitNameState] = useState(splitName);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(16);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getWorkouts = async () => {
      try {
        const data = await fetchWorkouts();
        setAllWorkouts(data);
      } catch (error) {
        console.error("Error fetching workouts:", error);
        setError(error.message || "Failed to fetch workouts.");
      }
    };

    getWorkouts();
  }, []);

  useEffect(() => {
    const filteredWorkouts = allWorkouts.filter((workout) =>
      workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    setWorkouts(filteredWorkouts.slice(startIndex, endIndex));
  }, [allWorkouts, searchTerm, page, limit]);

  const isWorkoutSelected = (workout) => {
    return selected.some((selectedWorkout) => selectedWorkout._id === workout._id);
  };

  const handleWorkoutSelect = (workout) => {
    if (!isWorkoutSelected(workout)) {
      setSelected((prev) => [...prev, workout]);
      setError("");
    }
  };

  const handleWorkoutRemove = (workout) => {
    setSelected((prev) =>
      prev.filter((selectedWorkout) => selectedWorkout._id !== workout._id)
    );
  };

  const handleCreateOrUpdateSplit = async () => {
    setError("");

    if (!splitNameState.trim()) {
      setError("Please enter a split name.");
      return;
    }

    if (selected.length === 0) {
      setError("Please select at least one workout.");
      return;
    }

    const splitData = {
      name: splitNameState.trim(),
      workouts: selected.map((workout) => workout._id),
    };

    try {
      setSaving(true);

      if (splitId) {
        await updateSplit(splitId, splitData);
      } else {
        await createSplit(splitData);
      }

      setSplitNameState("");
      setSelected([]);
      navigate("/splits");
    } catch (error) {
      console.error("Error saving split:", error);
      setError(error.message || "Failed to save split.");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  return (
    <div className="split-planner">
      <h2>{splitId ? "Edit Split" : "Create a New Split"}</h2>

      {error && <div className="error-message">{error}</div>}

      <input
        type="text"
        placeholder="Split Name"
        value={splitNameState}
        onChange={(event) => setSplitNameState(event.target.value)}
      />

      <h3>Select Workouts</h3>

      <input
        type="text"
        placeholder="Search Workouts"
        value={searchTerm}
        onChange={handleSearchChange}
      />

      <div className="workout-list">
        {workouts.map((workout) => (
          <div key={workout._id} className="workout-box">
            <h4>{workout.name}</h4>

            <ul>
              {(workout.exercises || []).map((exercise) => (
                <li key={exercise._id || exercise.id}>
                  <p>{exercise.name}</p>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleWorkoutSelect(workout)}
              disabled={isWorkoutSelected(workout)}
            >
              {isWorkoutSelected(workout) ? "Added" : "Add"}
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

        <button
          type="button"
          disabled={workouts.length < limit}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      <h3>Selected Workouts</h3>

      <div className="selected-workouts">
        {selected.map((workout) => (
          <div key={workout._id} className="selected-workout">
            <h4>{workout.name}</h4>
            <button type="button" onClick={() => handleWorkoutRemove(workout)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleCreateOrUpdateSplit}
        disabled={saving}
      >
        {saving
          ? splitId
            ? "Updating..."
            : "Creating..."
          : splitId
          ? "Update Split"
          : "Create Split"}
      </button>
    </div>
  );
};

export default SplitPlanner;