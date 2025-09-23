chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Axion background script installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "syncBookmarks") {
    console.log("📌 Sync triggered manually");
    sendResponse({ status: "triggered" });
  }
});