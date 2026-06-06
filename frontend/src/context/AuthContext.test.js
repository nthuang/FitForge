import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const Consumer = () => {
  const { isAuthenticated, user } = useAuth();
  return <div>{isAuthenticated ? `Hi ${user.name}` : "Logged out"}</div>;
};

describe("AuthContext", () => {
  beforeEach(() => localStorage.clear());

  it("starts logged out when there is no token", () => {
    render(<AuthProvider><Consumer /></AuthProvider>);
    expect(screen.getByText("Logged out")).toBeInTheDocument();
  });

  it("throws if useAuth is used outside an AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/useAuth must be used within an AuthProvider/);
    spy.mockRestore();
  });
});