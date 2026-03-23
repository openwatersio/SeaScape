import { resetNorth } from "@/components/map/NavigationCamera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface State {
  followUserLocation: boolean;
  trackingMode: undefined | "default" | "course";
}

export const useCameraState = create<State>()(
  persist(
    (): State => ({
      followUserLocation: true,
      trackingMode: "default",
    }),
    {
      name: "camera",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export function setFollowUserLocation(follow: boolean) {
  if (follow) {
    useCameraState.setState((state) => ({
      followUserLocation: true,
      trackingMode: state.trackingMode ?? "default",
    }));
  } else {
    useCameraState.setState({ followUserLocation: false, trackingMode: undefined });
  }
}

export function cycleTrackingMode() {
  useCameraState.setState((state) => {
    if (state.followUserLocation && state.trackingMode === "default") {
      return { trackingMode: "course" as const };
    }
    resetNorth();
    return { followUserLocation: true, trackingMode: "default" as const };
  });
}

