import AsyncStorage from "@react-native-async-storage/async-storage";
import type * as Location from "expo-location";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { startTrack, endTrack, deleteTrack } from "@/lib/database";
import {
  requestPermissions,
  startForegroundTracking,
  startBackgroundTracking,
  stopBackgroundTracking,
  addPointRecordedListener,
  resetLastPoint,
} from "@/lib/backgroundLocation";

// Minimum thresholds to keep a track
const MIN_TRACK_DURATION_MS = 60_000; // 1 minute
const MIN_TRACK_DISTANCE_M = 200; // 200 meters

type State = {
  isRecording: boolean;
  activeTrackId: number | null;
  pointCount: number;
  distance: number;
  startedAt: string | null;
};

type Actions = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  resume: () => Promise<void>;
};

let fgSubscription: Location.LocationSubscription | null = null;
let removePointListener: (() => void) | null = null;

export const useTrackRecording = create<State & Actions>()(
  persist(
    (set, get) => ({
      isRecording: false,
      activeTrackId: null,
      pointCount: 0,
      distance: 0,
      startedAt: null,

      start: async () => {
        const granted = await requestPermissions();
        if (!granted) return;

        const trackId = await startTrack();
        resetLastPoint();

        set({
          isRecording: true,
          activeTrackId: trackId,
          pointCount: 0,
          distance: 0,
          startedAt: new Date().toISOString(),
        });

        removePointListener = addPointRecordedListener((_lat, _lon, segmentDistance) => {
          set((state) => ({
            pointCount: state.pointCount + 1,
            distance: state.distance + segmentDistance,
          }));
        });

        fgSubscription = await startForegroundTracking(trackId);
        await startBackgroundTracking(trackId);
      },

      resume: async () => {
        const { isRecording, activeTrackId } = get();
        if (!isRecording || !activeTrackId) return;

        removePointListener = addPointRecordedListener((_lat, _lon, segmentDistance) => {
          set((state) => ({
            pointCount: state.pointCount + 1,
            distance: state.distance + segmentDistance,
          }));
        });

        fgSubscription = await startForegroundTracking(activeTrackId);
      },

      stop: async () => {
        const { activeTrackId, distance, startedAt } = get();

        if (fgSubscription) {
          fgSubscription.remove();
          fgSubscription = null;
        }
        await stopBackgroundTracking();
        removePointListener?.();
        removePointListener = null;
        resetLastPoint();

        if (activeTrackId) {
          const elapsed = startedAt
            ? Date.now() - new Date(startedAt).getTime()
            : 0;

          if (elapsed < MIN_TRACK_DURATION_MS || distance < MIN_TRACK_DISTANCE_M) {
            await deleteTrack(activeTrackId);
          } else {
            await endTrack(activeTrackId, distance);
          }
        }

        set({
          isRecording: false,
          activeTrackId: null,
          pointCount: 0,
          distance: 0,
          startedAt: null,
        });
      },
    }),
    {
      name: "track-recording",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.isRecording) {
          state.resume();
        }
      },
    },
  ),
);
