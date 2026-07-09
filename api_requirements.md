# Dokumen Kebutuhan API - Pejuang Mimpi

Dokumen ini berisi daftar kebutuhan API untuk aplikasi **Pejuang Mimpi** berdasarkan mapping fitur pada frontend dan status implementasi backend saat ini.

---

## Ringkasan Modul API

Aplikasi dibagi menjadi 5 modul utama:
1. **Authentication (Auth)** - Mengelola autentikasi dan session user.
2. **Dashboard (Home Mobile)** - Menampilkan ringkasan informasi saldo, motivasi harian, rekomendasi loker, dan status absensi.
3. **Celengan (Sangkar)** - Mengelola target tabungan (Celengan), deposit, penarikan (withdraw), dan riwayat transaksi.
4. **Pakan (Lowongan Kerja / Loker)** - Mengelola listing loker, pencarian, filter, dan proses lamaran kerja.
5. **Profile (Sarang)** - Mengelola informasi pribadi user, detail rekening, dan penggantian password.

---

## Daftar Kebutuhan API

### 1. Modul: Authentication (Auth)

#### [POST] Login (/auth/login)
*   **Deskripsi Fitur:** Mengautentikasi user dan mengembalikan data profil beserta token JWT.
*   **Auth Required:** `FALSE` (Public)
*   **Request Payload (JSON Body):**
    ```json
    {
      "login": "user@pejuangmimpi.com", // bisa email atau username
      "password": "password123"
    }
    ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
          "id": "2",
          "name": "Davin Metoti",
          "email": "user@pejuangmimpi.com",
          "role": "User",
          "telepon": "081382440615",
          "gender": "Laki-Laki",
          "tgl_join": "2025-04-14",
          "status_nikah": "K/0",
          "rekening": "1730018948050",
          "bank": "Mandiri",
          "gaji_pokok": 4440000,
          "lembur": 15000,
          "izin": 92500,
          "status": "active"
        }
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [login.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/auth/api/login.ts))

---

### 2. Modul: Dashboard (Home Mobile / Lumbung)

#### [GET] Card Summary Saldo (/dashboard/summary)
*   **Deskripsi Fitur:** Menampilkan summary finansial user berupa saldo saat ini (perkiraan gaji pokok) dan incoming saldo.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:** None (Diambil dari subjek token JWT)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "saldo_saat_ini": 4440000,
        "incoming_saldo": 500000
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `ToDo` (Saat ini masih menggunakan data fallback lokal di [lumbung-tabungan.tsx](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/tunas/components/lumbung-tabungan.tsx))

#### [GET] Dynamic Quote (/quotes/random atau /dashboard/quote)
*   **Deskripsi Fitur:** Mengambil kata-kata motivasi harian yang berganti secara dinamis untuk memotivasi user.
*   **Auth Required:** `FALSE`
*   **Request Payload:** None
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "title": "Terus Berjuang, Tingkatkan Dirimu!",
        "quote": "Belajar, bekerja, menabung untuk masa depan yang lebih baik."
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `ToDo`
    *   **Frontend:** `ToDo` (Saat ini static/hardcoded di [motivation-quote.tsx](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/components/motivation-quote.tsx))

#### [GET] List Celengan (/celengan)
*   **Deskripsi Fitur:** Mendapatkan daftar seluruh celengan/target tabungan milik user aktif.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:** None
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": [
        {
          "id": 1,
          "name": "Beli Motor",
          "target_amount": 25000000,
          "current_amount": 5000000,
          "icon": "motorcycle",
          "created_at": "2026-04-10T08:00:00Z"
        }
      ]
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `fetchCelengans`)

#### [GET] List Tunas/Loker Recommendation (/loker/recommendations)
*   **Deskripsi Fitur:** Rekomendasi lowongan pekerjaan yang dipersonalisasi berdasarkan preferensi atau profil user.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:** None
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": [
        {
          "id": 1,
          "title": "Frontend Developer",
          "company": "PT Finexy Digital Corp",
          "location": "Jakarta Selatan",
          "job_type": "hybrid",
          "salary_min": 6500000,
          "salary_max": 9000000
        }
      ]
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `ToDo`
    *   **Frontend:** `ToDo`
*   **Catatan Diskusi:** Perlu penyamaan indikator preferensi user (misal: kategori bidang pekerjaan, tipe kerja, minimum gaji, atau domisili) untuk penyusunan algoritma rekomendasi di backend.

---

### 3. Modul: Celengan (Sangkar)

#### [GET] Detail Celengan History (/celengan/{id}/history)
*   **Deskripsi Fitur:** Mengambil daftar riwayat transaksi (deposit dan withdraw) dari celengan tertentu.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Celengan ID)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": [
        {
          "id": 101,
          "celengan_id": 1,
          "amount": 50000,
          "type": "deposit",
          "note": "Uang sisa transport",
          "created_at": "2026-04-15T12:00:00Z"
        }
      ]
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `fetchCelenganHistory`)

#### [POST] Deposit Celengan (/celengan/{id}/deposit)
*   **Deskripsi Fitur:** Menambahkan sejumlah nominal uang ke target celengan tertentu.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Celengan ID)
    *   Body (JSON):
        ```json
        {
          "amount": 150000,
          "note": "Menabung bonus mingguan"
        }
        ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Deposit berhasil",
      "data": {
        "celengan": {
          "id": 1,
          "name": "Beli Motor",
          "target_amount": 25000000,
          "current_amount": 5150000,
          "icon": "motorcycle"
        },
        "transaction": {
          "id": 102,
          "celengan_id": 1,
          "amount": 150000,
          "type": "deposit",
          "note": "Menabung bonus mingguan",
          "created_at": "2026-07-07T11:50:00Z"
        }
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `depositCelengan`)

#### [POST] Withdraw Celengan (/celengan/{id}/withdraw)
*   **Deskripsi Fitur:** Mengambil tabungan dari celengan tertentu (mengurangi nominal celengan).
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Celengan ID)
    *   Body (JSON):
        ```json
        {
          "amount": 100000,
          "note": "Kebutuhan mendesak"
        }
        ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Withdraw berhasil",
      "data": {
        "celengan": {
          "id": 1,
          "name": "Beli Motor",
          "target_amount": 25000000,
          "current_amount": 5050000,
          "icon": "motorcycle"
        },
        "transaction": {
          "id": 103,
          "celengan_id": 1,
          "amount": 100000,
          "type": "withdraw",
          "note": "Kebutuhan mendesak",
          "created_at": "2026-07-07T11:52:00Z"
        }
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `withdrawCelengan`)

#### [PUT] Update Celengan (/celengan/{id})
*   **Deskripsi Fitur:** Mengubah target nama, nominal target, dan ikon pada celengan tertentu.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Celengan ID)
    *   Body (JSON):
        ```json
        {
          "name": "Beli Motor Baru",
          "target_amount": 27000000,
          "icon": "motorcycle"
        }
        ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Celengan berhasil diubah",
      "data": {
        "id": 1,
        "name": "Beli Motor Baru",
        "target_amount": 27000000,
        "current_amount": 5050000,
        "icon": "motorcycle"
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `updateCelengan`)

#### [DELETE] Delete Celengan (/celengan/{id})
*   **Deskripsi Fitur:** Menghapus data celengan.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Celengan ID)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Celengan berhasil dihapus"
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [celengan.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sangkar/api/celengan.ts) -> `deleteCelengan`)

---

### 4. Modul: Pakan (Loker / Lowongan Kerja)

#### [GET] List Loker (/loker)
*   **Deskripsi Fitur:** Mengambil list pekerjaan yang tersedia. Mendukung sorting & filter dasar.
*   **Auth Required:** `FALSE` (Public)
*   **Request Payload (Query Params):**
    *   `q` (String) - Keyword pencarian (opsional)
    *   `job_type` (String) - Tipe pekerjaan (opsional)
    *   `salary_min` (Number) - Minimum gaji (opsional)
    *   `salary_max` (Number) - Maksimum gaji (opsional)
    *   `page` (Number) - Halaman pagination (opsional)
    *   `per_page` (Number) - Jumlah data per halaman (opsional)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "data": [
          {
            "id": 1,
            "title": "Frontend Developer",
            "company": "PT Finexy Digital Corp",
            "location": "Jakarta Selatan",
            "job_type": "hybrid",
            "salary_min": 6500000,
            "salary_max": 9000000
          }
        ],
        "current_page": 1,
        "last_page": 5,
        "total": 50
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [loker.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/pakan/api/loker.ts) -> `fetchLokers`)

#### [GET] Detail Loker (/loker/{id})
*   **Deskripsi Fitur:** Menampilkan deskripsi lengkap dan persyaratan dari loker tertentu.
*   **Auth Required:** `FALSE` (Public)
*   **Request Payload:**
    *   Path Param: `id` (Loker ID)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "id": 1,
        "title": "Frontend Developer",
        "company": "PT Finexy Digital Corp",
        "location": "Jakarta Selatan",
        "job_type": "hybrid",
        "salary_min": 6500000,
        "salary_max": 9000000,
        "description": "Tanggung Jawab:\n- Mengembangkan antarmuka aplikasi web...\n\nPersyaratan:\n- Menguasai React/TypeScript..."
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [loker.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/pakan/api/loker.ts) -> `fetchLokerDetail`)

#### [GET] Detail Perusahaan (/loker/{id}/company)
*   **Deskripsi Fitur:** Menampilkan profil lengkap perusahaan yang memposting lowongan kerja tersebut.
*   **Auth Required:** `FALSE` (Public)
*   **Request Payload:**
    *   Path Param: `id` (Loker ID atau Company ID)
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": {
        "company_name": "PT Finexy Digital Corp",
        "logo_url": "https://portotalents.com/logo.png",
        "industry": "IT & Software Development",
        "description": "PT Finexy Digital Corp adalah perusahaan yang bergerak di bidang solusi finansial digital...",
        "address": "Gedung Cyber, Jakarta Selatan"
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `ToDo`
    *   **Frontend:** `ToDo`

#### [POST] Apply Loker (/loker/{id}/apply)
*   **Deskripsi Fitur:** Mengajukan lamaran pada pekerjaan tertentu dengan mengirim data form web lamaran.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:**
    *   Path Param: `id` (Loker ID)
    *   Body (JSON):
        ```json
        {
          "note": "Saya memiliki pengalaman 2 tahun di bidang React...",
          "resume_url": "https://storage.pejuangmimpi.com/cv/davin-cv.pdf",
          "answers": {
            "expected_salary": 7500000,
            "notice_period": "1 month"
          }
        }
        ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Lamaran Anda berhasil dikirim."
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done / Needs Adjustments` (Diimplementasikan di [loker.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/pakan/api/loker.ts) -> `applyLoker`).
*   **Catatan Diskusi:** Saat ini frontend baru mengirim apply kosong/tanpa body lengkap. Ekspektasi ke depan adalah berupa Web Form lamaran agar user bisa mengisi CV, Expected Salary, dan form input kustom lainnya sesuai kebutuhan lowongan.

#### [GET] History Apply (/loker/history)
*   **Deskripsi Fitur:** Mendapatkan daftar history lamaran kerja yang sudah diajukan oleh user beserta status progressnya.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:** None
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "data": [
        {
          "id": 501,
          "loker_id": 1,
          "position": "Frontend Developer",
          "company": "PT Finexy Digital Corp",
          "applied_at": "2026-04-12T08:00:00Z",
          "status": "review", // review, interview, accepted, rejected
          "feedback": "Kualifikasi Anda menarik. Kami akan menjadwalkan wawancara teknis minggu depan."
        }
      ]
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done / Needs Adjustments`
*   **Catatan Diskusi:** Perlu penambahan visualisasi feedback dari rekruter dan status stepper progress pada UI.

#### [GET] Filter Loker (/loker)
*   **Deskripsi Fitur:** Menyaring list pekerjaan berdasarkan query filter yang dikirimkan.
*   **Auth Required:** `FALSE` (Public)
*   **Request Payload (Query Params):** Sama seperti API List Loker.
*   **Response:** List Loker terfilter.
*   **Status Implementasi:**
    *   **Backend:** `ToDo` (Butuh implementasi logika pencarian query full-text & filter range gaji)
    *   **Frontend:** `ToDo`
*   **Catatan Diskusi:** Perlu diskusi lebih lanjut untuk menentukan filter apa saja yang efektif dan paling dibutuhkan user (misal: filter kota, filter tipe industri, range gaji).

---

### 5. Modul: Profile (Sarang)

#### [GET] Get Profile (/user atau /profile)
*   **Deskripsi Fitur:** Mengambil data detail profil lengkap milik user yang sedang aktif.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload:** None
*   **Response:** Sama seperti response objek `"user"` pada API Login.
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Dimuat di [App.tsx](file:///d:/Project/Uo-space/pejuang-mimpi/src/App.tsx) dan ditampilkan di halaman `/mobile/profile`)

#### [PUT] Edit Profile (/employee/update atau /profile)
*   **Deskripsi Fitur:** Mengubah data profil pribadi user seperti nama, no telepon, gender, bank, dan nomor rekening.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload (JSON Body):**
    ```json
    {
      "name": "Davin Metoti",
      "telepon": "081382440615",
      "gender": "Laki-Laki",
      "bank": "BCA",
      "rekening": "1234567890"
    }
    ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Profil berhasil diubah",
      "data": {
        "name": "Davin Metoti",
        "telepon": "081382440615",
        "gender": "Laki-Laki",
        "bank": "BCA",
        "rekening": "1234567890"
        // ... field profil lainnya
      }
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [profile.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sarang/api/profile.ts) -> `updateProfileOnBackend`)

#### [POST] Change Password (/auth/change-password atau /change-password)
*   **Deskripsi Fitur:** Mengganti password akun user.
*   **Auth Required:** `TRUE` (Bearer Token)
*   **Request Payload (JSON Body):**
    ```json
    {
      "password": "newpassword123"
    }
    ```
*   **Response (JSON - Success 200):**
    ```json
    {
      "code": 200,
      "status": "success",
      "message": "Password berhasil diubah"
    }
    ```
*   **Status Implementasi:**
    *   **Backend:** `Done`
    *   **Frontend:** `Done` (Diimplementasikan di [profile.ts](file:///d:/Project/Uo-space/pejuang-mimpi/src/features/sarang/api/profile.ts) -> `changePasswordOnBackend`)
