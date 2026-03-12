import {
  startTrack,
  endTrack,
  insertTrackPoint,
  getTrack,
  getAllTracks,
  getTrackPoints,
  deleteTrack,
  renameTrack,
} from "@/lib/database";

// Mock expo-sqlite with an in-memory implementation
const rows: Record<string, any[]> = { tracks: [], track_points: [] };
let autoIncrement: Record<string, number> = { tracks: 0, track_points: 0 };
let userVersion = 0;

const mockDb = {
  execAsync: jest.fn(async (sql: string) => {
    // Handle PRAGMA user_version setting
    const versionMatch = sql.match(/PRAGMA user_version = (\d+)/);
    if (versionMatch) {
      userVersion = parseInt(versionMatch[1]);
    }
    // For CREATE TABLE, just succeed
  }),
  getFirstAsync: jest.fn(async (sql: string, ...args: any[]) => {
    if (sql.includes("PRAGMA user_version")) {
      return { user_version: userVersion };
    }
    if (sql.includes("FROM tracks WHERE id")) {
      const id = args[0];
      return rows.tracks.find((t) => t.id === id) ?? null;
    }
    return null;
  }),
  getAllAsync: jest.fn(async (sql: string, ...args: any[]) => {
    if (sql.includes("FROM tracks ORDER BY")) {
      return [...rows.tracks].reverse();
    }
    if (sql.includes("FROM track_points WHERE track_id")) {
      const trackId = args[0];
      return rows.track_points.filter((p) => p.track_id === trackId);
    }
    return [];
  }),
  runAsync: jest.fn(async (sql: string, ...args: any[]) => {
    if (sql.includes("INSERT INTO tracks")) {
      const id = ++autoIncrement.tracks;
      rows.tracks.push({
        id,
        name: null,
        started_at: args[0],
        ended_at: null,
        distance: 0,
        color: null,
      });
      return { lastInsertRowId: id };
    }
    if (sql.includes("INSERT INTO track_points")) {
      const id = ++autoIncrement.track_points;
      rows.track_points.push({
        id,
        track_id: args[0],
        latitude: args[1],
        longitude: args[2],
        speed: args[3],
        heading: args[4],
        accuracy: args[5],
        timestamp: args[6],
      });
      return { lastInsertRowId: id };
    }
    if (sql.includes("UPDATE tracks SET ended_at")) {
      const track = rows.tracks.find((t) => t.id === args[2]);
      if (track) {
        track.ended_at = args[0];
        track.distance = args[1];
      }
      return { changes: track ? 1 : 0 };
    }
    if (sql.includes("UPDATE tracks SET name")) {
      const track = rows.tracks.find((t) => t.id === args[1]);
      if (track) track.name = args[0];
      return { changes: track ? 1 : 0 };
    }
    if (sql.includes("DELETE FROM track_points WHERE track_id")) {
      rows.track_points = rows.track_points.filter(
        (p) => p.track_id !== args[0],
      );
      return { changes: 0 };
    }
    if (sql.includes("DELETE FROM tracks WHERE id")) {
      rows.tracks = rows.tracks.filter((t) => t.id !== args[0]);
      return { changes: 0 };
    }
    return { lastInsertRowId: 0, changes: 0 };
  }),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(async () => mockDb),
}));

beforeEach(() => {
  rows.tracks = [];
  rows.track_points = [];
  autoIncrement = { tracks: 0, track_points: 0 };
});

describe("database", () => {
  describe("tracks", () => {
    it("creates a track and returns its id", async () => {
      const id = await startTrack();
      expect(id).toBe(1);

      const track = await getTrack(id);
      expect(track).not.toBeNull();
      expect(track!.started_at).toBeTruthy();
      expect(track!.ended_at).toBeNull();
    });

    it("ends a track with distance", async () => {
      const id = await startTrack();
      await endTrack(id, 1234.5);

      const track = await getTrack(id);
      expect(track!.ended_at).toBeTruthy();
      expect(track!.distance).toBe(1234.5);
    });

    it("lists all tracks in reverse chronological order", async () => {
      const id1 = await startTrack();
      const id2 = await startTrack();

      const tracks = await getAllTracks();
      expect(tracks).toHaveLength(2);
      expect(tracks[0].id).toBe(id2);
      expect(tracks[1].id).toBe(id1);
    });

    it("renames a track", async () => {
      const id = await startTrack();
      await renameTrack(id, "Morning sail");

      const track = await getTrack(id);
      expect(track!.name).toBe("Morning sail");
    });

    it("deletes a track and its points", async () => {
      const id = await startTrack();
      await insertTrackPoint(id, {
        latitude: 47.6,
        longitude: -122.3,
        speed: 2.5,
        heading: 180,
        accuracy: 5,
        timestamp: new Date().toISOString(),
      });

      await deleteTrack(id);

      const track = await getTrack(id);
      expect(track).toBeNull();

      const points = await getTrackPoints(id);
      expect(points).toHaveLength(0);
    });
  });

  describe("track points", () => {
    it("inserts and retrieves points for a track", async () => {
      const trackId = await startTrack();

      await insertTrackPoint(trackId, {
        latitude: 47.6062,
        longitude: -122.3321,
        speed: 2.5,
        heading: 180,
        accuracy: 5,
        timestamp: "2025-01-01T00:00:00Z",
      });
      await insertTrackPoint(trackId, {
        latitude: 47.607,
        longitude: -122.333,
        speed: 3.0,
        heading: 185,
        accuracy: 4,
        timestamp: "2025-01-01T00:00:05Z",
      });

      const points = await getTrackPoints(trackId);
      expect(points).toHaveLength(2);
      expect(points[0].latitude).toBe(47.6062);
      expect(points[1].latitude).toBe(47.607);
    });

    it("handles null speed and heading", async () => {
      const trackId = await startTrack();

      await insertTrackPoint(trackId, {
        latitude: 47.6,
        longitude: -122.3,
        speed: null,
        heading: null,
        accuracy: null,
        timestamp: "2025-01-01T00:00:00Z",
      });

      const points = await getTrackPoints(trackId);
      expect(points[0].speed).toBeNull();
      expect(points[0].heading).toBeNull();
    });
  });
});
