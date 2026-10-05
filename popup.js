const syncButton = document.getElementById("sync");
const statusBox = document.getElementById("status");

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? "#ff8a80" : "#d7ffe7";
}

function isBookmarksPageUrl(url) {
  return /\/i\/(bookmarks|history)(?:[/?#]|$)/.test(url);
}

syncButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url) {
    setStatus("Open a Twitter/X bookmarks tab first.", true);
    return;
  }

  if (!isBookmarksPageUrl(tab.url)) {
    setStatus("Please open your Twitter/X bookmarks/history page first.", true);
    return;
  }

  setStatus("Syncing bookmarks...");

  chrome.tabs.sendMessage(tab.id, { action: "syncBookmarks" }, () => {
    if (chrome.runtime.lastError) {
      setStatus("Could not start sync on this page.", true);
      return;
    }

    setStatus("Sync started. Please wait a moment.");
  });
});
