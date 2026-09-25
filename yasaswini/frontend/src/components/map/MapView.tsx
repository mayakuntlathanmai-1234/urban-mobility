import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Driver, RideType } from '../../types';

// Custom SVG Icons for Leaflet markers
const createCustomIcon = (type: 'pickup' | 'dest' | 'driver' | 'assigned', vehicleType?: RideType) => {
  let color = '#22c55e'; // Green pickup
  let emoji = '📍';
  let size = 32;

  if (type === 'dest') {
    color = '#ef4444'; // Red dest
    emoji = '🏁';
  } else if (type === 'driver') {
    color = '#3b82f6'; // Blue available driver
    emoji = vehicleType === 'BIKE' ? '🛵' : vehicleType === 'AUTO' ? '🛺' : vehicleType === 'SUV' ? '🚙' : '🚗';
    size = 28;
  } else if (type === 'assigned') {
    color = '#f59e0b'; // Amber assigned driver
    emoji = vehicleType === 'BIKE' ? '🛵' : vehicleType === 'AUTO' ? '🛺' : vehicleType === 'SUV' ? '🚙' : '🚗';
    size = 36;
  }

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${size * 0.5}px;
      transform: transition: all 0.3s ease;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

interface MapViewProps {
  pickup?: { lat: number; lng: number; address?: string } | null;
  destination?: { lat: number; lng: number; address?: string } | null;
  drivers?: Driver[];
  assignedDriver?: Driver | null;
  assignedDriverLoc?: { lat: number; lng: number } | null;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectionMode?: 'pickup' | 'dest' | null;
  height?: string;
}

// Controller component to smoothly re-center map when locations change
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1 });
  }, [center, zoom, map]);
  return null;
};

// Click Handler component for setting points directly on map
const MapClickHandler: React.FC<{ onSelect?: (lat: number, lng: number) => void }> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  pickup,
  destination,
  drivers = [],
  assignedDriver,
  assignedDriverLoc,
  onSelectLocation,
  selectionMode,
  height = '100%'
}) => {
  // Default Vijayawada, AP center
  const defaultCenter: [number, number] = [16.5062, 80.6480];
  const center: [number, number] = pickup
    ? [pickup.lat, pickup.lng]
    : defaultCenter;

  const polylineCoords: [number, number][] =
    pickup && destination
      ? [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng]
        ]
      : [];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        {/* Standard OpenStreetMap Basemap Tiles with Dark Filter - NO API KEY REQUIRED */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          className="dark-tiles"
        />

        <MapRecenter center={center} />
        <MapClickHandler onSelect={onSelectLocation} />

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={createCustomIcon('pickup')}>
            <Popup>
              <div className="p-1">
                <span className="font-bold text-emerald-400 block text-xs">🟢 Pickup Point</span>
                <span className="text-xs text-gray-200">{pickup.address || 'Selected Pickup'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={createCustomIcon('dest')}>
            <Popup>
              <div className="p-1">
                <span className="font-bold text-rose-400 block text-xs">🔴 Destination</span>
                <span className="text-xs text-gray-200">{destination.address || 'Selected Destination'}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{ color: '#10b981', weight: 4, opacity: 0.85, dashArray: '8, 8' }}
          />
        )}

        {/* Available Nearby Drivers */}
        {drivers.map(d => {
          if (assignedDriver && assignedDriver.id === d.id) return null; // Don't duplicate assigned driver
          return (
            <Marker
              key={d.id}
              position={[d.currentLat, d.currentLng]}
              icon={createCustomIcon('driver', d.vehicle?.type)}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <span className="font-bold text-blue-400 block">{d.user?.name || 'Available Driver'}</span>
                  <span>{d.vehicle?.make} {d.vehicle?.model} ({d.vehicle?.type})</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Assigned Driver Marker */}
        {assignedDriver && (
          <Marker
            position={[
              assignedDriverLoc?.lat || assignedDriver.currentLat,
              assignedDriverLoc?.lng || assignedDriver.currentLng
            ]}
            icon={createCustomIcon('assigned', assignedDriver.vehicle?.type)}
          >
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-amber-400 block">🚗 {assignedDriver.user?.name} (Assigned)</span>
                <span>{assignedDriver.vehicle?.make} {assignedDriver.vehicle?.model} &bull; {assignedDriver.vehicle?.plateNumber}</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Interactive Overlay Info */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center space-x-2 z-[1000] animate-bounce">
          <span>Click anywhere on map to set {selectionMode === 'pickup' ? 'Pickup' : 'Destination'}</span>
        </div>
      )}
    </div>
  );
};
