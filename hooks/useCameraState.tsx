import type { LngLat, LngLatBounds, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OrientationMode = "north" | "course";

interface State {
  followUserLocation: boolean
  zoom?: number
  center?: LngLat
  bounds?: LngLatBounds
  orientationMode: OrientationMode
  bearing: number
}

interface Actions {
  setFollowUserLocation: (follow: boolean) => void
  zoomIn(): void
  zoomOut(): void
  cycleTrackingMode(): void
  set(newState: Partial<State>): void
  didChange(payload: ViewStateChangeEvent): void
}

export const useCameraState = create<State & Actions>()(
  persist(
    (set) => ({
      center: undefined,
      bounds: undefined,
      zoom: undefined,
      followUserLocation: true,
      orientationMode: "north",
      bearing: 0,
      setFollowUserLocation: (follow: boolean) => {
        set(() => follow
          ? { followUserLocation: true }
          : { followUserLocation: false, orientationMode: "north" as OrientationMode, bearing: 0 }
        )
      },
      zoomIn() {
        set((state) => ({ zoom: (state.zoom ?? 0) + 1 }))
      },
      zoomOut() {
        set((state) => ({ zoom: (state.zoom ?? 0) - 1 }))
      },
      cycleTrackingMode() {
        set((state) => {
          if (!state.followUserLocation) {
            return { followUserLocation: true };
          }
          if (state.orientationMode === "north") {
            return { orientationMode: "course" as OrientationMode };
          }
          return { orientationMode: "north" as OrientationMode, bearing: 0 };
        })
      },
      didChange(e: ViewStateChangeEvent) {
        if (e.userInteraction) {
          set({
            zoom: e.zoom,
            center: e.center,
            bounds: e.bounds,
            bearing: e.bearing,
          });
        } else {
          set({ bearing: e.bearing, bounds: e.bounds });
        }
      },
      set(newState: Partial<State>) {
        set((state) => ({ ...state, ...newState }))
      }
    }),
    {
      name: "camera",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
