import React, { useState, useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';

export default function ResourceMarker({ resource }) {
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const geocodeAddress = async (address) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data && data[0]) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
      return null;
    };

    geocodeAddress(resource.address).then(setCoords);
  }, [resource.address]);

  if (!coords) return null;

  return (
    <Marker position={coords}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-sm">{resource.title}</h3>
          <p className="text-xs text-gray-600">{resource.category}</p>
          {resource.phone && <p className="text-xs mt-1">{resource.phone}</p>}
        </div>
      </Popup>
    </Marker>
  );
}