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
}

export function SingleDatePicker({
  value,
  onChange,
  placeholder = "Pilih Tanggal",
  minDate
}: SingleDatePickerProps) {
  const displayLabel = value ? formatDisplay(value) : placeholder;

  return (
    <div className="w-full relative">
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd MMM yyyy"
        minDate={minDate}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        customInput={
          <button
            type="button"
            className="w-full h-12 flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3.5 text-left hover:border-[#e0542c]/40 transition-colors cursor-pointer min-w-0"
          >
            <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-700 truncate leading-none">{displayLabel}</span>
          </button>
        }
      />
    </div>
  );
}
