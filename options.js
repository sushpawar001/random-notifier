function saveOptions() {
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  chrome.storage.sync.set(
    {
      startTime: startTime,
      endTime: endTime,
    },
    () => {
      const status = document.getElementById("status");
      status.textContent = "Settings saved successfully!";
      status.classList.add("success");

      setTimeout(() => {
        status.textContent = "";
        status.classList.remove("success");
      }, 2000);
    }
  );
}

function restoreOptions() {
  chrome.storage.sync.get(
    {
      startTime: "08:00",
      endTime: "22:00",
    },
    (items) => {
      document.getElementById("startTime").value = items.startTime;
      document.getElementById("endTime").value = items.endTime;
    }
  );
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
