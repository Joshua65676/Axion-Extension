chrome.runtime.onInstalled.addListener(() => {
  console.log("Axion background script installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "syncBookmarks") {
    console.log("Manual sync request received");
    sendResponse({ status: "triggered" });
  }

  return false;
});

chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    if (request.type === "CHECK_CONNECTION") {
      sendResponse({ installed: true, connected: true });
      return true;
    }

    if (request.ping) {
      sendResponse({ status: "alive" });
      return true;
    }

    if (request.type === "SET_USER" && request.user) {
      chrome.storage.local.set({ currentUser: request.user }, () => {
        console.log("User info saved:", request.user);
        sendResponse({ status: "ok" });
      });

      return true;
    }

    return false;
  },
);
