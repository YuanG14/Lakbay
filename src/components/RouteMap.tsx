import { useEffect, useRef, useState } from 'react';
import { MapPinned } from 'lucide-react';
import maplibregl, { LngLatBoundsLike, Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LatLng } from '../lib/freeMaps';

export type { LatLng } from '../lib/freeMaps';

const defaultCenter: [number, number] = [121.0583, 13.7565];

export default function RouteMap({
  origin,
  destination,
  route,
}: {
  origin: LatLng | null;
  destination: LatLng | null;
  route: LatLng[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    try {
      mapRef.current = new maplibregl.Map({
        container: hostRef.current,
        center: defaultCenter,
        zoom: 8.2,
        attributionControl: false,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
              maxzoom: 19,
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
      });
      mapRef.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      mapRef.current.on('error', (event) => {
        const message = (event?.error as Error | undefined)?.message;
        if (message) setLoadError(message);
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'The map could not be loaded.');
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (map.getLayer('lakbay-route')) map.removeLayer('lakbay-route');
      if (map.getSource('lakbay-route')) map.removeSource('lakbay-route');

      if (route.length > 1) {
        map.addSource('lakbay-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: route.map(([lat, lng]) => [lng, lat]) },
          },
        });
        map.addLayer({
          id: 'lakbay-route',
          type: 'line',
          source: 'lakbay-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#0f6b51', 'line-width': 6, 'line-opacity': 0.92 },
        });
      }

      if (origin) {
        markersRef.current.push(new maplibregl.Marker({ color: '#0f6b51' }).setLngLat([origin[1], origin[0]]).setPopup(new maplibregl.Popup({ offset: 20 }).setText('Origin')).addTo(map));
      }
      if (destination) {
        markersRef.current.push(new maplibregl.Marker({ color: '#183d30' }).setLngLat([destination[1], destination[0]]).setPopup(new maplibregl.Popup({ offset: 20 }).setText('Destination')).addTo(map));
      }

      const points = route.length ? route : [origin, destination].filter(Boolean) as LatLng[];
      if (!points.length) return;
      if (points.length === 1) {
        map.flyTo({ center: [points[0][1], points[0][0]], zoom: 13 });
      } else {
        const bounds = points.reduce((acc, [lat, lng]) => acc.extend([lng, lat]), new maplibregl.LngLatBounds());
        map.fitBounds(bounds as LngLatBoundsLike, { padding: 54, duration: 650 });
      }
    };

    if (map.loaded()) update();
    else map.once('load', update);
  }, [origin, destination, route]);

  if (loadError) {
    return <div className="google-map-setup error"><MapPinned size={26}/><strong>Map tiles could not load</strong><span>{loadError}</span></div>;
  }

  return <div className="route-map-wrap"><div className="route-map google-route-map free-route-map" ref={hostRef}/></div>;
}
