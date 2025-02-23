let pauseTimer = null;
let countdownInterval = null;

document.addEventListener("DOMContentLoaded", function () {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const pauseTime = document.getElementById("pauseTime");
  const customTimeInput = document.getElementById("customTimeInput");
  const customMinutes = document.getElementById("customMinutes");
  const applyCustomTime = document.getElementById("applyCustomTime");
  const pauseOptions = document.getElementById("pauseOptions");
  const statusIndicator = document.getElementById("statusIndicator");
  const timerDisplay = document.getElementById("timerDisplay");

  // Initialize state
  chrome.storage.local.get(
    ["notificationState", "pauseEndTime"],
    function (result) {
      const state = result.notificationState || "running";
      updateUI(state);

      // If paused, start the countdown
      if (state === "paused" && result.pauseEndTime) {
        const remainingTime = result.pauseEndTime - Date.now();
        if (remainingTime > 0) {
          startCountdown(result.pauseEndTime);
        }
      }
    }
  );

  startBtn.addEventListener("click", function () {
    chrome.storage.local.set({ notificationState: "running" });
    updateUI("running");
    chrome.runtime.sendMessage({ action: "startNotifications" });
    stopCountdown();
  });

  stopBtn.addEventListener("click", function () {
    chrome.storage.local.set({ notificationState: "stopped" });
    updateUI("stopped");
    chrome.runtime.sendMessage({ action: "stopNotifications" });
    stopCountdown();
  });

  pauseBtn.addEventListener("click", function () {
    if (pauseOptions.classList.contains("visible")) {
      pauseOptions.classList.remove("visible");
    } else {
      pauseOptions.classList.add("visible");
    }
  });

  pauseTime.addEventListener("change", function () {
    if (this.value === "custom") {
      customTimeInput.style.display = "block";
    } else {
      customTimeInput.style.display = "none";
      setPauseTimer(parseInt(this.value));
    }
  });

  applyCustomTime.addEventListener("click", function () {
    const minutes = parseInt(customMinutes.value);
    if (minutes > 0) {
      setPauseTimer(minutes);
    }
  });

  function setPauseTimer(minutes) {
    const pauseEndTime = Date.now() + minutes * 60 * 1000;
    chrome.storage.local.set({
      notificationState: "paused",
      pauseEndTime: pauseEndTime,
    });
    updateUI("paused");
    chrome.runtime.sendMessage({
      action: "pauseNotifications",
      duration: minutes,
    });
    startCountdown(pauseEndTime);
    pauseOptions.classList.remove("visible");
  }

  function startCountdown(endTime) {
    stopCountdown(); // Clear any existing countdown
    timerDisplay.classList.add("visible");

    function updateTimer() {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        stopCountdown();
        updateUI("running");
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      timerDisplay.textContent = `Resuming in: ${minutes}m ${seconds}s`;
    }

    updateTimer(); // Initial update
    countdownInterval = setInterval(updateTimer, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    timerDisplay.classList.remove("visible");
  }

  function updateUI(state) {
    // Update status indicator
    statusIndicator.className = "status-indicator";
    switch (state) {
      case "running":
        statusIndicator.textContent = "Notifications Active";
        statusIndicator.classList.add("status-running");
        break;
      case "paused":
        statusIndicator.textContent = "Notifications Paused";
        statusIndicator.classList.add("status-paused");
        break;
      case "stopped":
        statusIndicator.textContent = "Notifications Stopped";
        statusIndicator.classList.add("status-stopped");
        break;
    }

    // Update button states
    startBtn.disabled = state === "running";
    pauseBtn.disabled = state === "stopped" || state === "paused";
    stopBtn.disabled = state === "stopped";

    // Hide pause options if not relevant
    if (state !== "running") {
      pauseOptions.classList.remove("visible");
    }
  }
});
