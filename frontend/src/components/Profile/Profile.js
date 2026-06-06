import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Profile = () => {
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    goal: user?.fitnessProfile?.goal || "general_fitness",
    experienceLevel: user?.fitnessProfile?.experienceLevel || "beginner",
    daysPerWeek: user?.fitnessProfile?.daysPerWeek || 3,
    sessionLengthMinutes: user?.fitnessProfile?.sessionLengthMinutes || 60,
    equipment: user?.fitnessProfile?.equipment?.join(", ") || "",
    limitations: user?.fitnessProfile?.limitations?.join(", ") || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const splitCommaList = (value) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal: formData.goal,
          experienceLevel: formData.experienceLevel,
          daysPerWeek: Number(formData.daysPerWeek),
          sessionLengthMinutes: Number(formData.sessionLengthMinutes),
          equipment: splitCommaList(formData.equipment),
          limitations: splitCommaList(formData.limitations),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setMessage("Profile updated successfully.");
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Fitness Profile</h1>
        <p>Set your preferences for future personalized workout generation.</p>

        {message && <div className="profile-success">{message}</div>}
        {error && <div className="profile-error">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <label htmlFor="goal">Goal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
          >
            <option value="general_fitness">General Fitness</option>
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="fat_loss">Fat Loss</option>
          </select>

          <label htmlFor="experienceLevel">Experience Level</label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <label htmlFor="daysPerWeek">Days Per Week</label>
          <input
            id="daysPerWeek"
            name="daysPerWeek"
            type="number"
            min="1"
            max="7"
            value={formData.daysPerWeek}
            onChange={handleChange}
          />

          <label htmlFor="sessionLengthMinutes">Session Length</label>
          <input
            id="sessionLengthMinutes"
            name="sessionLengthMinutes"
            type="number"
            min="15"
            max="180"
            value={formData.sessionLengthMinutes}
            onChange={handleChange}
          />

          <label htmlFor="equipment">Equipment</label>
          <input
            id="equipment"
            name="equipment"
            type="text"
            placeholder="dumbbells, bench, barbell"
            value={formData.equipment}
            onChange={handleChange}
          />

          <label htmlFor="limitations">Limitations</label>
          <input
            id="limitations"
            name="limitations"
            type="text"
            placeholder="no running, avoid overhead press"
            value={formData.limitations}
            onChange={handleChange}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;