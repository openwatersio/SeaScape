import { type AISVessel, useAIS } from "@/hooks/useAIS";
import { useSelection } from "@/hooks/useSelection";
import { projectPosition } from "@/lib/geo";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import type { NativeSyntheticEvent } from "react-native";

type Position = { latitude: number; longitude: number };

type ShipTypeStyle = { color: string; icon: string };

const UNKNOWN_STYLE: ShipTypeStyle = { color: "#64748b", icon: "vessel-unknown" };  // slate-500

/** AIS ship type code → color and icon for map rendering */
function shipTypeStyle(code: number | undefined): ShipTypeStyle {
  if (code === undefined) return UNKNOWN_STYLE;
  if (code >= 80 && code <= 89) return { color: "#ef4444", icon: "vessel-tanker" };    // tanker = red-500
  if (code >= 70 && code <= 79) return { color: "#10b981", icon: "vessel-cargo" };     // cargo = emerald-500
  if (code >= 60 && code <= 69) return { color: "#6366f1", icon: "vessel-passenger" }; // passenger = indigo-500
  if (code === 52) return { color: "#8b5cf6", icon: "vessel-tug" };                    // tug = violet-500
  if (code >= 50 && code <= 59) return { color: "#06b6d4", icon: "vessel-default" };   // special = cyan-500
  if (code >= 40 && code <= 49) return { color: "#f59e0b", icon: "vessel-highspeed" }; // high speed = amber-500
  if (code === 37) return { color: "#d946ef", icon: "vessel-pleasure" };               // pleasure = fuchsia-500
  if (code === 36) return { color: "#0ea5e9", icon: "vessel-sailing" };                // sailing = sky-500
  if (code === 31 || code === 32) return { color: "#8b5cf6", icon: "vessel-tug" };     // towing = violet-500
  if (code === 30) return { color: "#f43f5e", icon: "vessel-fishing" };                // fishing = rose-500
  return UNKNOWN_STYLE;
}

function vesselPosition(vessel: AISVessel): Position | null {
  const pos = vessel.data["navigation.position"]?.value;
  if (pos && typeof pos === "object" && "latitude" in pos) {
    return pos as Position;
  }
  return null;
}

function vesselRotation(vessel: AISVessel): number {
  // Prefer heading, fall back to COG
  const heading = vessel.data["navigation.headingTrue"]?.value;
  if (typeof heading === "number") return (heading * 180) / Math.PI;
  const cog = vessel.data["navigation.courseOverGroundTrue"]?.value;
  if (typeof cog === "number") return (cog * 180) / Math.PI;
  return 0;
}

function vesselName(vessel: AISVessel): string {
  const name = vessel.data["name"]?.value;
  return typeof name === "string" ? name : vessel.mmsi;
}

function vesselSOG(vessel: AISVessel): number {
  const sog = vessel.data["navigation.speedOverGround"]?.value;
  return typeof sog === "number" ? sog * 1.9438 : 0; // m/s to knots
}

function vesselSOGmps(vessel: AISVessel): number {
  const sog = vessel.data["navigation.speedOverGround"]?.value;
  return typeof sog === "number" ? sog : 0;
}

function vesselCOGrad(vessel: AISVessel): number | null {
  const cog = vessel.data["navigation.courseOverGroundTrue"]?.value;
  return typeof cog === "number" ? cog : null;
}

const COG_PROJECTION_SECONDS = 15 * 60; // 15 minutes
const MIN_SOG_FOR_VECTOR = 0.25; // m/s (~0.5 knots) — skip stationary vessels


function vesselShipType(vessel: AISVessel): number | undefined {
  const t = vessel.data["design.aisShipType"]?.value;
  return typeof t === "number" ? t : undefined;
}


export default function AISLayer() {
  const vessels = useAIS((s) => s.vessels);

  const cogLines = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = Object.values(vessels)
      .map((vessel): GeoJSON.Feature | null => {
        const pos = vesselPosition(vessel);
        const cog = vesselCOGrad(vessel);
        const sog = vesselSOGmps(vessel);
        if (!pos || cog === null || sog < MIN_SOG_FOR_VECTOR) return null;
        const dist = sog * COG_PROJECTION_SECONDS;
        const end = projectPosition(pos.latitude, pos.longitude, cog, dist);
        return {
          type: "Feature",
          properties: {
            color: shipTypeStyle(vesselShipType(vessel)).color,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [pos.longitude, pos.latitude],
              end,
            ],
          },
        };
      })
      .filter((f): f is GeoJSON.Feature => f !== null);
    return { type: "FeatureCollection", features };
  }, [vessels]);

  const geojson = useMemo((): GeoJSON.FeatureCollection => {
    const features: GeoJSON.Feature[] = Object.values(vessels)
      .map((vessel): GeoJSON.Feature | null => {
        const pos = vesselPosition(vessel);
        if (!pos) return null;
        return {
          type: "Feature",
          properties: {
            mmsi: vessel.mmsi,
            name: vesselName(vessel),
            rotation: vesselRotation(vessel),
            sog: vesselSOG(vessel),
            icon: shipTypeStyle(vesselShipType(vessel)).icon,
            color: shipTypeStyle(vesselShipType(vessel)).color,
          },
          geometry: {
            type: "Point",
            coordinates: [pos.longitude, pos.latitude],
          },
        };
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    return {
      type: "FeatureCollection",
      features,
    };
  }, [vessels]);

  const selection = useSelection();

  const handlePress = useCallback((e: NativeSyntheticEvent<{ features: GeoJSON.Feature[] }>) => {
    const mmsi = e.nativeEvent.features?.[0]?.properties?.mmsi;
    if (mmsi) {
      e.stopPropagation();
      if (selection?.type === "vessel") {
        router.setParams({ mmsi });
      } else {
        router.navigate({ pathname: "/vessel/[mmsi]", params: { mmsi } });
      }
    }
  }, [selection]);

  const selectedMmsi = selection?.type === "vessel" ? selection.mmsi : "";

  return (
    <>
      <GeoJSONSource id="ais-cog-lines" data={cogLines}>
        <Layer
          id="ais-cog-lines-layer"
          type="line"
          paint={{
            "line-color": ["get", "color"],
            "line-width": 1.5,
            "line-opacity": 0.5,
          }}
          layout={{
            "line-cap": "round",
          }}
        />
      </GeoJSONSource>
      <GeoJSONSource
        id="ais-vessels"
        data={geojson}
        hitbox={{ top: 22, right: 22, bottom: 22, left: 22 }}
        onPress={handlePress}
      >
        {/* Unselected vessels */}
        <Layer
          id="ais-vessels-symbol"
          type="symbol"
          filter={["!=", ["get", "mmsi"], selectedMmsi]}
          layout={{
            "icon-image": ["get", "icon"],
            "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.2, 10, 0.35, 14, 0.5, 18, 0.7],
            "icon-rotate": ["get", "rotation"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          }}
          paint={{
            "icon-color": ["get", "color"],
            "icon-halo-color": "rgba(0, 0, 0, 0.5)",
            "icon-halo-width": 1,
          }}
        />

        {/* Selected vessel (larger icon) */}
        <Layer
          id="ais-vessels-selected"
          type="symbol"
          filter={["==", ["get", "mmsi"], selectedMmsi]}
          layout={{
            "icon-image": ["get", "icon"],
            "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.3, 10, 0.5, 14, 0.7, 18, 1.0],
            "icon-rotate": ["get", "rotation"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          }}
          paint={{
            "icon-color": ["get", "color"],
            "icon-halo-color": "rgba(255, 255, 255, 0.8)",
            "icon-halo-width": 2,
          }}
        />
      </GeoJSONSource>
    </>
  );
}
