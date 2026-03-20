import {
  deleteRoute,
  getAllRoutesWithStats,
  getRoutePoints,
  updateRoute,
  type RouteWithStats,
} from "@/lib/database";
import { distanceMeters } from "@/lib/geo";
import { useEffect } from "react";
import { create } from "zustand";

interface RoutesState {
  routes: RouteWithStats[];
}

export const useRoutes = create<RoutesState>(() => ({
  routes: [],
}));

export async function loadRoutes() {
  const routes = await getAllRoutesWithStats();

  // Compute total_distance from route points
  const routesWithDistance = await Promise.all(
    routes.map(async (route) => {
      if (route.point_count < 2) return { ...route, total_distance: 0 };
      const points = await getRoutePoints(route.id);
      let total = 0;
      for (let i = 1; i < points.length; i++) {
        total += distanceMeters(
          points[i - 1].latitude,
          points[i - 1].longitude,
          points[i].latitude,
          points[i].longitude,
        );
      }
      return { ...route, total_distance: total };
    }),
  );

  useRoutes.setState({ routes: routesWithDistance });
}

export async function handleDeleteRoute(routeId: number) {
  await deleteRoute(routeId);
  await loadRoutes();
}

export async function handleRenameRoute(routeId: number, name: string) {
  if (name.trim()) {
    await updateRoute(routeId, { name: name.trim() });
    await loadRoutes();
  }
}

/** Hook to load routes on mount */
export function useLoadRoutes() {
  useEffect(() => {
    loadRoutes();
  }, []);
}
