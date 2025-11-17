// src/audio/audioManager.js

let bgm = null;
let clickSfx = null;
let pickSfx = null;
let putSfx = null;
let talkSfx = null;
let cheerSfx = null;

let bgmStarted = false;

// Fungsi helper untuk memuat audio jika belum ada (Lazy Load)
function loadAudio(path, vol = 1.0) {
  try {
    const audio = new Audio(path);
    audio.volume = vol;
    return audio;
  } catch (e) {
    console.warn(`Gagal load audio: ${path}`, e);
    return null;
  }
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
  // Load otomatis jika null
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

// Tetap sediakan initAudio untuk pre-load opsional
export function initAudio() {
  console.log("Pre-loading audio...");
  playClick();
  playPick();
  playPut();
  playTalk();
  playCheer();
  // Mute sebentar biar ga bunyi pas loading, lalu reset
  [clickSfx, pickSfx, putSfx, talkSfx, cheerSfx].forEach((sfx) => {
    if (sfx) {
      sfx.pause();
      sfx.currentTime = 0;
    }
  });
}
