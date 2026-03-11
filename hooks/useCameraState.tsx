import type { LngLat, ViewStateChangeEvent } from '@maplibre/maplibre-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface State {
  followUserLocation: boolean
  zoom?: number
  center?: LngLat
}

interface Actions {
  setFollowUserLocation: (follow: boolean) => void
  zoomIn(): void
  zoomOut(): void
  set(newState: Partial<State>): void
  didChange(payload: ViewStateChangeEvent): void
}

export const useCameraState = create<State & Actions>()(
  persist(
    (set) => ({
      center: undefined,
      zoom: undefined,
      followUserLocation: true,
      setFollowUserLocation: (follow: boolean) => {
        set(() => ({ followUserLocation: follow }))
      },
      zoomIn() {
        set((state) => ({ zoom: (state.zoom ?? 0) + 1 }))
      },
      zoomOut() {
        set((state) => ({ zoom: (state.zoom ?? 0) - 1 }))
      },
      didChange(e: ViewStateChangeEvent) {
        if (e.userInteraction) {
          set({
            zoom: e.zoom,
            center: e.center,
          });
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
