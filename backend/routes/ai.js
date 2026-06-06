const express = require("express");
const Exercise = require("../models/Exercise");
const { protect } = require("../middleware/authMiddleware");
const Workout = require("../models/Workout");
const Split = require("../models/Split");

const router = express.Router();

const extractJson = (text) => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("LLM response did not contain JSON");
  }

  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
};

router.post("/generate-workout", protect, async (req, res) => {
  const profile = req.user.fitnessProfile || {};

  const {
    goal = "general_fitness",
    experienceLevel = "beginner",
    daysPerWeek = 3,
    sessionLengthMinutes = 60,
    equipment = [],
    limitations = [],
  } = profile;

  const equipmentFilter =
    equipment.length > 0
      ? {
          equipment: {
            $in: equipment.map((item) => new RegExp(item, "i")),
          },
        }
      : {};

  const exercises = await Exercise.find(equipmentFilter)
    .limit(40)
    .select("id name bodyPart equipment target");

  if (exercises.length === 0) {
    return res.status(400).json({
      message: "No matching exercises found for this profile.",
    });
  }

  const exerciseOptions = exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    bodyPart: exercise.bodyPart,
    equipment: exercise.equipment,
    target: exercise.target,
  }));

  const systemPrompt = `
You are FitForge AI, a workout planning assistant.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in triple backticks.
Do not include comments.
Do not include trailing commas.
Use double quotes for all JSON keys and string values.
Generate safe, structured workout plans using ONLY the exercises provided.
Do not invent exercise IDs.
Do not provide medical advice.
If limitations are listed, avoid exercises that obviously conflict with them.
`;

  const userPrompt = `
Create a personalized workout plan.

User profile:
- Goal: ${goal}
- Experience level: ${experienceLevel}
- Days per week: ${daysPerWeek}
- Session length minutes: ${sessionLengthMinutes}
- Equipment: ${equipment.join(", ") || "not specified"}
- Limitations: ${limitations.join(", ") || "none"}

Available exercises:
${JSON.stringify(exerciseOptions, null, 2)}

Return JSON in this exact shape:
{
  "programName": "string",
  "goal": "string",
  "daysPerWeek": number,
  "days": [
    {
      "day": 1,
      "name": "string",
      "focus": "string",
      "exercises": [
        {
          "exerciseId": number,
          "name": "string",
          "sets": number,
          "repRange": "string",
          "restSeconds": number,
          "reason": "string"
        }
      ]
    }
  ],
  "notes": ["string"]
}
`;

  const llmResponse = await fetch(process.env.LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
    }),
  });

  const llmData = await llmResponse.json();

  if (!llmResponse.ok) {
    console.error("LLM status:", llmResponse.status);
    console.error("Retry after:", llmResponse.headers.get("retry-after"));
    console.error("Rate limit remaining requests:", llmResponse.headers.get("x-ratelimit-remaining-requests"));
    console.error("Rate limit remaining tokens:", llmResponse.headers.get("x-ratelimit-remaining-tokens"));
    console.error("LLM request failed:", JSON.stringify(llmData, null, 2));

    return res.status(llmResponse.status === 429 ? 429 : 500).json({
      message:
        llmResponse.status === 429
          ? "Rate limit hit. Please wait and try again."
          : "LLM request failed",
      retryAfter: llmResponse.headers.get("retry-after"),
      error: llmData,
    });
  }

  const content = llmData.choices?.[0]?.message?.content;

  if (!content) {
    return res.status(500).json({
      message: "LLM returned no content",
    });
  }

  const plan = extractJson(content);

  const validExerciseIds = new Set(exerciseOptions.map((exercise) => exercise.id));

  for (const day of plan.days || []) {
    for (const exercise of day.exercises || []) {
      if (!validExerciseIds.has(exercise.exerciseId)) {
        return res.status(500).json({
          message: "LLM returned an invalid exercise ID",
          invalidExerciseId: exercise.exerciseId,
        });
      }
    }
  }

  res.status(200).json({
    plan,
  });
});

router.post("/save-generated-plan", protect, async (req, res) => {
  const { plan } = req.body;

  if (!plan || !Array.isArray(plan.days)) {
    return res.status(400).json({ message: "Valid plan is required" });
  }

  const createdWorkouts = [];

  for (const day of plan.days) {
    const exerciseIds = (day.exercises || []).map((exercise) => exercise.exerciseId);

    const workout = await Workout.create({
      userId: req.user._id,
      name: day.name || `Day ${day.day}`,
      exercises: exerciseIds,
    });

    createdWorkouts.push(workout);
  }

  const split = await Split.create({
    userId: req.user._id,
    name: plan.programName || "AI Generated Plan",
    workouts: createdWorkouts.map((workout) => workout._id),
  });

  res.status(201).json({
    message: "AI plan saved successfully",
    split,
    workouts: createdWorkouts,
  });
});

module.exports = router;