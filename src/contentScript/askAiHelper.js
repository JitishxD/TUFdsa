function getLeetcodeUserCode() {
  try {
    console.log("Getting leetcode user code");
    const elem = document.getElementById("__leetcode_code_export__");
    return (
      elem?.textContent ||
      [
        "__leetcode_code_export__ not found",
        "Did you configure the tampermonkey script?",
      ].join("\n")
    );
  } catch (e) {
    console.error("There is error getting the code", e);
    return "";
  }
}

function getGfgUserCode() {
  try {
    console.log("Getting GFG user code");
    const elem = document.getElementById("__gfg_code_export__");
    return (
      elem?.textContent ||
      ["ace-editor not found", "I don't know why report this"].join("\n")
    );
  } catch (e) {
    console.error("There is error getting the code", e);
    return "";
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_USER_CODE") {
    console.log("Received GET_USER_CODE Request");

    (async () => {
      try {
        let code;
        let url = window.location.href;
        // code360 also uses monaco based code editor like leetcode
        if (url.includes("leetcode.com") || url.includes("code360")) {
          code = getLeetcodeUserCode();
        } else if (url.includes("geeksforgeeks.org")) {
          code = getGfgUserCode();
        } else {
          code = null;
        }
        console.log("Sending code back to extension\n", code);

        sendResponse({
          type: "USER_CODE",
          code,
        });
      } catch (e) {
        console.error("Error getting LeetCode code", e);
        sendResponse({
          type: "USER_CODE",
          code: null,
        });
      }
    })();

    return true;
  }
});
