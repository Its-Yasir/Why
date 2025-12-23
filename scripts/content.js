(function () {
  const HOSTNAME = window.location.hostname;

  // Check Status immediately
  chrome.storage.local.get([HOSTNAME], (result) => {
    const data = result[HOSTNAME];
    const now = Date.now();

    // 1. If unlocked and time remains -> Allow access & Start Timer
    if (data && data.status === "unlocked" && data.expiry > now) {
      const timeRemaining = data.expiry - now;
      console.log(
        `[WHY] Access granted. Time left: ${Math.round(
          timeRemaining / 60000
        )} mins`
      );

      // Set auto-lock timer
      setTimeout(() => {
        alert("Time's up! Blocking site.");
        window.location.reload();
      }, timeRemaining);

      return; // EXIT: Do not show overlay
    }

    // 2. Else -> Show Overlay
    showOverlay();
  });

  function showOverlay() {
    // Prevent scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("why-locked");

    // Create Container
    const overlay = document.createElement("div");
    overlay.id = "why-extension-overlay";

    const container = document.createElement("div");
    container.className = "why-container";

    // Logo
    const logo = document.createElement("img");
    logo.src = chrome.runtime.getURL("assets/icon.png");

    // Title
    const title = document.createElement("h1");
    title.innerText = "State your Purpose";

    // Reason Input
    const input = document.createElement("textarea");
    input.placeholder = "I am visiting because...";

    // Time Selector
    const timeBox = document.createElement("div");
    timeBox.className = "time-selector";

    const timeLabel = document.createElement("label");
    timeLabel.innerText = "Session Duration:";

    const timeSelect = document.createElement("select");
    const times = [5, 10, 15, 30, 60];
    times.forEach((min) => {
      const opt = document.createElement("option");
      opt.value = min;
      opt.innerText = `${min} Minutes`;
      timeSelect.appendChild(opt);
    });

    // Button
    const button = document.createElement("button");
    button.innerText = "Focus & Unlock";

    // Assemble
    timeBox.appendChild(timeLabel);
    timeBox.appendChild(timeSelect);

    container.appendChild(logo);
    container.appendChild(title);
    container.appendChild(input);
    container.appendChild(timeBox);
    container.appendChild(button);
    overlay.appendChild(container);

    // Inject
    if (document.body) {
      document.body.appendChild(overlay);
    } else {
      document.documentElement.appendChild(overlay);
    }

    // Logic
    button.addEventListener("click", () => {
      const reason = input.value.trim();
      const minutes = parseInt(timeSelect.value);

      if (reason.length > 3) {
        const now = Date.now();
        const expiry = now + minutes * 60 * 1000;

        // Save to storage
        const sessionData = {
          status: "unlocked",
          reason: reason,
          expiry: expiry,
          duration: minutes,
        };

        const storeObj = {};
        storeObj[HOSTNAME] = sessionData;

        chrome.storage.local.set(storeObj, () => {
          // Unlock
          overlay.remove();
          document.body.classList.remove("why-locked");
          document.documentElement.style.overflow = "";

          // Set Timer to re-block
          setTimeout(() => {
            alert("Time's up!");
            window.location.reload();
          }, minutes * 60 * 1000);
        });
      } else {
        alert("Please enter a valid reason.");
      }
    });
  }
})();
