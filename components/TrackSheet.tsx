import SpeedChart from "@/components/SpeedChart";
import BottomSheet from "@/components/ui/BottomSheet";
import Button from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { usePreferredUnits } from "@/hooks/usePreferredUnits";
import { useTrackRecording } from "@/hooks/useTrackRecording";
import { getAllTimeSpeedStats, type SpeedStats } from "@/lib/database";
import { exportTrackAsGPX } from "@/lib/exportTrack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

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

function formatTime(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function StatComparison({ label, current, allTime, unit }: {
  label: string;
  current: string;
  allTime: string;
  unit: string;
}) {
  return (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <View style={styles.comparisonValues}>
        <View style={styles.comparisonStat}>
          <Text style={styles.comparisonValue}>
            {current}
            <Text style={styles.comparisonUnit}> {unit}</Text>
          </Text>
          <Text style={styles.comparisonCaption}>This track</Text>
        </View>
        <View style={styles.comparisonStat}>
          <Text style={styles.comparisonValue}>
            {allTime}
            <Text style={styles.comparisonUnit}> {unit}</Text>
          </Text>
          <Text style={styles.comparisonCaption}>All time</Text>
        </View>
      </View>
    </View>
  );
}

export default function TrackSheet() {
  const { isRecording, activeTrackId, startedAt, distance, maxSpeed, speedSamples, stop } = useTrackRecording();
  const units = usePreferredUnits();
  const [, setTick] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [compactHeight, setCompactHeight] = useState(0);
  const [allTimeStats, setAllTimeStats] = useState<SpeedStats | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      getAllTimeSpeedStats().then(setAllTimeStats);
    }
  }, [isRecording]);

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  }, []);

  const handleExport = useCallback(() => {
    if (activeTrackId) exportTrackAsGPX(activeTrackId);
  }, [activeTrackId]);

  const dist = units.toDistance(distance);

  const avgSpeed = useMemo(() => {
    if (speedSamples.length === 0) return 0;
    return speedSamples.reduce((sum, s) => sum + s.speed, 0) / speedSamples.length;
  }, [speedSamples]);

  const currentAvg = units.toSpeed(avgSpeed);
  const currentMax = units.toSpeed(maxSpeed);
  const allTimeAvg = units.toSpeed(allTimeStats?.avgSpeed ?? 0);
  const allTimeMax = units.toSpeed(allTimeStats?.maxSpeed ?? 0);

  return (
    <BottomSheet isOpen={isRecording} onOpenChange={() => { }} onExpandedChange={setExpanded} compactHeight={compactHeight}>
      {/* Compact section — always visible */}
      <View style={styles.compact} onLayout={(e) => setCompactHeight(e.nativeEvent.layout.height)}>
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
        <View style={styles.stopButton}>
          <Button
            label="Stop"
            onPress={stop}
            role="destructive"
            variant="bordered"
            systemImage="stop"
          />
        </View>
      </View>

      <View style={styles.expanded}>
        <View style={styles.section} onLayout={onChartLayout}>
          {chartWidth > 0 && (
            <SpeedChart
              samples={speedSamples}
              width={chartWidth}
            />
          )}
        </View>

        <View style={styles.section}>
          <StatComparison
            label="Average Speed"
            current={currentAvg.value}
            allTime={allTimeAvg.value}
            unit={currentAvg.abbr}
          />
          <StatComparison
            label="Max Speed"
            current={currentMax.value}
            allTime={allTimeMax.value}
            unit={currentMax.abbr}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.timesRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Started</Text>
              <Text style={styles.timeValue}>{formatTime(startedAt)}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Elapsed</Text>
              <Text style={styles.timeValue}>{formatDuration(startedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            label="Export GPX"
            onPress={handleExport}
            systemImage="share"
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
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
  stopButton: {
    flex: 1,
    alignItems: "flex-end",
  },
  expanded: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  comparisonRow: {
    gap: 6,
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  comparisonValues: {
    flexDirection: "row",
    gap: 12,
  },
  comparisonStat: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    padding: 12,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a2b4a",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.8,
  },
  comparisonUnit: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.5,
  },
  comparisonCaption: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.5,
    marginTop: 2,
  },
  timesRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    padding: 12,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a2b4a",
    fontVariant: ["tabular-nums"],
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
  },
});
