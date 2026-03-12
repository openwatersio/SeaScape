import { getAllTracks, deleteTrack, renameTrack, type Track } from "@/lib/database";
import { exportTrackAsGPX } from "@/lib/exportTrack";
import { useCallback, useEffect, useState } from "react";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDistance(meters: number): string {
  const nm = meters / 1852;
  if (nm < 0.01) return "< 0.01 nm";
  return `${nm.toFixed(2)} nm`;
}

export function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "In progress";
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function trackDisplayName(track: Track): string {
  return track.name || formatDate(track.started_at);
}

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadTracks = useCallback(async () => {
    const result = await getAllTracks();
    setTracks(result);
  }, []);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  const handleDelete = useCallback(
    async (trackId: number) => {
      await deleteTrack(trackId);
      setSelectedId((prev) => (prev === trackId ? null : prev));
      await loadTracks();
    },
    [loadTracks],
  );

  const handleRename = useCallback(
    async (trackId: number, name: string) => {
      if (name.trim()) {
        await renameTrack(trackId, name.trim());
        await loadTracks();
      }
    },
    [loadTracks],
  );

  const handleExport = useCallback((trackId: number) => {
    exportTrackAsGPX(trackId);
  }, []);

  const toggleSelected = useCallback((trackId: number) => {
    setSelectedId((prev) => (prev === trackId ? null : trackId));
  }, []);

  return {
    tracks,
    selectedId,
    loadTracks,
    handleDelete,
    handleRename,
    handleExport,
    toggleSelected,
  };
}
