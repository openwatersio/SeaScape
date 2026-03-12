import { shouldRecordPoint } from "@/lib/geo";

const base = {
  latitude: 47.6062,
  longitude: -122.3321,
  heading: 180,
  timestamp: 1000000,
};

describe("shouldRecordPoint", () => {
  it("always records the first point", () => {
    expect(shouldRecordPoint(base, null)).toBe(true);
  });

  it("rejects points within MIN_INTERVAL (2s)", () => {
    const point = { ...base, timestamp: base.timestamp + 1000 };
    expect(shouldRecordPoint(point, base)).toBe(false);
  });

  it("records after MAX_INTERVAL (30s) even with no movement", () => {
    const point = { ...base, timestamp: base.timestamp + 30_000 };
    expect(shouldRecordPoint(point, base)).toBe(true);
  });

  it("records when distance exceeds 10m", () => {
    const point = {
      ...base,
      // ~15m north
      latitude: base.latitude + 0.000135,
      timestamp: base.timestamp + 3000,
    };
    expect(shouldRecordPoint(point, base)).toBe(true);
  });

  it("rejects when distance is under 10m and no heading change", () => {
    const point = {
      ...base,
      // ~5m north
      latitude: base.latitude + 0.000045,
      timestamp: base.timestamp + 3000,
    };
    expect(shouldRecordPoint(point, base)).toBe(false);
  });

  it("records when heading changes by 5+ degrees", () => {
    const point = {
      ...base,
      heading: 186,
      timestamp: base.timestamp + 3000,
    };
    expect(shouldRecordPoint(point, base)).toBe(true);
  });

  it("rejects small heading changes under 5 degrees", () => {
    const point = {
      ...base,
      heading: 183,
      timestamp: base.timestamp + 3000,
    };
    expect(shouldRecordPoint(point, base)).toBe(false);
  });

  it("handles null headings gracefully", () => {
    const last = { ...base, heading: null };
    const point = {
      ...base,
      heading: null,
      timestamp: base.timestamp + 3000,
    };
    // No distance, no heading — should not record
    expect(shouldRecordPoint(point, last)).toBe(false);
  });
});
