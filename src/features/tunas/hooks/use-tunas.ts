import { useState, useEffect, useRef } from "react";
import { fetchProfileAPI } from "../api/absensi";

export function useTunas() {
  const [clockInTime, setClockInTime] = useState<string>("--:--");
  const [clockOutTime, setClockOutTime] = useState<string>("--:--");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>("Mencari Lokasi...");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const isFetched = useRef(false);

  const loadUserAttendanceStatus = async () => {
    try {
      const profile = await fetchProfileAPI();
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
    } catch (err) {
      console.error("Failed to load attendance status from profile API:", err);
    }
  };

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    loadUserAttendanceStatus();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName("Tidak Didukung");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "Accept-Language": "id-ID,id;q=0.9",
                "User-Agent": "PejuangMimpiApp/1.0"
              }
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
            setLocationName(displayLoc);
          } else {
            setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Geocoding fetch failed:", error);
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      },
      (error) => {
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
        maximumAge: 0,
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
    year: "numeric"
  });

  return {
    clockInTime,
    clockOutTime,
    isCheckedIn,
    refreshAttendanceStatus: loadUserAttendanceStatus,
    formatRupiah,
    dayName,
    dateString,
    locationName,
    coords,
  };
}
