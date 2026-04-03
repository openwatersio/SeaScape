import { mapRef } from "@/hooks/useMapRef";
import { addDraftPoint, insertDraftPointAt, useRouteDraft } from "@/hooks/useRouteDraft";
import { useSelectionHandler } from "@/hooks/useSelection";
import { useMapStyle } from "@/hooks/useViewOptions";
import { findNearestLegIndex } from "@/lib/geo";
import { Images, Map } from "@maplibre/maplibre-react-native";
import { useCallback } from "react";
import AISLayer from "./AISLayer";
import AtoNLayer from "./AtoNLayer";
import MapOverlay from "./MapOverlay";
import MarkerOverlay from "./MarkerOverlay";
import RouteOverlay from "./RouteOverlay";
import TrackOverlay from "./TrackOverlay";
import { NavigationCamera, handleRegionDidChange, handleRegionIsChanging } from "./map/NavigationCamera";
import { NavigationPuck } from "./map/NavigationPuck";
import SelectedLocationAnnotation from "./map/SelectedLocationAnnotation";

export default function ChartView() {
  const mapStyle = useMapStyle();
  const navigate = useSelectionHandler();

  const handleLongPress = useCallback((e: { nativeEvent: { lngLat: [number, number] } }) => {
    const points = useRouteDraft.getState().points;

    const [lon, lat] = e.nativeEvent.lngLat;

    // Check if near a leg line — insert between waypoints
    const insertIndex = findNearestLegIndex(lat, lon, points, 500);
    if (insertIndex !== null) {
      insertDraftPointAt(insertIndex, { latitude: lat, longitude: lon });
    } else {
      // Append to end
      addDraftPoint({ latitude: lat, longitude: lon });
    }
  }, []);

  return <>
    <Map
      ref={mapRef}
      style={{ flex: 1 }}
      mapStyle={mapStyle}
      touchRotate={false}
      touchPitch={false}
      attribution={false}
      compass={false}
      compassPosition={{ top: -2000, right: -2000 }}
      onRegionIsChanging={handleRegionIsChanging}
      onRegionDidChange={handleRegionDidChange}
      onLongPress={handleLongPress}
      onPress={(e) => {
        const { lngLat } = e.nativeEvent;

        const { points } = useRouteDraft.getState();
        if (points.length > 0) {
          // const [lon, lat] = lngLat;
          // addDraftPoint({ latitude: lat, longitude: lon });
          return;
        }

        navigate("location", lngLat.join(','));
      }}
      logo={false}
    >
      <NavigationCamera />
      <Images images={{
        "vessel-default": { source: require("@/assets/vessels/png/default.png"), sdf: true },
        "vessel-unknown": { source: require("@/assets/vessels/png/unknown.png"), sdf: true },
        "vessel-cargo": { source: require("@/assets/vessels/png/cargo.png"), sdf: true },
        "vessel-tanker": { source: require("@/assets/vessels/png/tanker.png"), sdf: true },
        "vessel-passenger": { source: require("@/assets/vessels/png/passenger.png"), sdf: true },
        "vessel-sailing": { source: require("@/assets/vessels/png/sailing.png"), sdf: true },
        "vessel-pleasure": { source: require("@/assets/vessels/png/pleasure.png"), sdf: true },
        "vessel-highspeed": { source: require("@/assets/vessels/png/highspeed.png"), sdf: true },
        "vessel-fishing": { source: require("@/assets/vessels/png/fishing.png"), sdf: true },
        "vessel-tug": { source: require("@/assets/vessels/png/tug.png"), sdf: true },
        "nav-puck": { source: require("@/assets/vessels/png/puck.png"), sdf: true },
        "aton-default": { source: require("@/assets/atons/png/default.png"), sdf: true },
        "aton-buoy": { source: require("@/assets/atons/png/buoy.png"), sdf: true },
        "aton-beacon": { source: require("@/assets/atons/png/beacon.png"), sdf: true },
        "aton-lighthouse": { source: require("@/assets/atons/png/lighthouse.png"), sdf: true },
        "aton-virtual": { source: require("@/assets/atons/png/virtual.png"), sdf: true },
      }} />
      <TrackOverlay />
      <MarkerOverlay />
      <RouteOverlay />
      <AISLayer />
      <AtoNLayer />
      <SelectedLocationAnnotation />
      <NavigationPuck />
    </Map>
    <MapOverlay />
  </>;
}
