import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type LatLng = [number, number];

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitRoute({ points }: { points: LatLng[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [38, 38] });
    } else if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [map, points]);

  return null;
}

export default function RouteMap({
  origin,
  destination,
  route,
}: {
  origin: LatLng | null;
  destination: LatLng | null;
  route: LatLng[];
}) {
  const defaultCenter: LatLng = [13.7565, 121.0583];
  const points = route.length > 0 ? route : [origin, destination].filter(Boolean) as LatLng[];

  return (
    <div className="route-map-wrap">
      <MapContainer center={origin ?? defaultCenter} zoom={9} scrollWheelZoom={false} className="route-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {origin && <Marker position={origin} icon={markerIcon} />}
        {destination && <Marker position={destination} icon={markerIcon} />}
        {route.length > 1 && <Polyline positions={route} pathOptions={{ weight: 5, opacity: 0.82 }} />}
        <FitRoute points={points} />
      </MapContainer>
    </div>
  );
}
