console.log("%c[Comet Extension] Background script loaded", "color: green; font-weight: bold;");
const myNewTabUrl = chrome.runtime.getURL("src/newtab/newtab.html");

chrome.tabs.onCreated.addListener((tab) => {
  // Check if the new tab is the default Chromium/Comet new tab page
  if (tab.url === "chrome://newtab/" || tab.pendingUrl === "chrome://newtab/") {
    
    // Immediately redirect to your custom extension page
    chrome.tabs.update(tab.id, { 
        url: myNewTabUrl 
    });
  }
});