// src/audio/audioManager.js

let bgm = null;
let clickSfx = null;
let pickSfx = null;
let putSfx = null;
let talkSfx = null;
let cheerSfx = null;

let bgmStarted = false;
export let isMuted = false; // Variable global untuk status mute

// Fungsi helper load audio (Updated: Cek isMuted saat load)
function loadAudio(path, vol = 1.0) {
  try {
    const audio = new Audio(path);
    audio.volume = vol;
    audio.muted = isMuted; // 🔥 PENTING: Ikuti status mute saat ini
    return audio;
  } catch (e) {
    console.warn(`Gagal load audio: ${path}`, e);
    return null;
  }
}

// --- FUNGSI BARU: TOGGLE MUTE (BGM & SFX) ---
export function toggleMute() {
  isMuted = !isMuted; // Balik status (True <-> False)

  // Masukkan SEMUA audio ke dalam list, termasuk BGM
  const allAudio = [bgm, clickSfx, pickSfx, putSfx, talkSfx, cheerSfx];

  allAudio.forEach((sound) => {
    if (sound) {
      sound.muted = isMuted; // Matikan/Nyalakan suara
    }
  });

  return isMuted; // Kembalikan status untuk update UI (tombol merah/putih)
}

// --- FUNGSI PLAY (OTOMATIS LOAD) ---

export function playClick() {
  if (!clickSfx)
    clickSfx = loadAudio("./assets/audio/button-click-sfx.mp3", 0.8);
  if (clickSfx) {
    clickSfx.currentTime = 0;
    clickSfx.play().catch(() => {});
  }
}

export function playPick() {
  if (!pickSfx) pickSfx = loadAudio("./assets/audio/picking-item-sfx.mp3", 0.8);
  if (pickSfx) {
    pickSfx.currentTime = 0;
    pickSfx.play().catch((e) => console.warn("Pick SFX error:", e));
  }
}

export function playPut() {
  if (!putSfx) putSfx = loadAudio("./assets/audio/putting-item-sfx.mp3", 0.8);
  if (putSfx) {
    putSfx.currentTime = 0;
    putSfx.play().catch((e) => console.warn("Put SFX error:", e));
  }
}

export function playTalk() {
  if (!talkSfx) talkSfx = loadAudio("./assets/audio/talk.mp3", 0.6);
  if (talkSfx) {
    talkSfx.currentTime = 0;
    talkSfx.play().catch((e) => console.warn("Talk SFX error:", e));
  }
}

export function playCheer() {
  if (!cheerSfx) cheerSfx = loadAudio("./assets/audio/cheering-sfx.mp3", 0.7);
  if (cheerSfx) {
    cheerSfx.currentTime = 0;
    cheerSfx.play().catch((e) => console.warn("Cheer SFX error:", e));
  }
}

export function startBGM() {
  if (!bgm) {
    bgm = loadAudio("./assets/audio/bgm-ambience.mp3", 0.3);
    if (bgm) bgm.loop = true;
  }

  // Pastikan BGM mengikuti status mute saat dimulai
  if (bgm) bgm.muted = isMuted;

  if (bgm && !bgmStarted) {
    bgm.play().catch(() => {});
    bgmStarted = true;
  }
}

export function stopBGM() {
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
    bgmStarted = false;
  }
}

// Pre-load optional
export function initAudio() {
  console.log("Pre-loading audio...");
  playClick();
  playPick();
  playPut();
  playTalk();
  playCheer();

  const allAudio = [clickSfx, pickSfx, putSfx, talkSfx, cheerSfx];
  allAudio.forEach((sfx) => {
    if (sfx) {
      sfx.pause();
      sfx.currentTime = 0;
      sfx.muted = isMuted; // Sync mute status
    }
  });
}
