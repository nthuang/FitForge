import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"; // Base API URL

// Function to trigger fetching exercises from the API
export const triggerExerciseFetch = async () => {
  const { data } = await axios.get(`${API_URL}/exercises/fetch`);
  return data;
};


// Function to fetch exercises with optional search, pagination
export const fetchExercises = async (searchTerm = "", page = 1, limit = 1500) => {
  const { data } = await axios.get(`${API_URL}/exercises`, {
    params: {
      search: searchTerm,
      page,
      limit,
    },
  });

  return data;
};
