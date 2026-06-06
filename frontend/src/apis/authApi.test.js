import { registerUser, loginUser, getCurrentUser } from "./authApi";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (message) => ({ ok: false, json: async () => ({ message }) });

describe("authApi", () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => jest.resetAllMocks());

  it("registerUser POSTs credentials and returns the token payload", async () => {
    global.fetch.mockResolvedValue(ok({ token: "t", user: { email: "a@b.com" } }));
    const data = await registerUser({ name: "A", email: "a@b.com", password: "password123" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data.token).toBe("t");
  });

  it("loginUser POSTs to /auth/login", async () => {
    global.fetch.mockResolvedValue(ok({ token: "t" }));
    const data = await loginUser({ email: "a@b.com", password: "password123" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ method: "POST" })
    );
    expect(data.token).toBe("t");
  });

  it("getCurrentUser sends the bearer token", async () => {
    global.fetch.mockResolvedValue(ok({ user: { email: "a@b.com" } }));
    const data = await getCurrentUser("abc");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer abc" }) })
    );
    expect(data.user.email).toBe("a@b.com");
  });

  it("throws the server message on failure", async () => {
    global.fetch.mockResolvedValue(fail("Invalid email or password"));
    await expect(loginUser({ email: "x", password: "y" })).rejects.toThrow("Invalid email or password");
  });
      it.each([
    ["registerUser", () => registerUser({ name: "a", email: "a@b.com", password: "x" })],
    ["getCurrentUser", () => getCurrentUser("tok")],
  ])("%s throws on a non-ok response", async (_n, call) => {
    global.fetch.mockResolvedValue(fail("boom"));
    await expect(call()).rejects.toThrow("boom");
  });
});