# 🌍 CostingCarbon — Carbon Resource Planner

> *"Kita tidak mewarisi Bumi dari nenek moyang kita — kita meminjamnya dari anak cucu kita."*
> — Antoine de Saint-Exupéry

**CostingCarbon** (sebelumnya dikenal sebagai EcoBalance) adalah aplikasi perencanaan jejak karbon berbasis web yang dirancang untuk membantu pengguna memahami, melacak, dan mengurangi emisi CO₂e harian mereka secara nyata dan bermakna. Dibangun dengan filosofi bahwa data yang akurat, visualisasi yang hidup, dan pendampingan yang cerdas dapat mengubah kebiasaan, mengarahkannya pada penyelamatan lingkungan.

// ═══════════════════════════════════════════════════════════════════════════════
🚀 Demo Website
// ═══════════════════════════════════════════════════════════════════════════════
**Live Demo:** https://costingcarbon.netlify.app/

---

## 📌 Latar Belakang & Permasalahan

Dalam menghadapi krisis iklim global, banyak individu menyadari pentingnya mengurangi jejak karbon. Namun, terdapat beberapa masalah utama yang sering dihadapi:
1. **Kurangnya Pemahaman Visual & Nyata:** Emisi karbon adalah hal yang tidak terlihat (invisible). Pengguna kesulitan membayangkan seberapa besar dampak dari aktivitas harian mereka terhadap lingkungan.
2. **Kurangnya Personalisasi & Perencanaan:** Kebanyakan kalkulator karbon hanya bersifat statis dan memberikan angka akhir tanpa kemampuan merencanakan anggaran emisi (budgeting) ke depan.
3. **Isolasi & Kurangnya Motivasi:** Menurunkan jejak karbon sering kali terasa seperti perjuangan sendirian tanpa ada apresiasi, gamifikasi, atau dukungan komunitas.
4. **Kesulitan Mendapatkan Edukasi Instan:** Mencari tahu dampak spesifik dari suatu tindakan sering kali membutuhkan riset yang membosankan dan panjang di internet.

## 💡 Solusi yang Diberikan

**CostingCarbon** memecahkan masalah tersebut dengan pendekatan interaktif dan integratif:
1. **Visualisasi Lingkungan 3D:** Menggunakan model Bumi 3D dan *Carbon Futures Biome* yang merespons secara *real-time* terhadap batas karbon pengguna, mengubah angka emisi menjadi dampak visual yang emosional (dari ekosistem yang subur menjadi gurun berpolusi).
2. **Perencanaan Anggaran Karbon Interaktif:** Memberikan pengguna kendali penuh untuk mengalokasikan anggaran harian (berdasarkan target ilmiah 6,8 kg CO₂e/hari) melintasi 5 kategori aktivitas (Transportasi, Makanan, Energi, Digital, Sampah).
3. **Gamifikasi & Komunitas Global:** Menggunakan sistem *Tier*, Poin, *Achievements* (Pencapaian), dan Leaderboard global yang disinkronkan secara *real-time* menggunakan Supabase untuk memacu kompetisi sehat.
4. **Asisten AI Terintegrasi (Gaia):** Menyematkan AI berbasis Google Gemini yang memahami profil, data, dan riwayat emisi pengguna untuk memberikan edukasi iklim yang presisi, hiper-personal, dan instan bak seorang pakar lingkungan.

---

## 🛠 Metode Pengembangan

Pengembangan aplikasi ini menggunakan metode **Agile**. Pendekatan ini dipilih karena:
* **Fleksibilitas Tinggi:** Memungkinkan iterasi fitur secara cepat (rapid prototyping) berdasarkan evaluasi.
* **Continuous Integration / Continuous Deployment (CI/CD):** Memanfaatkan Netlify Drop dan GitHub untuk mempermudah pembaruan yang terus-menerus tanpa *downtime*.
* **Pengembangan Modular:** Setiap fitur seperti *Activity Logger*, *Leaderboard* (Supabase), dan *Gaia AI* dikembangkan, diuji, dan disempurnakan dalam *sprint* kecil sebelum diintegrasikan secara penuh.
* **Kolaborasi AI-Assisted:** Pengembangan dibantu oleh kecerdasan buatan untuk merancang struktur algoritma yang efisien dan memecahkan hambatan *debugging* secara tangkas.

---

## 💻 Teknologi yang Digunakan

Aplikasi ini dibangun dengan *stack* teknologi modern yang sangat ringan dan berkinerja tinggi:
* **Front-End:** Vanilla JavaScript, HTML5, Vanilla CSS (Tanpa framework berat seperti React, memastikan beban file hanya ~200KB).
* **3D Rendering Engine:** Three.js r128 (Menangani pencahayaan dinamis, partikel *glowing*, rotasi *orbit*, dan model GLB).
* **Autentikasi:** Auth0 SPA JS v2.1.3 (Google OAuth & Email login).
* **Database & Sinkronisasi:** Supabase JS v2 (PostgreSQL berbasis *serverless* untuk papan peringkat dan data profil).
* **Kecerdasan Buatan (AI):** Google Gemini 3.5 Flash API (Diproses melalui Netlify Serverless Functions agar kunci API aman).
* **Hosting & Deployment:** Netlify (Menyediakan CDN global dan backend *serverless*).

---

## 🏛 Arsitektur Sistem

Berikut adalah arsitektur sederhana bagaimana sistem **CostingCarbon** bekerja:

```mermaid
graph TD
    A[Pengguna (Browser)] -->|Load UI & 3D| B(index.html / Vanilla JS / Three.js)
    A -->|Autentikasi| C[Auth0]
    B -->|Simpan Data Personal| D[(Local Storage)]
    B -->|Sync Leaderboard & Profil| E[(Supabase PostgreSQL)]
    B -->|Tanya Gaia AI| F[Netlify Serverless Function]
    F -->|Kirim Prompt Rahasia| G[Google Gemini 3.5 Flash API]
```

**Penjelasan Arsitektur:**
1. **Front-End (Browser):** Semua aset grafis (HTML/JS/Model 3D) dimuat dari server CDN Netlify. Penyimpanan status aktivitas harian disimpan secara presisi di *Local Storage* per perangkat.
2. **Back-End (API & Database):**
   * Papan peringkat dan sinkronisasi skor komunitas dikelola oleh **Supabase**. Data profil pengguna (poin, avatar, bio, total emisi yang dihemat, pencapaian) ditarik dan disinkronkan ke sini.
   * Modul AI (Gaia) menggunakan **Netlify Functions** (`netlify/functions/gaia.js`). Hal ini memastikan *API Key* Google Gemini tersimpan aman di server Netlify sebagai *Environment Variables*, mencegah kebocoran kunci di sisi *client*.

---

## ✨ Fitur dan Fungsi Web

### 🌐 Bumi 3D Interaktif
Visualisasi Bumi real-time menggunakan tekstur NASA. Atmosfer Bumi berubah warna sesuai tingkat emisi CO₂e harian pengguna — dari putih bersih hingga merah kritis. Lima orb 3D (*Castle, Sakura, Crab, Chest, Ship*) mengambang mengelilingi Bumi sebagai panel fitur.

### 📋 Activity Logger
Pencatatan aktivitas harian presisi (dalam hitungan km, kwh, jam, dan gram) menggunakan faktor emisi dari **DEFRA 2023**, **Poore & Nemecek**, dan **ESDM RI 2022**. Setiap aktivitas langsung memperbarui widget harian, memicu riak *ripple effect* di UI, dan menambah poin pengguna.

### 📊 Dashboard — Carbon Bank Balance
Ringkasan karbon harian dan mingguan:
* Gauge karbon harian vs anggaran 6,8 kg.
* Grafik mingguan *Budget vs Actual*.
* Rincian emisi hari ini per kategori (donut chart).

### 🔮 Insights & Gaia AI
* **Scenario Simulator:** Skenario perubahan gaya hidup dengan kutipan inspiratif dari tokoh dunia.
* **Gaia AI:** Asisten AI yang memantau data pengguna secara personal dan menjawab pertanyaan seputar iklim melalui antarmuka *streaming text* seperti mesin ketik.

### 🎯 Budget Planner & Carbon Futures Biome
Alokasi anggaran karbon manual ke 5 kategori dengan target harian.
* **Carbon Futures Biome:** Simulator *micro-biome* 3D (pulau *low-poly*) yang memvisualisasikan dampak ekologis jangka panjang. Biome berkembang secara dinamis (subur dengan hewan vs gersang berpolusi) berdasarkan batas karbon yang direncanakan.

### 🏆 Community Forest & Public Profile
* Sinkronisasi data ke **Supabase** secara aktual.
* Profil Publik (*Public Profile*): Menampilkan Avatar pengguna, total aktivitas, metrik karbon yang dihemat (*kg Saved*), ringkasan *Tier*, dan lencana pencapaian (Achievements) yang dapat dilihat oleh semua orang di Leaderboard.
* 12 tantangan (*challenges*) dan 12 pencapaian yang terhubung dengan kontribusi nyata.

### 👤 Profil & Sistem Tier
Profil pengguna dengan sistem progres 5 tier yang mencerminkan perjalanan kesadaran lingkungan:

|Tier|Nama|Pts|Julukan|
|---|---|---|---|
|1|Explorer|0|The Lone Voyager|
|2|Guardian|20|The Orbital Sentry|
|3|Ecologist|60|The Bio-Terraformer|
|4|Atmosphere Architect|80|The Stellar Designer|
|5|Earth Sovereign|100|The Galactic Source|

---

## 🔬 Validasi Ilmiah

### 📌 Anggaran Harian 6,8 kg CO₂e/hari
Berangkat dari **Paris Agreement (2015)** (target 1,5°C) dan laporan **IPCC AR6**: Emisi global per kapita perlu turun ke sekitar **2,5 ton per tahun** (2.500 kg ÷ 365 hari ≈ 6,8 kg/hari).

### 🚗 Faktor Emisi Transportasi *(kg CO₂e per km)*
|Moda|Faktor|Sumber|
|-|-|-|
|Mobil bensin|0,192 kg/km|DEFRA GHG 2023|
|Sepeda motor|0,114 kg/km|DEFRA 2023|
|Bus|0,089 kg/km|DEFRA 2023|

### 🥗 Faktor Emisi Makanan *(kg CO₂e per gram)*
|Bahan|Faktor|Sumber|
|-|-|-|
|Daging sapi|0,027 kg/g|Poore & Nemecek (2018), *Science*|
|Ayam|0,0069 kg/g|Poore & Nemecek (2018)|
|Vegan|0,0019 kg/g|Our World in Data, 2020|

### ⚡ Faktor Emisi Energi *(kg CO₂e per kWh)*
|Sumber Energi|Faktor|Sumber|
|-|-|-|
|Listrik PLN (Indonesia)|0,781 kg/kWh|**ESDM RI 2022**|

### ♻️ Formula kgSaved
Metrik akumulasi karbon yang berhasil dihemat dibandingkan anggaran harian:
`kgSaved = Σ max(0, DAILY_BUDGET − emisi_harian)`
Hari yang melebihi anggaran tidak mengurangi total (metrik penghargaan, bukan hukuman).

---

## 🌱 Visi

CostingCarbon lahir dari keyakinan sederhana: bahwa kesadaran yang nyata — bukan rasa bersalah, bukan angka abstrak, tapi pemahaman yang hidup dan personal — adalah langkah pertama menuju perubahan. Setiap log aktivitas adalah percakapan kecil antara seseorang dan planetnya. Dan Gaia ada di sana, mendengarkan, siap membantu siapa pun yang mau bertanya.

---

## 👤 Kredit

Dibangun bersama, baris demi baris, dengan penuh kepedulian terhadap planet yang kita pinjam dari generasi yang akan datang. 
Dibuat dengan 💚 oleh **NEO TANJU ALLABIB, FARIS MAHENDRA SAKTI, dan JAYA MUSYAFA SURYA SUDRAJAT**.
