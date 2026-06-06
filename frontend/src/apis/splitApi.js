import { getAuthHeaders } from "./authHeaders";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const createSplit = async (split) => {
  const response = await fetch(`${API_URL}/splits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(split),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create split");
  }

  return data;
};

export const fetchSplits = async () => {
  const response = await fetch(`${API_URL}/splits`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch splits");
  }

  return data;
};

export const fetchSplitById = async (id) => {
  const response = await fetch(`${API_URL}/splits/${id}`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch split");
  }

  return data;
};

export const updateSplit = async (id, split) => {
  const response = await fetch(`${API_URL}/splits/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(split),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update split");
  }

  return data;
};

export const deleteSplit = async (id) => {
  const response = await fetch(`${API_URL}/splits/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete split");
  }

  return data;
};