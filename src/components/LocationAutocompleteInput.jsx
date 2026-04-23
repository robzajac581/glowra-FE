import React, { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config/api';
import { loadGoogleMapsPlaces } from '../utils/loadGoogleMaps';

/**
 * Location text field with Google Places Autocomplete when an API key is configured.
 * Falls back to a plain controlled input when the key is missing or the script fails to load.
 */
const LocationAutocompleteInput = ({
  value,
  onChange,
  onPlaceResolved,
  placeholder,
  className,
  id,
}) => {
  const inputRef = useRef(null);
  const onPlaceResolvedRef = useRef(onPlaceResolved);
  const [mapsReady, setMapsReady] = useState(() =>
    Boolean(typeof window !== 'undefined' && window.google?.maps?.places)
  );

  useEffect(() => {
    onPlaceResolvedRef.current = onPlaceResolved;
  }, [onPlaceResolved]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      return undefined;
    }
    let cancelled = false;
    loadGoogleMapsPlaces()
      .then(() => {
        if (!cancelled && window.google?.maps?.places) {
          setMapsReady(true);
        }
      })
      .catch((err) => {
        console.error('Google Maps could not load:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapsReady || !GOOGLE_MAPS_API_KEY || !inputRef.current) {
      return undefined;
    }
    const input = inputRef.current;
    const ac = new window.google.maps.places.Autocomplete(input, {
      fields: ['geometry', 'formatted_address', 'name'],
      componentRestrictions: { country: ['us'] },
      types: ['(regions)'],
    });
    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;
      onPlaceResolvedRef.current?.({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        formattedAddress: place.formatted_address || place.name || '',
      });
    });
    return () => {
      listener.remove();
      window.google.maps.event.clearInstanceListeners(ac);
    };
  }, [mapsReady]);

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
      autoComplete={GOOGLE_MAPS_API_KEY ? 'off' : undefined}
    />
  );
};

export default LocationAutocompleteInput;
