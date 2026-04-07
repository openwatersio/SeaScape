import { useNavigation } from "@/hooks/useNavigation";
import useTheme from "@/hooks/useTheme";
import { projectPosition } from "@/lib/geo";
import type { LngLat } from "@maplibre/maplibre-react-native";
import { GeoJSONSource, Layer, LayerAnnotation } from "@maplibre/maplibre-react-native";
import { memo, useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

const PUCK_ID = "current-location";
const COG_PROJECTION_SECONDS = 5 * 60; // 5 minutes
const MIN_SOG_FOR_COG_LINE = 0.25; // m/s (~0.5 knots)
// Slightly longer than the GPS update interval (~1s) so animations overlap
// rather than completing and pausing before the next update
const ANIMATION_DURATION = 1500;
const EASING = Easing.linear;

/** Normalize an angle delta to [-180, 180] for shortest-path rotation */
function shortestRotation(from: number, to: number): number {
  const delta = ((to - from) % 360 + 540) % 360 - 180;
  return from + delta;
}

/**
 * Animated angle value that always rotates the shortest direction.
 * Returns the current interpolated value in degrees.
 */
function useAnimatedAngle(targetDeg: number | null): number {
  const animValue = useRef(new Animated.Value(targetDeg ?? 0)).current;
  const currentRef = useRef(targetDeg ?? 0);
  const [display, setDisplay] = useState(targetDeg ?? 0);

  useEffect(() => {
    if (targetDeg === null) return;
    const resolvedTarget = shortestRotation(currentRef.current, targetDeg);
    currentRef.current = resolvedTarget;
    Animated.timing(animValue, {
      toValue: resolvedTarget,
      duration: ANIMATION_DURATION,
      easing: EASING,
      useNativeDriver: false,
    }).start();
  }, [targetDeg, animValue]);

  useEffect(() => {
    const id = animValue.addListener(({ value }) => setDisplay(value));
    return () => animValue.removeListener(id);
  }, [animValue]);

  return display;
}

/**
 * Animated position that interpolates longitude/latitude smoothly.
 * Returns the current interpolated position.
 */
function useAnimatedPosition(
  longitude: number | null,
  latitude: number | null,
): { longitude: number; latitude: number } | null {
  const longitudeAnim = useRef(new Animated.Value(longitude ?? 0)).current;
  const latitudeAnim = useRef(new Animated.Value(latitude ?? 0)).current;
  const [display, setDisplay] = useState(
    longitude !== null && latitude !== null ? { longitude, latitude } : null,
  );

  useEffect(() => {
    if (longitude === null || latitude === null) return;
    Animated.parallel([
      Animated.timing(longitudeAnim, {
        toValue: longitude,
        duration: ANIMATION_DURATION,
        easing: EASING,
        useNativeDriver: false,
      }),
      Animated.timing(latitudeAnim, {
        toValue: latitude,
        duration: ANIMATION_DURATION,
        easing: EASING,
        useNativeDriver: false,
      }),
    ]).start();
  }, [longitude, latitude, longitudeAnim, latitudeAnim]);

  useEffect(() => {
    let currentLongitude = longitude ?? 0;
    let currentLatitude = latitude ?? 0;
    const longitudeId = longitudeAnim.addListener(({ value }) => {
      currentLongitude = value;
      setDisplay({ longitude: currentLongitude, latitude: currentLatitude });
    });
    const latitudeId = latitudeAnim.addListener(({ value }) => {
      currentLatitude = value;
      setDisplay({ longitude: currentLongitude, latitude: currentLatitude });
    });
    return () => {
      longitudeAnim.removeListener(longitudeId);
      latitudeAnim.removeListener(latitudeId);
    };
  }, [longitudeAnim, latitudeAnim, longitude, latitude]);

  return display;
}

export const NavigationPuck = memo(function NavigationPuck() {
  const latitude = useNavigation((s) => s.latitude);
  const longitude = useNavigation((s) => s.longitude);
  const heading = useNavigation((s) => s.heading);
  const course = useNavigation((s) => s.course);
  const speed = useNavigation((s) => s.speed);
  const theme = useTheme();

  // Smooth heading rotation for the arrow icon
  const displayHeading = useAnimatedAngle(heading);

  // Smooth course rotation for the COG line
  const courseDeg = course !== null ? (course * 180) / Math.PI : null;
  const displayCourseDeg = useAnimatedAngle(courseDeg);
  const displayCourseRad = (displayCourseDeg * Math.PI) / 180;

  // Smooth position for the COG line start point (tracks the puck's animated position)
  const animPos = useAnimatedPosition(longitude, latitude);

  if (latitude === null || longitude === null || !animPos) return null;

  const lngLat: LngLat = [longitude, latitude];
  const showCogLine = course !== null && (speed ?? 0) > MIN_SOG_FOR_COG_LINE;

  // COG line: projected segment (where vessel will be) + extended line (indefinite heading)
  const cogLineData: GeoJSON.FeatureCollection = (() => {
    if (!showCogLine || speed === null) {
      return { type: "FeatureCollection", features: [] };
    }
    const projectedDist = speed * COG_PROJECTION_SECONDS;
    const projectedEnd = projectPosition(animPos.latitude, animPos.longitude, displayCourseRad, projectedDist);
    const extendedEnd = projectPosition(animPos.latitude, animPos.longitude, displayCourseRad, 400 * 1852); // 400 nm
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { segment: "extended" },
          geometry: {
            type: "LineString",
            coordinates: [projectedEnd, extendedEnd],
          },
        },
        {
          type: "Feature",
          properties: { segment: "projected" },
          geometry: {
            type: "LineString",
            coordinates: [[animPos.longitude, animPos.latitude], projectedEnd],
          },
        },
      ],
    };
  })();

  return (
    <>
      {/* COG projection line */}
      <GeoJSONSource id="nav-puck-cog" data={cogLineData}>
        <Layer
          id="nav-puck-cog-line"
          type="line"
          paint={{
            "line-color": theme.userLocation,
            "line-width": 3,
            "line-opacity": ["match", ["get", "segment"], "projected", 0.75, "extended", 0.25, 0.5],
          }}
          layout={{
            "line-cap": "round",
          }}
        />
      </GeoJSONSource>
      {/* Puck arrow */}
      <LayerAnnotation
        id={PUCK_ID}
        lngLat={lngLat}
        animated
        animationDuration={ANIMATION_DURATION}
        animationEasingFunction={EASING}
      >
        <Layer
          type="symbol"
          id="nav-puck-arrow"
          layout={{
            "icon-image": "nav-puck",
            "icon-size": 0.5,
            "icon-rotate": displayHeading,
            "icon-rotation-alignment": "map",
            "icon-pitch-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          }}
          paint={{
            "icon-color": theme.userLocation,
            "icon-halo-color": theme.surface,
            "icon-halo-width": 1.5,
          }}
        />
      </LayerAnnotation>
    </>
  );
});
