import { useMemo } from 'react';

/**
 * Custom hook to parse and memoize clinic Google Places data
 * Prevents unnecessary re-parsing of JSON fields and expensive calculations
 */
export const useClinicData = (clinicInfo) => {
  // Parse workingHours JSON
  const workingHours = useMemo(() => {
    if (!clinicInfo?.workingHours) return null;
    
    try {
      // If already an object, return it
      if (typeof clinicInfo.workingHours === 'object') {
        return clinicInfo.workingHours;
      }
      // Parse JSON string
      return JSON.parse(clinicInfo.workingHours);
    } catch (error) {
      console.error('Error parsing workingHours:', error);
      return null;
    }
  }, [clinicInfo?.workingHours]);

  // Parse aboutJSON (amenities, accessibility, etc.)
  const aboutData = useMemo(() => {
    if (!clinicInfo?.aboutJSON) return null;
    
    try {
      // If already an object, return it
      if (typeof clinicInfo.aboutJSON === 'object') {
        return clinicInfo.aboutJSON;
      }
      // Parse JSON string
      return JSON.parse(clinicInfo.aboutJSON);
    } catch (error) {
      console.error('Error parsing aboutJSON:', error);
      return null;
    }
  }, [clinicInfo?.aboutJSON]);

  // Calculate if clinic is currently open
  const isOpenNow = useMemo(() => {
    if (!workingHours) return null;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = workingHours[currentDay];

    if (!todayHours || todayHours.toLowerCase() === 'closed') {
      return false;
    }

    // Parse hours like "9AM-5PM" or "9:00 AM - 5:00 PM"
    const timeMatch = todayHours.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    
    if (!timeMatch) return null;

    const [, openHour, openMin = '00', openPeriod, closeHour, closeMin = '00', closePeriod] = timeMatch;
    
    // Convert to 24-hour format
    let openHour24 = parseInt(openHour);
    let closeHour24 = parseInt(closeHour);
    
    if (openPeriod.toUpperCase() === 'PM' && openHour24 !== 12) openHour24 += 12;
    if (openPeriod.toUpperCase() === 'AM' && openHour24 === 12) openHour24 = 0;
    if (closePeriod.toUpperCase() === 'PM' && closeHour24 !== 12) closeHour24 += 12;
    if (closePeriod.toUpperCase() === 'AM' && closeHour24 === 12) closeHour24 = 0;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openHour24 * 60 + parseInt(openMin);
    const closeMinutes = closeHour24 * 60 + parseInt(closeMin);

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }, [workingHours]);

  // Get today's hours
  const todayHours = useMemo(() => {
    if (!workingHours) return null;
    
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return workingHours[currentDay] || null;
  }, [workingHours]);

  // Get closing time for display
  const closingTime = useMemo(() => {
    if (!todayHours || todayHours.toLowerCase() === 'closed') return null;
    
    const timeMatch = todayHours.match(/-\s*(\d{1,2}:?\d{2}?\s*(?:AM|PM))/i);
    return timeMatch ? timeMatch[1].trim() : null;
  }, [todayHours]);

  // Get photos array from Google Places data
  const photos = useMemo(() => {
    const photoUrls = [];
    
    if (clinicInfo?.photo) photoUrls.push(clinicInfo.photo);
    if (clinicInfo?.streetView) photoUrls.push(clinicInfo.streetView);
    
    return photoUrls.length > 0 ? photoUrls : null;
  }, [clinicInfo?.photo, clinicInfo?.streetView]);

  // Get logo (prefer logo, fallback to photo)
  const logo = useMemo(() => {
    return clinicInfo?.logo || clinicInfo?.photo || null;
  }, [clinicInfo?.logo, clinicInfo?.photo]);

  return {
    workingHours,
    aboutData,
    isOpenNow,
    todayHours,
    closingTime,
    photos,
    logo,
  };
};

