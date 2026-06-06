import React, { useEffect, useState } from "react";
import { fetchSplits, deleteSplit, fetchSplitDetails } from "../../apis/splitApi";
import { Link, useNavigate } from "react-router-dom";
import "./SplitLibrary.css";

const SplitLibrary = () => {
  const [splits, setSplits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getSplits = async () => {
      try {
        const fetchedSplits = await fetchSplits();
        setSplits(fetchedSplits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getSplits();
  }, []);

  const handleDeleteSplit = async (e, id) => {
    e.stopPropagation(); // don't open the modal when deleting
    try {
      await deleteSplit(id);
      setSplits(splits.filter((split) => split._id !== id));
    } catch (err) {
      console.error("Error deleting split:", err);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleEditSplit = (e, split) => {
    e.stopPropagation(); // don't open the modal when editing
    navigate("/split-planner", {
      state: {
        splitId: split._id,
        splitName: split.name,
        selectedWorkouts: split.workouts,
      },
    });
  };

  const handleOpenSplit = async (split) => {
    setSelectedSplit(split);     // show name immediately
    setDetailsLoading(true);
    try {
      const detailed = await fetchSplitDetails(split._id);
      setSelectedSplit(detailed); // swap in full exercise details
    } catch (err) {
      console.error("Error loading split details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseModal = () => setSelectedSplit(null);

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
            <div
              className="split-box"
              key={split._id}
              onClick={() => handleOpenSplit(split)}
            >
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
              <button onClick={(e) => handleEditSplit(e, split)} className="edit-button">
                Edit
              </button>
              <button
                className="delete-button"
                onClick={(e) => handleDeleteSplit(e, split._id)}
                aria-label="Delete Split"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      <Link to="/split-planner" className="create-split-button">
        Create Split
      </Link>

      {selectedSplit && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal} aria-label="Close">
              &times;
            </button>
            <h2>{selectedSplit.name}</h2>
            {detailsLoading ? (
              <p>Loading exercises…</p>
            ) : (
              selectedSplit.workouts.map((workout) => (
                <div className="modal-workout" key={workout._id}>
                  <h3>{workout.name}</h3>
                  {workout.exercises && workout.exercises.length > 0 ? (
                    <ul className="modal-exercise-list">
                      {workout.exercises.map((ex) => (
                        <li key={ex._id || ex.id}>
                          <strong>{ex.name}</strong>
                          <span className="exercise-meta">
                            {[ex.bodyPart, ex.target, ex.equipment].filter(Boolean).join(" · ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No exercises in this workout</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitLibrary;