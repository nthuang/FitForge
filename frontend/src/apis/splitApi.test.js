import { createSplit, fetchSplits, fetchSplitById, updateSplit, deleteSplit } from "./splitApi";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (message) => ({ ok: false, json: async () => ({ message }) });

describe("splitApi", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem("fitforgeToken", "test-token");
  });
  afterEach(() => { jest.resetAllMocks(); localStorage.clear(); });

  it("fetchSplits returns data and sends the auth header", async () => {
    global.fetch.mockResolvedValue(ok([{ _id: "1", name: "PPL" }]));
    const data = await fetchSplits();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/splits"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-token" }) })
    );
    expect(data).toEqual([{ _id: "1", name: "PPL" }]);
  });

  it("createSplit POSTs the body", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "2", name: "New" }));
    const res = await createSplit({ name: "New", workouts: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/splits"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "New", workouts: [] }) })
    );
    expect(res.name).toBe("New");
  });

  it("fetchSplitById requests the id", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "9", name: "X" }));
    const res = await fetchSplitById("9");
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/splits/9"), expect.any(Object));
    expect(res._id).toBe("9");
  });

  it("updateSplit PUTs to the id", async () => {
    global.fetch.mockResolvedValue(ok({ _id: "9", name: "Upd" }));
    const res = await updateSplit("9", { name: "Upd", workouts: [] });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/splits/9"),
      expect.objectContaining({ method: "PUT" })
    );
    expect(res.name).toBe("Upd");
  });

  it("deleteSplit DELETEs the id", async () => {
    global.fetch.mockResolvedValue(ok({ message: "deleted" }));
    const res = await deleteSplit("9");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/splits/9"),
      expect.objectContaining({ method: "DELETE" })
    );
    expect(res.message).toBe("deleted");
  });

  it("throws the server message on a non-ok response", async () => {
    global.fetch.mockResolvedValue(fail("Failed to fetch splits"));
    await expect(fetchSplits()).rejects.toThrow("Failed to fetch splits");
  });


  it.each([
    ["createSplit", () => createSplit({ name: "x", workouts: [] })],
    ["fetchSplitById", () => fetchSplitById("1")],
    ["updateSplit", () => updateSplit("1", { name: "x", workouts: [] })],
    ["deleteSplit", () => deleteSplit("1")],
  ])("%s throws on a non-ok response", async (_n, call) => {
    global.fetch.mockResolvedValue(fail("boom"));
    await expect(call()).rejects.toThrow("boom");
  });
});