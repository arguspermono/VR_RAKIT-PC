// src/audio/audioManager.js
let bgm = null;
let clickSfx = null;
let pickSfx = null;
let putSfx = null;
let talkSfx = null;
let cheerSfx = null;

let bgmStarted = false;
let initialized = false;

export function initAudio() {
  if (initialized) return;
  initialized = true;

  // 1. Load semua file audio
  try {
    clickSfx = new Audio("./assets/audio/button-click-sfx.mp3");
    clickSfx.volume = 0.8;

    bgm = new Audio("./assets/audio/bgm-ambience.mp3");
    bgm.loop = true;
    bgm.volume = 0.3;

    pickSfx = new Audio("./assets/audio/picking-item-sfx.mp3");
    pickSfx.volume = 0.8;

    putSfx = new Audio("./assets/audio/putting-item-sfx.mp3");
    putSfx.volume = 0.8;

    talkSfx = new Audio("./assets/audio/talk.mp3");
    talkSfx.volume = 0.6;

    cheerSfx = new Audio("./assets/audio/cheering-sfx.mp3");
    cheerSfx.volume = 0.7;
  } catch (e) {
    console.warn("Gagal memuat audio:", e);
  }
}

// 2. Fungsi Play untuk masing-masing aksi

export function playClick() {
  if (!clickSfx) return;
  clickSfx.currentTime = 0;
  clickSfx.play().catch(() => {});
}

export function playPick() {
  if (!pickSfx) return;
  pickSfx.currentTime = 0;
  pickSfx.play().catch(() => {});
}

export function playPut() {
  if (!putSfx) return;
  putSfx.currentTime = 0;
  putSfx.play().catch(() => {});
}

export function playTalk() {
  if (!talkSfx) return;
  talkSfx.currentTime = 0;
  talkSfx.play().catch(() => {});
}

export function playCheer() {
  if (!cheerSfx) return;
  cheerSfx.currentTime = 0;
  cheerSfx.play().catch(() => {});
}

export function startBGM() {
  if (!bgm) return;
  if (bgmStarted) return;
  bgm.play().catch(() => {});
  bgmStarted = true;
}

export function stopBGM() {
  if (!bgm) return;
  bgm.pause();
  bgm.currentTime = 0;
  bgmStarted = false;
}
