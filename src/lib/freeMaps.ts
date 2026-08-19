export type LatLng = [number, number];

export type GeocodeResult = {
  label: string;
  coords: LatLng;
  city?: string;
  state?: string;
  country?: string;
};

export type RouteResult = {
  distanceKm: number;
  durationSeconds: number;
  line: LatLng[];
};

export const graphHopperApiKey = (import.meta.env.VITE_GRAPHHOPPER_API_KEY ?? '').trim();
export const routingConfigured = Boolean(graphHopperApiKey && !graphHopperApiKey.includes('your_'));

const graphHopperBase = 'https://graphhopper.com/api/1';

function apiError(payload: any, fallback: string) {
  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message;
  if (Array.isArray(payload?.hints) && payload.hints[0]?.message) return payload.hints[0].message;
  return fallback;
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  if (!routingConfigured) throw new Error('Add VITE_GRAPHHOPPER_API_KEY to your .env file.');
  const value = query.trim();
  if (value.length < 3) return [];

  const params = new URLSearchParams({
    q: value,
    locale: 'en',
    limit: '6',
    key: graphHopperApiKey,
  });

  const response = await fetch(`${graphHopperBase}/geocode?${params.toString()}`, { signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(apiError(payload, 'Place search is unavailable right now.'));

  return (payload?.hits ?? [])
    .filter((hit: any) => Number.isFinite(hit?.point?.lat) && Number.isFinite(hit?.point?.lng))
    .filter((hit: any) => {
      const countryCode = String(hit?.countrycode ?? hit?.country_code ?? '').toLowerCase();
      const country = String(hit?.country ?? '').toLowerCase();
      return !countryCode || countryCode === 'ph' || country.includes('philippines');
    })
    .slice(0, 6)
    .map((hit: any) => {
      const city = hit.city || hit.town || hit.village || hit.locality || '';
      const state = hit.state || '';
      const country = hit.country || 'Philippines';
      const parts = [hit.name, city && city !== hit.name ? city : '', state, country].filter(Boolean);
      return {
        label: parts.join(', '),
        coords: [Number(hit.point.lat), Number(hit.point.lng)] as LatLng,
        city,
        state,
        country,
      };
    });
}

export async function geocodeFirst(query: string, signal?: AbortSignal): Promise<GeocodeResult> {
  const results = await searchPlaces(query, signal);
  if (!results.length) throw new Error(`No Philippine place matched “${query.trim()}”. Try a more specific city or landmark.`);
  return results[0];
}

export async function findDrivingRoute(origin: LatLng, destination: LatLng, signal?: AbortSignal): Promise<RouteResult> {
  if (!routingConfigured) throw new Error('Add VITE_GRAPHHOPPER_API_KEY to your .env file.');

  const params = new URLSearchParams({
    profile: 'car',
    locale: 'en',
    calc_points: 'true',
    points_encoded: 'false',
    instructions: 'false',
    key: graphHopperApiKey,
  });
  params.append('point', `${origin[0]},${origin[1]}`);
  params.append('point', `${destination[0]},${destination[1]}`);

  const response = await fetch(`${graphHopperBase}/route?${params.toString()}`, { signal });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(apiError(payload, 'Unable to calculate that driving route right now.'));

  const path = payload?.paths?.[0];
  const coordinates = path?.points?.coordinates ?? [];
  if (!path || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('No drivable route was found between those places.');
  }

  return {
    distanceKm: Number(path.distance ?? 0) / 1000,
    durationSeconds: Number(path.time ?? 0) / 1000,
    line: coordinates.map((coordinate: number[]) => [Number(coordinate[1]), Number(coordinate[0])] as LatLng),
  };
}
