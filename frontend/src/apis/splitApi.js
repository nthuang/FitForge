import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Base API URL

// Function to create a new split
export const createSplit = async (split) => {
  const { data } = await axios.post(`${API_URL}/splits`, split); // Send POST request to create split
  return data; // Return created split data
};

// Function to fetch all splits
export const fetchSplits = async () => {
  const { data } = await axios.get(`${API_URL}/splits`); // Send GET request to fetch splits
  return data; // Return fetched splits data
};

// Function to fetch a split by its ID
export const fetchSplitById = async (id) => {
  const { data } = await axios.get(`${API_URL}/splits/${id}`); // Send GET request for specific split
  return data; // Return fetched split data
};

// Function to update a split by its ID
export const updateSplit = async (id, split) => {
  const { data } = await axios.put(`${API_URL}/splits/${id}`, split); // Send PUT request to update split
  return data; // Return updated split data
};

// Function to delete a split by its ID
export const deleteSplit = async (id) => {
  await axios.delete(`${API_URL}/splits/${id}`); // Send DELETE request to remove split
};
