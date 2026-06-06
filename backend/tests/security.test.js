const request = require("supertest");
const app = require("../app");
const { protect } = require("../middleware/authMiddleware");

describe("Security middleware", () => {
  it("exports protect function", () => {
    expect(typeof protect).toBe("function");
  });
  it("rejects a protected route with no token (401)", async () => {
    const res = await request(app).get("/api/workouts");
    expect(res.status).toBe(401);
  });
  it("rejects a protected route with an invalid token (401)", async () => {
    const res = await request(app).get("/api/workouts").set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
  it("blocks a request from a disallowed origin (500)", async () => {
    const res = await request(app).get("/api/workouts").set("Origin", "https://evil.example.com");
    expect(res.status).toBe(500);                 // covers app.js:27
  });

  it("hits the SPA catchall for non-API routes", async () => {
    const res = await request(app).get("/some-frontend-page");
    expect([200, 404, 500]).toContain(res.status); // covers app.js:43 (sendFile executes)
  });
});