import RouteEditor from "@/components/features/RouteEditor";
import { fitBounds } from "@/components/map/NavigationCamera";
import SheetView from "@/components/ui/SheetView";
import { useActiveRoute, useRoute } from "@/hooks/useRoutes";
import type { LngLatBounds } from "@maplibre/maplibre-react-native";
import { useLocalSearchParams } from "expo-router";
import { getBounds } from "geolib";
import { useEffect, useRef } from "react";

/**
 * Unified view + edit screen for an existing route. Loads the route into
 * the active store on mount via `useRoute(id)`. The body is rendered by
 * `<RouteEditor>`, which is shared with `/route/new`.
 */
export default function RouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = Number(id);

  useRoute(routeId);
  useFitRouteOnLoad();

  return (
    <SheetView id="route" style={{ flex: 1 }} headerDetent additionalDetents={[0.5, 1]}>
      <RouteEditor />
    </SheetView>
  );
}

/**
 * Fit the camera to the route bounds once when the route first loads.
 * Uses an imperative Zustand subscription to avoid adding reactive
 * re-renders to the component tree.
 */
function useFitRouteOnLoad() {
  const hasFitted = useRef(false);

  useEffect(() => {
    function tryFit(points: { latitude: number; longitude: number }[]) {
      if (hasFitted.current || points.length < 2) return;
      hasFitted.current = true;

      const { minLng, minLat, maxLng, maxLat } = getBounds(points);
      const routeBounds: LngLatBounds = [minLng, minLat, maxLng, maxLat];
      fitBounds(routeBounds, {
        padding: { top: 60, right: 16, bottom: 300, left: 16 },
        duration: 300,
      });
    }

    // Check current state immediately
    const state = useActiveRoute.getState();
    tryFit(state?.points ?? []);

    // If not yet fitted, subscribe and wait for the route to load
    if (!hasFitted.current) {
      const unsub = useActiveRoute.subscribe((s) => {
        tryFit(s?.points ?? []);
        if (hasFitted.current) unsub();
      });
      return unsub;
    }
  }, []);
}
