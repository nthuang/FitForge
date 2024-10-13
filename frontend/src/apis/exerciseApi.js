import axios from "axios";

const API_URL = "https://fitforge.onrender.com/api"; // Base API URL

// Function to trigger fetching exercises from the API
export const triggerExerciseFetch = async () => {
  try {
    await axios.get(`${API_URL}/exercises/fetch`); // Send request to fetch exercises
  } catch (error) {
    console.error("Error triggering exercise fetch:", error); // Log any errors
  }
};

// Function to fetch exercises with optional search, pagination
export const fetchExercises = async (searchTerm, page = 1, limit = 1500) => {
  const { data } = await axios.get(`${API_URL}/exercises`, {
    params: {
      search: searchTerm,
      page,
      limit,
    },
  });
  return data; // Return fetched exercise data
};
