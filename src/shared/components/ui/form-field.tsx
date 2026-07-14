import { Combobox } from "./combobox";
import { SingleDatePicker } from "./single-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  label: string;
  type: "text" | "password" | "email" | "number" | "date" | "combobox" | "file" | "select";
  name?: string;
  value?: string | number;
  onChange?: (e: any) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  isCurrency?: boolean;
}

export function FormField({
  label,
  type,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "",
  searchPlaceholder,
  required = false,
  disabled = false,
  minLength,
  className = "",
  minDate,
  maxDate,
  isCurrency = false,
}: FormFieldProps) {
  const parseDate = (str: string) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (d: Date | null) => {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (val: string | number) => {
    let clean = String(val).replace(/[^0-9.]/g, "");
    
    // Ensure only one dot exists
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }

    if (!clean) return "";

    const [integerPart, decimalPart] = clean.split(".");
    const formattedInteger = integerPart ? new Intl.NumberFormat("en-US").format(Number(integerPart)) : "";

    if (clean.includes(".")) {
      return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : `${formattedInteger}.`;
    }
    return formattedInteger;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/[^0-9.]/g, "");
    
    // Ensure only one dot
    const parts = rawVal.split(".");
    if (parts.length > 2) {
      rawVal = parts[0] + "." + parts.slice(1).join("");
    }

    if (onChange) {
      onChange({
        target: {
          name,
          value: rawVal
        }
      });
    }
  };

  const renderLabel = () => {
    if (!label) return null;
    let baseLabel = label;
    let isRequired = required;
    if (label.endsWith("*")) {
      baseLabel = label.slice(0, -1).trim();
      isRequired = true;
    }
    return (
      <>
        {baseLabel}
        {isRequired && <span className="text-red-500 ml-0.5">*</span>}
      </>
    );
  };

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-[11px] font-semibold text-gray-500">{renderLabel()}</label>
      
      {type === "combobox" ? (
        <Combobox
          options={options}
          value={String(value)}
          onChange={(val) => {
            if (onChange) {
              onChange({ target: { name, value: val } });
            }
          }}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
        />
      ) : type === "date" ? (
        <SingleDatePicker
          value={parseDate(String(value))}
          onChange={(d) => {
            if (onChange) {
              onChange({ target: { name, value: formatDate(d) } });
            }
          }}
          placeholder={placeholder || "Pilih Tanggal"}
          minDate={minDate}
          maxDate={maxDate}
        />
      ) : type === "file" ? (
        <input
          type="file"
          disabled={disabled}
          onChange={onChange}
          className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#e0542c]/10 file:text-[#e0542c] hover:file:bg-[#e0542c]/20 cursor-pointer"
        />
      ) : type === "number" ? (
        <input
          type="text"
          name={name}
          value={isCurrency ? formatCurrency(value) : String(value)}
          onChange={handleNumberChange}
          required={required}
          disabled={disabled}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:bg-zinc-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      ) : type === "select" ? (
        <Select
          value={String(value)}
          onValueChange={(val) => {
            if (onChange) {
              onChange({ target: { name, value: val } });
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium flex items-center justify-between">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-md p-1 min-w-[120px]">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs text-gray-700 hover:bg-zinc-50 py-1.5 px-3 rounded-md cursor-pointer flex items-center gap-2"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <input
          type={type}
          name={name}
          value={String(value)}
          onChange={onChange}
          required={required}
          disabled={disabled}
          minLength={minLength}
          placeholder={placeholder}
          className="w-full h-9 px-3 py-2 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium disabled:bg-zinc-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
}
