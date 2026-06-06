import { generateWorkoutPlan, saveGeneratedPlan } from "./aiApi";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (message) => ({ ok: false, json: async () => ({ message }) });

describe("aiApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem("fitforgeToken", "test-token");
  });
  afterEach(() => { jest.resetAllMocks(); localStorage.clear(); });

  it("generateWorkoutPlan returns the plan (unwraps data.plan)", async () => {
    global.fetch.mockResolvedValue(ok({ plan: { programName: "P" } }));
    const plan = await generateWorkoutPlan();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/ai/generate-workout"),
      expect.objectContaining({ method: "POST" })
    );
    expect(plan.programName).toBe("P");
  });

  it("saveGeneratedPlan POSTs the plan wrapped in { plan }", async () => {
    global.fetch.mockResolvedValue(ok({ message: "saved" }));
    const res = await saveGeneratedPlan({ programName: "P", days: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/ai/save-generated-plan"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ plan: { programName: "P", days: [] } }) })
    );
    expect(res.message).toBe("saved");
  });

  it("throws the server message on failure", async () => {
    global.fetch.mockResolvedValue(fail("Failed to generate workout plan"));
    await expect(generateWorkoutPlan()).rejects.toThrow("Failed to generate workout plan");
  });
  it("saveGeneratedPlan throws on a non-ok response", async () => {
    global.fetch.mockResolvedValue(fail("Failed to save generated plan"));
    await expect(saveGeneratedPlan({ days: [] })).rejects.toThrow("Failed to save generated plan");
  });
});