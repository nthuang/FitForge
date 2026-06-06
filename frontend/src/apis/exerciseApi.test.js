import axios from "axios";
import { fetchExercises, triggerExerciseFetch } from "./exerciseApi";

jest.mock("axios");

describe("exerciseApi", () => {
  afterEach(() => jest.resetAllMocks());

  it("fetchExercises GETs /exercises with search + pagination params", async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, name: "Bench" }] });
    const data = await fetchExercises("bench", 1, 24);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/exercises"),
      expect.objectContaining({ params: { search: "bench", page: 1, limit: 24 } })
    );
    expect(data).toEqual([{ id: 1, name: "Bench" }]);
  });

  it("triggerExerciseFetch GETs /exercises/fetch", async () => {
    axios.get.mockResolvedValue({ data: { message: "ok" } });
    const data = await triggerExerciseFetch();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("/exercises/fetch"));
    expect(data.message).toBe("ok");
  });
  
    it("fetchExercises uses default params when called with none", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await fetchExercises();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/exercises"),
      expect.objectContaining({ params: { search: "", page: 1, limit: 1500 } })
    );
  });
});