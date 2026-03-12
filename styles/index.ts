import googleEarth from "@/styles/google-earth.json";
import noaaEcdis from "@/styles/noaa-ecdis.json";
import noaaPaper from "@/styles/noaa-paper.json";
import openseamap from "@/styles/openseamap.json";
import type { StyleSpecification } from "@maplibre/maplibre-react-native";

export default [
  {
    id: "vectorcharts",
    name: "VectorCharts",
    style:
      "https://api.vectorcharts.com/api/v1/styles/base.json?token=7756d6ccad1c4656937e539bd3744dcd",
  },
  {
    id: "noaa-ecdis",
    name: "NOAA (ECDIS)",
    style: noaaEcdis as unknown as StyleSpecification,
  },
  {
    id: "noaa-paper",
    name: "NOAA (Paper Chart)",
    style: noaaPaper as unknown as StyleSpecification,
  },
  {
    id: "openseamap",
    name: "OpenSeaMap",
    style: openseamap as unknown as StyleSpecification,
  },
  {
    id: "google-earth",
    name: "Google Earth",
    style: googleEarth as unknown as StyleSpecification,
  },
];
