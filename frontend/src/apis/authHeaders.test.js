import { getAuthHeaders } from "./authHeaders";

describe("getAuthHeaders", () => {
  afterEach(() => localStorage.clear());

  it("returns an Authorization header when a token exists", () => {
    localStorage.setItem("fitforgeToken", "abc123");
    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer abc123" });
  });

  it("returns an empty object when there is no token", () => {
    localStorage.removeItem("fitforgeToken");
    expect(getAuthHeaders()).toEqual({});
  });
});