const request = require("supertest");
const app = require("../app");
const { protect, adminOnly } = require("../middleware/authMiddleware");

describe("Security middleware", () => {
  it("exports protect and adminOnly as functions", () => {
    expect(typeof protect).toBe("function");
    expect(typeof adminOnly).toBe("function");
  });

  it("blocks the destructive /api/exercises/fetch without auth (401)", async () => {
    const res = await request(app).get("/api/exercises/fetch");
    expect(res.status).toBe(401);
  });

  it("blocks /api/exercises/fetch for non-admin users (403)", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "U", email: "u@e.com", password: "password123" });
    const res = await request(app)
      .get("/api/exercises/fetch")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(res.status).toBe(403);
  });
});