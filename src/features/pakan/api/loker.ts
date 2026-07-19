import type { JobOpening } from "../types/pakan.type";
import { API_BASE_URL, getHeaders } from "@/shared/utils/api";

export async function fetchLokers(params?: {
  q?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  per_page?: number;
  page?: number;
}): Promise<{ data: JobOpening[]; last_page: number; current_page: number; total: number }> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.job_type) query.append("job_type", params.job_type);
  if (params?.salary_min) query.append("salary_min", String(params.salary_min));
  if (params?.salary_max) query.append("salary_max", String(params.salary_max));
  if (params?.per_page) query.append("per_page", String(params.per_page));
  if (params?.page) query.append("page", String(params.page));

  const response = await fetch(`${API_BASE_URL}/loker?${query.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch loker");
  const json = await response.json();
  if (json.code === 200 && json.data) {
    const rows = json.data.data || [];
    const mapped = rows.map((item: any) => {
      // Map API job_type to JobOpening jobType & workplace
      let jobType = "Full-time";
      let workplace = "On-site";
      
      switch (item.job_type) {
        case "paruh_waktu":
          jobType = "Part-time";
          break;
        case "purna_waktu":
          jobType = "Full-time";
          break;
        case "remote":
          jobType = "Full-time";
          workplace = "Remote";
          break;
        case "hybrid":
          jobType = "Full-time";
          workplace = "Hybrid";
          break;
        case "pekerja_lepas":
          jobType = "Freelance";
          break;
        case "datang_ketempat":
          jobType = "Full-time";
          workplace = "On-site";
          break;
      }

      // Convert salary from numbers to text format
      let salaryText = "Negosiasi";
      const sMin = item.salary_min ? Number(item.salary_min) : 0;
      const sMax = item.salary_max ? Number(item.salary_max) : 0;

      if (sMin > 0 && sMax > 0) {
        salaryText = `Rp ${(sMin / 1_000_000).toFixed(1).replace(".", ",")} - ${(sMax / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      } else if (sMin > 0) {
        salaryText = `Mulai Rp ${(sMin / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      } else if (sMax > 0) {
        salaryText = `s/d Rp ${(sMax / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      }

      // Infer category from title
      const title = (item.title || "").toLowerCase();
      let category = "tech";
      if (title.includes("admin") || title.includes("office") || title.includes("sekretaris")) {
        category = "admin";
      } else if (title.includes("barista") || title.includes("chef") || title.includes("masak") || title.includes("waiter") || title.includes("makanan")) {
        category = "fnb";
      } else if (title.includes("design") || title.includes("ui") || title.includes("ux") || title.includes("creative") || title.includes("sosmed") || title.includes("social")) {
        category = "design";
      }

      return {
        id: String(item.id),
        position: item.title || "",
        company: item.company || "Perusahaan Mitra",
        location: item.location || "Indonesia",
        salary: salaryText,
        category,
        jobType,
        workplace,
        salaryMin: sMin / 1_000_000,
        salaryMax: sMax / 1_000_000,
      };
    });

    return {
      data: mapped,
      current_page: json.data.current_page || 1,
      last_page: json.data.last_page || 1,
      total: json.data.total || 0,
    };
  }

  throw new Error(json.message || "Failed to parse loker response");
}

const MOCK_JOBS_DETAIL = [
  {
    id: "1",
    position: "Frontend Developer",
    company: "PT Finexy Digital Corp",
    location: "Jakarta Selatan",
    salary: "Rp 6,5 - 9,0 jt",
    category: "tech",
    jobType: "Hybrid",
    workplace: "Hybrid",
    description: "Tanggung Jawab:\n- Mengembangkan antarmuka aplikasi web berbasis React/TypeScript.\n- Berkolaborasi dengan UI/UX Designer untuk implementasi desain pixel-perfect.\n- Mengoptimalkan performa aplikasi untuk loading speed maksimal.\n\nPersyaratan:\n- Lulusan S1 Teknik Informatika atau setara.\n- Menguasai Tailwind CSS, React, dan React Router.\n- Memiliki portofolio aplikasi web front-end."
  },
  {
    id: "2",
    position: "Social Media Specialist",
    company: "Mimpi Creative Agency",
    location: "Bandung",
    salary: "Rp 4,5 - 6,0 jt",
    category: "design",
    jobType: "Full-time",
    workplace: "Remote",
    description: "Tanggung Jawab:\n- Membuat konten kreatif harian untuk Instagram, TikTok, dan LinkedIn.\n- Melakukan riset tren media sosial terkini untuk meningkatkan engagement.\n- Merancang strategi branding digital perusahaan.\n\nPersyaratan:\n- Minimal D3 Ilmu Komunikasi, Pemasaran, atau setara.\n- Mahir menggunakan Canva, CapCut, atau Adobe Premiere.\n- Aktif di media sosial dan kreatif."
  },
  {
    id: "3",
    position: "Barista & Store Helper",
    company: "Kopi Nusantara Co",
    location: "Surabaya",
    salary: "Rp 3,5 - 4,5 jt",
    category: "fnb",
    jobType: "Full-time",
    workplace: "On-site",
    description: "Tanggung Jawab:\n- Meracik minuman kopi dan non-kopi sesuai standar resep.\n- Menjaga kebersihan area bar dan area kasir.\n- Memberikan pelayanan terbaik dan ramah kepada pelanggan.\n\nPersyaratan:\n- Minimal lulusan SMA/SMK sederajat.\n- Memiliki passion di bidang kopi dan hospitality.\n- Jujur, disiplin, dan komunikatif."
  },
  {
    id: "4",
    position: "Admin Operational",
    company: "PT Logistik Jaya",
    location: "Tangerang",
    salary: "Rp 4,8 - 5,5 jt",
    category: "admin",
    jobType: "Full-time",
    workplace: "On-site",
    description: "Tanggung Jawab:\n- Mengelola input data transaksi logistik harian.\n- Menyusun laporan inventarisasi gudang dan distribusi barang.\n- Melakukan koordinasi dengan kurir dan divisi gudang.\n\nPersyaratan:\n- Lulusan SMA/D3 semua jurusan.\n- Menguasai Microsoft Excel tingkat menengah.\n- Teliti dan terbiasa bekerja dengan target data."
  }
];

export async function fetchLokerDetail(id: string | number): Promise<JobOpening & { description: string; isApplied?: boolean }> {
  const mockItem = MOCK_JOBS_DETAIL.find(item => item.id === String(id));
  if (mockItem) {
    return mockItem as any;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/loker/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch loker detail");
    const json = await response.json();
    if (json.code === 200 && json.data) {
      const item = json.data;
      
      // Map API job_type to JobOpening jobType & workplace
      let jobType = "Full-time";
      let workplace = "On-site";
      
      switch (item.job_type) {
        case "paruh_waktu":
          jobType = "Part-time";
          break;
        case "purna_waktu":
          jobType = "Full-time";
          break;
        case "remote":
          jobType = "Full-time";
          workplace = "Remote";
          break;
        case "hybrid":
          jobType = "Full-time";
          workplace = "Hybrid";
          break;
        case "pekerja_lepas":
          jobType = "Freelance";
          break;
        case "datang_ketempat":
          jobType = "Full-time";
          workplace = "On-site";
          break;
      }

      // Convert salary from numbers to text format
      let salaryText = "Negosiasi";
      const sMin = item.salary_min ? Number(item.salary_min) : 0;
      const sMax = item.salary_max ? Number(item.salary_max) : 0;

      if (sMin > 0 && sMax > 0) {
        salaryText = `Rp ${(sMin / 1_000_000).toFixed(1).replace(".", ",")} - ${(sMax / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      } else if (sMin > 0) {
        salaryText = `Mulai Rp ${(sMin / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      } else if (sMax > 0) {
        salaryText = `s/d Rp ${(sMax / 1_000_000).toFixed(1).replace(".", ",")} jt`;
      }

      // Infer category from title
      const title = (item.title || "").toLowerCase();
      let category = "tech";
      if (title.includes("admin") || title.includes("office") || title.includes("sekretaris")) {
        category = "admin";
      } else if (title.includes("barista") || title.includes("chef") || title.includes("masak") || title.includes("waiter") || title.includes("makanan")) {
        category = "fnb";
      } else if (title.includes("design") || title.includes("ui") || title.includes("ux") || title.includes("creative") || title.includes("sosmed") || title.includes("social")) {
        category = "design";
      }

      return {
        id: String(item.id),
        position: item.title || "",
        company: item.company || "Perusahaan Mitra",
        location: item.location || "Indonesia",
        salary: salaryText,
        category,
        jobType,
        workplace,
        salaryMin: sMin / 1_000_000,
        salaryMax: sMax / 1_000_000,
        description: item.description || "Tidak ada deskripsi pekerjaan.",
        isApplied: !!item.is_applied || !!item.applied || (Array.isArray(item.applies) && item.applies.length > 0) || (Array.isArray(item.apply) && item.apply.length > 0) || (Array.isArray(item.applications) && item.applications.length > 0)
      };
    }
    throw new Error(json.message || "Failed to parse loker detail response");
  } catch (err) {
    console.warn("API error or ID not found, using fallback mock details:", err);
    return MOCK_JOBS_DETAIL[0] as any;
  }
}

export async function applyLoker(id: string | number, note?: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/loker/${id}/apply`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note: note || null }),
  });

  if (!response.ok) throw new Error("Failed to apply for job");
  const json = await response.json();
  return json.code === 200 || json.code === 201;
}

export async function fetchMyApplications(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/loker/my-applications`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error("Failed to fetch applied jobs");
  const json = await response.json();
  return json.data || json || [];
}
