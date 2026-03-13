import { usePreferredUnits } from "@/hooks/usePreferredUnits";
import type { SpeedSample } from "@/hooks/useTrackRecording";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  samples: SpeedSample[];
  width: number;
  height?: number;
};

export default function SpeedChart({ samples, width, height = 100 }: Props) {
  const units = usePreferredUnits();

  const { avgSpeed, maxSpeed, path, fillPath } = useMemo(() => {
    if (samples.length < 2) {
      return { avgSpeed: 0, maxSpeed: 0, path: "", fillPath: "" };
    }

    const speeds = samples.map((s) => s.speed);
    const max = Math.max(...speeds);
    const avg = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const yMax = max * 1.1 || 1; // 10% headroom

    const padding = 0;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 8; // small top padding

    const points = samples.map((s, i) => {
      const x = padding + (i / (samples.length - 1)) * chartWidth;
      const y = chartHeight - (s.speed / yMax) * chartHeight + 4;
      return { x, y };
    });

    const lineParts = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`));
    const line = lineParts.join(" ");
    const fill = `${line} L${points[points.length - 1].x},${chartHeight + 4} L${points[0].x},${chartHeight + 4} Z`;

    return { avgSpeed: avg, maxSpeed: max, path: line, fillPath: fill };
  }, [samples, width, height]);

  const avg = units.toSpeed(avgSpeed);
  const max = units.toSpeed(maxSpeed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPEED</Text>
      <View style={styles.chartContainer}>
        {samples.length >= 2 && (
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#8BC6A8" stopOpacity={0.6} />
                <Stop offset="1" stopColor="#8BC6A8" stopOpacity={0.1} />
              </LinearGradient>
            </Defs>
            <Path d={fillPath} fill="url(#fill)" />
            <Path d={path} stroke="#8BC6A8" strokeWidth={1.5} fill="none" />
          </Svg>
        )}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>AVERAGE</Text>
            <Text style={styles.statValue}>
              {avg.value}
              <Text style={styles.statUnit}> {avg.abbr}</Text>
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>MAX</Text>
            <Text style={styles.statValue}>
              {max.value}
              <Text style={styles.statUnit}> {max.abbr}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  statsRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 4,
  },
  stat: {
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a2b4a",
    fontVariant: ["tabular-nums"],
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.5,
  },
});
