# Forum API - CI/CD & Security (Rate Limiting & HTTPS)

Proyek submission kelas **Menjadi Back-End Developer Expert** (Dicoding Indonesia) dengan implementasi **Clean Architecture, Automation Testing (100% Coverage), Continuous Integration (CI), Continuous Deployment (CD), Rate Limiting (DDoS Protection), dan HTTPS**.

---

## 📌 Ringkasan Fitur & Spesifikasi Proyek

### 1. Clean Architecture & Modularisasi
- **Framework**: Express.js (Node.js v22 LTS)
- **Database**: PostgreSQL dengan `node-pg-migrate`
- **Testing Engine**: Vitest & Supertest (**100% Test Coverage** pada Statements, Branches, Functions, dan Lines)
- **Linter**: ESLint dengan konfigurasi `eslint-config-dicodingacademy`
- **Layer Arsitektur**:
  - `src/Domains`: Entities dan Repository Interfaces
  - `src/Applications`: Use Cases dan Security Interfaces
  - `src/Infrastructures`: PostgreSQL Repositories, Bcrypt Password Hash, JWT Token Manager, Express Server
  - `src/Interfaces`: HTTP Handlers, Routes, Authentication Middleware

---

### 2. Kriteria Utama & Opsional (Target Nilai Bintang 5)
1. **Continuous Integration (CI)**:
   - Pengujian otomatis (Unit Test, Integration Test, Functional Test) dengan PostgreSQL service container pada event `pull_request`.
   - Menggunakan GitHub Actions (`.github/workflows/ci.yml`).
   - Skenario pengujian gagal dan berhasil terverifikasi.
2. **Continuous Deployment (CD)**:
   - Deployment otomatis ke server pada event `push` ke branch `main`.
   - Menggunakan GitHub Actions (`.github/workflows/cd.yml`).
3. **Limit Access (DDoS Prevention)**:
   - Resource `/threads` dan seluruh sub-path `/threads/*` dibatasi sebanyak **90 request per menit**.
   - Dilampirkan file konfigurasi **`nginx.conf`** pada root proyek.
4. **HTTPS Protocol (MITM Prevention)**:
   - Konfigurasi SSL/TLS pada Reverse Proxy NGINX dengan enkripsi modern.
5. **Fitur Opsional 1 - Menyukai dan Batal Menyukai Komentar (Like/Unlike Comment)**:
   - Route `PUT /threads/{threadId}/comments/{commentId}/likes` (Restrict).
   - Response: `{"status": "success"}`.
   - Properti `likeCount` tampil pada setiap komentar di endpoint `GET /threads/{threadId}`.
6. **Fitur Opsional 2 - Balasan Komentar (Replies)**:
   - `POST /threads/{threadId}/comments/{commentId}/replies` (Restrict).
   - `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` (Restrict & Owner).
   - Menampilkan replies dan handling balasan terhapus (`**balasan telah dihapus**`).
7. **100% Test Coverage & Clean Code**.

---

## 🛠️ Panduan Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
```bash
cp .env.example .env
```

### 3. Menjalankan Database Migration
```bash
npm run migrate
```

### 4. Menjalankan Automated Testing & Coverage
```bash
# Menjalankan seluruh test
npm test

# Menjalankan test coverage (100% threshold)
npm run test:coverage
```

### 5. Menjalankan Server
```bash
# Development mode
npm run start:dev

# Production mode
npm start
```
