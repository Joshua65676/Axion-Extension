chrome.runtime.onInstalled.addListener(() => {
  console.log(" Axion background script installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "syncBookmarks") {
    console.log(" Sync triggered manually");
    sendResponse({ status: "triggered" });
  }
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.message === "ping") {
    sendResponse({ installed: true });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.ping) {
    sendResponse({ status: "alive" });
    return true;
  }

  if (message.type === "SET_USER" && message.user) {
    chrome.storage.local.set({ currentUser: message.user }, () => {
      console.log(" User info saved:", message.user);
      sendResponse({ status: "ok" });
    });

    return true;
  }
});