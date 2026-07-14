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
            className="w-full h-9 flex items-center gap-2 bg-zinc-50 border border-gray-200 rounded-lg px-3 text-left hover:bg-zinc-100/50 transition-colors cursor-pointer min-w-0"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate leading-normal">{displayLabel}</span>
          </button>
        }
      />
    </div>
  );
}
