import { setFollowUserLocation } from "@/hooks/useCameraState";
import { useCameraView } from "@/hooks/useCameraView";
import { useRouteNavigation } from "@/hooks/useRouteNavigation";
import { useSelection } from "@/hooks/useSelection";
import { useSheetStore } from "@/hooks/useSheetPosition";
import useTheme from "@/hooks/useTheme";
import { getRoutePoints, type RoutePoint } from "@/lib/database";
import type { LngLatBounds } from "@maplibre/maplibre-react-native";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { getBounds } from "geolib";
import { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Coord = [longitude: number, latitude: number];

export default function RouteOverlay() {
  const selection = useSelection();
  const selectedId = selection?.type === "route" ? Number(selection.id) : null;
  const activeRouteId = useRouteNavigation((s) => s.activeRouteId);

  // Show the selected route, or the actively navigating route
  const displayId = selectedId ?? activeRouteId;

  return displayId ? <RouteDisplay routeId={displayId} isNavigation={displayId === activeRouteId} /> : null;
}

function RouteDisplay({ routeId, isNavigation }: { routeId: number; isNavigation: boolean }) {
  const theme = useTheme();
  const activePointIndex = useRouteNavigation((s) => s.activePointIndex);
  const sheetHeight = useSheetStore((s) => {
    const entry = s.sheets["feature"] ?? s.sheets["route-navigate"];
    return entry?.height ?? 0;
  });
  const cameraRef = useCameraView((s) => s.cameraRef);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getRoutePoints(routeId).then(setPoints);
  }, [routeId]);

  const coords: Coord[] = useMemo(
    () => points.map((p) => [p.longitude, p.latitude]),
    [points],
  );

  // Fit camera to route bounds (only for selected, not navigation)
  useEffect(() => {
    if (isNavigation || coords.length < 2) return;
    const { minLng, minLat, maxLng, maxLat } = getBounds(coords);
    const routeBounds: LngLatBounds = [minLng, minLat, maxLng, maxLat];
    setFollowUserLocation(false);
    cameraRef?.current?.fitBounds(routeBounds, {
      padding: { top: insets.top + 16, right: 16, bottom: 16 + sheetHeight, left: 16 },
      duration: 300,
    });
  }, [coords, sheetHeight, cameraRef, insets, isNavigation]);

  // Route line data — during navigation, split into completed/active/remaining segments
  const { completedLineData, activeLineData, remainingLineData, fullLineData } = useMemo(() => {
    if (coords.length < 2) return { completedLineData: null, activeLineData: null, remainingLineData: null, fullLineData: null };

    if (!isNavigation) {
      return {
        completedLineData: null,
        activeLineData: null,
        remainingLineData: null,
        fullLineData: JSON.stringify({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: coords },
        }),
      };
    }

    const completed = activePointIndex > 0
      ? coords.slice(0, activePointIndex + 1)
      : null;
    const active = activePointIndex > 0
      ? [coords[activePointIndex - 1], coords[activePointIndex]]
      : coords.length > 0 ? [coords[0]] : null;
    const remaining = coords.slice(activePointIndex);

    return {
      completedLineData: completed && completed.length >= 2
        ? JSON.stringify({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: completed } })
        : null,
      activeLineData: active && active.length >= 2
        ? JSON.stringify({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: active } })
        : null,
      remainingLineData: remaining.length >= 2
        ? JSON.stringify({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: remaining } })
        : null,
      fullLineData: null,
    };
  }, [coords, isNavigation, activePointIndex]);

  const pointData = useMemo(() => {
    if (coords.length === 0) return null;
    return JSON.stringify({
      type: "FeatureCollection",
      features: points.map((p, i) => ({
        type: "Feature",
        properties: {
          index: i + 1,
          name: p.name || `${i + 1}`,
          isActive: isNavigation && i === activePointIndex,
          isCompleted: isNavigation && i < activePointIndex,
        },
        geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
      })),
    });
  }, [points, coords, isNavigation, activePointIndex]);

  return (
    <>
      {/* Full route line (non-navigation) */}
      {fullLineData && (
        <GeoJSONSource id="route-line" data={fullLineData}>
          <Layer
            id="route-line-halo"
            type="line"
            paint={{ "line-width": 7, "line-opacity": 0.5, "line-color": theme.background }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
          <Layer
            id="route-line-dash"
            type="line"
            paint={{ "line-width": 3, "line-opacity": 1, "line-color": theme.primary, "line-dasharray": [2, 2] }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </GeoJSONSource>
      )}

      {/* Completed legs (dimmed) */}
      {completedLineData && (
        <GeoJSONSource id="route-completed" data={completedLineData}>
          <Layer
            id="route-completed-line"
            type="line"
            paint={{ "line-width": 3, "line-opacity": 0.3, "line-color": theme.primary }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </GeoJSONSource>
      )}

      {/* Active leg (solid, bright) */}
      {activeLineData && (
        <GeoJSONSource id="route-active" data={activeLineData}>
          <Layer
            id="route-active-halo"
            type="line"
            paint={{ "line-width": 7, "line-opacity": 0.5, "line-color": theme.background }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
          <Layer
            id="route-active-line"
            type="line"
            paint={{ "line-width": 4, "line-opacity": 1, "line-color": theme.primary }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </GeoJSONSource>
      )}

      {/* Remaining legs (dashed) */}
      {remainingLineData && (
        <GeoJSONSource id="route-remaining" data={remainingLineData}>
          <Layer
            id="route-remaining-line"
            type="line"
            paint={{ "line-width": 3, "line-opacity": 0.7, "line-color": theme.primary, "line-dasharray": [2, 2] }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </GeoJSONSource>
      )}

      {/* Waypoint circles */}
      {pointData && (
        <GeoJSONSource id="route-points" data={pointData}>
          <Layer
            id="route-point-circle"
            type="circle"
            paint={{
              "circle-radius": ["case", ["get", "isActive"], 14, 12],
              "circle-color": [
                "case",
                ["get", "isCompleted"], theme.textTertiary,
                theme.primary,
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": theme.background,
            }}
          />
          <Layer
            id="route-point-label"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={{ "text-color": "#ffffff" }}
          />
        </GeoJSONSource>
      )}
    </>
  );
}
