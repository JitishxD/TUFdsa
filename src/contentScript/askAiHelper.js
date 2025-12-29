function getLeetcodeUserCode() {
    try {
        console.log("Getting leetcode user code");
        const elem = document.getElementById("__leetcode_code_export__");
        return (
            elem?.textContent ||
            [
                "__leetcode_code_export__ not found",
                "Did you configure the tampermonkey script?"
            ].join("\n")
        );
    } catch (e) {
        console.error("There is error getting the code", e);
        return "";
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_LEETCODE_USER_CODE") {
        console.log("Received GET_LEETCODE_USER_CODE Request");

        (async () => {
            try {
                const code = getLeetcodeUserCode();
                console.log("Sending code back to extension\n", code);

                sendResponse({
                    type: "LEETCODE_USER_CODE",
                    code
                });
            } catch (e) {
                console.error("Error getting LeetCode code", e);
                sendResponse({
                    type: "LEETCODE_USER_CODE",
                    code: null
                });
            }
        })();

        return true;
    }
});
