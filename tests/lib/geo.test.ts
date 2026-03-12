import { distanceMeters, headingDelta } from "@/lib/geo";

describe("distanceMeters", () => {
  it("returns 0 for the same point", () => {
    expect(distanceMeters(47.6, -122.3, 47.6, -122.3)).toBe(0);
  });

  it("computes known distance (Seattle to Portland ~233km)", () => {
    const d = distanceMeters(47.6062, -122.3321, 45.5152, -122.6784);
    expect(d).toBeGreaterThan(232_000);
    expect(d).toBeLessThan(235_000);
  });

  it("computes short distance accurately", () => {
    // ~111m per degree of latitude at equator
    const d = distanceMeters(0, 0, 0.001, 0);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });
});

describe("headingDelta", () => {
  it("returns 0 for equal headings", () => {
    expect(headingDelta(90, 90)).toBe(0);
  });

  it("handles simple difference", () => {
    expect(headingDelta(10, 20)).toBe(10);
  });

  it("wraps around 360", () => {
    expect(headingDelta(350, 10)).toBe(20);
  });

  it("returns max 180", () => {
    expect(headingDelta(0, 180)).toBe(180);
  });
});
