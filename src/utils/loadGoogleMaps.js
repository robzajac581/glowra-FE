import { GOOGLE_MAPS_API_KEY } from '../config/api';

const SCRIPT_ID = 'glowra-google-maps-places-js';

let mapsLoadPromise = null;

/**
 * Loads the Google Maps JavaScript API with the Places library (singleton).
 * Resolves immediately if Places is already available, or if no API key is set.
 */
export function loadGoogleMapsPlaces() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.resolve();
  }
  if (mapsLoadPromise) {
    return mapsLoadPromise;
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    mapsLoadPromise = new Promise((resolve, reject) => {
      let attempts = 0;
      const t = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(t);
          resolve();
        } else if (attempts++ > 200) {
          clearInterval(t);
          mapsLoadPromise = null;
          reject(new Error('Google Maps Places did not become available'));
        }
      }, 50);
    });
    return mapsLoadPromise;
  }

  mapsLoadPromise = new Promise((resolve, reject) => {
    const cbName = `__glowraMapsCb_${Math.random().toString(36).slice(2)}`;
    window[cbName] = () => {
      delete window[cbName];
      if (window.google?.maps?.places) {
        resolve();
      } else {
        mapsLoadPromise = null;
        reject(new Error('Google Maps Places failed to initialize'));
      }
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY
    )}&libraries=places&callback=${cbName}`;
    script.onerror = () => {
      mapsLoadPromise = null;
      delete window[cbName];
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}
