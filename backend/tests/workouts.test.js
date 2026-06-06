const request = require("supertest");
const app = require("../app");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function registerUser(email) {
  const res = await request(app).post("/api/auth/register")
    .send({ name: "Test", email, password: "password123" });
  return res.body.token;
}

describe("Workouts API", () => {
  let token;
  beforeEach(async () => { token = await registerUser("workout-user@example.com"); });

  describe("POST /api/workouts", () => {
    it("creates a workout (201)", async () => {
      const res = await request(app).post("/api/workouts").set(auth(token))
        .send({ name: "Push Day", exercises: [1, 2, 3] });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Push Day");
      expect(res.body._id).toBeDefined();          // now we assert it explicitly
    });
    it("rejects a missing name (400)", async () => {
      const res = await request(app).post("/api/workouts").set(auth(token)).send({ exercises: [1] });
      expect(res.status).toBe(400);
    });
    it("rejects non-array exercises (400)", async () => {
      const res = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Bad", exercises: "nope" });
      expect(res.status).toBe(400);
    });
    it("rejects an empty exercises array (400)", async () => {
      const res = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Empty", exercises: [] });
      expect(res.status).toBe(400);               // documents your "at least one exercise" rule
    });
    it("requires authentication (401)", async () => {
      const res = await request(app).post("/api/workouts").send({ name: "X", exercises: [1] });
      expect(res.status).toBe(401);
    });
  });
    describe("GET /api/workouts", () => {
        it("returns the user's workouts with populated exercises", async () => {
        await request(app).post("/api/workouts").set(auth(token)).send({ name: "Mine", exercises: [1] });
        const res = await request(app).get("/api/workouts").set(auth(token));
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe("Mine");
        });
    });

    describe("GET /api/workouts/:id", () => {
        it("fetches a workout by id", async () => {
        const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "One", exercises: [1] });
        const res = await request(app).get(`/api/workouts/${created.body._id}`).set(auth(token));
        expect(res.status).toBe(200);
        expect(res.body.name).toBe("One");
        });
        it("returns 404 for another user's workout", async () => {
        const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Private", exercises: [1] });
        const otherToken = await registerUser("snooper@example.com");
        const res = await request(app).get(`/api/workouts/${created.body._id}`).set(auth(otherToken));
        expect(res.status).toBe(404);
        });
        it("returns 400 for a malformed id", async () => {                       // NEW
        const res = await request(app).get("/api/workouts/not-a-valid-id").set(auth(token));
        expect(res.status).toBe(400);
        });
    });

  describe("GET /api/workouts/:id", () => {
    it("fetches a workout by id", async () => {
      const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "One", exercises: [1] });
      const res = await request(app).get(`/api/workouts/${created.body._id}`).set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("One");
    });
    it("returns 404 for another user's workout", async () => {
      const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Private", exercises: [1] });
      const otherToken = await registerUser("snooper@example.com");
      const res = await request(app).get(`/api/workouts/${created.body._id}`).set(auth(otherToken));
      expect(res.status).toBe(404);
    });
  });

    describe("PUT /api/workouts/:id", () => {
        it("updates a workout", async () => {
        const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Old", exercises: [1] });
        const res = await request(app).put(`/api/workouts/${created.body._id}`).set(auth(token))
            .send({ name: "New", exercises: [5] });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe("New");
        });
        it("returns 404 when updating a non-existent workout", async () => {      // NEW
        const res = await request(app).put("/api/workouts/64b8f0000000000000000000")
            .set(auth(token)).send({ name: "X", exercises: [1] });
        expect(res.status).toBe(404);
        });
        it("rejects an update with a missing name (400)", async () => {
        const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Old", exercises: [1] });
        const res = await request(app).put(`/api/workouts/${created.body._id}`).set(auth(token)).send({ exercises: [1] });
        expect(res.status).toBe(400);
        });
        it("rejects an update with empty exercises (400)", async () => {
        const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Old", exercises: [1] });
        const res = await request(app).put(`/api/workouts/${created.body._id}`).set(auth(token)).send({ name: "X", exercises: [] });
        expect(res.status).toBe(400);
        });
    });

    describe("DELETE /api/workouts/:id", () => {
    it("deletes a workout", async () => {
      const created = await request(app).post("/api/workouts").set(auth(token)).send({ name: "Temp", exercises: [1] });
      expect((await request(app).delete(`/api/workouts/${created.body._id}`).set(auth(token))).status).toBe(200);
      const after = await request(app).get(`/api/workouts/${created.body._id}`).set(auth(token));
      expect(after.status).toBe(404);
    });
    it("returns 404 when deleting a non-existent workout", async () => {      // NEW
      const res = await request(app).delete("/api/workouts/64b8f0000000000000000000").set(auth(token));
      expect(res.status).toBe(404);
    });
  });
});