import { Paths, File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getTrack, getTrackPoints } from "@/lib/database";
import { toGPX } from "@/lib/gpx";

export async function exportTrackAsGPX(trackId: number): Promise<void> {
  const track = await getTrack(trackId);
  if (!track) throw new Error(`Track ${trackId} not found`);

  const points = await getTrackPoints(trackId);
  const gpx = toGPX(track, points);

  const file = new File(Paths.cache, `track-${trackId}.gpx`);
  file.write(gpx);

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/gpx+xml",
    dialogTitle: "Export Track",
    UTI: "com.topografix.gpx",
  });
}
