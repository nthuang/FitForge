import { render, screen, within } from "@testing-library/react";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

test("shows login and register links in the nav when logged out", () => {
  // App's <Router> uses basename="/FitForge", so the test URL must start with it
  // or react-router refuses to render anything.
  window.history.pushState({}, "", "/FitForge");

  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const nav = screen.getByRole("navigation"); // the <nav> element
  expect(within(nav).getByText(/login/i)).toBeInTheDocument();
  expect(within(nav).getByText(/register/i)).toBeInTheDocument();
});