# Chart Sources

This document catalogs available chart sources for integration into SeaScape, covering basemaps, nautical overlays, official hydrographic office charts, and commercial options.

## Contents

- [Full Base Maps (PMTiles/MBTiles)](#full-base-maps-pmtilesmbtiles)
- [Nautical Overlays](#nautical-overlays)
- [Official Hydrographic Office Charts](#official-hydrographic-office-charts)
- [Community MBTiles Collections](#community-mbtiles-collections)
- [Bathymetry / Depth Data](#bathymetry--depth-data)
- [Commercial Chart APIs](#commercial-chart-apis)
- [DIY Generation](#diy-generation)
- [Summary: Recommended Options](#summary-recommended-options)

## Full Base Maps (PMTiles/MBTiles)

### Protomaps Basemap (PMTiles)

| Property            | Detail                                                                |
| ------------------- | --------------------------------------------------------------------- |
| Coverage            | Global (planet)                                                       |
| Format              | PMTiles (vector tiles)                                                |
| License             | ODbL (OpenStreetMap)                                                  |
| Data layers         | Roads, water polygons, land cover, buildings, labels                  |
| Planet size         | ~120 GB (daily builds); regional extracts much smaller                |
| Download            | https://maps.protomaps.com/builds/                                    |
| Self-hostable       | Yes — static file hosting (S3, Cloudflare, local); no server required |
| Update frequency    | Daily builds                                                          |
| MapLibre compatible | Yes, natively                                                         |

Designed for serverless, offline-first deployment via HTTP range requests. Regional extracts via `pmtiles extract` CLI. Not nautical-specific but excellent as a base layer.

### OpenFreeMap (OSM basemap)

| Property         | Detail                                                   |
| ---------------- | -------------------------------------------------------- |
| Coverage         | Global                                                   |
| Format           | Vector tiles (PMTiles/MBTiles downloads; hosted service) |
| License          | ODbL                                                     |
| Styles           | `https://tiles.openfreemap.org/styles/liberty`           |
| Self-hostable    | Yes — full deploy scripts available                      |
| API key required | No                                                       |
| Update frequency | Weekly                                                   |

Good alternative to Protomaps for a general basemap with ready-made styles.

---

## Nautical Overlays

### OpenSeaMap Seamark Overlay

| Property         | Detail                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Coverage         | Worldwide (crowd-sourced via OpenStreetMap seamark tags)                                                                    |
| Format           | Raster PNG tiles (overlay)                                                                                                  |
| License          | CC-BY-SA (ODbL for underlying OSM data)                                                                                     |
| Tile URL         | `http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png`                                                                       |
| API key required | No                                                                                                                          |
| Self-hostable    | Yes — generate from OSM PBF using tilemaker or [vectortiles-generator](https://github.com/OpenSeaMap/vectortiles-generator) |
| MBTiles download | Available for Europe (~1.6 GB) and worldwide at https://www.openseamap.org/index.php?id=kartendownload                      |
| Contents         | Buoys, beacons, lights, traffic separation, harbor info, depth soundings                                                    |

Transparent overlay only — needs a base layer. Coverage varies by region; best in Europe and North America. No pre-built PMTiles planet available; self-hosting requires OSM pipeline.

### OpenNauticalChart

| Property         | Detail                         |
| ---------------- | ------------------------------ |
| Coverage         | Worldwide (OSM-based)          |
| Format           | Raster web tiles               |
| License          | CC-BY-SA                       |
| URL              | https://opennauticalchart.org/ |
| API key required | No                             |

OSM-based nautical rendering combining land basemap with seamark overlay in a single layer.

---

## Official Hydrographic Office Charts

### NOAA (United States) ⭐ Best free official source

#### ENC (Electronic Navigational Charts, S-57 vector)

| Property         | Detail                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Coverage         | US coastal, Great Lakes, Puerto Rico, USVI, Hawaii, American Samoa, Guam, N. Marianas, inland waterways |
| Format           | S-57 (.000 files)                                                                                       |
| License          | Public domain                                                                                           |
| Download         | https://charts.noaa.gov/ENCs/ENCs.shtml                                                                 |
| Total size       | ~754 MB (all US ENCs)                                                                                   |
| Update frequency | Daily (weekday evenings)                                                                                |

#### MBTiles (offline download only)

| Property         | Detail                                               |
| ---------------- | ---------------------------------------------------- |
| Coverage         | Same as above (26+ regional sections)                |
| Format           | MBTiles (raster)                                     |
| License          | Public domain                                        |
| Download         | https://distribution.charts.noaa.gov/ncds/index.html |
| Update frequency | Weekly                                               |

Note: `tileservice.charts.noaa.gov` (old streaming CDN) is permanently down. The NCDS endpoint above is download-only; there is no streaming tile API from it.

#### Tile Services (online, WMS/WMTS)

The primary online service is hosted on ArcGIS. Two WMS flavors are available, both dynamically rendered at any zoom level:

| Service                          | Endpoint                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| WMS — IHO S-52 (ECDIS symbology) | `https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/MaritimeChartService/WMSServer`        |
| WMS — paper chart symbology      | `https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/NOAAChartDisplay/MapServer/exts/MaritimeChartService/WMSServer` |
| WMTS (pre-cached, zoom 0–7 only) | `https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/WMTS`                     |

**MapLibre integration:** Use the WMS endpoints with a `{bbox-epsg-3857}` raster source. The WMTS pre-cached tiles only cover zoom 0–7 (roughly state-level scale), so WMS is the correct choice for navigation use.

WMS source config (works in MapLibre style JSON directly):

```json
{
  "type": "raster",
  "tiles": [
    "https://gis.charttools.noaa.gov/arcgis/rest/services/MCS/ENCOnline/MapServer/exts/MaritimeChartService/WMSServer?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX={bbox-epsg-3857}&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=0,1,2,3,4,5,6,7,8,9,10,11,12&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE"
  ],
  "tileSize": 256,
  "attribution": "NOAA ENC Online"
}
```

Use `VERSION=1.1.1` with `SRS=` (not `CRS=`) — WMS 1.3.0 reverses axis order for EPSG:4326 and causes rendering issues. CORS headers are absent from NOAA's WMS responses, but this is not a problem in React Native (native HTTP stack bypasses CORS).

Available WMS layers (use `LAYERS=0` for all, or comma-separate individual layers):

| Layer # | Content                                                   |
| ------- | --------------------------------------------------------- |
| 0       | All layers (parent)                                       |
| 1       | Natural and man-made features, port features              |
| 2       | Depths, currents                                          |
| 3       | Seabed, obstructions, pipelines                           |
| 4       | Traffic routes                                            |
| 5       | Special areas                                             |
| 6       | Buoys, beacons, lights, fog signals, radar                |
| 7       | Services and small craft facilities                       |
| 8       | Data quality                                              |
| 9       | Low accuracy                                              |
| 10–12   | Additional info, shallow water pattern, overscale warning |

WMTS XYZ-compatible tile URL (zoom 0–7 only):

```
https://gis.charttools.noaa.gov/arcgis/rest/services/MarineChart_Services/NOAACharts/MapServer/tile/{z}/{y}/{x}
```

#### US Army Corps of Engineers Inland ENCs (IENC)

| Property | Detail                                 |
| -------- | -------------------------------------- |
| Coverage | US inland waterways (rivers, channels) |
| Format   | S-57 IENC                              |
| License  | Free                                   |
| Download | http://ienccloud.us/#DataDownload      |

### New Zealand (LINZ)

| Property         | Detail                                                   |
| ---------------- | -------------------------------------------------------- |
| Coverage         | NZ waters, SW Pacific, parts of Antarctica               |
| Format           | S-57 (free) or S-63 (encrypted, via ENC Service)         |
| License          | Free for recreational/non-commercial                     |
| Download         | https://encservice.linz.govt.nz/ (registration required) |
| Catalog          | https://charts.linz.govt.nz/charts/enc                   |
| Update frequency | Weekly (email notifications available)                   |

Full dataset downloadable in one archive.

### Canada (CHS — Canadian Hydrographic Service)

| Property | Detail                                                                      |
| -------- | --------------------------------------------------------------------------- |
| Coverage | Canadian coastal and inland waters                                          |
| Format   | S-57 (paid download) / WMS (free online viewing)                            |
| License  | Commercial download; free WMS view-only                                     |
| Dataset  | https://open.canada.ca/data/en/dataset/12b769c8-48b8-4562-80fb-4a2e5ee9b45b |

### Brazil (Marinha do Brasil / CHM)

| Property     | Detail                                                       |
| ------------ | ------------------------------------------------------------ |
| Coverage     | Brazil coastal waters                                        |
| Format       | S-57 ENC + raster RNC                                        |
| License      | Free                                                         |
| ENC download | https://www.marinha.mil.br/chm/dados-do-segnav/cartas-ienc   |
| RNC download | https://www.marinha.mil.br/chm/dados-do-segnav/cartas-raster |

### Australia (Australian Hydrographic Service)

| Property     | Detail                                         |
| ------------ | ---------------------------------------------- |
| Coverage     | Australia, Papua New Guinea, Solomon Islands   |
| Format       | S-63 (encrypted)                               |
| License      | Commercial subscription                        |
| Portal       | https://www.hydro.gov.au/                      |
| Distributors | Via UKHO AVCS, PRIMAR, authorized distributors |

### Norway (Kartverket)

| Property | Detail                                                                       |
| -------- | ---------------------------------------------------------------------------- |
| Coverage | Norwegian waters                                                             |
| Format   | S-63 (encrypted)                                                             |
| License  | Subscription via PRIMAR distributors                                         |
| Info     | https://www.kartverket.no/en/at-sea/nautical-charts/elektroniske-sjokart-enc |

### South China Sea (EAHC)

| Property | Detail                           |
| -------- | -------------------------------- |
| Coverage | South China Sea region           |
| Format   | S-57                             |
| License  | Free                             |
| Download | http://scsenc.eahc.asia/main.php |

### Argentina (SHOA)

| Property | Detail                                           |
| -------- | ------------------------------------------------ |
| Coverage | Argentina coastal                                |
| Format   | Raster (RNC)                                     |
| License  | Free                                             |
| Download | http://www.hidro.gov.ar/nautica/CNRaster.asp?r=1 |

### Peru (DIHIDRONAV)

| Property | Detail                               |
| -------- | ------------------------------------ |
| Coverage | Peru coastal                         |
| Format   | Raster                               |
| License  | Free                                 |
| Download | https://www.dhn.mil.pe/cartas_raster |

### European Inland Waterways (EURIS)

| Property | Detail                                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Coverage | Austria, Belgium, Bulgaria, Croatia, Czech Republic, France, Germany, Hungary, Luxembourg, Netherlands, Romania, Serbia, Slovakia |
| Format   | IENC (S-57 for inland waterways)                                                                                                  |
| License  | Free                                                                                                                              |
| Portal   | https://www.eurisportal.eu/                                                                                                       |

Also available via the [OpenCPN chart catalogs](https://chartcatalogs.github.io/) XML files.

---

## Community MBTiles Collections

These are crowd-sourced MBTiles assembled by cruising sailors, primarily derived from ArcGIS/Bing/Google satellite and Navionics imagery. Useful for remote areas with no official chart coverage. Note: upstream satellite imagery ToS may limit commercial use.

### The Chart Locker (Bruce Balan)

| Property    | Detail                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Coverage    | French Polynesia, South Pacific, Japan, NZ, Australia East, Caribbean, Bahamas, Atlantic islands, Mexico, Central America, Mediterranean, Taiwan |
| Format      | MBTiles (raster, satellite-derived)                                                                                                              |
| License     | Free for personal use                                                                                                                            |
| Download    | https://chartlocker.brucebalan.com/ (hosted on MediaFire)                                                                                        |
| Zoom levels | Typically Z8–Z18                                                                                                                                 |
| File sizes  | 70 MB – 9+ GB per region                                                                                                                         |

### SV Ocelot Charts (John & Sue Hacking)

| Property    | Detail                                                                                                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Coverage    | Caribbean, Pacific (Galapagos, French Polynesia, Cook Islands, Fiji, Micronesia), SE Asia (Indonesia, Philippines, Malaysia, Thailand, Sri Lanka, Maldives), Indian Ocean (Seychelles, Madagascar, Kenya, Tanzania), Red Sea |
| Format      | MBTiles (ArcGIS, Bing, Google, C-MAP, Navionics-derived)                                                                                                                                                                     |
| License     | Free for personal use                                                                                                                                                                                                        |
| Download    | https://hackingfamily.com/Cruise_Info/Equipment/Chart_Downloads.htm (hosted on Mega.nz)                                                                                                                                      |
| Zoom levels | Z10–Z18                                                                                                                                                                                                                      |
| File sizes  | < 1 MB – 17+ GB                                                                                                                                                                                                              |

### Sailing Grace Charts

| Property | Detail                                                 |
| -------- | ------------------------------------------------------ |
| Coverage | Mediterranean, US/Canada West Coast (Alaska to Mexico) |
| Format   | MBTiles (Z10–Z18)                                      |
| Download | https://sailingamazinggrace.com/charts                 |

### Soggy Paws Charts

| Property | Detail                   |
| -------- | ------------------------ |
| Coverage | Red Sea and others       |
| Format   | MBTiles and KAP          |
| Download | https://svsoggypaws.com/ |

---

## Bathymetry / Depth Data

### GEBCO (General Bathymetric Chart of the Oceans) ⭐ Best free global bathymetry

| Property          | Detail                                             |
| ----------------- | -------------------------------------------------- |
| Coverage          | Global ocean depths                                |
| Format            | GeoTIFF / NetCDF (must convert to MBTiles/PMTiles) |
| License           | Public domain                                      |
| Resolution        | 15 arc-second grid (~450 m at equator)             |
| Download          | https://download.gebco.net/                        |
| Update frequency  | Annual (GEBCO_2025 current)                        |
| MBTiles converter | https://github.com/acalcutt/GEBCO_to_MBTiles       |

### MapTiler Ocean

| Property      | Detail                                                                             |
| ------------- | ---------------------------------------------------------------------------------- |
| Coverage      | Worldwide                                                                          |
| Format        | Vector tiles (MapLibre-compatible)                                                 |
| License       | Commercial (API key required)                                                      |
| Layers        | Depth polygons (0 to −12,000m), depth contours, underwater landforms, ocean labels |
| Tile URL      | `https://api.maptiler.com/tiles/ocean/{z}/{x}/{y}.pbf?key={KEY}`                   |
| Self-hostable | Via MapTiler Server (on-premises, paid)                                            |
| Explorer      | https://cloud.maptiler.com/tiles/ocean/                                            |

---

## Commercial Chart APIs

### O-Charts (oeSENC / oeRNC)

| Property             | Detail                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Coverage             | ~58 regional sets: UK, Western Europe, Baltic, Mediterranean, Caribbean, N. America, Australia/NZ, SE Asia, South America |
| Format               | oeSENC (OpenCPN-encrypted S-57) and oeRNC (encrypted raster)                                                              |
| License              | Commercial per-device license                                                                                             |
| Pricing              | €14–€82 per regional set (e.g., Netherlands €14.75, UK + Atlantic France €29.50, Indonesia €82)                           |
| Store                | https://o-charts.org/shop/en/8-oesenc                                                                                     |
| Update frequency     | Weekly (DE, FR, NO) to quarterly                                                                                          |
| Special requirements | OpenCPN with O-Charts plugin; device-locked                                                                               |
| Source               | Data licensed directly from national hydrographic offices                                                                 |

Note: Format is currently OpenCPN-specific; not directly usable in a MapLibre-based app without format conversion or a separate renderer.

### UKHO AVCS (Admiralty Vector Chart Service)

| Property      | Detail                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| Coverage      | 15,800+ ENCs from hydrographic offices worldwide (most comprehensive global coverage)      |
| Format        | S-63 (encrypted S-57)                                                                      |
| License       | Commercial subscription (3, 6, 12-month)                                                   |
| Trial FTP     | `ftp://ukho.gov.uk` — user: `ukhopublic`, password: `Public12345` (south coast of England) |
| Discovery API | https://www.api.gov.uk/ukho/avcs-online-discovery-api/ (free trial, 2,000 calls/day)       |
| Full service  | https://www.admiralty.co.uk/charts/digital-charts/admiralty-vector-chart-service           |

### Navionics / Garmin Marine Charts

| Property         | Detail                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Coverage         | Worldwide (daily updated from HO sources + community sonar)       |
| Format           | Proprietary raster/vector tiles                                   |
| License          | Standard (free, view-only embed); Enhanced (paid, commercial use) |
| API key required | Yes                                                               |
| Developer portal | https://developer.garmin.com/marine-charts/                       |
| Self-hostable    | No                                                                |
| Notable feature  | SonarChart HD community-sourced bathymetry                        |

### C-MAP (Navico)

| Property         | Detail                               |
| ---------------- | ------------------------------------ |
| Coverage         | Worldwide                            |
| Format           | Raster or vector tiles               |
| License          | Standard (free, limited); Commercial |
| Developer portal | https://developer.navico.com/Apis    |
| Self-hostable    | No                                   |

### PRIMAR (Nordic/Baltic RENC)

| Property | Detail                                                              |
| -------- | ------------------------------------------------------------------- |
| Coverage | Nordic and Baltic seas + member nations                             |
| Format   | S-63 (encrypted ENC)                                                |
| License  | Subscription via authorized distributors (NAVTOR, ChartWorld, etc.) |
| Portal   | https://www.primar.org/                                             |

---

## OpenCPN Chart Catalog System

OpenCPN uses XML catalog files to manage chart downloads. The community-maintained catalog repo at [chartcatalogs/catalogs](https://github.com/chartcatalogs/catalogs) and [chartcatalogs.github.io](https://chartcatalogs.github.io/) contains direct download links for free charts.

Key catalog files:

- NOAA ENCs: `https://raw.githubusercontent.com/chartcatalogs/catalogs/master/NOAA_ENCs_Catalog.xml`
- NOAA MBTiles: `https://raw.githubusercontent.com/chartcatalogs/catalogs/master/NOAA_MBTiles_Catalog.xml`
- GSHHG Basemap: `https://raw.githubusercontent.com/chartcatalogs/catalogs/master/GSHHG_Catalog.xml`
- NZ ENCs, Brazil RNC/ENC, and European Inland catalogs also included

See [OpenCPN chart sources](https://www.opencpn.org/OpenCPN/info/chartsource.html) for the full list.

The [SignalK charts-plugin](https://github.com/SignalK/charts-plugin) consumes a similar catalog format and supports serving locally installed MBTiles, S-57, and GeoTIFF charts over a REST API to connected chart plotters.

---

## DIY Generation

### OSM + Tilemaker (Seamark Vector Tiles)

Generate vector tiles including seamark data from OpenStreetMap PBF files using [tilemaker](https://tilemaker.org/). Configure custom Lua/JSON profiles to extract seamark objects (buoys, beacons, lights, etc.). Output to MBTiles or PMTiles. Planet PBF available from Geofabrik or via Overpass API.

### NOAA ENC → MBTiles

Download all US ENCs (~754 MB S-57) from https://charts.noaa.gov/ENCs/ENCs.shtml and render to raster tiles using GDAL/QGIS/GeoServer → MBTiles.

### GEBCO → MBTiles

Download GeoTIFF from https://download.gebco.net/ and convert using https://github.com/acalcutt/GEBCO_to_MBTiles.

### Protomaps Regional Extract

```sh
pmtiles extract https://build.protomaps.com/20240101.pmtiles region.pmtiles \
  --bbox="-180,-90,180,90"
```

Host the extracted PMTiles file on any static storage (S3, Cloudflare R2, local).

---

## Summary: Recommended Options

| Use Case                            | Recommended Source                           | License               | Notes                                                         |
| ----------------------------------- | -------------------------------------------- | --------------------- | ------------------------------------------------------------- |
| **General basemap (bundled)**       | Protomaps PMTiles                            | ODbL                  | Extract regional subset; static file hosting; MapLibre native |
| **Nautical seamark overlay**        | OpenSeaMap tiles                             | CC-BY-SA              | No API key; MBTiles download for offline                      |
| **US official charts**              | NOAA MBTiles or ENC                          | Public domain         | Free, downloadable, weekly updates                            |
| **Global official ENC coverage**    | O-Charts (commercial)                        | Per-device commercial | Only practical route outside US/NZ                            |
| **Global depth contours (online)**  | MapTiler Ocean                               | Commercial            | API key required                                              |
| **Global depth contours (offline)** | GEBCO → MBTiles                              | Public domain         | Convert from GeoTIFF; annual updates                          |
| **NZ charts**                       | LINZ ENCs                                    | Free non-commercial   | Registration required                                         |
| **Self-hosted full stack**          | Protomaps + OpenSeaMap tilemaker + NOAA ENCs | Mixed open            | DIY pipeline, no recurring costs                              |
