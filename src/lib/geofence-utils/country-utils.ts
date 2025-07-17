import type {
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
  Polygon,
  MultiPolygon,
} from "geojson";

export interface CountryOption {
  label: string;
  iso: string;
}

/**
 * Loads country options from a GeoJSON file containing country boundaries.
 * Each country is represented by a label and an ISO 3166-1 alpha-3 code.
 * 
 * The file is located at /geo/countries.geojson in the public directory.
 */
export const getCountryOptions = async (): Promise<CountryOption[]> => {
  const res = await fetch("/geo/countries.geojson");
  const data = (await res.json()) as FeatureCollection<Geometry, GeoJsonProperties>;
  return data.features.map((f) => ({
    label: f.properties?.label_en,
    iso: f.properties?.iso3_code,
  }));
};

/**
 * Fetches the boundary of a country by its ISO 3166-1 alpha-3 code.
 * Uses the GeoBoundaries API to retrieve the boundary in GeoJSON format.
 */
export const fetchCountryBoundary = async (
  iso3: string
): Promise<Polygon | MultiPolygon | null> => {
  try {
    // Use a CORS proxy to avoid CORS issues with the GeoBoundaries API
    // FIXME: This is a temporary solution. In production, consider setting up own CORS proxy or using a server-side solution.
    const corsProxy = "https://corsproxy.io/?";
    const metaRes = await fetch(`${corsProxy}https://www.geoboundaries.org/api/current/gbOpen/${iso3}/ADM0`);
    const meta = await metaRes.json();

    const gjUrl = meta.gjDownloadURL;
    if (!gjUrl) throw new Error("No gjDownloadURL in API response");

    const geoRes = await fetch(`${corsProxy}${gjUrl}`);
    const geojson = (await geoRes.json()) as FeatureCollection;

    console.log('GeoJSON for country ', iso3, ': ', geojson);

    const supportedGeometry = geojson.features.find((f) =>
      f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon"
    );

    if (!supportedGeometry) throw new Error("No Polygon or MultiPolygon found");

    return supportedGeometry.geometry as Polygon | MultiPolygon;
  } catch (err) {
    console.error("Failed to fetch country boundary", err);
    return null;
  }
};
