import { calculateCPA, formatBearing, headingDelta } from "@/lib/geo";

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

describe("calculateCPA", () => {
  const DEG = Math.PI / 180;

  it("returns null when both vessels are stationary", () => {
    expect(calculateCPA(
      { latitude: 47.6, longitude: -122.3, sog: 0, cog: 0 },
      { latitude: 47.61, longitude: -122.3, sog: 0, cog: 0 },
    )).toBeNull();
  });

  it("returns null when CPA is in the past (vessels diverging)", () => {
    const result = calculateCPA(
      { latitude: 47.6, longitude: -122.3, sog: 5, cog: 0 },
      { latitude: 47.65, longitude: -122.3, sog: 10, cog: 0 },
    );
    expect(result).toBeNull();
  });

  it("calculates CPA for head-on vessels", () => {
    const result = calculateCPA(
      { latitude: 47.0, longitude: -122.0, sog: 5, cog: 0 },
      { latitude: 47.1, longitude: -122.0, sog: 5, cog: 180 * DEG },
    );
    expect(result).not.toBeNull();
    expect(result!.distance).toBeLessThan(100);
    expect(result!.time).toBeGreaterThan(0);
  });

  it("calculates CPA for crossing vessels", () => {
    const result = calculateCPA(
      { latitude: 47.0, longitude: -122.0, sog: 5, cog: 0 },
      { latitude: 47.05, longitude: -121.95, sog: 5, cog: 270 * DEG },
    );
    expect(result).not.toBeNull();
    expect(result!.distance).toBeGreaterThan(0);
    expect(result!.time).toBeGreaterThan(0);
  });

  it("calculates reasonable TCPA for known scenario", () => {
    // Two vessels ~5.5km apart, closing at ~10 m/s combined
    const result = calculateCPA(
      { latitude: 47.0, longitude: -122.0, sog: 5, cog: 0 },
      { latitude: 47.05, longitude: -122.0, sog: 5, cog: 180 * DEG },
    );
    expect(result).not.toBeNull();
    expect(result!.time).toBeGreaterThan(400);
    expect(result!.time).toBeLessThan(700);
  });

  it("returns null for parallel vessels with same speed", () => {
    const result = calculateCPA(
      { latitude: 47.0, longitude: -122.0, sog: 5, cog: 0 },
      { latitude: 47.0, longitude: -121.99, sog: 5, cog: 0 },
    );
    expect(result).toBeNull();
  });

  it("handles one stationary vessel", () => {
    const result = calculateCPA(
      { latitude: 47.0, longitude: -122.0, sog: 5, cog: 0 },
      { latitude: 47.05, longitude: -122.001, sog: 0, cog: 0 },
    );
    expect(result).not.toBeNull();
    expect(result!.time).toBeGreaterThan(0);
    expect(result!.distance).toBeLessThan(200);
  });
});

describe("formatBearing", () => {
  it("pads single-digit bearings", () => {
    expect(formatBearing(5)).toBe("005°T");
  });

  it("pads two-digit bearings", () => {
    expect(formatBearing(45)).toBe("045°T");
  });

  it("formats three-digit bearings", () => {
    expect(formatBearing(270)).toBe("270°T");
  });

  it("rounds decimal values", () => {
    expect(formatBearing(44.7)).toBe("045°T");
  });

  it("normalizes 360 to 000", () => {
    expect(formatBearing(360)).toBe("000°T");
  });
});
