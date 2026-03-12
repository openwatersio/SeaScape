
import { NavigationState, useNavigationState } from "@/hooks/useNavigationState";
import { usePreferredUnits } from "@/hooks/usePreferredUnits";
import { useTrackRecording } from "@/hooks/useTrackRecording";
import { StyleSheet, Text, View } from "react-native";
import OverlayView from "./ui/OverlayView";

function SpeedOverGround() {
  const units = usePreferredUnits();
  const nav = useNavigationState();
  const { value, plural } = units.toSpeed(nav.coords?.speed ?? undefined);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>SOG</Text>
      <Text style={styles.sectionValue}>{value ?? "--"}</Text>
      <Text style={styles.sectionUnits}>{plural}</Text>
    </View>
  );
}

export default function HeadsUpDisplay() {
  const nav = useNavigationState();
  const { isRecording } = useTrackRecording();

  const visible = nav.state === NavigationState.Underway || isRecording;
  if (!visible) return null;

  return (
    <OverlayView style={styles.container}>
      <SpeedOverGround />
    </OverlayView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 100,
  },
  section: {
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.6,
  },
  sectionUnits: {
    fontSize: 10,
    textTransform: "uppercase",
    opacity: 0.6,
  },
  sectionValue: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
});
