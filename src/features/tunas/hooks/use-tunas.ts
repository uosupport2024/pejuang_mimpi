import { useState, useEffect } from "react";
import { fetchProfileAPI } from "../api/absensi";

// Module-level persistent cache for geolocation to prevent OpenStreetMap 429 rate limiting
let cachedCoords: { latitude: number; longitude: number } | null = null;
let cachedLocationName: string | null = null;
let lastGeocodedTimestamp = 0;
let isGeocodingInFlight = false;
const GEOCODE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Module-level persistent cache for attendance profile status
let cachedProfileData: any = null;
let lastProfileTimestamp = 0;
let profileInFlightPromise: Promise<any> | null = null;
const PROFILE_CACHE_TTL = 15 * 1000; // 15 seconds

export function clearTunasCache() {
  cachedProfileData = null;
  lastProfileTimestamp = 0;
}

export function useTunas() {
  const [clockInTime, setClockInTime] = useState<string>("--:--");
  const [clockOutTime, setClockOutTime] = useState<string>("--:--");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>(cachedLocationName || "Mencari Lokasi...");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(cachedCoords);
  const [profileData, setProfileData] = useState<any>(cachedProfileData);

  const applyScheduleToState = (profile: any) => {
    if (profile && profile.today_schedule) {
      const schedule = profile.today_schedule;
      if (schedule.jam_absen) {
        setClockInTime(schedule.jam_absen.substring(0, 5));
        setIsCheckedIn(true);
      } else {
        setClockInTime("--:--");
        setIsCheckedIn(false);
      }
      if (schedule.jam_pulang) {
        setClockOutTime(schedule.jam_pulang.substring(0, 5));
      } else {
        setClockOutTime("--:--");
      }
    } else {
      setClockInTime("--:--");
      setClockOutTime("--:--");
      setIsCheckedIn(false);
    }
  };

  const loadUserAttendanceStatus = async (force = false) => {
    if (!force && cachedProfileData && Date.now() - lastProfileTimestamp < PROFILE_CACHE_TTL) {
      setProfileData(cachedProfileData);
      applyScheduleToState(cachedProfileData);
      return;
    }

    if (profileInFlightPromise) {
      try {
        const profile = await profileInFlightPromise;
        setProfileData(profile);
        applyScheduleToState(profile);
      } catch (err) {
        console.error("Failed to wait for profile in-flight:", err);
      }
      return;
    }

    try {
      profileInFlightPromise = fetchProfileAPI();
      const profile = await profileInFlightPromise;
      cachedProfileData = profile;
      lastProfileTimestamp = Date.now();
      setProfileData(profile);
      applyScheduleToState(profile);
    } catch (err) {
      console.error("Failed to load attendance status from profile API:", err);
    } finally {
      profileInFlightPromise = null;
    }
  };

  useEffect(() => {
    loadUserAttendanceStatus();
  }, []);

  useEffect(() => {
    // If we already have a recent location name cached, reuse it immediately
    if (cachedLocationName && cachedCoords && Date.now() - lastGeocodedTimestamp < GEOCODE_CACHE_TTL) {
      setLocationName(cachedLocationName);
      setCoords(cachedCoords);
      return;
    }

    if (!navigator.geolocation) {
      setLocationName("Tidak Didukung");
      return;
    }

    if (isGeocodingInFlight) return;
    isGeocodingInFlight = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { latitude, longitude };
        cachedCoords = newCoords;
        setCoords(newCoords);

        // Check if cached location is still fresh and close enough
        if (cachedLocationName && Date.now() - lastGeocodedTimestamp < GEOCODE_CACHE_TTL) {
          setLocationName(cachedLocationName);
          isGeocodingInFlight = false;
          return;
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "id-ID,id;q=0.9",
                "User-Agent": "PejuangMimpiApp/1.0",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const displayLoc =
              address.suburb ||
              address.village ||
              address.neighbourhood ||
              address.city_district ||
              address.city ||
              address.town ||
              address.municipality ||
              "Jakarta";
            cachedLocationName = displayLoc;
            lastGeocodedTimestamp = Date.now();
            setLocationName(displayLoc);
          } else {
            const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            cachedLocationName = fallback;
            lastGeocodedTimestamp = Date.now();
            setLocationName(fallback);
          }
        } catch (error) {
          console.error("Geocoding fetch failed:", error);
          const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationName(fallback);
        } finally {
          isGeocodingInFlight = false;
        }
      },
      (error) => {
        isGeocodingInFlight = false;
        console.error("Geolocation tracking error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationName("Akses Ditolak");
        } else {
          setLocationName("Gagal Memuat");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Accept cached browser location up to 1 minute
      }
    );
  }, []);

  const formatRupiah = (val?: number) => {
    if (val === undefined) return "Rp 0";
    return "Rp " + val.toLocaleString("id-ID");
  };

  const now = new Date();
  const dayName = now.toLocaleDateString("id-ID", { weekday: "long" });
  const dateString = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    clockInTime,
    clockOutTime,
    isCheckedIn,
    refreshAttendanceStatus: () => loadUserAttendanceStatus(true),
    formatRupiah,
    dayName,
    dateString,
    locationName,
    coords,
    profileData,
  };
}
