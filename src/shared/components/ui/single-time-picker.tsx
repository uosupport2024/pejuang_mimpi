import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Clock } from "lucide-react";

interface SingleTimePickerProps {
  value: string; // e.g. "08:00"
  onChange: (timeStr: string) => void;
  placeholder?: string;
  minTime?: Date;
  maxTime?: Date;
}

export function SingleTimePicker({
  value,
  onChange,
  placeholder = "Pilih Jam",
  minTime,
  maxTime
}: SingleTimePickerProps) {
  // Convert string "HH:mm" to Date object for react-datepicker
  const getSelectedDate = () => {
    if (!value) return null;
    const [hours, minutes] = value.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    const d = new Date();
    d.setHours(hours);
    d.setMinutes(minutes);
    d.setSeconds(0);
    return d;
  };

  const handleTimeChange = (date: Date | null) => {
    if (!date) {
      onChange("");
      return;
    }
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    onChange(`${h}:${m}`);
  };

  const selectedDate = getSelectedDate();

  return (
    <div className="w-full relative">
      <DatePicker
        selected={selectedDate}
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Jam"
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        minTime={minTime}
        maxTime={maxTime}
        wrapperClassName="w-full"
        customInput={
          <button
            type="button"
            className="w-full h-10 box-border flex items-center gap-2 bg-zinc-50 border border-gray-200 rounded-xl px-3.5 text-left hover:border-[#e0542c]/50 focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all cursor-pointer min-w-0"
          >
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-700 truncate leading-normal">
              {value || placeholder}
            </span>
          </button>
        }
      />
      <style>{`
        .react-datepicker-wrapper { width: 100%; display: block; }
        .react-datepicker-wrapper > div { width: 100%; }
        .react-datepicker-popper { z-index: 9999 !important; }
        .react-datepicker--time-only {
          border-radius: 12px;
          border: 1px solid #e4e4e7;
          background-color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        .react-datepicker__time-container {
          width: 90px !important;
        }
        .react-datepicker__time-box {
          width: 90px !important;
          border-radius: 12px;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #e0542c !important;
          color: white !important;
          font-weight: bold;
        }
        .react-datepicker__time-list-item:hover {
          background-color: #f4f4f5 !important;
          color: #18181b !important;
        }
        .react-datepicker__time-header {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #71717a;
          border-bottom: 1px solid #f4f4f5;
          padding: 8px 0 !important;
        }
      `}</style>
    </div>
  );
}
