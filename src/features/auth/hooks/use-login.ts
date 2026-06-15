import { useState } from "react"
import { login } from "../api/login"
import type { LoginResponse } from "../types/login.type"
import { toast } from "sonner"

export function useLogin(onSuccess: (response: LoginResponse) => void) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {}

    if (!username) {
      newErrors.username = "Username wajib diisi"
      toast.warning("Username wajib diisi")
    }

    if (!password) {
      newErrors.password = "Password wajib diisi"
      toast.warning("Password wajib diisi")
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
      toast.warning("Password minimal 6 karakter")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await login(username, password)
      if (result.success) {
        toast.success("Masuk berhasil! Selamat datang kembali.")
        onSuccess(result)
      } else {
        const errorMsg = result.error || "Gagal masuk. Silakan coba lagi."
        setErrors({ form: errorMsg })
        toast.error(errorMsg)
      }
    } catch (err) {
      const serverError = "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."
      setErrors({ form: serverError })
      toast.error(serverError)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    errors,
    isLoading,
    handleSubmit,
  }
}
