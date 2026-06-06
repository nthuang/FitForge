const request = require("supertest");
const app = require("../app");
const { protect, adminOnly } = require("../middleware/authMiddleware");

describe("Security middleware", () => {
  it("exports protect and adminOnly as functions", () => {
    expect(typeof protect).toBe("function");
    expect(typeof adminOnly).toBe("function");
  });

  it("rejects a protected route with no token (401)", async () => {
    const res = await request(app).get("/api/workouts");
    expect(res.status).toBe(401);
  });

  it("rejects a protected route with an invalid token (401)", async () => {
    const res = await request(app)
      .get("/api/workouts")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});