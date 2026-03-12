import { useBottomSheetOffset } from "@/hooks/useBottomSheetOffset";
import { useCameraState } from "@/hooks/useCameraState";
import { useViewOptions } from "@/hooks/useViewOptions";
import mapStyles from "@/styles";
import { Camera, Map, UserLocation } from "@maplibre/maplibre-react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CurrentLocationButton from "./CurrentLocationButton";
import HeadsUpDisplay from "./HeadsUpDisplay";
import TrackOverlay from "./TrackOverlay";
import TrackRecordButton from "./TrackRecordButton";
import TrackSheet from "./TrackSheet";
import ViewOptionsButton from "./ViewOptionsButton";
import ZoomAndScale from "./ZoomAndScale";

function trackingMode(follow: boolean, orientationMode: string) {
  if (!follow) return undefined;
  return orientationMode === "course" ? "course" : "default";
}

export default function ChartView() {
  const viewOptions = useViewOptions();
  const cameraState = useCameraState();
  const bottomSheetOffset = useBottomSheetOffset();
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
        initialViewState={{
          zoom: cameraState.zoom,
          center: cameraState.center,
        }}
        trackUserLocation={trackingMode(cameraState.followUserLocation, cameraState.orientationMode)}
        zoom={cameraState.zoom}
        center={cameraState.center}
        easing="ease"
        duration={300}
        bearing={isNorth ? 0 : undefined}
        pitch={0}
        onTrackUserLocationChange={(e) => {
          cameraState.setFollowUserLocation(e.nativeEvent.trackUserLocation !== null);
        }}
      />
      <UserLocation heading />
      <TrackOverlay />
      <TrackSheet />
    </Map>
    <SafeAreaView style={{ position: "absolute", top: 0, left: 16, right: 16, alignItems: "center" }}>
      <HeadsUpDisplay />
    </SafeAreaView>
    <SafeAreaView style={{ position: "absolute", top: 0, right: 16, gap: 16 }}>
    </SafeAreaView>
    <SafeAreaView style={{ position: "absolute", top: 0, left: 16, gap: 16 }}>
      <TrackRecordButton />
    </SafeAreaView>
    <Animated.View style={[{ position: "absolute", bottom: 0, left: 0, right: 0 }, bottomSheetOffset]}>
      <SafeAreaView style={{ position: "absolute", bottom: 0, left: 16, gap: 8 }}>
        <ViewOptionsButton />
      </SafeAreaView>
      <SafeAreaView style={{ position: "absolute", bottom: 0, right: 16, gap: 16 }}>
        <ZoomAndScale />
        <CurrentLocationButton />
      </SafeAreaView>
    </Animated.View>
  </>;
}
