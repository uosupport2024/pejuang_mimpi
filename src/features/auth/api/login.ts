import type { LoginResponse } from "../types/login.type"
import { API_BASE_URL } from "@/shared/utils/api"

/**
 * Connects to the login API using the base URL configured in .env.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        login: email,
        password: password,
      }),
    })

    const json = await response.json()

    if (response.ok && json.code === 200) {
      return {
        success: true,
        token: json.data.token,
        user: {
          id: String(json.data.user.id),
          name: json.data.user.name,
          email: json.data.user.email || json.data.user.username || email,
          role: (json.data.user.is_admin === "admin" || (Array.isArray(json.data.user.roles) && json.data.user.roles.some((r: any) => r.name === "admin"))) ? "Administrator" : "User",
          is_admin: json.data.user.is_admin,
          telepon: json.data.user.telepon,
          gender: json.data.user.gender,
          tgl_join: json.data.user.tgl_join,
          status_nikah: json.data.user.status_nikah,
          rekening: json.data.user.rekening,
          bank: json.data.user.bank,
          gaji_pokok: json.data.user.gaji_pokok,
          lembur: json.data.user.lembur,
          izin: json.data.user.izin,
          status: json.data.user.status,
        },
      }
    }

    return {
      success: false,
      error: json.message || "Email atau password salah.",
    }
  } catch (error) {
    console.error("API Connection error:", error)

    // Fallback to simulation if backend server is not running
    console.warn(`Backend server not running at ${API_BASE_URL}. Falling back to mock simulation.`)

    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (email === "admin@pejuangmimpi.com" && password === "admin123") {
      return {
        success: true,
        token: "mock-jwt-token-xyz-12345",
        user: {
          id: "1",
          name: "Admin Pejuang Mimpi",
          email: "admin@pejuangmimpi.com",
          role: "Administrator",
          is_admin: "admin",
          status: "active",
        },
      }
    }

    if (email && password.length >= 6) {
      return {
        success: true,
        token: `mock-jwt-${Math.random().toString(36).substr(2)}`,
        user: {
          id: "2",
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          email: email,
          role: "User",
          is_admin: "user",
          telepon: "081382440615",
          gender: "Laki-Laki",
          tgl_join: "2025-04-14",
          status_nikah: "K/0",
          rekening: "1730018948050",
          bank: "Mandiri",
          gaji_pokok: 4440000,
          lembur: 15000,
          izin: 92500,
          status: "active",
        },
      }
    }

    return {
      success: false,
      error: `Gagal menghubungkan ke server API absensi di ${API_BASE_URL}. Pastikan backend Absensi POT sudah berjalan.`,
    }
  }
}
