import { useState, useCallback } from 'react';

/**
 * LocationIQ API Key
 * In Produktion sollte dies über Umgebungsvariablen konfiguriert werden
 */
const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY || '';

const BASE_URL = 'https://api.locationiq.com/v1';
const TILES_URL = 'https://tiles.locationiq.com/v3';

/**
 * useLocationIQ - Hook für LocationIQ API Interaktionen
 *
 * Bietet Autocomplete-Suche und Geocoding-Funktionen
 */
export const useLocationIQ = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sucht nach Adressen basierend auf Eingabe (Autocomplete)
   * @param {string} query - Suchbegriff
   * @param {Object} options - Optionale Parameter
   * @returns {Promise<Array>} - Liste von Adressvorschlägen
   */
  const searchAddress = useCallback(async (query, options = {}) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return [];
    }

    if (!LOCATIONIQ_API_KEY) {
      setError('LocationIQ API Key nicht konfiguriert');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        key: LOCATIONIQ_API_KEY,
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: options.limit || 5,
        countrycodes: options.countrycodes || 'de,at,ch', // DACH-Region
        ...options
      });

      const response = await fetch(`${BASE_URL}/autocomplete?${params}`);

      if (!response.ok) {
        throw new Error(`API Fehler: ${response.status}`);
      }

      const data = await response.json();

      // Formatiere die Ergebnisse
      const formattedSuggestions = data.map(item => ({
        id: item.place_id,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: {
          street: item.address?.road || '',
          houseNumber: item.address?.house_number || '',
          postalCode: item.address?.postcode || '',
          city: item.address?.city || item.address?.town || item.address?.village || '',
          state: item.address?.state || '',
          country: item.address?.country || ''
        }
      }));

      setSuggestions(formattedSuggestions);
      return formattedSuggestions;
    } catch (err) {
      setError(err.message);
      setSuggestions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Geocodiert eine Adresse (Adresse → Koordinaten)
   * @param {string} address - Vollständige Adresse
   * @returns {Promise<Object|null>} - Koordinaten und Details
   */
  const geocodeAddress = useCallback(async (address) => {
    if (!address || !LOCATIONIQ_API_KEY) return null;

    try {
      const params = new URLSearchParams({
        key: LOCATIONIQ_API_KEY,
        q: address,
        format: 'json',
        addressdetails: 1
      });

      const response = await fetch(`${BASE_URL}/search?${params}`);

      if (!response.ok) return null;

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          displayName: result.display_name
        };
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Reverse Geocoding (Koordinaten → Adresse)
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @returns {Promise<Object|null>} - Adressdetails
   */
  const reverseGeocode = useCallback(async (lat, lon) => {
    if (!LOCATIONIQ_API_KEY) return null;

    try {
      const params = new URLSearchParams({
        key: LOCATIONIQ_API_KEY,
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: 1
      });

      const response = await fetch(`${BASE_URL}/reverse?${params}`);

      if (!response.ok) return null;

      const data = await response.json();

      return {
        displayName: data.display_name,
        address: {
          street: data.address?.road || '',
          houseNumber: data.address?.house_number || '',
          postalCode: data.address?.postcode || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          country: data.address?.country || ''
        }
      };
    } catch {
      return null;
    }
  }, []);

  /**
   * Generiert eine statische Karten-URL
   * @param {number} lat - Breitengrad
   * @param {number} lon - Längengrad
   * @param {Object} options - Optionen (zoom, width, height, markers)
   * @returns {string} - URL zur statischen Karte
   */
  const getStaticMapUrl = useCallback((lat, lon, options = {}) => {
    if (!LOCATIONIQ_API_KEY || !lat || !lon) return null;

    const {
      zoom = 14,
      width = 400,
      height = 200,
      marker = true
    } = options;

    const params = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      center: `${lat},${lon}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      format: 'png',
      maptype: 'roadmap'
    });

    if (marker) {
      params.append('markers', `icon:large-red-cutout|${lat},${lon}`);
    }

    return `${BASE_URL}/staticmap?${params}`;
  }, []);

  /**
   * Gibt die Tile-URL für interaktive Karten zurück (z.B. für Leaflet)
   * @returns {string} - Tile URL Template
   */
  const getTileUrl = useCallback(() => {
    if (!LOCATIONIQ_API_KEY) return null;
    return `${TILES_URL}/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`;
  }, []);

  /**
   * Leert die Vorschlagsliste
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    // State
    suggestions,
    isLoading,
    error,

    // Methoden
    searchAddress,
    geocodeAddress,
    reverseGeocode,
    getStaticMapUrl,
    getTileUrl,
    clearSuggestions,

    // API Key Status
    isConfigured: !!LOCATIONIQ_API_KEY
  };
};

export default useLocationIQ;
