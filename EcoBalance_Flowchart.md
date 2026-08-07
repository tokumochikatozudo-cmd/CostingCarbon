# 🌍 EcoBalance — Detailed System Flowchart

Flowchart ini didesain persis seperti standar diagram alur sistem (*system flowchart*), dimulai dari **START** dan **LOGIN**, dengan bentuk-*shape* yang merepresentasikan setiap proses:
- **Oval (Pill)**: Titik Start / End
- **Jajar Genjang (Parallelogram)**: Input / Output / Tampilan (Display)
- **Persegi Panjang (Rectangle)**: Proses Sistem / Kalkulasi
- **Belah Ketupat (Diamond)**: Keputusan (Decision - Yes/No)
- **Tabung (Database)**: Penyimpanan Data / Server

Setiap panel dan fitur (termasuk fitur *Google Fit API*, *OCR Scanner*, dan *B2B2C Rewards*) saling terhubung menggunakan garis panah (*flow lines*) yang akhirnya selalu kembali ke hub utama (**3D Earth Gateway**) kecuali pengguna memilih *Logout*.

---

## 🗺️ Visual Flowchart (Standard Format)

\`\`\`mermaid
flowchart TD
    %% Define Shapes and Styles
    classDef startEnd fill:#f9ca24,stroke:#f0932b,stroke-width:2px,color:#000
    classDef process fill:#ecf0f1,stroke:#bdc3c7,stroke-width:2px,color:#2c3e50
    classDef decision fill:#7ed6df,stroke:#22a6b2,stroke-width:2px,color:#000
    classDef io fill:#badc58,stroke:#6ab04c,stroke-width:2px,color:#000
    classDef storage fill:#ffbe76,stroke:#f0932b,stroke-width:2px,color:#000
    
    A([START]):::startEnd --> B[Open EcoBalance Web App]:::process
    B --> C{Is Authenticated?}:::decision
    
    %% LOGIN FLOW
    C -- No --> D[/Auth0 Login Page/]:::io
    D --> E[/Input Google / Email Account/]:::io
    E --> F{Is Login Valid?}:::decision
    F -- No --> D
    F -- Yes --> G[Access Granted]:::process
    G --> H
    
    C -- Yes --> H[3D EARTH GATEWAY]:::process
    
    %% MAIN HUB DECISION
    H --> I{Select Feature Panel}:::decision
    
    %% --- PROFILE FLOW ---
    I -- Profile Panel --> P1[/Display Profile & Tier/]:::io
    P1 --> P2{Edit Profile?}:::decision
    P2 -- Yes --> P3[/Input New Profile Data/]:::io
    P3 --> P4{Save Changes?}:::decision
    P4 -- Yes --> P5[(Update LocalStorage)]:::storage
    P5 --> H
    P4 -- No --> P1
    P2 -- No --> H
    
    %% --- DASHBOARD FLOW ---
    I -- Dashboard Panel --> D1[Fetch Daily/Weekly Data]:::process
    D1 --> D2[/Display Carbon Gauge & Charts/]:::io
    D2 --> H
    
    %% --- INSIGHTS FLOW ---
    I -- Insights Panel --> IN1[Fetch 30-Day Trend]:::process
    IN1 --> IN2[/Display Trend & Scenarios/]:::io
    IN2 --> IN3{Ask Gaia AI?}:::decision
    IN3 -- Yes --> IN4[/Input Prompt/]:::io
    IN4 --> IN5[Gemini 2.5 API Processing]:::process
    IN5 --> IN6[/Display AI Response/]:::io
    IN6 --> IN3
    IN3 -- No --> H
    
    %% --- BUDGET PLANNER FLOW ---
    I -- Budget Planner --> B1[/Display Current Limits/]:::io
    B1 --> B2[/Adjust Category Sliders/]:::io
    B2 --> B3[Update Carbon Futures Biome 3D]:::process
    B3 --> B4{Confirm Limit?}:::decision
    B4 -- Yes --> B5[(Save Configuration to LocalStorage)]:::storage
    B5 --> H
    B4 -- No --> B2
    
    %% --- COMMUNITY FOREST FLOW ---
    I -- Community Panel --> C1[Sync Local Data to Supabase]:::process
    C1 --> C2[(Supabase Database)]:::storage
    C2 --> C3[/Display Global Leaderboard/]:::io
    C3 --> H
    
    %% --- ACTIVITY LOGGER FLOW ---
    I -- Activity Logger --> AL1{Select Input Method}:::decision
    
    AL1 -- Manual --> AL2[/Input Category & Value/]:::io
    
    AL1 -- API Sync --> AL3[Call Google Fit / Strava API]:::process
    AL3 --> AL4[/Receive Walking Data/]:::io
    AL4 --> AL5[Assign Verified Green Points]:::process
    
    AL1 -- OCR Scan --> AL6[/Upload Green Transaction Receipt/]:::io
    AL6 --> AL7[Run OCR Text Scanner]:::process
    AL7 --> AL8{Is Valid Green Transaction?}:::decision
    AL8 -- Yes --> AL9[Assign Verified Green Points]:::process
    AL8 -- No --> AL10[/Show Rejection Message/]:::io
    AL10 --> AL1
    
    AL2 --> AL11[Calculate CO2 Emissions]:::process
    AL5 --> AL11
    AL9 --> AL11
    
    AL11 --> AL12[(Update Daily History & Add Total Points)]:::storage
    AL12 --> H
    
    %% --- REWARD CENTER FLOW ---
    I -- Reward Center --> R1[Check Verified Green Points]:::process
    R1 --> R2[/Display Points Balance/]:::io
    R2 --> R3{Meet Voucher Threshold?}:::decision
    R3 -- Yes --> R4[Generate B2B2C Voucher Code]:::process
    R4 --> R5[/Display Real Shopping Voucher/]:::io
    R5 --> R6[(Deduct Points)]:::storage
    R6 --> H
    R3 -- No --> R7[/Display 'Keep Saving Emissions'/]:::io
    R7 --> H
    
    %% --- LOGOUT FLOW ---
    I -- Logout --> L1{Do you really want to logout?}:::decision
    L1 -- No --> H
    L1 -- Yes --> L2[Clear Session / Sign Out]:::process
    L2 --> L3([END]):::startEnd

\`\`\`

## Keterangan Logika

1. **Gatekeeping (Login Flow)**: Sama seperti diagram klasik, aplikasi dimulai dengan pengecekan autentikasi. Jika *User Account* tidak valid, aplikasi akan berputar (loop) kembali ke form input login. Jika berhasil, *Access Granted* membawanya ke Dashboard/Gateway.
2. **Sentralisasi (Hub Flow)**: Titik `[3D EARTH GATEWAY]` adalah jantung navigasi. Apa pun panel yang dibuka pengguna (baik itu sekadar melihat Dashboard, mengubah konfigurasi di Budget Planner, mencatat emisi di Activity Logger, atau menukar poin di Reward Center), setelah proses selesai, panah akan selalu bermuara kembali ke Gateway tersebut.
3. **Pencabangan Presisi (Decision)**: Diagram secara ketat menggunakan belah ketupat untuk setiap pertanyaan (*Yes/No*), seperti "Is Valid Green Transaction?" pada sistem pemindai OCR, atau "Meet Voucher Threshold?" pada penukaran *Reward Center*.
4. **Input/Output Parallelogram**: Setiap langkah yang membutuhkan input pengguna (seperti mengisi prompt ke Gaia AI, mengatur slider budget, atau mengunggah setruk/foto OCR) digambarkan secara spesifik menggunakan bentuk jajar genjang.
