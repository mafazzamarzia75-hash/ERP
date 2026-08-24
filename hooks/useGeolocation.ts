"use client";

import { useEffect, useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  getCurrentPosition: () => Promise<void>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition = async () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setCoordinates({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? err.code === 1
            ? "Izin lokasi ditolak"
            : err.code === 2
            ? "Posisi tidak tersedia"
            : "Waktu habis"
          : "Gagal mendapatkan lokasi";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentPosition();
  }, []);

  return { coordinates, isLoading, error, getCurrentPosition };
}