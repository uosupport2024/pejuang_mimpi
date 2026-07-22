import { useState, useEffect } from "react";
import bgQuote from "@/assets/bg/bg-quote-1.png";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export function MotivationQuote() {
  const [message, setMessage] = useState<string>(
    "Belajar, bekerja, menabung untuk masa depan yang lebih baik."
  );

  useEffect(() => {
    let isMounted = true;
    const fetchDailyMotivation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/motivation/get-daily`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.data?.message) {
            setMessage(data.data.message);
          }
        }
      } catch (err) {
        console.error("Failed to fetch daily motivation:", err);
      }
    };

    fetchDailyMotivation();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="w-full rounded-[24px] relative overflow-hidden flex flex-col justify-center min-h-[135px] bg-no-repeat bg-[length:100%_100%] shadow-xs text-left"
      style={{ backgroundImage: `url(${bgQuote})` }}
    >
      {/* Blurred background overlay - flush left/top/bottom, fading to 0 opacity on the right */}
      <div
        className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#F7F3EB]/95 via-[#F7F3EB]/50 to-transparent backdrop-blur-xs pointer-events-none rounded-l-[24px]"
      />

      <div className="max-w-[40%] z-10 relative pl-5">
        <p className="text-[10px] font-bold text-[#1e2a4a] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}


