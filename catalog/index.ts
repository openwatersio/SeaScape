import googleEarth from "./google-earth.json";
import noaaRaster from "./noaa-raster";
import openseamap from "./openseamap.json";
import vectorcharts from "./vectorcharts.json";

export default async function loadCatalog() {
  return [await noaaRaster(), openseamap, googleEarth, vectorcharts];
}
