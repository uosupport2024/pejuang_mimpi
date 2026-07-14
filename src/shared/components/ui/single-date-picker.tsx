import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const formatDisplay = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()}`;

interface SingleDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function SingleDatePicker({
  value,
  onChange,
  placeholder = "Pilih Tanggal",
  minDate,
  maxDate
}: SingleDatePickerProps) {
  const displayLabel = value ? formatDisplay(value) : placeholder;

  return (
    <div className="w-full relative">
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd MMM yyyy"
        minDate={minDate}
        maxDate={maxDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        wrapperClassName="w-full"
        customInput={
          <button
            type="button"
            className="w-full h-10 box-border flex items-center gap-2 bg-zinc-50 border border-gray-200 rounded-xl px-3.5 text-left hover:border-[#e0542c]/50 focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all cursor-pointer min-w-0"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate leading-normal">{displayLabel}</span>
          </button>
        }
      />

      {/* Include the custom premium styles */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; display: block; }
        .react-datepicker-wrapper > div { width: 100%; }
        .react-datepicker-popper { z-index: 9999 !important; }
        
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          background-color: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          padding: 4px;
        }
        
        .react-datepicker__header {
          background-color: #ffffff;
          border-bottom: 1px solid #f4f4f5;
          padding: 8px 8px 6px;
        }
        
        .react-datepicker__current-month {
          color: #18181b;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        
        .react-datepicker__month-select,
        .react-datepicker__year-select {
          background-color: #f4f4f5;
          border: 1px solid #e4e4e7;
          color: #18181b;
          border-radius: 6px;
          padding: 3px 6px;
          font-size: 10px;
          font-weight: 600;
          outline: none;
          margin: 0 2px;
          cursor: pointer;
        }
        
        .react-datepicker__month-select:hover,
        .react-datepicker__year-select:hover {
          background-color: #e4e4e7;
        }

        .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          margin-top: 6px;
          border-top: 1px solid #f4f4f5;
          padding-top: 6px;
        }
        
        .react-datepicker__day-name {
          color: #71717a;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          width: 28px;
          text-align: center;
          margin: 0;
        }
        
        .react-datepicker__month {
          margin: 4px;
        }

        .react-datepicker__week {
          display: flex;
          justify-content: space-around;
        }
        
        .react-datepicker__day {
          color: #27272a;
          font-size: 11px;
          font-weight: 555;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          margin: 2px 0;
          transition: all 0.1s ease;
          cursor: pointer;
        }
        
        .react-datepicker__day:hover {
          background-color: #f4f4f5;
          color: #18181b;
        }
        
        .react-datepicker__day--selected {
          background-color: #e0542c !important;
          color: #ffffff !important;
          font-weight: 700;
          border-radius: 8px !important;
        }
        
        .react-datepicker__day--today {
          color: #e0542c;
          font-weight: 700;
          border: 1px solid #e0542c30;
        }

        .react-datepicker__day--disabled {
          color: #d4d4d8;
          cursor: not-allowed;
        }

        .react-datepicker__day--disabled:hover {
          background-color: transparent;
          color: #d4d4d8;
        }
        
        .react-datepicker__navigation {
          top: 10px;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #71717a;
          border-width: 2px 2px 0 0;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #18181b;
        }
      `}</style>
    </div>
  );
}
