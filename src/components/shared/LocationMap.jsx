import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useLocationIQ } from '../../hooks/useLocationIQ';

/**
 * LocationMap - Zeigt eine statische Karte für einen Standort
 *
 * @param {Object} props
 * @param {number} props.lat - Breitengrad
 * @param {number} props.lon - Längengrad
 * @param {string} props.address - Adresse (für Fallback-Anzeige)
 * @param {number} props.zoom - Zoom-Level (1-18, Standard: 14)
 * @param {number} props.width - Breite in Pixeln
 * @param {number} props.height - Höhe in Pixeln
 * @param {boolean} props.showMarker - Marker anzeigen
 * @param {boolean} props.linkToMaps - Link zu Google Maps anzeigen
 * @param {string} props.className - Zusätzliche CSS-Klassen
 */
const LocationMap = ({
  lat,
  lon,
  address = '',
  zoom = 14,
  width = 400,
  height = 200,
  showMarker = true,
  linkToMaps = true,
  className = ''
}) => {
  const { getStaticMapUrl, isConfigured } = useLocationIQ();

  // Keine Koordinaten vorhanden
  if (!lat || !lon) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Kein Standort verfügbar</p>
        </div>
      </div>
    );
  }

  // API nicht konfiguriert - Fallback
  if (!isConfigured) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500 p-4">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">{address || `${lat.toFixed(4)}, ${lon.toFixed(4)}`}</p>
          {linkToMaps && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs mt-2 inline-flex items-center gap-1"
            >
              In Google Maps öffnen <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    );
  }

  const mapUrl = getStaticMapUrl(lat, lon, {
    zoom,
    width,
    height,
    marker: showMarker
  });

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <img
        src={mapUrl}
        alt={address || 'Standort'}
        width={width}
        height={height}
        className="w-full h-auto"
        loading="lazy"
      />

      {/* Overlay mit Link */}
      {linkToMaps && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end justify-end p-2"
          title="In Google Maps öffnen"
        >
          <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1 shadow">
            <ExternalLink className="w-3 h-3" /> Öffnen
          </span>
        </a>
      )}
    </div>
  );
};

/**
 * LocationMapCompact - Kompakte Kartenansicht für Listen
 */
export const LocationMapCompact = ({ lat, lon, address, size = 80 }) => {
  const { getStaticMapUrl, isConfigured } = useLocationIQ();

  if (!lat || !lon || !isConfigured) {
    return (
      <div
        className="bg-gray-100 rounded flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <MapPin className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  const mapUrl = getStaticMapUrl(lat, lon, {
    zoom: 13,
    width: size * 2, // Retina
    height: size * 2,
    marker: true
  });

  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lon}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded overflow-hidden hover:ring-2 ring-blue-500 transition-shadow"
      style={{ width: size, height: size }}
    >
      <img
        src={mapUrl}
        alt={address || 'Standort'}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </a>
  );
};

export default LocationMap;
