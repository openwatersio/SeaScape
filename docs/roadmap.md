# Roadmap

Features are prioritized using MoSCoW (Must/Should/Could/Won't) across three milestones. The goal is to ship a useful, differentiated v0.1 as quickly as possible, then layer on capabilities.

## v0.1 — Minimum Viable Chart Plotter

Ship a usable chart viewer with basic navigation. Enough to replace a paper chart on a day sail.

### Must Have

- [x] **Map display with nautical charts** — Render vector tiles via MapLibre GL with nautical chart styling (OpenSeaMap or similar open data source)
- [ ] **Real-time GPS position** — Show user's position, heading, and speed on the chart
- [ ] **Zoom, pan, rotate** — Standard map interactions; north-up and course-up modes
- [ ] **Offline chart storage** — Download chart regions for use without connectivity
- [ ] **Basic waypoints** — Drop pins, name them, navigate to them with bearing/distance
- [ ] **Route creation** — Create multi-leg routes by placing waypoints on the chart
- [ ] **Track recording** — Record GPS track while underway; display on chart
- [ ] **Settings & vessel profile** — Configure vessel name, draft, beam, LOA (used later for depth shading and routing)
- [ ] **Safety disclaimer** — "Not for primary navigation" disclaimer in app store listing, first launch, and about screen. Research competitor language and legal requirements before finalizing.

### Should Have

- [ ] **Chart layer toggling** — Show/hide depth contours, buoys, lights, land features independently
- [ ] **Depth shading by vessel draft** — Color-code areas as safe/caution/danger based on vessel draft (inspired by Wavve)
- [ ] **Distance/bearing measurement tool** — Tap two points to get distance and bearing
- [ ] **GPX import/export** — Import/export waypoints, routes, and tracks for interoperability

### Could Have

- [ ] **Satellite/hybrid base map** — Toggle between chart-only and satellite imagery overlay
- [ ] **Search** — Find locations, marinas, navigational aids by name
- [ ] **Day/night/dusk color schemes** — Reduce screen brightness and shift colors for night use

## v0.2 — Weather, Tides & Instruments

Layer on environmental data and onboard instrument connectivity.

### Must Have

- [ ] **Tide station data** — Display tide predictions for nearby stations; tide graphs with current time indicator
- [ ] **Current station data** — Display tidal current predictions and direction
- [ ] **Weather overlay** — Wind, wave, and pressure data displayed on the chart
- [ ] **Signal K integration** — Connect to a Signal K server on the boat's Wi-Fi network to receive instrument data (depth, wind, speed, heading, AIS targets)

### Should Have

- [ ] **Instrument dashboard** — Configurable panel showing live data from Signal K (SOG, COG, depth, wind speed/direction, water temp)
- [ ] **AIS target display** — Show nearby vessels from Signal K or internet AIS with name, MMSI, COG, SOG
- [ ] **AIS collision warnings** — CPA/TCPA alerts for vessels on converging courses
- [ ] **Anchor alarm** — Set anchor position and radius; alert if vessel drifts outside the watch circle

### Could Have

- [ ] **Bluetooth LE sensor support** — Connect directly to BLE marine sensors (wind, depth, GPS) without requiring a Signal K server
- [ ] **GRIB file viewer** — Import and display GRIB weather files for offshore passage planning
- [ ] **Weather along route** — Show forecast conditions at each waypoint for a planned departure time

## v0.3 — Smart Navigation & Community

Intelligent routing and community features that differentiate SeaScape.

### Must Have

- [ ] **Auto-routing** — Calculate routes that avoid land, shallow water (based on vessel draft), and restricted areas
- [ ] **Tide/current-aware routing** — Factor tidal gates and current streams into route timing and ETA
- [ ] **Departure planner** — Suggest optimal departure time based on tides, currents, weather, and daylight

### Should Have

- [ ] **Open community POI layer** — User-contributed anchorages, marinas, fuel docks, hazards with ratings and reviews (open data, not vendor-locked)
- [ ] **Route sharing** — Share routes via link or GPX with other SeaScape users
- [ ] **Logbook** — Automatic trip logging with track, conditions, and notes

### Could Have

- [ ] **Plugin/extension architecture** — Allow community-developed plugins to add chart sources, data overlays, instrument widgets, or integrations
- [ ] **Chart Store** — A commercial marketplace for subscribing to chart data from hydrographic offices and third-party providers (e.g. UKHO, LINZ, MarineCharts.io). Enables worldwide coverage beyond free NOAA data and provides a potential sustainability model for the project.
- [ ] **Multi-device sync** — Sync waypoints, routes, and settings across phone, tablet, and desktop
- [ ] **MOB (Man Overboard) alarm** — One-tap MOB button that marks position, sounds alarm, and provides bearing back to the MOB point

## Out of Scope (for now)

- Proprietary chart formats (S-63 encrypted, Navionics, C-MAP)
- Fishfinder/sonar integration
- Radar overlay
- Autopilot output/control
- Social features (seeing other boaters live on map)
- Catch logging / fishing-specific features
