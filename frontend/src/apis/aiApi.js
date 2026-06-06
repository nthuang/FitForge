import { getAuthHeaders } from "./authHeaders";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const generateWorkoutPlan = async () => {
  const response = await fetch(`${API_URL}/ai/generate-workout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate workout plan");
  }

  return data.plan;
};

export const saveGeneratedPlan = async (plan) => {
  const response = await fetch(`${API_URL}/ai/save-generated-plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ plan }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save generated plan");
  }

  return data;
};