import { useState, useEffect } from "react";

export function useHeaderBanner() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBalance, setShowBalance] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + " WIB";
  };

  const formatRupiah = (val?: number) => {
    if (val === undefined) return "Rp 0";
    return "Rp " + val.toLocaleString("id-ID");
  };

  return {
    currentTime,
    showBalance,
    setShowBalance,
    isExpanded,
    setIsExpanded,
    formatDate,
    formatTime,
    formatRupiah,
  };
}
