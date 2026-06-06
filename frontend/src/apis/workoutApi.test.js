import { fetchWorkouts, createWorkout, fetchWorkoutById, updateWorkout, deleteWorkout } from "./workoutApi";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (message) => ({ ok: false, json: async () => ({ message }) });

describe("workoutApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem("fitforgeToken", "test-token");
  });
  afterEach(() => { jest.resetAllMocks(); localStorage.clear(); });

  it("fetchWorkouts returns data with the auth header", async () => {
    global.fetch.mockResolvedValue(ok([{ _id: "1", name: "Push" }]));
    const data = await fetchWorkouts();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-token" }) })
    );
    expect(data).toHaveLength(1);
  });

  it("createWorkout POSTs the body", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "2", name: "New" }));
    const res = await createWorkout({ name: "New", exercises: [1] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts"),
      expect.objectContaining({ method: "POST" })
    );
    expect(res.name).toBe("New");
  });

  it("fetchWorkoutById requests the id", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "9" }));
    const res = await fetchWorkoutById("9");
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/workouts/9"), expect.any(Object));
    expect(res._id).toBe("9");
  });

  it("updateWorkout PUTs to the id", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "9", name: "Upd" }));
    const res = await updateWorkout("9", { name: "Upd", exercises: [1] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts/9"),
      expect.objectContaining({ method: "PUT" })
    );
    expect(res.name).toBe("Upd");
  });

  it("deleteWorkout DELETEs the id", async () => {
    global.fetch.mockResolvedValue(ok({ message: "deleted" }));
    const res = await deleteWorkout("9");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workouts/9"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(res.message).toBe("deleted");
  });

  it("throws on a non-ok response", async () => {
    global.fetch.mockResolvedValue(fail("Failed to fetch workouts"));
    await expect(fetchWorkouts()).rejects.toThrow("Failed to fetch workouts");
  });
      it.each([
    ["createWorkout", () => createWorkout({ name: "x", exercises: [1] })],
    ["fetchWorkoutById", () => fetchWorkoutById("1")],
    ["updateWorkout", () => updateWorkout("1", { name: "x", exercises: [1] })],
    ["deleteWorkout", () => deleteWorkout("1")],
  ])("%s throws on a non-ok response", async (_n, call) => {
    global.fetch.mockResolvedValue(fail("boom"));
    await expect(call()).rejects.toThrow("boom");
  });
});