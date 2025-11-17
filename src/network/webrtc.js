// src/network/webrtc.js
import io from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

let socket = null;
let pc = null;
let dataChannel = null;

let remotePosCallback = () => {};

export async function initSignaling() {
  return new Promise((resolve, reject) => {
    socket = io("http://localhost:3000"); // ganti URL server signaling kamu

    socket.on("connect", () => {
      console.log("[Signaling] Connected");
      resolve();
    });

    socket.on("connect_error", (err) => {
      console.error("[Signaling] Connection error:", err);
      reject(err);
    });
  });
}

export async function connectRTC() {
  return new Promise(async (resolve, reject) => {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // ---- DATA CHANNEL (initiator) ----
    dataChannel = pc.createDataChannel("pos");
    setupDataChannel(dataChannel);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice", event.candidate);
      }
    };

    // ---- If other peer creates channel ----
    pc.ondatachannel = (event) => {
      console.log("[RTC] DataChannel received");
      setupDataChannel(event.channel);
    };

    // ---- SIGNALING EVENTS ----
    socket.on("offer", async (offer) => {
      console.log("[Signaling] Received offer");

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
      console.log("[Signaling] Received answer");
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice", async (candidate) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Failed to add ICE:", err);
      }
    });

    // ---- CREATE OFFER (starter peer) ----
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", offer);

    pc.onconnectionstatechange = () => {
      console.log("[RTC] State:", pc.connectionState);
      if (pc.connectionState === "connected") resolve();
      if (pc.connectionState === "failed") reject("WebRTC failed");
    };
  });
}

// =========================================================
// DATA CHANNEL
// =========================================================
function setupDataChannel(ch) {
  ch.onopen = () => console.log("[RTC] DataChannel open");
  ch.onclose = () => console.log("[RTC] DataChannel closed");

  ch.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type === "pos") {
        remotePosCallback(data.payload);
      }
    } catch (e) {
      console.warn("Invalid RTC message:", msg.data);
    }
  };

  dataChannel = ch;
}

// =========================================================
// API CALLED FROM sceneBase.js
// =========================================================
export function sendMyPosition(pos) {
  if (!dataChannel || dataChannel.readyState !== "open") return;
  dataChannel.send(
    JSON.stringify({
      type: "pos",
      payload: pos,
    })
  );
}

export function onRemotePosition(cb) {
  remotePosCallback = cb;
}
