import {
  DangerTriangle,
  DangerCircle,
  InfoCircle,
} from "@solar-icons/react"
import { cn } from "@/shared/lib/utils"
import { THEME_COLORS } from "@/shared/constants/colors"

export type ConfirmationVariant = "warning" | "danger" | "info"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmationVariant
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
  loading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  // Icon configuration based on variant
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <DangerCircle size={28} weight="Bold" className="text-rose-600" />
      case "warning":
        return <DangerTriangle size={28} weight="Bold" style={{ color: THEME_COLORS.hex.primary }} />
      case "info":
        return <InfoCircle size={28} weight="Bold" style={{ color: THEME_COLORS.hex.airKehidupan }} />
    }
  }

  // Icon bg configuration based on variant
  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-50 border border-rose-100"
      case "warning":
        return `bg-[${THEME_COLORS.hex.primary}]/10 border border-[${THEME_COLORS.hex.primary}]/20`
      case "info":
        return `bg-[${THEME_COLORS.hex.airKehidupan}]/10 border border-[${THEME_COLORS.hex.airKehidupan}]/20`
    }
  }

  // Confirm button class configuration based on variant
  const getConfirmButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 focus:ring-rose-500"
      case "warning":
        return `bg-[${THEME_COLORS.hex.primary}] hover:bg-[${THEME_COLORS.hex.primaryHover}] shadow-[${THEME_COLORS.hex.primary}]/15 focus:ring-[${THEME_COLORS.hex.primary}]`
      case "info":
        return `bg-[${THEME_COLORS.hex.airKehidupan}] hover:bg-[${THEME_COLORS.hex.airKehidupanDark}] shadow-[${THEME_COLORS.hex.airKehidupan}]/15 focus:ring-[${THEME_COLORS.hex.airKehidupan}]`
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl max-w-sm w-full p-6 space-y-4 z-50 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Circular Icon Wrapper */}
          <div className={cn("p-3 rounded-full flex items-center justify-center w-14 h-14", getIconBg())}>
            {getIcon()}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-800 tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed px-2">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full h-9 px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "w-full h-9 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-offset-1 cursor-pointer disabled:opacity-50 flex items-center justify-center",
              getConfirmButtonClass()
            )}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
