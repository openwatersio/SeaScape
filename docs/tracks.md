# Track Recording

Record the vessel's path as a series of GPS points, display tracks on the chart, and manage saved tracks.

## Architecture

- **Storage:** SQLite via `expo-sqlite` — source of truth for tracks, waypoints, routes
- **Location:** `expo-location` + `expo-task-manager` for foreground + background GPS
- **Export:** GPX 1.1 XML via `fast-xml-parser` — interchange format for sharing
- **Geo math:** `geolib` for distance calculations
- **Map rendering:** MapLibre `GeoJSONSource` + `Layer` for track line overlay

## Database Schema (`lib/database.ts`)

- `tracks` table: `id`, `name`, `started_at`, `ended_at`, `distance` (meters), `color`
- `track_points` table: `id`, `track_id` (FK), `latitude`, `longitude`, `speed`, `heading`, `accuracy`, `timestamp`
- Version-based migrations via `PRAGMA user_version`

## Track Recording Store (`hooks/useTrackRecording.tsx`)

Zustand store (persisted, key: `"track-recording"`) to survive app restarts mid-recording.

**State:** `isRecording`, `activeTrackId`, `pointCount`, `distance`, `startedAt`

**Actions:** `start()`, `stop()`, `resume()`

### Sampling Strategy

Record a point when ANY of these conditions are met (after a 2s minimum interval):

- Distance from last point > 10m
- Heading change > 5°
- Time elapsed > 30s (breadcrumbs even when drifting)

### Track Discard Rules

On stop, tracks are silently deleted if:
- Duration < 1 minute, OR
- Distance < 200m

## Background Location (`lib/backgroundLocation.ts`)

- `expo-task-manager` background task registered at module scope (imported in `_layout.tsx`)
- Background task reads active track ID from AsyncStorage (Zustand may not be hydrated)
- Foreground uses `expo-location` `watchPositionAsync` for real-time UI updates
- Both foreground and background run simultaneously during recording
- iOS: blue bar indicator via `showsBackgroundLocationIndicator`

## Track Display (`components/TrackOverlay.tsx`)

Display is completely separated from recording. TrackOverlay owns its own coordinate pipeline:

- On mount/resume: loads saved points from DB via `getTrackPoints(activeTrackId)`
- Subscribes to `LocationManager.addListener` for live coordinate accumulation — the same location source that drives the puck, ensuring perfect sync
- Two-layer rendering:
  - **Historical track:** `GeoJSONSource` + `Layer` with Catmull-Rom spline smoothing (`lib/spline.ts`)
  - **Animated tail:** `Animated.GeoJSONSource` with `Animated.CoordinatesArray` — 1000ms linear easing matching the puck's animation
- Red line, 3px width, 80% opacity, round caps/joins

## Track Management (`app/Tracks.tsx`)

- Modal screen accessible via long-press on record button
- FlatList of saved tracks (name defaults to date, renamable)
- Swipe-left reveals "..." (action menu) and "Delete" buttons
- Long-press also opens action menu: Rename, Export GPX, Delete
- Tap to select/deselect for chart display

## GPX Export (`lib/gpx.ts`, `lib/exportTrack.ts`)

- `fast-xml-parser` `XMLBuilder` generates GPX 1.1 XML
- Track points include `<time>`, `<extensions>` with `<speed>` and `<course>`
- Written to cache via `expo-file-system`, shared via `expo-sharing`

## Recording UI (`components/TrackRecordButton.tsx`)

- Bottom-left overlay button on chart (above ViewOptions)
- Idle: red circle icon (tap to start, long-press for track list)
- Recording: elapsed time + distance badge, red stop button
- Duration ticks every second via `setInterval`

## Key Decisions

1. **Background tracking is required** — the screen will be off most of the time underway
2. **SQLite over GPX files** — real-time appending, crash resilience, querying, relationships
3. **GPX as export format** — universal interchange for marine apps
4. **One track at a time on chart** — show-all is a future feature toggle
5. **Tracks auto-named by date** — user can rename via long-press menu
