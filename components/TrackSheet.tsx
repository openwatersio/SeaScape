import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { usePreferredUnits } from "@/hooks/usePreferredUnits";
import { useTrackRecording } from "@/hooks/useTrackRecording";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

function formatDuration(startedAt: string | null): string {
  if (!startedAt) return "00:00";
  const seconds = Math.floor(
    (Date.now() - new Date(startedAt).getTime()) / 1000,
  );
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TrackSheet() {
  const { isRecording, startedAt, distance, stop } = useTrackRecording();
  const units = usePreferredUnits();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const dist = units.toDistance(distance);

  return (
    <BottomSheet isOpen={isRecording} onOpenChange={() => { }}>
      <View style={styles.container}>
        <IconSymbol name="route" color="#e53e3e" />
        <View style={styles.stat}>
          <Text style={styles.label} numberOfLines={1}>Time</Text>
          <Text style={styles.value} numberOfLines={1}>{formatDuration(startedAt)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.label} numberOfLines={1}>Distance</Text>
          <Text style={styles.value} numberOfLines={1}>
            {dist.value}
            <Text style={styles.units}> {dist.abbr}</Text>
          </Text>
        </View>
        <View style={styles.button}>
          <Button
            label="Stop"
            onPress={stop}
            role="destructive"
            variant="bordered"
            systemImage="stop"
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 24,
    gap: 16,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.8,
  },
  units: {
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.5,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  button: {
    flex: 1,
    alignItems: "flex-end",
  }
});
