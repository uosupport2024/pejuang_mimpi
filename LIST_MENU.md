# 📜 List Tree Menu HRMS — Pejuang Mimpi (Spesifikasi untuk Backend / BE)

> **Catatan untuk Developer Backend (BE):**
> Spesifikasi menu di bawah ini disusun dalam bentuk **List Tree Hirarkis** agar Backend mudah memetakan **RBAC (Role-Based Access Control)**, **Endpoint API**, serta alur data untuk aplikasi **Admin (Desktop)** dan **Mobile (User / Karyawan)**. *(Aspek Multi-Tenant diabaikan)*.

---

## 💻 A. APP ADMIN (WEB DASHBOARD — ROLE: ADMINISTRATOR)

- 📂 **1. GROUP: UTAMA**
  - 🏠 **Dashboard**
    - **Path URL:** `/dashboard` | **Route ID:** `Dashboard`
    - **Target Endpoint / Fitur BE:**
      - `GET /api/dashboard/stats` — Summary angka total pegawai, hadir hari ini, terlambat, izin/cuti, lembur.
      - `GET /api/dashboard/attendance-chart` — Grafik tren statistik kehadiran harian/bulanan.
      - `GET /api/dashboard/pending-approvals` — Counter & daftar pengajuan pending (cuti & koreksi).
      - `GET /api/dashboard/recent-activities` — Log aktivitas sistem terbaru.
      - `GET /api/dashboard/announcements` — List pengumuman internal perusahaan.

---

- 📂 **2. GROUP: DATA MASTER**
  - 👥 **Pegawai** (Master Karyawan)
    - **Path URL:** `/pegawai` | **Route ID:** `Employee`
    - **Sub-Menu & Fitur BE:**
      - 📋 **Daftar Pegawai** (`GET /api/employees`)
        - Support query parameter: `search`, `division_id`, `status` (Aktif/Resigned), `page`, `limit`.
        - `POST /api/employees/export` — Export data pegawai ke Excel/PDF.
      - ➕ **Tambah Pegawai** (`/pegawai/tambah` | `EmployeeAdd`)
        - `POST /api/employees` — Form submit data pribadi, NIK, Jabatan, Divisi, Gaji Pokok, No Rekening.
      - ✏️ **Edit Pegawai** (`/pegawai/edit` | `EmployeeEdit`)
        - `GET /api/employees/{id}` & `PUT /api/employees/{id}` — Detail & update data pegawai.
      - 🔄 **Shift Pegawai** (`/pegawai/shift` | `EmployeeInputShift`)
        - `POST /api/employees/assign-shift` — Penugasan shift individual maupun *batch assignment*.
      - 🗑️ **Hapus Pegawai** (`DELETE /api/employees/{id}`)

  - ⏱️ **Shift** (Master Jam Kerja)
    - **Path URL:** `/shift` | **Route ID:** `Shift`
    - **Fitur BE:**
      - `GET /api/shifts` — List Master Shift (Shift Pagi, Siang, Malam, Off).
      - `POST /api/shifts` — Tambah Master Shift baru (Jam Masuk, Jam Keluar, Grace Period/Toleransi Terlambat).
      - `PUT /api/shifts/{id}` — Update parameter shift.
      - `DELETE /api/shifts/{id}` — Hapus master shift.

  - 🏢 **Divisi** (Struktur Organisasi)
    - **Path URL:** `/divisi` | **Route ID:** `Organization`
    - **Fitur BE:**
      - `GET /api/divisions` — List Divisi/Departemen & Jumlah Pegawai.
      - `POST /api/divisions` — Tambah divisi baru.
      - `PUT /api/divisions/{id}` — Edit nama divisi / Manager in Charge.
      - `DELETE /api/divisions/{id}` — Hapus divisi.

  - 📍 **Lokasi** (Geofencing Master)
    - **Path URL:** `/lokasi` | **Route ID:** `Location`
    - **Sub-Menu & Fitur BE:**
      - 📋 **Daftar Lokasi** (`GET /api/locations`) — List titik lokasi kantor/cabang.
      - ➕ **Tambah Lokasi** (`/lokasi/tambah` | `LocationAdd`)
        - `POST /api/locations` — Submit Nama Kantor, Alamat, Latitude, Longitude, Radius Validasi (meter).
      - ✏️ **Edit Lokasi** (`/lokasi/edit` | `LocationEdit`)
        - `PUT /api/locations/{id}` — Update koordinat geofencing.
      - 🗑️ **Hapus Lokasi** (`DELETE /api/locations/{id}`)

---

- 📂 **3. GROUP: OPERASIONAL**
  - 📅 **Absensi** (Group Menu Absensi)
    - 📊 **Rekap Data Absensi**
      - **Path URL:** `/absensi` | **Route ID:** `Attendance`
      - `GET /api/attendance/recap` — Laporan rekapitulasi presensi per periode bulan & divisi.
      - `POST /api/attendance/recap/export` — Cetak Laporan PDF/Excel.
    - 🟢 **Absensi Hari Ini**
      - **Path URL:** `/absensi-hari-ini` | **Route ID:** `AttendanceToday`
      - `GET /api/attendance/today` — Live tracking kehadiran hari ini (Foto Selfie, Koordinat GPS, Status Masuk/Pulang).

  - ⏰ **Lembur** (Overtime Approval)
    - **Path URL:** `/overtime` | **Route ID:** `Overtime`
    - **Fitur BE:**
      - `GET /api/overtimes` — List pengajuan lembur pegawai.
      - `PUT /api/overtimes/{id}/approve` — Approve pengajuan lembur.
      - `PUT /api/overtimes/{id}/reject` — Reject pengajuan lembur.
      - `GET /api/overtimes/recap` — Total jam lembur per pegawai untuk payroll.

  - 🎓 **Pelatihan** (Master Training / E-Learning)
    - **Path URL:** `/training` | **Route ID:** `Training`
    - **Sub-Menu & Fitur BE:**
      - 📋 **Daftar Pelatihan** (`GET /api/trainings`) — List program pelatihan internal.
      - ➕ **Tambah Pelatihan** (`/training/tambah` | `TrainingAdd`)
        - `POST /api/trainings` — Form tambah judul, materi (video/file PDF), kategori, durasi.
      - ✏️ **Edit Pelatihan** (`/training/edit` | `TrainingEdit`)
        - `PUT /api/trainings/{id}` — Update materi pelatihan.
      - 🔍 **Detail & Progress Peserta** (`/training/detail` | `TrainingDetail`)
        - `GET /api/trainings/{id}/progress` — Monitoring status penyelesaian & nilai kuis pegawai.

---

- 📂 **4. GROUP: LAYANAN**
  - 💵 **Keuangan** (Payroll & Gaji)
    - 🧾 **Rekap Data Payroll**
      - **Path URL:** `/keuangan` | **Route ID:** `Payroll`
      - `GET /api/payrolls` — Kalkulasi otomatis Gaji Pokok + Lembur - Potongan Absen/Izin.
      - `POST /api/payrolls/generate` — Generate Slip Gaji bulanan.
      - `POST /api/payrolls/publish` — Publish & kirim slip gaji ke app mobile pegawai.
    - 📜 **Riwayat Payroll**
      - **Path URL:** `/keuangan/riwayat` | **Route ID:** `PayrollHistory`
      - `GET /api/payrolls/history` — Arsip histori penggajian bulan-bulan sebelumnya.

  - 📝 **Pengajuan** (Approval Hub)
    - 🏖️ **Cuti & Izin**
      - **Path URL:** `/cuti` | **Route ID:** `Leave`
      - `GET /api/leaves` — List permohonan cuti/izin + view attachment dokumen/surat sakit.
      - `PUT /api/leaves/{id}/approve` — Approve cuti (otomatis memotong kuota cuti pegawai).
      - `PUT /api/leaves/{id}/reject` — Reject cuti dengan alasan penolakan.
    - 🔧 **Persetujuan Absen** (Koreksi Jam Absen)
      - **Path URL:** `/persetujuan-absen` | **Route ID:** `KoreksiAbsenApproval`
      - `GET /api/attendance-corrections` — List pengajuan koreksi jam masuk/pulang.
      - `PUT /api/attendance-corrections/{id}/approve` — Approve koreksi (update record absensi pegawai).
      - `PUT /api/attendance-corrections/{id}/reject` — Reject koreksi.

---

- 📂 **5. HEADER BAR & AKUN ADMIN**
  - 👤 **Profil Admin** (`/profile` | `Profile`) -> `GET / PUT /api/admin/profile`
  - 🔔 **Center Notifikasi** -> `GET /api/notifications`
  - 🚪 **Logout Admin** -> `POST /api/auth/logout`

---
---

## 📱 B. APP MOBILE (WEB / MOBILE APP — ROLE: USER / KARYAWAN)

- 📂 **1. BOTTOM NAVIGATION BAR (5 TAB UTAMA)**

  - 🪺 **Tab 1: Sangkar** *(Home Dashboard)*
    - **Path URL:** `/mobile/home` | **Route ID:** `MobileHome`
    - **Fitur & Endpoint BE:**
      - `GET /api/mobile/home` — Data user login, status shift hari ini, timer clock-in/out status, koordinat lokasi aktif.
      - `GET /api/mobile/announcements` — List pengumuman & loker terbaru.
      - `GET /api/mobile/celengan/summary` — Summary saldo celengan sangkar.
      - **Direct Shortcut Actions:**
        - ➔ Presensi Camera (`/mobile/absensi`)
        - ➔ ID Card Digital (`/mobile/id-card`)
        - ➔ Pengajuan Cuti (`/mobile/leave-request`)
        - ➔ Form Koreksi Absen (`/mobile/koreksi-absen`)
        - ➔ Absen Lembur (`/mobile/lembur`)

  - 📦 **Tab 2: Pakan** *(Lumbung Operasional)*
    - **Path URL:** `/mobile/lumbung` | **Route ID:** `MobileLumbung`
    - **Fitur & List Menu Operasional:**
      - ➔ **Form Clock-In / Out Absensi** -> `/mobile/absensi`
      - ➔ **Riwayat Absensi Harian** -> `/mobile/history`
      - ➔ **Form Pengajuan Cuti & Izin** -> `/mobile/leave-request`
      - ➔ **Histori Status Cuti** -> `/mobile/leave-history`
      - ➔ **Form Koreksi Jam Absen** -> `/mobile/koreksi-absen`
      - ➔ **Form Absen Lembur** -> `/mobile/lembur`
      - ➔ **Histori Jam Lembur** -> `/mobile/lembur/history`

  - 🐓 **Tab 3: Ayamku** *(Floating Quick Hub & Stat Center)*
    - **Path URL:** `/mobile/ayamku` | **Route ID:** `MobileAyamku`
    - **Fitur & Endpoint BE:**
      - `GET /api/mobile/my-stats` — Stat Total Kehadiran Bulan Ini, Akumulasi Jam Lembur, Sisa Kuota Cuti, Estimasi Gaji Bulan Ini.

  - 🎖️ **Tab 4: Tunas** *(E-Learning & Training)*
    - **Path URL:** `/mobile/pakan` | **Route ID:** `MobilePakan`
    - **Fitur & Endpoint BE:**
      - `GET /api/mobile/trainings` — Catalog Modul Pelatihan Karyawan.
      - `GET /api/mobile/trainings/progress` — Percent completion progress per user.
      - ➔ **Pembelajaran Modul** (`/mobile/pakan/learn` | `MobilePakanLearn`)
        - `GET /api/mobile/trainings/{id}` — Detail materi (video/bacaan PDF).
        - `POST /api/mobile/trainings/{id}/quiz` — Submit jawaban kuis/tes evaluasi.

  - 👤 **Tab 5: Induk** *(Profil & Setting Akun)*
    - **Path URL:** `/mobile/profile` | **Route ID:** `MobileProfile`
    - **Fitur & Endpoint BE:**
      - `GET /api/mobile/profile` — Data Pribadi Karyawan (NIK, Email, No. HP, Tgl Join, Gender, Status Nikah).
      - `GET /api/mobile/payroll-info` — Details Rekening Bank & Rincian Gaji Pokok.
      - `POST /api/mobile/change-password` — Form ubah kata sandi.
      - `POST /api/auth/logout` — Submit Logout.

---

- 📂 **2. SUB-HALAMAN & MODUL OPERASIONAL MOBILE (CHILD ROUTES)**

  - 📷 **Absensi Kamera & GPS**
    - **Path URL:** `/mobile/absensi` | **Route ID:** `MobileAbsensi`
    - `POST /api/mobile/attendance/clock-in` — Payload: `latitude`, `longitude`, `photo_file` (validasi geofencing & radius kantor oleh BE).
    - `POST /api/mobile/attendance/clock-out` — Submit Jam Pulang + Foto.

  - 🆔 **Kartu Identitas Digital (ID Card)**
    - **Path URL:** `/mobile/id-card` | **Route ID:** `MobileIdCard`
    - `GET /api/mobile/id-card` — Digital ID Pass + String Payload QR Code NIK/Employee ID.

  - 📝 **Form Pengajuan Cuti & Izin**
    - **Path URL:** `/mobile/leave-request` | **Route ID:** `MobileLeaveRequest`
    - `POST /api/mobile/leaves` — Payload: `leave_type`, `start_date`, `end_date`, `reason`, `attachment_file`.

  - 📜 **Riwayat Pengajuan Cuti**
    - **Path URL:** `/mobile/leave-history` | **Route ID:** `MobileLeaveHistory`
    - `GET /api/mobile/leaves/history` — Log status permohonan cuti (`Pending`, `Approved`, `Rejected`).

  - ⏰ **Absen Lembur**
    - **Path URL:** `/mobile/lembur` | **Route ID:** `MobileLemburAbsensi`
    - `POST /api/mobile/overtime/clock-in` — Submit Clock-In Lembur (Photo + GPS).
    - `POST /api/mobile/overtime/clock-out` — Submit Clock-Out Lembur.

  - 🕒 **Riwayat Lembur**
    - **Path URL:** `/mobile/lembur/history` | **Route ID:** `MobileLemburHistory`
    - `GET /api/mobile/overtime/history` — Histori jam lembur & nominal kompensasi.

  - 🔧 **Koreksi Absen**
    - **Path URL:** `/mobile/koreksi-absen` | **Route ID:** `MobileKoreksiAbsen`
    - `POST /api/mobile/attendance-corrections` — Payload: `date`, `target_type` (Check-In/Out), `new_time`, `reason`.

  - 📅 **Riwayat Absensi Harian**
    - **Path URL:** `/mobile/history` | **Route ID:** `MobileHistory`
    - `GET /api/mobile/attendance/history` — Log presensi bulanan lengkap dengan timestamp & status keterlambatan.

  - 💰 **Celengan Sangkar (Internal App Feature)**
    - **Detail Celengan:** `/mobile/celengan` (`MobileCelenganDetail`) -> `GET /api/mobile/celengan`
    - **Tambah Celengan:** `/mobile/celengan/add` (`MobileCelenganAdd`) -> `POST /api/mobile/celengan`

  - 💼 **Detail Loker**
    - **Path URL:** `/mobile/loker` | **Route ID:** `MobileLokerDetail`
    - `GET /api/mobile/lokers/{id}` — Detail informasi lowongan internal.

---

## 🗂️ C. MATRIKS PERMISSI / RBAC RINGKAS (UNTUK BE DATABASE ROLES)

```
[ROLE: ADMINISTRATOR]
 ├── Full Access ke App Admin Web (/dashboard, /pegawai, /shift, /divisi, /lokasi, /absensi, /overtime, /training, /keuangan, /cuti, /persetujuan-absen)
 └── Endpoints: ALL GET, POST, PUT, DELETE /api/admin/* & /api/* (Master Data & Approvals)

[ROLE: USER / KARYAWAN]
 ├── Full Access ke App Mobile (/mobile/home, /mobile/lumbung, /mobile/ayamku, /mobile/pakan, /mobile/profile + Child Routes)
 └── Endpoints: GET & POST /api/mobile/* (Presensi Mandiri, Submit Cuti, Submit Lembur, Submit Koreksi, Viewing Personal Stats & Learning)
```

---
*Spesifikasi Hirarki Tree Menu ini siap digunakan oleh Tim Backend untuk perancangan Router, Middleware Permission, dan Schema DB.*
