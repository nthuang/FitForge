const request = require("supertest");
const app = require("../app");
const Exercise = require("../models/Exercise");

describe("Exercises API", () => {
  beforeEach(async () => {
    await Exercise.insertMany([
      { id: 1, name: "Bench Press", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" },
      { id: 2, name: "Squat", bodyPart: "upper legs", target: "quads", equipment: "barbell", gifUrl: "" },
      { id: 3, name: "Bicep Curl", bodyPart: "upper arms", target: "biceps", equipment: "dumbbell", gifUrl: "" },
    ]);
  });

  it("returns all exercises (200)", async () => {
    const res = await request(app).get("/api/exercises");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
  it("filters by search term", async () => {
    const res = await request(app).get("/api/exercises").query({ search: "squat" });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Squat");
  });
  it("supports pagination via limit", async () => {
    const res = await request(app).get("/api/exercises").query({ limit: 2, page: 1 });
    expect(res.body).toHaveLength(2);
  });
});