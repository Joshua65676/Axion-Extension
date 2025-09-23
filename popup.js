chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "updateStatus") {
    document.getElementById("status").innerText = msg.status;
  }
});
chrome.runtime.sendMessage({ action: "syncBookmarks" });

document.getElementById("sync").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      window.scrollTo(0, 0);
      let interval = setInterval(() => {
        window.scrollBy(0, 1000);
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
          clearInterval(interval);

          chrome.runtime.sendMessage({
            action: "syncBookmarks",
            data: {
              tweet: "This is a test tweet",
              category: "inspiration",
            },
          });

          chrome.runtime.sendMessage({
            action: "updateStatus",
            status: "✅ Bookmarks synced!",
          });
        }
      }, 5000);
    },
  });

  document.getElementById("status").innerText = "Syncing bookmarks...!!!";
});
