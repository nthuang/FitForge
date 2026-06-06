import { useState } from "react";
import { generateWorkoutPlan, saveGeneratedPlan } from "../../apis/aiApi";
import "./AIWorkoutGenerator.css";

const AIWorkoutGenerator = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setPlan(null);

    try {
      const generatedPlan = await generateWorkoutPlan();
      setPlan(generatedPlan);
    } catch (error) {
      setError(error.message || "Failed to generate workout plan");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!plan) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await saveGeneratedPlan(plan);
      setSuccess("Plan saved to your workouts and splits.");
    } catch (error) {
      setError(error.message || "Failed to save workout plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ai-generator-page">
      <div className="ai-generator-card">
        <h1>AI Workout Generator</h1>
        <p>
          Generate a personalized workout plan using your fitness profile and
          available exercises.
        </p>

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Workout Plan"}
        </button>

        {error && <div className="ai-error">{error}</div>}
        {success && <div className="ai-success">{success}</div>}

        {plan && (
          <div className="ai-plan">
            <h2>{plan.programName}</h2>
            <p>
              Goal: {plan.goal} | Days per week: {plan.daysPerWeek}
            </p>

            <button onClick={handleSavePlan} disabled={saving}>
              {saving ? "Saving..." : "Save Plan to My Workouts"}
            </button>

            {plan.days?.map((day) => (
              <div key={day.day} className="ai-day-card">
                <h3>
                  Day {day.day}: {day.name}
                </h3>
                <p>Focus: {day.focus}</p>

                <ul>
                  {day.exercises?.map((exercise) => (
                    <li key={`${day.day}-${exercise.exerciseId}`}>
                      <strong>{exercise.name}</strong> — {exercise.sets} sets,{" "}
                      {exercise.repRange}, {exercise.restSeconds}s rest
                      <br />
                      <span>{exercise.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {plan.notes?.length > 0 && (
              <div className="ai-notes">
                <h3>Notes</h3>
                <ul>
                  {plan.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWorkoutGenerator;