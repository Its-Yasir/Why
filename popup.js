document.addEventListener("DOMContentLoaded", () => {
  // Get current tab domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    try {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;

      chrome.storage.local.get([hostname], (result) => {
        const data = result[hostname];
        const now = Date.now();

        if (data && data.status === "unlocked" && data.expiry > now) {
          // Show Session Info
          document.getElementById("active-session").style.display = "block";
          document.getElementById("no-session").style.display = "none";

          document.getElementById("site").textContent = hostname;
          document.getElementById("reason").textContent = `"${data.reason}"`;

          // Start Countdown
          updateTimer(data.expiry);
          setInterval(() => updateTimer(data.expiry), 1000);
        } else {
          // No session
          document.getElementById("active-session").style.display = "none";
          document.getElementById("no-session").style.display = "block";
        }
      });
    } catch (e) {
      document.getElementById("no-session").textContent = "Restricted Page";
    }
  });

  function updateTimer(expiry) {
    const now = Date.now();
    const diff = expiry - now;

    if (diff <= 0) {
      document.getElementById("timer").textContent = "Expired";
      return;
    }

    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("timer").textContent = `${mins}m ${
      secs < 10 ? "0" : ""
    }${secs}s`;
  }
});
