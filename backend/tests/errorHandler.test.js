const errorHandler = require("../middleware/errorHandler");

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("errorHandler", () => {
  it("maps CastError to 400", () => {
    const res = mockRes();
    errorHandler({ name: "CastError" }, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it("maps ValidationError to 400", () => {
    const res = mockRes();
    errorHandler({ name: "ValidationError", message: "bad" }, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it("falls back to 500 for unknown errors", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = mockRes();
    errorHandler({ name: "Error", message: "boom" }, {}, res, () => {});
    expect(res.status).toHaveBeenCalledWith(500);
    spy.mockRestore();
  });
});