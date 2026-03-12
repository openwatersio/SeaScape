import { useTrackRecording } from "@/hooks/useTrackRecording";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import OverlayView from "./ui/OverlayView";

export default function TrackRecordButton() {
  const { isRecording, start } = useTrackRecording();

  if (isRecording) return null;

  return (
    <OverlayView style={styles.buttonOverlay}>
      <Pressable
        onPress={start}
        onLongPress={() => router.push("/Tracks")}
        style={styles.button}
      >
        <IconSymbol name="fiber-manual-record" color="#e53e3e" />
      </Pressable>
    </OverlayView>
  );
}

const styles = StyleSheet.create({
  buttonOverlay: {
    borderRadius: 100,
    overflow: "hidden",
  },
  button: {
    padding: 12,
  },
});
