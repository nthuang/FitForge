const request = require("supertest");
const app = require("../app");
const Exercise = require("../models/Exercise");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function registerUser(email) {
  const res = await request(app).post("/api/auth/register")
    .send({ name: "Test", email, password: "password123" });
  return res.body.token;
}
async function createWorkout(token, name, exercises = [1]) {
  const res = await request(app).post("/api/workouts").set(auth(token)).send({ name, exercises });
  return res.body;
}

describe("Splits API", () => {
  let token;
  beforeEach(async () => { token = await registerUser("split-user@example.com"); });

  describe("POST /api/splits", () => {
    it("creates a split (201)", async () => {
      const w = await createWorkout(token, "Push");
      const res = await request(app).post("/api/splits").set(auth(token))
        .send({ name: "PPL", workouts: [w._id] });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe("PPL");
    });
    it("rejects a missing name (400)", async () => {
      const res = await request(app).post("/api/splits").set(auth(token)).send({ workouts: [] });
      expect(res.status).toBe(400);
    });
    it("rejects non-array workouts (400)", async () => {
      const res = await request(app).post("/api/splits").set(auth(token)).send({ name: "Bad", workouts: "nope" });
      expect(res.status).toBe(400);
    });
    it("requires authentication (401)", async () => {
      const res = await request(app).post("/api/splits").send({ name: "X", workouts: [] });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/splits", () => {
    it("returns only the current user's splits", async () => {
      await request(app).post("/api/splits").set(auth(token)).send({ name: "Mine", workouts: [] });
      const other = await registerUser("other-split@example.com");
      await request(app).post("/api/splits").set(auth(other)).send({ name: "Theirs", workouts: [] });

      const res = await request(app).get("/api/splits").set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Mine");
    });
  });

    describe("GET /api/splits/:id", () => {
    it("fetches a split by id (success)", async () => {                      // NEW
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "S", workouts: [] });
      const res = await request(app).get(`/api/splits/${created.body._id}`).set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("S");
    });
    it("returns 404 for another user's split", async () => {
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "Private", workouts: [] });
      const other = await registerUser("snoop-split@example.com");
      const res = await request(app).get(`/api/splits/${created.body._id}`).set(auth(other));
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/splits/:id/details", () => {
    it("returns the split with fully populated exercise details", async () => {
      await Exercise.create({ id: 1, name: "Bench Press", bodyPart: "chest", target: "pecs", equipment: "barbell", gifUrl: "" });
      const w = await createWorkout(token, "Push", [1]);
      const split = await request(app).post("/api/splits").set(auth(token)).send({ name: "PPL", workouts: [w._id] });

      const res = await request(app).get(`/api/splits/${split.body._id}/details`).set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.workouts).toHaveLength(1);
      expect(res.body.workouts[0].exercises[0].name).toBe("Bench Press");
    });
    it("returns 404 for a non-existent split", async () => {
      const res = await request(app).get(`/api/splits/64b8f0000000000000000000/details`).set(auth(token));
      expect(res.status).toBe(404);
    });
  });

    describe("PUT /api/splits/:id", () => {
    it("updates a split name", async () => {
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "Old", workouts: [] });
      const res = await request(app).put(`/api/splits/${created.body._id}`).set(auth(token)).send({ name: "New", workouts: [] });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New");
    });
    it("returns 404 when updating a non-existent split", async () => {        // NEW
      const res = await request(app).put("/api/splits/64b8f0000000000000000000")
        .set(auth(token)).send({ name: "X", workouts: [] });
      expect(res.status).toBe(404);
    });
    it("rejects an update with a missing name (400)", async () => {
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "Old", workouts: [] });
      const res = await request(app).put(`/api/splits/${created.body._id}`).set(auth(token)).send({ workouts: [] });
      expect(res.status).toBe(400);
    });
    it("rejects an update with non-array workouts (400)", async () => {
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "Old", workouts: [] });
      const res = await request(app).put(`/api/splits/${created.body._id}`).set(auth(token)).send({ name: "X", workouts: "nope" });
      expect(res.status).toBe(400);
    });
  });

    describe("DELETE /api/splits/:id", () => {
    it("deletes a split", async () => {
      const created = await request(app).post("/api/splits").set(auth(token)).send({ name: "Temp", workouts: [] });
      expect((await request(app).delete(`/api/splits/${created.body._id}`).set(auth(token))).status).toBe(200);
      const after = await request(app).get(`/api/splits/${created.body._id}`).set(auth(token));
      expect(after.status).toBe(404);
    });
    it("returns 404 when deleting a non-existent split", async () => {        // NEW
      const res = await request(app).delete("/api/splits/64b8f0000000000000000000").set(auth(token));
      expect(res.status).toBe(404);
    });
  });
});