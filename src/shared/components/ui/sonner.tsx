import { useEffect, useState } from "react"
import { Toaster as Sonner, type ToasterProps, toast } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Hook to dynamically determine toast position based on screen width and route
function useResponsiveToastPosition(propPosition?: ToasterProps["position"]): ToasterProps["position"] {
  const getPosition = (): ToasterProps["position"] => {
    if (typeof window === "undefined") return "top-right"
    const isMobileScreen = window.innerWidth < 768
    const pathname = window.location.pathname.toLowerCase()
    const hash = window.location.hash.toLowerCase()
    const isMobileRoute = pathname.includes("/mobile") || hash.includes("/mobile")

    // On mobile screen AND on a mobile route -> top-center
    // On desktop, tablet, or admin/desktop pages -> top-right
    if (isMobileScreen && isMobileRoute) {
      return "top-center"
    }
    return "top-right"
  }

  const [position, setPosition] = useState<ToasterProps["position"]>(getPosition)

  useEffect(() => {
    const handleUpdate = () => {
      setPosition(getPosition())
    }

    handleUpdate()
    window.addEventListener("resize", handleUpdate)
    window.addEventListener("popstate", handleUpdate)
    return () => {
      window.removeEventListener("resize", handleUpdate)
      window.removeEventListener("popstate", handleUpdate)
    }
  }, [])

  return propPosition || position
}

// Auto-patch Sonner toast methods to ensure all toasts have a simple title and detailed message
let isToastPatched = false

function patchSonnerToast() {
  if (isToastPatched || typeof toast === "undefined") return
  isToastPatched = true

  const originalSuccess = toast.success.bind(toast)
  const originalError = toast.error.bind(toast)
  const originalInfo = toast.info.bind(toast)
  const originalWarning = toast.warning.bind(toast)
  const originalMessage = toast.message.bind(toast)
  const originalLoading = toast.loading.bind(toast)

  const formatToastArgs = (defaultTitle: string, message: any, data?: any) => {
    if (typeof message === "string") {
      const trimmed = message.trim()
      // If description is already provided, keep custom title and description
      if (data && "description" in data && data.description !== undefined) {
        return { title: message, data }
      }

      // Check if message is already just a simple generic status title
      const isSimpleWord = /^(berhasil!?|sukses!?|success!?|gagal!?|error!?|peringatan!?|warning!?|info!?|informasi!?)$/i.test(trimmed)
      if (isSimpleWord) {
        return { title: trimmed, data }
      }

      // Format as Simple Title + Detailed message in description
      return {
        title: defaultTitle,
        data: {
          ...data,
          description: message,
        },
      }
    }
    return { title: message, data }
  }

  toast.success = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Berhasil", message, data)
    return originalSuccess(title, formattedData)
  }) as typeof toast.success

  toast.error = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Gagal", message, data)
    return originalError(title, formattedData)
  }) as typeof toast.error

  toast.info = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Informasi", message, data)
    return originalInfo(title, formattedData)
  }) as typeof toast.info

  toast.warning = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Peringatan", message, data)
    return originalWarning(title, formattedData)
  }) as typeof toast.warning

  toast.message = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Pemberitahuan", message, data)
    return originalMessage(title, formattedData)
  }) as typeof toast.message

  toast.loading = ((message: any, data?: any) => {
    const { title, data: formattedData } = formatToastArgs("Memproses", message, data)
    return originalLoading(title, formattedData)
  }) as typeof toast.loading
}

patchSonnerToast()

const Toaster = ({ position: propPosition, ...props }: ToasterProps) => {
  const dynamicPosition = useResponsiveToastPosition(propPosition)

  return (
    <Sonner
      className="toaster group"
      position={dynamicPosition}
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-white bg-[#166534] rounded-full p-0.5 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-5 text-white bg-[#2b6cb0] rounded-full p-0.5 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-white bg-[#c05621] rounded-full p-0.5 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-white bg-[#9b2c2c] rounded-full p-0.5 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-gray-500 shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:shadow-xl border rounded-2xl !flex !items-start p-4 !gap-2 text-sm tracking-tight w-full max-w-sm [&>[data-icon]]:!self-start [&>[data-icon]]:!mt-0.5 [&>[data-icon]]:!mr-2.5",
          icon: "!self-start !mt-0.5 !mr-2.5 shrink-0",
          content: "!flex !flex-col !gap-1 !justify-start !items-start text-left",
          title: "!text-sm !font-semibold !leading-tight !text-inherit",
          description: "!text-xs !font-medium !opacity-90 !leading-relaxed !text-inherit",
          success: "!bg-[#eefcf3] !border-[#bbf7d0] !text-[#166534]",
          error: "!bg-[#fff5f5] !border-[#feb2b2] !text-[#9b2c2c]",
          warning: "!bg-[#fffaf0] !border-[#feebc8] !text-[#c05621]",
          info: "!bg-[#ebf8ff] !border-[#bee3f8] !text-[#2b6cb0]",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground !font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground !font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
