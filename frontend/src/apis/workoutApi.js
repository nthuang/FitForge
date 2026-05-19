import { getAuthHeaders } from "./authHeaders";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; // Base API URL

export const fetchWorkouts = async () => {
    const response = await fetch(`${API_URL}/workouts`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch workouts");
    }

    return data;
};

export const createWorkout = async (workout) => {
    const response = await fetch(`${API_URL}/workouts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(workout),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create workout");
    }

    return data;
};

export const fetchWorkoutById = async (id) => {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch workout");
  }

  return data;
};

export const updateWorkout = async (id, workout) => {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(workout),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update workout");
  }

  return data;
};

export const deleteWorkout = async (id) => {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete workout");
  }

  return data;
};