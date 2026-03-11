# Roadmap

Features are prioritized using MoSCoW (Must/Should/Could/Won't) across three milestones. The goal is to ship a useful, differentiated v0.1 as quickly as possible, then layer on capabilities.

## v0.1 — Minimum Viable Chart Plotter

Ship a usable chart viewer with basic navigation. Enough to replace a paper chart on a day sail.

### Must Have

- [x] **Map display with nautical charts** — Render vector tiles via MapLibre GL with nautical chart styling (OpenSeaMap or similar open data source) ([#23](https://github.com/openwatersio/SeaScape/issues/23))
- [ ] **NOAA charts** — Add NOAA nautical charts as a built-in chart source ([#8](https://github.com/openwatersio/SeaScape/issues/8))
- [ ] **Real-time GPS position** — Show user's position, heading, and speed on the chart ([#6](https://github.com/openwatersio/SeaScape/issues/6))
- [ ] **Zoom, pan, rotate** — Standard map interactions; north-up and course-up modes
- [ ] **Offline chart storage** — Download chart regions for use without connectivity ([#7](https://github.com/openwatersio/SeaScape/issues/7))
- [ ] **Basic waypoints** — Drop pins, name them, navigate to them with bearing/distance ([#15](https://github.com/openwatersio/SeaScape/issues/15))
- [ ] **Route creation** — Create multi-leg routes by placing waypoints on the chart ([#16](https://github.com/openwatersio/SeaScape/issues/16))
- [ ] **Route navigation** — Active guidance along a route with bearing, distance, and next waypoint info ([#17](https://github.com/openwatersio/SeaScape/issues/17))
- [ ] **Track recording** — Record GPS track while underway; display on chart
- [ ] **Settings & vessel profile** — Configure vessel name, draft, beam, LOA (used later for depth shading and routing)
- [ ] **Map attribution** — Display proper attribution for chart data sources as required by tile providers ([#21](https://github.com/openwatersio/SeaScape/issues/21))
- [ ] **Choose a license** — Select and apply an open-source license ([#12](https://github.com/openwatersio/SeaScape/issues/12))
- [ ] **Android support** — Ship on Android in addition to iOS ([#10](https://github.com/openwatersio/SeaScape/issues/10))
- [ ] **Safety disclaimer** — "Not for primary navigation" disclaimer in app store listing, first launch, and about screen. Research competitor language and legal requirements before finalizing.

### Should Have

- [ ] **Chart layer toggling** — Show/hide depth contours, buoys, lights, land features independently
- [ ] **Combine multiple chart layers** — Layer charts from multiple sources with configurable opacity ([#5](https://github.com/openwatersio/SeaScape/issues/5))
- [ ] **Scale bar** — Display a distance scale indicator on the chart ([#37](https://github.com/openwatersio/SeaScape/issues/37))
- [ ] **Coordinates display** — Show lat/lon for a selected point on the chart ([#14](https://github.com/openwatersio/SeaScape/issues/14))
- [ ] **Depth shading by vessel draft** — Color-code areas as safe/caution/danger based on vessel draft (inspired by Wavve)
- [ ] **Distance/bearing measurement tool** — Tap two points to get distance and bearing ([#13](https://github.com/openwatersio/SeaScape/issues/13))
- [ ] **GPX import/export** — Import/export waypoints, routes, and tracks for interoperability
- [ ] **Improve ViewOptions UI** — Better interface for toggling chart layers and options ([#4](https://github.com/openwatersio/SeaScape/issues/4))

### Could Have

- [ ] **Satellite/hybrid base map** — Toggle between chart-only and satellite imagery overlay
- [ ] **OpenStreetMap base map** — Add OpenStreetMap as a built-in chart source ([#24](https://github.com/openwatersio/SeaScape/issues/24))
- [ ] **Search** — Find locations, marinas, navigational aids by name
- [ ] **Day/night/dusk color schemes** — Reduce screen brightness and shift colors for night use ([#22](https://github.com/openwatersio/SeaScape/issues/22))

## v0.2 — Weather, Tides & Instruments

Layer on environmental data and onboard instrument connectivity.

### Must Have

- [ ] **Tide station data** — Display tide predictions for nearby stations; tide graphs with current time indicator
- [ ] **Current station data** — Display tidal current predictions and direction
- [ ] **Weather overlay** — Wind, wave, and pressure data displayed on the chart
- [ ] **Signal K integration** — Connect to a Signal K server on the boat's Wi-Fi network to receive instrument data (depth, wind, speed, heading, AIS targets) ([#28](https://github.com/openwatersio/SeaScape/issues/28))
- [ ] **NMEA connectivity** — Connect directly to NMEA 0183/2000 instrument data ([#27](https://github.com/openwatersio/SeaScape/issues/27))

### Should Have

- [ ] **Instrument dashboard** — Configurable panel showing live data from Signal K (SOG, COG, depth, wind speed/direction, water temp)
- [ ] **AIS target display** — Show nearby vessels from Signal K or internet AIS with name, MMSI, COG, SOG
- [ ] **AIS collision warnings** — CPA/TCPA alerts for vessels on converging courses
- [ ] **Anchor alarm** — Set anchor position and radius; alert if vessel drifts outside the watch circle

### Could Have

- [ ] **Bluetooth LE sensor support** — Connect directly to BLE marine sensors (wind, depth, GPS) without requiring a Signal K server
- [ ] **Import custom charts** — Allow users to import their own charts in various formats ([#26](https://github.com/openwatersio/SeaScape/issues/26))
- [ ] **Split screen** — View two different chart layers side-by-side ([#11](https://github.com/openwatersio/SeaScape/issues/11))
- [ ] **GRIB file viewer** — Import and display GRIB weather files for offshore passage planning
- [ ] **Weather along route** — Show forecast conditions at each waypoint for a planned departure time

## v0.3 — Smart Navigation & Community

Intelligent routing and community features that differentiate SeaScape.

### Must Have

- [ ] **Auto-routing** — Calculate routes that avoid land, shallow water (based on vessel draft), and restricted areas ([#19](https://github.com/openwatersio/SeaScape/issues/19))
- [ ] **Tide/current-aware routing** — Factor tidal gates and current streams into route timing and ETA
- [ ] **Departure planner** — Suggest optimal departure time based on tides, currents, weather, and daylight

### Should Have

- [ ] **Open community POI layer** — User-contributed anchorages, marinas, fuel docks, hazards with ratings and reviews (open data, not vendor-locked)
- [ ] **Route sharing** — Share routes via link or GPX with other SeaScape users
- [ ] **Logbook** — Automatic trip logging with track, conditions, and notes

### Could Have

- [ ] **Plugin/extension architecture** — Allow community-developed plugins to add chart sources, data overlays, instrument widgets, or integrations ([#35](https://github.com/openwatersio/SeaScape/issues/35), [#36](https://github.com/openwatersio/SeaScape/issues/36))
- [ ] **Chart Store** — A commercial marketplace for subscribing to chart data from hydrographic offices and third-party providers (e.g. UKHO, LINZ, MarineCharts.io). Enables worldwide coverage beyond free NOAA data and provides a potential sustainability model for the project.
- [ ] **Web platform** — Run SeaScape as a web application in addition to native mobile ([#20](https://github.com/openwatersio/SeaScape/issues/20))
- [ ] **Multi-device sync** — Sync waypoints, routes, and settings across phone, tablet, and desktop
- [ ] **MOB (Man Overboard) alarm** — One-tap MOB button that marks position, sounds alarm, and provides bearing back to the MOB point

## Out of Scope (for now)

- Proprietary chart formats (S-63 encrypted, Navionics, C-MAP)
- Fishfinder/sonar integration
- Radar overlay
- Autopilot output/control
- Social features (seeing other boaters live on map)
- Catch logging / fishing-specific features
