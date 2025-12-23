(function () {
  // Unique key for this specific tab/session
  const SESSION_KEY = "why_unlocked_" + window.location.hostname;

  // Check if user already unlocked this site in this session
  if (sessionStorage.getItem(SESSION_KEY)) {
    return; // Allow access
  }

  // prevent site interaction immediately
  document.documentElement.style.overflow = "hidden";

  // Create the overlay elements
  const overlay = document.createElement("div");
  overlay.id = "why-extension-overlay";

  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("assets/icon.png");
  logo.style.width = "80px";
  logo.style.marginBottom = "20px";

  const title = document.createElement("h1");
  title.innerText = "Why are you here?";

  const input = document.createElement("textarea");
  input.placeholder = "I need to visit this site because...";

  const button = document.createElement("button");
  button.innerText = "Unlock Site";

  // Assemble the UI
  overlay.appendChild(logo);
  overlay.appendChild(title);
  overlay.appendChild(input);
  overlay.appendChild(button);

  // Inject into the page
  // We use a timer to ensure body exists, or append to documentElement if body is null
  const injectOverlay = () => {
    if (document.body) {
      document.body.appendChild(overlay);
      document.body.classList.add("why-locked");
    } else {
      document.documentElement.appendChild(overlay);
    }
  };

  // Run injection
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectOverlay);
  } else {
    injectOverlay();
  }

  // Button Logic
  button.addEventListener("click", () => {
    const reason = input.value.trim();

    // Validation: Must type at least 10 characters
    if (reason.length > 5) {
      // Remove overlay
      overlay.remove();
      document.body.classList.remove("why-locked");
      document.documentElement.style.overflow = "";

      // Save permission to session storage so it doesn't ask again until tab is closed
      sessionStorage.setItem(SESSION_KEY, "true");

      // Optional: Save the reason to Chrome storage for your review later
      chrome.storage.local.get({ logs: [] }, (result) => {
        const logs = result.logs;
        logs.push({
          site: window.location.hostname,
          reason: reason,
          date: new Date().toLocaleString(),
        });
        chrome.storage.local.set({ logs: logs });
      });
    } else {
      alert("Please give a valid reason (min 5 chars).");
    }
  });
})();
