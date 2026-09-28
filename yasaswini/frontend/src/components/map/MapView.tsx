import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Driver } from '../../types';

export interface MapViewProps {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  driverLat?: number;
  driverLng?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
  className?: string;

  // Additional props from various dashboards
  pickup?: { lat: number; lng: number; address?: string } | null;
  destination?: { lat: number; lng: number; address?: string } | null;
  drivers?: Driver[];
  assignedDriver?: Driver | null;
  assignedDriverLoc?: { lat: number; lng: number } | null;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectionMode?: 'pickup' | 'destination' | null;
  height?: string;
}

const pickupIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pickup"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-dest"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const driverIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-driver"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const MapBoundsHandler: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  driverLat,
  driverLng,
  pickupAddress,
  dropoffAddress,
  className = 'h-[400px]',
  pickup,
  destination,
  drivers = [],
  assignedDriver,
  assignedDriverLoc,
  height,
}) => {
  const effectivePickupLat = pickupLat ?? pickup?.lat ?? 12.9716;
  const effectivePickupLng = pickupLng ?? pickup?.lng ?? 77.5946;
  const effectivePickupAddress = pickupAddress ?? pickup?.address ?? 'Pickup Location';

  const effectiveDropoffLat = dropoffLat ?? destination?.lat;
  const effectiveDropoffLng = dropoffLng ?? destination?.lng;
  const effectiveDropoffAddress = dropoffAddress ?? destination?.address ?? 'Destination';

  const effectiveDriverLat = driverLat ?? assignedDriverLoc?.lat ?? assignedDriver?.currentLat;
  const effectiveDriverLng = driverLng ?? assignedDriverLoc?.lng ?? assignedDriver?.currentLng;

  const points: [number, number][] = [];
  if (effectivePickupLat && effectivePickupLng) points.push([effectivePickupLat, effectivePickupLng]);
  if (effectiveDropoffLat && effectiveDropoffLng) points.push([effectiveDropoffLat, effectiveDropoffLng]);
  if (effectiveDriverLat && effectiveDriverLng) points.push([effectiveDriverLat, effectiveDriverLng]);

  drivers.forEach((d) => {
    if (d.currentLat && d.currentLng) {
      points.push([d.currentLat, d.currentLng]);
    }
  });

  const defaultCenter: [number, number] = [effectivePickupLat, effectivePickupLng];

  const containerStyle = height ? `w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft` : `relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft ${className}`;

  return (
    <div className={containerStyle} style={height ? { height } : undefined}>
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Marker */}
        {effectivePickupLat && effectivePickupLng && (
          <Marker position={[effectivePickupLat, effectivePickupLng]} icon={pickupIcon}>
            <Popup className="font-sans text-xs font-semibold">
              📍 <b>Pickup:</b> {effectivePickupAddress}
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {effectiveDropoffLat && effectiveDropoffLng && (
          <Marker position={[effectiveDropoffLat, effectiveDropoffLng]} icon={destIcon}>
            <Popup className="font-sans text-xs font-semibold">
              🏁 <b>Destination:</b> {effectiveDropoffAddress}
            </Popup>
          </Marker>
        )}

        {/* Assigned Driver Marker */}
        {effectiveDriverLat && effectiveDriverLng && (
          <Marker position={[effectiveDriverLat, effectiveDriverLng]} icon={driverIcon}>
            <Popup className="font-sans text-xs font-semibold">
              🚗 <b>Driver Location</b> ({assignedDriver?.name || 'Assigned Driver'})
            </Popup>
          </Marker>
        )}

        {/* Active Nearby Drivers */}
        {drivers.map((drv) => {
          if (!drv.currentLat || !drv.currentLng || drv.id === assignedDriver?.id) return null;
          return (
            <Marker key={drv.id} position={[drv.currentLat, drv.currentLng]} icon={driverIcon}>
              <Popup className="font-sans text-xs font-semibold">
                🚗 <b>Driver:</b> {drv.name}
              </Popup>
            </Marker>
          );
        })}

        {/* Polyline Route */}
        {effectivePickupLat && effectivePickupLng && effectiveDropoffLat && effectiveDropoffLng && (
          <Polyline
            positions={[
              [effectivePickupLat, effectivePickupLng],
              [effectiveDropoffLat, effectiveDropoffLng],
            ]}
            pathOptions={{ color: '#2563EB', weight: 4, dashArray: '8, 8', opacity: 0.8 }}
          />
        )}

        {points.length > 1 && <MapBoundsHandler points={points} />}
      </MapContainer>
    </div>
  );
};
