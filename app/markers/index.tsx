import { AnnotationIcon } from "@/components/map/AnnotationIcon";
import SheetView from "@/components/ui/SheetView";
import { deleteMarker, loadMarkers, updateMarker, useMarkers } from "@/hooks/useMarkers";
import { usePosition } from "@/hooks/useNavigation";
import { toDistance } from "@/hooks/usePreferredUnits";
import useTheme from "@/hooks/useTheme";
import type { Marker } from "@/lib/database";
import { formatBearing } from "@/lib/geo";
import { getDistance, getGreatCircleBearing } from "geolib";
import {
  Button,
  ContextMenu,
  Host,
  HStack,
  List,
  Picker,
  RNHostView,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  labelsHidden,
  lineLimit,
  monospacedDigit,
  onTapGesture,
  padding,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { CoordinateFormat } from "coordinate-format";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, View } from "react-native";

type SortBy = "name" | "created" | "nearby";

const coordFormat = new CoordinateFormat("minutes");

function formatCoords(lat: number, lon: number): string {
  const [lonStr, latStr] = coordFormat.format(lon, lat);
  return `${latStr}  ${lonStr}`;
}

export default function MarkerList() {
  const markers = useMarkers((s) => s.markers);

  const position = usePosition();
  const theme = useTheme();
  const [sort, setSort] = useState<SortBy>("created");

  useEffect(() => {
    loadMarkers();
  }, []);

  const proximityMap = useMemo(() => {
    if (sort !== "nearby" || !position) return null;
    const map = new Map<number, number>();
    for (const m of markers) {
      map.set(m.id, getDistance(position, m));
    }
    return map;
  }, [sort, markers, position]);

  const sortedMarkers = useMemo(() => {
    return [...markers].sort((a, b) => {
      switch (sort) {
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "");
        case "nearby": {
          const distA = proximityMap?.get(a.id) ?? Infinity;
          const distB = proximityMap?.get(b.id) ?? Infinity;
          return distA - distB;
        }
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [markers, sort, proximityMap]);

  function confirmDelete(marker: Marker) {
    Alert.alert(
      "Delete Marker",
      `Delete "${marker.name ?? `Marker ${marker.id}`}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMarker(marker.id) },
      ],
    );
  }

  function promptRename(marker: Marker) {
    Alert.prompt(
      "Rename Marker",
      undefined,
      (name: string) => updateMarker(marker.id, { name: name || null }),
      "plain-text",
      marker.name ?? "",
    );
  }

  function getDistanceLabel(marker: Marker): string | null {
    if (!position) return null;
    const dist = proximityMap?.get(marker.id)
      ?? getDistance(position, marker);
    const formatted = toDistance(dist);
    const bearing = getGreatCircleBearing(position, marker);
    return `${formatted.value} ${formatted.abbr} ${formatBearing(bearing)}`;
  }

  return (
    <SheetView id="markers">
      <Host style={{ flex: 1 }}>
        <List>
          <Picker
            selection={sort}
            onSelectionChange={(s) => setSort(s as SortBy)}
            modifiers={[pickerStyle("segmented"), labelsHidden()]}
          >
            <Text modifiers={[tag("created")]}>Recent</Text>
            <Text modifiers={[tag("name")]}>Name</Text>
            <Text modifiers={[tag("nearby")]}>Nearby</Text>
          </Picker>

          <List.ForEach>
            {sortedMarkers.map((marker) => {
              const distLabel = getDistanceLabel(marker);
              const coordsLabel = formatCoords(marker.latitude, marker.longitude);

              return (
                <ContextMenu key={marker.id}>
                  <ContextMenu.Trigger>
                    <HStack
                      alignment="center"
                      spacing={16}
                      modifiers={[
                        onTapGesture(() => {
                          router.push({ pathname: "/marker/[id]", params: { id: marker.id } });
                        }),
                        padding({ vertical: 4 }),
                      ]}
                    >
                      <RNHostView matchContents>
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: marker.color ?? theme.primary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <AnnotationIcon name={marker.icon ?? "pin"} color="white" size={18} />
                        </View>
                      </RNHostView>
                      <VStack alignment="leading" spacing={2}>
                        <HStack spacing={6}>
                          <Text modifiers={[font({ size: 16, weight: "semibold" }), lineLimit(1)]}>
                            {marker.name ?? `Marker ${marker.id}`}
                          </Text>
                          <Spacer />
                          {distLabel && (
                            <Text modifiers={[font({ size: 13 }), monospacedDigit(), foregroundStyle("secondary")]}>
                              {distLabel}
                            </Text>
                          )}
                        </HStack>
                        <Text modifiers={[font({ size: 12 }), monospacedDigit(), foregroundStyle(theme.textSecondary)]}>
                          {coordsLabel}
                        </Text>
                      </VStack>
                    </HStack>
                  </ContextMenu.Trigger>

                  <ContextMenu.Items>
                    <Button
                      label="Rename"
                      systemImage="pencil"
                      onPress={() => promptRename(marker)}
                    />
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => confirmDelete(marker)}
                    />
                  </ContextMenu.Items>
                </ContextMenu>
              );
            })}
          </List.ForEach>
        </List>
      </Host>
    </SheetView>
  );
}
