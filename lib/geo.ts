import { getDistance } from "geolib";

/** Distance between two points in meters (Haversine) */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 },
    0.01, // 1cm accuracy
  );
}

/** Absolute angular difference in degrees (0–180) */
export function headingDelta(h1: number, h2: number): number {
  const d = Math.abs(h1 - h2) % 360;
  return d > 180 ? 360 - d : d;
}

// Sampling thresholds for track recording
export const MIN_INTERVAL_MS = 2_000;
export const MAX_INTERVAL_MS = 30_000;
export const MIN_DISTANCE_M = 10;
export const MIN_HEADING_DELTA = 5;

/** Decide whether a new GPS fix should be recorded based on distance/heading/time thresholds. */
export function shouldRecordPoint(
  point: { latitude: number; longitude: number; heading: number | null; timestamp: number },
  last: { latitude: number; longitude: number; heading: number | null; timestamp: number } | null,
): boolean {
  if (!last) return true;

  const elapsed = point.timestamp - last.timestamp;

  if (elapsed < MIN_INTERVAL_MS) return false;
  if (elapsed >= MAX_INTERVAL_MS) return true;

  const dist = distanceMeters(
    last.latitude,
    last.longitude,
    point.latitude,
    point.longitude,
  );
  if (dist >= MIN_DISTANCE_M) return true;

  if (
    point.heading != null &&
    last.heading != null &&
    headingDelta(last.heading, point.heading) >= MIN_HEADING_DELTA
  ) {
    return true;
  }

  return false;
}
