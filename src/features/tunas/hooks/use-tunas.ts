import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useTunas() {
  const [clockInTime, setClockInTime] = useState<string>("--:--");
  const [clockOutTime, setClockOutTime] = useState<string>("--:--");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [locationName, setLocationName] = useState<string>("Mencari Lokasi...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName("Tidak Didukung");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
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
            // Extract the most specific location name available
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

  const handleClockPress = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    if (!isCheckedIn) {
      setClockInTime(timeString);
      setIsCheckedIn(true);
      toast.success(`Berhasil Clock-In pada pukul ${timeString}`);
    } else if (clockOutTime === "--:--") {
      setClockOutTime(timeString);
      toast.success(`Berhasil Clock-Out pada pukul ${timeString}`);
    } else {
      toast.error("Anda sudah menyelesaikan absensi shift hari ini.");
    }
  };

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
    handleClockPress,
    formatRupiah,
    dayName,
    dateString,
    locationName,
  };
}
