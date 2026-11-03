import { useCallback, useState } from 'react';
import type { Location } from '../types/weather';

const GEO_TIMEOUT_MS = 10_000;

export function useGeolocation() {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Resolves to a Location for the device's position. Rejects with a user-readable message. */
  const locate = useCallback((): Promise<Location> => {
    setError(null);
    if (!('geolocation' in navigator)) {
      const message = 'Location is not supported on this device.';
      setError(message);
      return Promise.reject(new Error(message));
    }

    setIsLocating(true);
    return new Promise<Location>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setIsLocating(false);
          resolve({
            id: 'current-location',
            name: 'My location',
            country: '',
            latitude: coords.latitude,
            longitude: coords.longitude,
            isCurrentLocation: true,
          });
        },
        (geoError) => {
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Location permission was denied. You can still search for a city.'
              : 'Could not get your location. Please try again.';
          setIsLocating(false);
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  return { locate, isLocating, error };
}
