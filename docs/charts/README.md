# Charts

Open Waters supports browsing, installing, and managing nautical chart sources from a built-in catalog or by adding custom sources manually.

## Features

- **Chart Catalog** — Browse a curated catalog of chart sources, preview coverage areas, and install with a tap. See the [Chart Catalog spec](catalog-spec.md) for the catalog format.
- **Custom Sources** — Add your own chart sources by providing a tile URL, MapLibre style URL, or importing a local file.
- **Multiple Charts** — Switch between installed charts or combine sources from different providers.
- **Offline Charts** — Import MBTiles or PMTiles files for full offline use without any network connection.

## Supported Source Types

| Type        | Description                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Style**   | A complete map style supporting vector tiles, custom symbology, and interactive features. Uses the [MapLibre style spec](https://maplibre.org/maplibre-style-spec/) format. |
| **Raster**  | XYZ (`{z}/{x}/{y}`) or WMS (`{bbox-epsg-3857}`) tile URL templates. Covers most web-based chart tile services.                                                              |
| **MBTiles** | A self-contained [MBTiles](https://github.com/mapbox/mbtiles-spec) SQLite file. Fully offline — no network required after import.                                           |
| **PMTiles** | A single-file [PMTiles](https://github.com/protomaps/PMTiles) archive. Supports both local and remote access with HTTP range requests.                                      |

## Planned Formats

The following chart formats are not yet supported but are on the roadmap:

- **S-57 ENC** — The current international standard for Electronic Navigational Charts published by hydrographic offices worldwide (IHO S-57).
- **S-100 / S-101** — The next-generation IHO standard for ENCs, replacing S-57 with richer data models and portrayal rules.
- **BSB/KAP** — Georeferenced raster chart images used by NOAA and other agencies. Common in legacy chart plotters.

## Catalog

The chart catalog is a JSON format for describing collections of chart sources. It enables browsing, installing, and updating chart data from a curated list of providers.

See the [Chart Catalog spec](catalog-spec.md) for the full format specification.
