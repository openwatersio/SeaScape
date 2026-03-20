import SheetView from "@/components/ui/SheetView";
import { toDistance } from "@/hooks/usePreferredUnits";
import { useRouteNavigation } from "@/hooks/useRouteNavigation";
import {
  handleDeleteRoute,
  handleRenameRoute,
  loadRoutes,
  useLoadRoutes,
  useRoutes,
} from "@/hooks/useRoutes";
import useTheme from "@/hooks/useTheme";
import { insertRoute, type RouteWithStats } from "@/lib/database";
import { exportRouteAsGPX } from "@/lib/export";
import {
  Button,
  ContextMenu,
  HStack,
  Host,
  List,
  Picker,
  Section,
  Text,
  VStack
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
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert } from "react-native";

type SortBy = "recent" | "name" | "distance";

export function routeDisplayName(route: RouteWithStats): string {
  return route.name || `Route ${route.id}`;
}

export default function RouteList() {
  const routes = useRoutes((s) => s.routes);
  useLoadRoutes();
  const activeRouteId = useRouteNavigation((s) => s.activeRouteId);
  const theme = useTheme();
  const [sort, setSort] = useState<SortBy>("recent");

  const sortedRoutes = useMemo(() => {
    return [...routes].sort((a, b) => {
      switch (sort) {
        case "name":
          return (a.name ?? "").localeCompare(b.name ?? "");
        case "distance":
          return b.total_distance - a.total_distance;
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
  }, [routes, sort]);

  function confirmDelete(route: RouteWithStats) {
    Alert.alert(
      "Delete Route",
      `Delete "${routeDisplayName(route)}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteRoute(route.id) },
      ],
    );
  }

  function promptRename(route: RouteWithStats) {
    Alert.prompt(
      "Rename Route",
      undefined,
      (name: string) => handleRenameRoute(route.id, name),
      "plain-text",
      route.name || "",
    );
  }

  return (
    <SheetView id="routes">
      <Host style={{ flex: 1 }}>
        <List>
          <Section>
            <Button
              systemImage="plus"
              label="New Route"
              modifiers={[tint("primary")]}
              onPress={async () => {
                const route = await insertRoute();
                await loadRoutes();
                router.push({ pathname: "/route/edit", params: { id: route.id } });
              }}
            />
          </Section>

          <Section>
            <Picker
              selection={sort}
              onSelectionChange={(s) => setSort(s as SortBy)}
              modifiers={[pickerStyle("segmented"), labelsHidden()]}
            >
              <Text modifiers={[tag("recent")]}>Recent</Text>
              <Text modifiers={[tag("name")]}>Name</Text>
              <Text modifiers={[tag("distance")]}>Distance</Text>
            </Picker>
          </Section>

          <List.ForEach>
            {sortedRoutes.map((route) => {
              const isNavigating = activeRouteId === route.id;
              const dist = route.total_distance > 0 ? toDistance(route.total_distance) : null;

              return (
                <ContextMenu key={route.id}>
                  <ContextMenu.Trigger>
                    <HStack
                      alignment="center"
                      spacing={12}
                      modifiers={[
                        onTapGesture(() => {
                          router.push({ pathname: "/feature/[type]/[id]", params: { type: "route", id: String(route.id) } });
                        }),
                        padding({ vertical: 4 }),
                      ]}
                    >
                      <VStack alignment="leading" spacing={2}>
                        <HStack spacing={6}>
                          <Text modifiers={[font({ size: 16, weight: "semibold" }), lineLimit(1)]}>
                            {routeDisplayName(route)}
                          </Text>
                          {isNavigating && (
                            <Text modifiers={[foregroundStyle(theme.primary), font({ size: 12 })]}>
                              ▶
                            </Text>
                          )}
                        </HStack>
                        <HStack spacing={6}>
                          <Text
                            modifiers={[
                              font({ size: 13 }),
                              monospacedDigit(),
                              foregroundStyle("secondary"),
                            ]}
                          >
                            {route.point_count} {route.point_count === 1 ? "waypoint" : "waypoints"}
                          </Text>
                          {dist && (
                            <Text
                              modifiers={[
                                font({ size: 13 }),
                                monospacedDigit(),
                                foregroundStyle("secondary"),
                              ]}
                            >
                              · {dist.value} {dist.abbr}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </ContextMenu.Trigger>

                  <ContextMenu.Items>
                    <Button
                      label="Rename"
                      systemImage="pencil"
                      onPress={() => promptRename(route)}
                    />
                    <Button
                      label="Export GPX"
                      systemImage="square.and.arrow.up"
                      onPress={() => exportRouteAsGPX(route.id)}
                    />
                    <Button
                      label="Delete"
                      systemImage="trash"
                      role="destructive"
                      onPress={() => confirmDelete(route)}
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
