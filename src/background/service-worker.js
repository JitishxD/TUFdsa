console.log(
  "%c[Comet Extension] Background script loaded",
  "color: green; font-weight: bold;"
);

const CUSTOM_NEW_TAB_URL = chrome.runtime.getURL("src/newtab/newtab.html");
const CHROME_NEW_TAB_URLS = new Set([
  "chrome://newtab/",
  "chrome://new-tab-page/",
]);

function isDefaultNewTabPage(url) {
  return typeof url === "string" && CHROME_NEW_TAB_URLS.has(url);
}

function redirectToExtensionNewTab(tabId, candidateUrl) {
  if (!Number.isInteger(tabId) || !isDefaultNewTabPage(candidateUrl)) return;

  chrome.tabs.update(tabId, { url: CUSTOM_NEW_TAB_URL }, () => {
    if (chrome.runtime.lastError) {
      // Avoid crashing the service worker when Chrome rejects an update.
      console.warn(
        "[Comet Extension] Failed to redirect new tab:",
        chrome.runtime.lastError.message
      );
    }
  });
}

chrome.tabs.onCreated.addListener((tab) => {
  redirectToExtensionNewTab(tab.id, tab.pendingUrl || tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  redirectToExtensionNewTab(tabId, changeInfo.pendingUrl || changeInfo.url || tab?.url);
});
