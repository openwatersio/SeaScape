import { useCameraState } from "@/hooks/useCameraState";
import { useViewOptions } from "@/hooks/useViewOptions";
import mapStyles from "@/styles";
import { Camera, Map, UserLocation } from "@maplibre/maplibre-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CurrentLocationButton from "./CurrentLocationButton";
import SpeedOverGround from "./SpeedOverGround";
import ViewOptionsButton from "./ViewOptionsButton";
import ZoomAndScale from "./ZoomAndScale";

function trackingMode(follow: boolean, orientationMode: string) {
  if (!follow) return undefined;
  return orientationMode === "course" ? "course" : "default";
}

export default function ChartView() {
  const viewOptions = useViewOptions();
  const cameraState = useCameraState();
  const mapStyle = mapStyles.find(style => style.id === viewOptions.mapStyleId)?.style || mapStyles[0].style;
  const isNorth = cameraState.orientationMode === "north";

  return <>
    <Map
      style={{ flex: 1 }}
      mapStyle={mapStyle}
      touchRotate={false}
      touchPitch={false}
      attribution={false}
      compass={false}
      compassPosition={{ top: -2000, right: -2000 }}
      onRegionIsChanging={(e) => cameraState.set({ bearing: e.nativeEvent.bearing })}
      onRegionDidChange={(e) => cameraState.didChange(e.nativeEvent)}
    >
      <Camera
        trackUserLocation={trackingMode(cameraState.followUserLocation, cameraState.orientationMode)}
        zoom={cameraState.zoom}
        center={cameraState.center}
        easing="ease"
        duration={1000}
        bearing={isNorth ? 0 : undefined}
        pitch={0}
        onTrackUserLocationChange={(e) => {
          cameraState.setFollowUserLocation(e.nativeEvent.trackUserLocation !== null);
        }}
      />
      <UserLocation heading />
    </Map>
    <SafeAreaView style={{ position: "absolute", top: 0, right: 16, zIndex: 1, gap: 16 }}>
      <ZoomAndScale />
    </SafeAreaView>
    <SafeAreaView style={{ position: "absolute", bottom: 0, left: 16, zIndex: 1 }}>
      <ViewOptionsButton />
    </SafeAreaView>
    <SafeAreaView style={{ position: "absolute", bottom: 0, right: 16, zIndex: 1 }}>
      <CurrentLocationButton />
    </SafeAreaView>
    <SafeAreaView style={{ position: "absolute", top: 0, left: 90, right: 90, zIndex: 1, alignItems: "center" }}>
      <SpeedOverGround />
    </SafeAreaView>
  </>;
}
