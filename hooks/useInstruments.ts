import { create } from "zustand";

/** A single data point from any instrument source */
export type DataPoint = {
  value: number | string | { latitude: number; longitude: number } | null;
  timestamp: number; // Unix ms
  source: string; // e.g. "signalk.raspberrypi", "nmea.tcp.192.168.1.1:10110"
  meta?: {
    sentence?: string; // NMEA sentence type, e.g. "DBT"
    pgn?: number; // NMEA 2000 PGN
    talker?: string; // NMEA talker ID, e.g. "SD"
  };
};

interface State {
  /** Flat map of Signal K-compatible paths to their current values */
  data: Record<string, DataPoint>;
}

export const useInstruments = create<State>()(() => ({
  data: {},
}));

/** Update a single instrument path */
export function updatePath(path: string, dataPoint: DataPoint) {
  useInstruments.setState((s) => ({
    data: { ...s.data, [path]: dataPoint },
  }));
}

/** Batch update multiple instrument paths */
export function updatePaths(updates: Record<string, DataPoint>) {
  useInstruments.setState((s) => ({
    data: { ...s.data, ...updates },
  }));
}

/** Check if a data point is stale (older than maxAgeMs) */
export function isStale(path: string, maxAgeMs: number): boolean {
  const point = useInstruments.getState().data[path];
  if (!point) return true;
  return Date.now() - point.timestamp > maxAgeMs;
}

/** Clear all instrument data */
export function clearInstruments() {
  useInstruments.setState({ data: {} });
}
