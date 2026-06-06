const request = require("supertest");
const app = require("../app");
const Exercise = require("../models/Exercise");

const auth = (token) => ({ Authorization: `Bearer ${token}` });
async function registerUser(email) {
  const res = await request(app).post("/api/auth/register").send({ name: "Test", email, password: "password123" });
  return res.body.token;
}

// Fake LLM HTTP response shaped like what the route expects
function mockLLM({ ok = true, status = 200, content = "", body = null } = {}) {
  return {
    ok, status,
    headers: { get: () => null },
    json: async () => (body !== null ? body : { choices: [{ message: { content } }] }),
  };
}

const validPlan = {
  programName: "Test Program", goal: "strength", daysPerWeek: 1,
  days: [{ day: 1, name: "Day 1", focus: "full body",
    exercises: [{ exerciseId: 1, name: "Bench Press", sets: 3, repRange: "8-10", restSeconds: 90, reason: "x" }] }],
  notes: [],
};

describe("AI API", () => {
  let token;
  beforeEach(async () => {
    token = await registerUser("ai-user@example.com");
    global.fetch = jest.fn();                       // mock the LLM call
    process.env.LLM_API_URL = "https://mock-llm.test/chat";
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_MODEL = "test-model";
  });
  afterEach(() => jest.restoreAllMocks());

  describe("POST /api/ai/generate-workout", () => {
    it("returns a plan when exercises exist and the LLM responds (200)", async () => {
      await Exercise.create({ id: 1, name: "Bench Press", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      global.fetch.mockResolvedValue(mockLLM({ content: JSON.stringify(validPlan) }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.plan.programName).toBe("Test Program");
    });
    it("returns 400 when there are no exercises to choose from", async () => {
      global.fetch.mockResolvedValue(mockLLM({ content: JSON.stringify(validPlan) }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(400);
      expect(global.fetch).not.toHaveBeenCalled();   // bails before calling the LLM
    });
    it("rejects a plan referencing an invalid exercise id (500)", async () => {
      await Exercise.create({ id: 1, name: "Bench Press", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      const badPlan = { ...validPlan, days: [{ ...validPlan.days[0],
        exercises: [{ exerciseId: 999, name: "Fake", sets: 1, repRange: "1", restSeconds: 1, reason: "x" }] }] };
      global.fetch.mockResolvedValue(mockLLM({ content: JSON.stringify(badPlan) }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(500);
    });
    it("propagates a 429 from the LLM", async () => {
      await Exercise.create({ id: 1, name: "Bench Press", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      global.fetch.mockResolvedValue(mockLLM({ ok: false, status: 429, body: { error: "rate limited" } }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(429);
    });
    it("requires authentication (401)", async () => {
      const res = await request(app).post("/api/ai/generate-workout");
      expect(res.status).toBe(401);
    });
    it("uses the equipment filter when the profile has equipment", async () => {
      await Exercise.create({ id: 1, name: "Bench", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      await request(app).put("/api/auth/profile").set(auth(token)).send({ equipment: ["barbell"] });
      global.fetch.mockResolvedValue(mockLLM({ content: JSON.stringify(validPlan) }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/ai/save-generated-plan", () => {
    it("saves the plan as workouts + a split (201)", async () => {
      const res = await request(app).post("/api/ai/save-generated-plan").set(auth(token)).send({ plan: validPlan });
      expect(res.status).toBe(201);
      expect(res.body.workouts).toHaveLength(1);
      expect(res.body.split.name).toBe("Test Program");
    });
    it("rejects an invalid plan (400)", async () => {
      const res = await request(app).post("/api/ai/save-generated-plan").set(auth(token)).send({ plan: { nope: true } });
      expect(res.status).toBe(400);
    });
    it("requires authentication (401)", async () => {
      const res = await request(app).post("/api/ai/save-generated-plan").send({ plan: validPlan });
      expect(res.status).toBe(401);
    });
    it("returns 500 when the LLM returns no content", async () => {
      await Exercise.create({ id: 1, name: "Bench", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      global.fetch.mockResolvedValue(mockLLM({ content: "" }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(500);
    });
    it("returns 500 when the LLM returns non-JSON", async () => {
      await Exercise.create({ id: 1, name: "Bench", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      global.fetch.mockResolvedValue(mockLLM({ content: "totally not json" }));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(500);
    });
    it("returns 500 when the LLM request throws", async () => {
      await Exercise.create({ id: 1, name: "Bench", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      global.fetch.mockRejectedValue(new Error("network down"));
      const res = await request(app).post("/api/ai/generate-workout").set(auth(token));
      expect(res.status).toBe(500);
    });
  });
});