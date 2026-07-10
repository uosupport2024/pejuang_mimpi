import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const indonesianMonths = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const formatDisplay = (d: Date) =>
  `${d.getDate().toString().padStart(2, "0")} ${indonesianMonths[d.getMonth()]} ${d.getFullYear()}`;

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: [Date | null, Date | null]) => void;
  maxDate?: Date;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  maxDate
}: DateRangePickerProps) {
  const rangeLabel = startDate && endDate
    ? `${formatDisplay(startDate)}  –  ${formatDisplay(endDate)}`
    : startDate
    ? `${formatDisplay(startDate)}  –  ...`
    : "Pilih Rentang Tanggal";

  return (
    <div className="w-full relative">
      <DatePicker
        selectsRange
        startDate={startDate ?? undefined}
        endDate={endDate ?? undefined}
        onChange={onChange}
        dateFormat="dd MMM yyyy"
        maxDate={maxDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        customInput={
          <button
            type="button"
            className="w-full h-[38px] flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 text-left hover:border-[#1e2a4a]/40 transition-colors cursor-pointer min-w-0"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[10px] font-semibold text-zinc-700 truncate leading-none">{rangeLabel}</span>
          </button>
        }
      />
      
      {/* Include the custom premium styles */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
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
        
        .react-datepicker__day--in-range {
          background-color: #fdf2f0 !important;
          color: #c23f1b !important;
          border-radius: 0px;
        }

        .react-datepicker__day--in-selecting-range {
          background-color: #fdf2f0 !important;
          color: #c23f1b !important;
        }
        
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end,
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
