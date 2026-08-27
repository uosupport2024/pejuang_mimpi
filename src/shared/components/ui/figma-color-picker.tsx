import { useState, useEffect } from "react";
import { 
  type ColorOrGradient, 
  type GradientConfig, 
  type GradientStop, 
  parseBackgroundConfig, 
  buildCssBackground 
} from "@/shared/constants/colors";
import { 
  Square, 
  Sliders, 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  RotateCw, 
  Sparkles,
  Check
} from "lucide-react";

interface FigmaColorPickerProps {
  value: ColorOrGradient | null | undefined;
  fallbackColor?: string;
  label?: string;
  onChange: (value: ColorOrGradient) => void;
  allowGradient?: boolean;
}

const GRADIENT_PRESETS = [
  { name: "Navy Velvet", css: "linear-gradient(135deg, #1E2A4A 0%, #0F172A 100%)" },
  { name: "Pejuang Orange", css: "linear-gradient(135deg, #E0542C 0%, #C54117 100%)" },
  { name: "Ocean Breeze", css: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)" },
  { name: "Emerald Forest", css: "linear-gradient(135deg, #064E3B 0%, #10B981 100%)" },
  { name: "Royal Purple", css: "linear-gradient(135deg, #3730A3 0%, #6366F1 100%)" },
  { name: "Sunset Horizon", css: "linear-gradient(135deg, #7C2D12 0%, #F59E0B 100%)" },
  { name: "Dark Modern", css: "linear-gradient(135deg, #18181B 0%, #27272A 100%)" },
  { name: "Teal Glass", css: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)" },
];

const SOLID_PRESETS = [
  "#1E2A4A", "#2A3B66", "#0F172A", "#18181B",
  "#E0542C", "#F2B233", "#7FA46D", "#5C8A90",
  "#1E40AF", "#3B82F6", "#0D9488", "#6366F1"
];

export function FigmaColorPicker({
  value,
  fallbackColor = "#1E2A4A",
  label,
  onChange,
  allowGradient = true,
}: FigmaColorPickerProps) {
  const [config, setConfig] = useState<GradientConfig>(() =>
    parseBackgroundConfig(value, fallbackColor)
  );
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  useEffect(() => {
    setConfig(parseBackgroundConfig(value, fallbackColor));
  }, [value, fallbackColor]);

  const updateConfig = (newConfig: GradientConfig) => {
    const css = buildCssBackground(newConfig, fallbackColor);
    const updated = { ...newConfig, css };
    setConfig(updated);
    if (updated.type === "solid") {
      onChange(updated.stops?.[0]?.color || fallbackColor);
    } else {
      onChange(updated);
    }
  };

  const handleModeChange = (mode: "solid" | "linear" | "radial") => {
    if (mode === "solid") {
      const firstColor = config.stops?.[0]?.color || fallbackColor;
      updateConfig({
        type: "solid",
        angle: config.angle ?? 135,
        stops: [{ offset: 0, color: firstColor, opacity: 100 }],
      });
    } else {
      const stops: GradientStop[] =
        config.stops && config.stops.length >= 2
          ? config.stops
          : [
              { offset: 0, color: config.stops?.[0]?.color || fallbackColor, opacity: 100 },
              { offset: 100, color: "#334C7A", opacity: 100 },
            ];
      updateConfig({
        type: mode,
        angle: config.angle ?? 135,
        stops,
      });
    }
  };

  const handleAddStop = () => {
    const currentStops = [...(config.stops || [])];
    const newOffset = Math.min(
      100,
      currentStops.length > 0
        ? Math.round(
            (currentStops[currentStops.length - 1].offset + (currentStops[0]?.offset || 0)) / 2
          )
        : 50
    );
    const newColor = currentStops[currentStops.length - 1]?.color || fallbackColor;
    const newStops = [
      ...currentStops,
      { offset: newOffset, color: newColor, opacity: 100 },
    ].sort((a, b) => a.offset - b.offset);

    const newIndex = newStops.findIndex((s) => s.offset === newOffset);
    setActiveStopIndex(newIndex >= 0 ? newIndex : 0);
    updateConfig({ ...config, stops: newStops });
  };

  const handleRemoveStop = (index: number) => {
    const currentStops = [...(config.stops || [])];
    if (currentStops.length <= 2) return;
    currentStops.splice(index, 1);
    setActiveStopIndex(Math.max(0, index - 1));
    updateConfig({ ...config, stops: currentStops });
  };

  const handleUpdateStop = (
    index: number,
    fields: Partial<GradientStop>
  ) => {
    const currentStops = [...(config.stops || [])];
    if (!currentStops[index]) return;
    currentStops[index] = {
      ...currentStops[index],
      ...fields,
      color: fields.color !== undefined ? fields.color.toUpperCase() : currentStops[index].color,
    };
    updateConfig({ ...config, stops: currentStops });
  };

  const handleReverseGradient = () => {
    const currentStops = [...(config.stops || [])];
    const reversed = currentStops
      .map((s) => ({ ...s, offset: 100 - s.offset }))
      .reverse();
    updateConfig({ ...config, stops: reversed });
  };

  const handleAngleChange = (angle: number) => {
    updateConfig({ ...config, angle });
  };

  const currentCss = buildCssBackground(config, fallbackColor);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md p-4 space-y-4 text-gray-800 font-sans animate-in fade-in zoom-in-95 duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shadow-xs shrink-0"
            style={{ background: currentCss }}
          />
          <span className="text-xs font-bold text-gray-800">{label || "Inspector Warna & Gradient"}</span>
        </div>

        {/* Mode Switcher Tabs */}
        {allowGradient ? (
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => handleModeChange("solid")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                config.type === "solid"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              <Square className="w-3 h-3" />
              <span>Solid</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("linear")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                config.type === "linear"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Linear</span>
            </button>
          </div>
        ) : (
          <span className="text-[10px] font-bold text-gray-400 uppercase">Mode Solid</span>
        )}
      </div>

      {/* SOLID MODE */}
      {config.type === "solid" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-2 bg-gray-50 rounded-xl border border-gray-200/80">
            <input
              type="color"
              value={config.stops?.[0]?.color || fallbackColor}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  stops: [{ offset: 0, color: e.target.value.toUpperCase(), opacity: 100 }],
                })
              }
              className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent shrink-0"
            />
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-gray-500 block uppercase">
                Kode Hex
              </label>
              <input
                type="text"
                maxLength={7}
                value={config.stops?.[0]?.color || fallbackColor}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    stops: [{ offset: 0, color: e.target.value.toUpperCase(), opacity: 100 }],
                  })
                }
                className="w-full text-xs font-mono font-bold text-gray-800 bg-transparent focus:outline-none uppercase"
                placeholder="#1E2A4A"
              />
            </div>
          </div>

          {/* Quick Solid Swatches */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Pilihan Warna Cepat
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {SOLID_PRESETS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() =>
                    updateConfig({
                      ...config,
                      stops: [{ offset: 0, color: hex, opacity: 100 }],
                    })
                  }
                  className="h-6 rounded-md border border-gray-200 hover:scale-105 transition-transform relative cursor-pointer"
                  style={{ backgroundColor: hex }}
                  title={hex}
                >
                  {(config.stops?.[0]?.color || "").toLowerCase() === hex.toLowerCase() && (
                    <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GRADIENT MODE (LINEAR / RADIAL) */}
      {config.type !== "solid" && (
        <div className="space-y-4">
          {/* Gradient Visual Bar with Handles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
              <span className="flex items-center gap-1">
                <span>Bar Stop Gradasi</span>
                <span className="text-[10px] text-gray-400 font-normal">(Klik bar untuk tambah stop)</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReverseGradient}
                  className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                  title="Balik Arah Gradasi (Reverse)"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Gradient Track */}
            <div className="relative pt-3 pb-1">
              <div
                className="w-full h-7 rounded-xl border border-black/15 shadow-inner cursor-crosshair relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${config.stops
                    ?.map((s) => `${s.color} ${s.offset}%`)
                    .join(", ")})`,
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
                  const newStops = [
                    ...(config.stops || []),
                    {
                      offset: pct,
                      color: config.stops?.[activeStopIndex]?.color || fallbackColor,
                      opacity: 100,
                    },
                  ].sort((a, b) => a.offset - b.offset);
                  const idx = newStops.findIndex((s) => s.offset === pct);
                  setActiveStopIndex(idx >= 0 ? idx : 0);
                  updateConfig({ ...config, stops: newStops });
                }}
              />

              {/* Stop Markers on bar */}
              <div className="absolute inset-x-0 top-0 pointer-events-none">
                {config.stops?.map((stop, idx) => {
                  const isSelected = idx === activeStopIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStopIndex(idx);
                      }}
                      className={`pointer-events-auto absolute -top-1 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all cursor-pointer shadow-md ${
                        isSelected
                          ? "border-blue-500 scale-125 z-20 ring-2 ring-blue-400/40"
                          : "border-white z-10 hover:scale-110"
                      }`}
                      style={{
                        left: `${stop.offset}%`,
                        backgroundColor: stop.color,
                      }}
                      title={`Stop ${idx + 1}: ${stop.color} (${stop.offset}%)`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Angle & Direction Controls */}
          <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200/80">
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <RotateCw className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-[11px]">Sudut (Angle):</span>
            </div>
            <div className="flex items-center gap-1">
              {[0, 90, 135, 180].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => handleAngleChange(deg)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                    config.angle === deg
                      ? "bg-gray-800 text-white border-gray-800 shadow-2xs"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {deg}°
                </button>
              ))}
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={config.angle ?? 135}
                  onChange={(e) => handleAngleChange(Number(e.target.value) || 0)}
                  className="w-12 h-6 pl-1.5 pr-3 text-[11px] font-mono font-bold text-gray-800 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:border-gray-400"
                />
                <span className="absolute right-1 text-[10px] text-gray-400 font-mono pointer-events-none">°</span>
              </div>
            </div>
          </div>

          {/* Stops List (Figma Style Inspector) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
              <span>Daftar Stops ({config.stops?.length || 0})</span>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Stop</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {config.stops?.map((stop, idx) => {
                const isSelected = idx === activeStopIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStopIndex(idx)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-300/40"
                        : "bg-gray-50/80 border-gray-200/80 hover:bg-gray-50"
                    }`}
                  >
                    {/* Position Offset Input */}
                    <div className="relative flex items-center shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.offset}
                        onChange={(e) =>
                          handleUpdateStop(idx, { offset: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                        }
                        className="w-12 h-7 pl-1.5 pr-3 text-[10px] font-mono font-bold text-gray-800 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:border-blue-400"
                      />
                      <span className="absolute right-1 text-[9px] text-gray-400 font-mono pointer-events-none">%</span>
                    </div>

                    {/* Color Swatch & Native Color Picker */}
                    <div className="flex items-center gap-1.5 flex-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) => handleUpdateStop(idx, { color: e.target.value.toUpperCase() })}
                        className="w-5 h-5 rounded border-0 cursor-pointer p-0 bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={stop.color}
                        onChange={(e) => handleUpdateStop(idx, { color: e.target.value.toUpperCase() })}
                        className="w-full text-[10px] font-mono font-bold text-gray-800 bg-transparent focus:outline-none uppercase"
                        placeholder="#FFFFFF"
                      />
                    </div>

                    {/* Opacity Input */}
                    <div className="relative flex items-center shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.opacity ?? 100}
                        onChange={(e) =>
                          handleUpdateStop(idx, { opacity: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                        }
                        className="w-12 h-7 pl-1 pr-3.5 text-[10px] font-mono font-bold text-gray-800 bg-white border border-gray-200 rounded-lg text-right focus:outline-none focus:border-blue-400"
                      />
                      <span className="absolute right-1 text-[9px] text-gray-400 font-mono pointer-events-none">%</span>
                    </div>

                    {/* Delete Stop button */}
                    <button
                      type="button"
                      disabled={(config.stops?.length || 0) <= 2}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStop(idx);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:bg-transparent cursor-pointer"
                      title="Hapus Stop Ini"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Gradient Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Preset Gradasi Populer</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => updateConfig(parseBackgroundConfig(preset.css, fallbackColor))}
                  className="h-8 rounded-lg border border-black/10 hover:scale-105 transition-transform flex items-center justify-center p-1 cursor-pointer relative group"
                  style={{ background: preset.css }}
                  title={preset.name}
                >
                  <span className="text-[9px] font-bold text-white drop-shadow-md truncate opacity-90 group-hover:opacity-100">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
