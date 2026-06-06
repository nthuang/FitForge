import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SplitLibrary from "./SplitLibrary";
import { fetchSplits } from "../../apis/splitApi";

jest.mock("../../apis/splitApi");

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("SplitLibrary", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders splits returned by the API", async () => {
    fetchSplits.mockResolvedValue([
      { _id: "1", name: "Push Pull Legs", workouts: [{ _id: "w1", name: "Push" }] },
    ]);
    renderWithRouter(<SplitLibrary />);
    expect(await screen.findByText("Push Pull Legs")).toBeInTheDocument();
    expect(screen.getByText("Push")).toBeInTheDocument();
  });

  it("shows 'No splits found' when there are none", async () => {
    fetchSplits.mockResolvedValue([]);
    renderWithRouter(<SplitLibrary />);
    expect(await screen.findByText(/no splits found/i)).toBeInTheDocument();
  });

  it("shows an error message if fetching fails", async () => {
    fetchSplits.mockRejectedValue(new Error("Network down"));
    renderWithRouter(<SplitLibrary />);
    expect(await screen.findByText(/network down/i)).toBeInTheDocument();
  });
});