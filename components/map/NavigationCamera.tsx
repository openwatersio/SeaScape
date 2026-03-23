import { saveViewport, useCameraPosition } from "@/hooks/useCameraPosition";
import { setFollowUserLocation, useCameraState } from "@/hooks/useCameraState";
import { onRegionDidChange, onRegionIsChanging, useCameraView } from "@/hooks/useCameraView";
import { useNavigation } from "@/hooks/useNavigation";
import type { CameraRef, LngLatBounds, ViewStateChangeEvent } from "@maplibre/maplibre-react-native";
import { Camera } from "@maplibre/maplibre-react-native";
import type { ComponentProps } from "react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { NativeSyntheticEvent } from "react-native";

/** Module-scoped camera ref accessible by exported imperative functions */
let _cameraRef: React.RefObject<CameraRef | null> = { current: null };

type NavigationCameraProps = Omit<
  ComponentProps<typeof Camera>,
  "trackUserLocation" | "onTrackUserLocationChange" | "center" | "bearing"
>;

/**
 * Drop-in replacement for MapLibre's Camera that follows the unified
 * navigation position via reactive props. The native Camera component
 * handles animation lifecycle internally, smoothly redirecting in-flight
 * animations when the target changes.
 */
export const NavigationCamera = forwardRef<CameraRef, NavigationCameraProps>(
  function NavigationCamera(props, ref) {
    const cameraRef = useRef<CameraRef>(null);
    const { followUserLocation, trackingMode } = useCameraState();
    const { longitude, latitude, course } = useNavigation();

    useImperativeHandle(ref, () => cameraRef.current!, []);

    useEffect(() => {
      _cameraRef = cameraRef;
    }, []);

    // Compute reactive camera props based on follow state
    const followProps = followUserLocation && longitude !== null && latitude !== null
      ? {
        center: [longitude, latitude] as [number, number],
        bearing: trackingMode === "course" && course !== null
          ? (course * 180) / Math.PI
          : 0,
        duration: 1000,
        easing: "linear" as const,
      }
      : {};

    return (
      <Camera
        ref={cameraRef}
        initialViewState={{
          zoom: useCameraPosition.getState().zoom,
          center: useCameraPosition.getState().center,
        }}
        pitch={0}
        {...followProps}
        {...props}
      />
    );
  },
);

// --- Map event handlers ---

/** Handler for Map's onRegionIsChanging event */
export function handleRegionIsChanging(e: NativeSyntheticEvent<ViewStateChangeEvent>) {
  const { bearing, userInteraction } = e.nativeEvent;
  onRegionIsChanging(bearing);
  if (userInteraction) setFollowUserLocation(false);
}

/** Handler for Map's onRegionDidChange event */
export function handleRegionDidChange(e: NativeSyntheticEvent<ViewStateChangeEvent>) {
  const { bearing, bounds, zoom, center, userInteraction } = e.nativeEvent;
  onRegionDidChange(bearing, bounds, zoom);
  saveViewport(center, zoom);
  if (userInteraction) setFollowUserLocation(false);
}

// --- Imperative camera actions ---

export function zoomIn() {
  const { zoom } = useCameraView.getState();
  _cameraRef.current?.zoomTo(zoom + 1, { duration: 300 });
}

export function zoomOut() {
  const { zoom } = useCameraView.getState();
  _cameraRef.current?.zoomTo(zoom - 1, { duration: 300 });
}

export function resetNorth() {
  _cameraRef.current?.setStop({ bearing: 0, duration: 300 });
}

export function fitBounds(
  bounds: LngLatBounds,
  options?: Parameters<CameraRef["fitBounds"]>[1],
) {
  setFollowUserLocation(false);
  _cameraRef.current?.fitBounds(bounds, options);
}

export function flyTo(
  options: Parameters<CameraRef["flyTo"]>[0],
) {
  setFollowUserLocation(false);
  _cameraRef.current?.flyTo(options);
}
