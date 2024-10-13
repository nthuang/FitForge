import axios from "axios";

const API_URL = "https://nfitforge-45045cb2f053.herokuapp.com/api"; // Base API URL

// Function to create a new workout
export const createWorkout = async (workout) => {
  const { data } = await axios.post(`${API_URL}/workouts`, workout); // Send POST request to create workout
  return data; // Return created workout data
};

// Function to fetch all workouts
export const fetchWorkouts = async () => {
  const { data } = await axios.get(`${API_URL}/workouts`); // Send GET request to fetch workouts
  return data; // Return fetched workouts data
};

// Function to fetch a workout by its ID
export const fetchWorkoutById = async (id) => {
  const { data } = await axios.get(`${API_URL}/workouts/${id}`); // Send GET request for specific workout
  return data; // Return fetched workout data
};

// Function to update a workout by its ID
export const updateWorkout = async (id, workout) => {
  const { data } = await axios.put(`${API_URL}/workouts/${id}`, workout); // Send PUT request to update workout
  return data; // Return updated workout data
};

// Function to delete a workout by its ID
export const deleteWorkout = async (id) => {
  await axios.delete(`${API_URL}/workouts/${id}`); // Send DELETE request to remove workout
};
