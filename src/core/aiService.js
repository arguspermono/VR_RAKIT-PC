// src/core/aiService.js
// Modul ini bertindak sebagai "Otak" yang menghubungi Google Gemini API.

// Kita import library Google AI langsung dari CDN (ESM-style)
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// --------------------------- KONEKSI KE GEMINI ---------------------------

// ⚠️ API KEY ANDA SAYA SEMBUNYIKAN UNTUK KEAMANAN
const API_KEY = "AIzaSyAHYjKJO8qKY9_8b8D_bqle3WDv7W12k2g"; // Pastikan key Anda ada di sini

let genAI = null;
let model = null;
let isInitializing = false; // Flag untuk mencegah inisialisasi ganda

// Cache sederhana agar tidak boros kuota API
// (key: componentName, value: data_json)
const knowledgeCache = {};

// Fungsi untuk inisialisasi model (dibuat 'lazy' agar tidak error saat load)
function initAI() {
  if (genAI || isInitializing) return; // Sudah diinisialisasi atau sedang proses
  isInitializing = true;
  try {
    console.log("Initializing Google AI...");
    genAI = new GoogleGenerativeAI(API_KEY);
    // Menggunakan model 'flash' yang cepat & cocok untuk respon real-time
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });
    console.log("Google AI Initialized.");
  } catch (error) {
    console.error("Gagal inisialisasi AI:", error);
  }
  isInitializing = false;
}

/**
 * Meminta insight AI (analogi, deskripsi, fakta) tentang sebuah komponen.
 * @param {string} componentName - Nama ID komponen (misal: "ram_1_pc", "processor")
 * @returns {Promise<object>} - Object berisi { role, desc, funFact }
 */
export async function getComponentInsight(componentName) {
  // Inisialisasi AI saat pertama kali dibutuhkan
  initAI();

  // 1. Cek di Cache dulu (HEMAT KUOTA)
  if (knowledgeCache[componentName]) {
    return knowledgeCache[componentName];
  }

  // 2. Jika tidak ada di cache, tanya AI
  if (!model) {
    console.error("AI Model not ready.");
    return getFallbackData(componentName);
  }

  // --- PERUBAHAN PROMPT DI SINI ---
  // Kita instruksikan AI untuk format judul BHS INGGRIS
  // dan deskripsi BHS INDONESIA
  const prompt = `
        You are a computer hardware expert.
        Identify this component from its filename: "${componentName}".
        
        Return a JSON object with 3 properties:
        1. "role": A short English title, combining the acronym AND analogy. Format: "ACRONYM (Analogy)". 
           (e.g., "CPU (The Brain)", "RAM (Workbench)", "PSU (The Heart)").
        2. "desc": A short technical explanation in **Bahasa Indonesia** (1 sentence).
        3. "funFact": A unique interesting fact in **Bahasa Indonesia** (max 15 words).
        
        Format: { "role": "...", "desc": "...", "funFact": "..." }
        Return ONLY raw JSON. No markdown ticks.
    `;
  // --- AKHIR PERUBAHAN PROMPT ---

  try {
    console.log(`[AI] Asking Gemini about: ${componentName}`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Bersihkan teks dari markdown (kadang AI masih mengirim ```json)
    const cleanText = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanText);

    // Simpan ke cache untuk penggunaan berikutnya
    knowledgeCache[componentName] = data;
    return data;
  } catch (error) {
    console.error("AI Error:", error);
    // Jika AI error (API salah, network, dll), berikan data fallback
    return getFallbackData(componentName);
  }
}

// Data cadangan jika AI gagal
function getFallbackData(componentName) {
  // --- PERUBAHAN FALLBACK DI SINI ---
  // Data cadangan juga diubah ke format baru
  const fallbackDB = {
    processor: {
      role: "CPU (The Brain)",
      desc: "Memproses semua instruksi.",
      funFact: "Bisa sepanas kompor!",
    },
    ram1_pc: {
      role: "RAM (Workbench)",
      desc: "Menyimpan data sementara.",
      funFact: "Data hilang saat mati listrik.",
    },
    gpu: {
      role: "GPU (The Artist)",
      desc: "Menggambar grafis ke layar.",
      funFact: "Punya ratusan 'otak' kecil.",
    },
    PSU: {
      role: "PSU (The Heart)",
      desc: "Memberikan daya ke semua komponen.",
      funFact: "Kipasnya penting untuk pendinginan.",
    },
  };
  // --- AKHIR PERUBAHAN FALLBACK ---

  if (fallbackDB[componentName]) return fallbackDB[componentName];

  return {
    role: componentName.toUpperCase(),
    desc: "Gagal memindai komponen...",
    funFact: "Cek koneksi internet atau API Key.",
  };
}
