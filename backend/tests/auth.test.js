const request = require("supertest");
const app = require("../app");

const validUser = { name: "Test User", email: "test@example.com", password: "password123" };

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app).post("/api/auth/register").send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it("rejects missing fields with 400", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "a@b.com" });
      expect(res.status).toBe(400);
    });

    it("rejects short passwords with 400", async () => {
      const res = await request(app).post("/api/auth/register").send({ ...validUser, password: "short" });
      expect(res.status).toBe(400);
    });

    it("rejects duplicate emails with 409", async () => {
      await request(app).post("/api/auth/register").send(validUser);
      const res = await request(app).post("/api/auth/register").send(validUser);
      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("rejects a wrong password with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "wrongpassword" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the current user with a valid token", async () => {
      const reg = await request(app).post("/api/auth/register").send(validUser);
      const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${reg.body.token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });

    it("rejects requests without a token with 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});