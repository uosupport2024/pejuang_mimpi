import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
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
          toast: "group toast group-[.toaster]:shadow-lg border rounded-2xl flex items-center p-4 gap-3 text-sm font-semibold tracking-tight w-full",
          success: "!bg-[#eefcf3] !border-[#bbf7d0] !text-[#166534]",
          error: "!bg-[#fff5f5] !border-[#feb2b2] !text-[#9b2c2c]",
          warning: "!bg-[#fffaf0] !border-[#feebc8] !text-[#c05621]",
          info: "!bg-[#ebf8ff] !border-[#bee3f8] !text-[#2b6cb0]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
