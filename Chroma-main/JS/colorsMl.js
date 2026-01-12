'use strict';

// --- BACKGROUND COLOR CYCLING ---
const work = document.querySelector(".workspace");

const colored = [
  "rgba(255, 0, 0,0.8)",    // red
  "rgba(0, 255, 255,0.8)",   // cyan
  "rgba(255, 255, 255,0.8)", // white
  "rgba(138, 43, 226,0.8)",  // violet
  "rgba(0, 255, 0,0.8)"      // green
];

let colorIndex = 0;

setInterval(() => {
  if (work) {
    work.style.setProperty(
      "--workspace-bg",
      colored[colorIndex]
    );
    colorIndex = (colorIndex + 1) % colored.length;
  }
}, 2000);

// --- MAIN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
  // --- CONTROL VARIABLE ---
  // Set this to true or false to change the outcome
  let verified = false; 

  const overlay = document.getElementById("overlay");
  const mainContent = document.getElementById("mainContent");
  const audio = document.getElementById("audio");
  const visualizerContainer = document.querySelector(".visualizer-container");
  
  const mainHeader = document.getElementById("mainHeader");
  const mainHeadingBox = document.getElementById("mainHeadingBox");
  const endBtn = document.getElementById("endBtn");
  const textBottom = document.querySelector(".second-row");
  
  // NEW: Select the spinner
  const spinner = document.getElementById("loadingSpinner");
  const calibrationText = document.querySelector(".calibration-text");
  let calibrationTimers = []; 

  // --- CALIBRATION LOGIC ---
  function runCalibrationSequence() {
    clearCalibrationTimers();
    
    // Ensure spinner is visible when starting
    if(spinner) spinner.style.display = "block";

    // 0s: Start
    if(calibrationText) calibrationText.innerText = "CALIBRATING SEQUENCE...";

    // 3s: Frames Analyzed
    calibrationTimers.push(setTimeout(() => {
      if(calibrationText) calibrationText.innerText = "400+ FRAMES ANALYZED...";
    }, 3000));

    // 7s: Generating
    calibrationTimers.push(setTimeout(() => {
      if(calibrationText) calibrationText.innerText = "GENERATING RESPONSE...";
    }, 7000));

    // 10s: Result based on Boolean
    calibrationTimers.push(setTimeout(() => {
      // HIDE THE SPINNER NOW
      if(spinner) spinner.style.display = "none";

      if(calibrationText) {
        if (verified) {
            calibrationText.innerText = "VERIFIED HUMAN";
            // Add success styling (Teal/Green)
            calibrationText.style.color = "#00ffcc";
            calibrationText.style.textShadow = "0 0 15px #00ffcc";
        } else {
            calibrationText.innerText = "NOT VERIFIED";
            // Add failure styling (Red/Pink)
            calibrationText.style.color = "#ff0055";
            calibrationText.style.textShadow = "0 0 15px #ff0055";
        }
      }
    }, 10000));
  }

  function clearCalibrationTimers() {
    calibrationTimers.forEach(timer => clearTimeout(timer));
    calibrationTimers = [];
    
    // Reset styles to default (white)
    if(calibrationText) {
        calibrationText.style.color = ""; 
        calibrationText.style.textShadow = "";
    }
    
    // Reset spinner visibility (show it again for next time)
    if(spinner) spinner.style.display = "block";
  }

  // --- START ---
  if(overlay) {
      overlay.addEventListener("click", () => {
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";

        if(mainContent) mainContent.classList.remove("waiting-to-start");
        if(visualizerContainer) visualizerContainer.style.opacity = "1";

        if (audio) audio.play().catch(e => console.log("Audio error:", e));

        if(mainHeader) mainHeader.classList.add("hidden");
        if(mainHeadingBox) mainHeadingBox.classList.add("hidden");
        
        if(textBottom) textBottom.classList.remove("hidden");
        
        runCalibrationSequence();
      });
  }

  // --- END ---
  if(endBtn) {
      endBtn.addEventListener("click", () => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }

        if(overlay) {
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "all";
        }

        if(mainContent) mainContent.classList.add("waiting-to-start");
        if(visualizerContainer) visualizerContainer.style.opacity = "0";

        if(mainHeader) mainHeader.classList.remove("hidden");
        if(mainHeadingBox) mainHeadingBox.classList.remove("hidden");
        
        textBottom.classList.add("hidden");

        clearCalibrationTimers();
        if(calibrationText) calibrationText.innerText = "SYSTEM CALIBRATING..."; 
      });
  }

  // --- MENU & LOCAL VIDEO CHECK ---
  const menuTrigger = document.getElementById("menuTrigger");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const uploadLink = document.getElementById("uploadLink");
  const videoInput = document.getElementById("videoInput");
  const statusText = document.getElementById("uploadStatus");

  if(menuTrigger && menuOverlay) {
      menuTrigger.addEventListener("click", () => menuOverlay.classList.add("active"));
  }
  
  if(closeMenuBtn && menuOverlay) {
      closeMenuBtn.addEventListener("click", () => menuOverlay.classList.remove("active"));
  }
  
  if(menuOverlay) {
      menuOverlay.addEventListener("click", (e) => {
        if (e.target === menuOverlay) menuOverlay.classList.remove("active");
      });
  }
  
  if (uploadLink) {
    uploadLink.addEventListener("click", (e) => {
      e.preventDefault();
      const menuOverlay = document.getElementById("menuOverlay");
      if (menuOverlay) menuOverlay.classList.remove("active");
      if (videoInput) videoInput.click();
    });
  }

  if (videoInput) {
    videoInput.addEventListener("change", function () {
      if (this.files && this.files[0]) validateFile(this.files[0]);
    });
  }

  function validateFile(file) {
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = function () {
      window.URL.revokeObjectURL(videoElement.src);
      if (videoElement.duration > 9) {
        alert("Video too long. Max 9s.");
        videoInput.value = "";
        return;
      }
      // Success case - just update UI since we removed backend upload
      if(statusText) statusText.innerText = "Video Ready (Local)";
      console.log("File checked and ready:", file.name);
    };
    videoElement.src = URL.createObjectURL(file);
  }
});