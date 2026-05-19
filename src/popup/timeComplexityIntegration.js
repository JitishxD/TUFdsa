// analyzeTimeComplexity(code), analyzeTimeComplexityWithPermission(code)

const API_URL = "https://www.timecomplexity.ai/api/analyze";

/**
 * Analyzes the time complexity of the given code via TimeComplexity.ai API.
 * @param {string} code
 * @returns {Promise<{complexity: string|null, reasoning: string|null, error: string|null}>}
 */
export async function analyzeTimeComplexity(code) {
  if (!code || !code.trim()) {
    return { complexity: null, reasoning: null, error: "No code provided" };
  }

  const headers = {
    "content-type": "application/json",
    "x-session-id": crypto.randomUUID(),
  };
  const payload = { inputCode: code };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (responseText.trim() === "Error") {
      return { complexity: null, reasoning: null, error: "Rate limit exceeded" };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        complexity: null,
        reasoning: null,
        error: `Invalid JSON response: ${responseText.slice(0, 200)}`,
      };
    }

    if (data.status === "Success") {
      return {
        complexity: data.timeComplexity || "Unknown",
        reasoning: data.reasoning || "",
        error: null,
      };
    }
    if (data.status === "Error") {
      return {
        complexity: null,
        reasoning: null,
        error: data.message || "Unknown API error",
      };
    }

    return {
      complexity: null,
      reasoning: null,
      error: `Unexpected response: ${JSON.stringify(data)}`,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return { complexity: null, reasoning: null, error: "Request timed out" };
    }
    return {
      complexity: null,
      reasoning: null,
      error: `Unexpected error: ${err.message}`,
    };
  }
}

export async function analyzeTimeComplexityWithPermission(code) {
  return new Promise((resolve) => {
    try {
      chrome.permissions.contains(
        { origins: ["https://www.timecomplexity.ai/*"] },
        async (hasPermission) => {
          if (hasPermission) {
            resolve(await analyzeTimeComplexity(code));
          } else {
            chrome.permissions.request(
              { origins: ["https://www.timecomplexity.ai/*"] },
              async (granted) => {
                if (granted) {
                  resolve(await analyzeTimeComplexity(code));
                } else {
                  resolve({
                    complexity: null,
                    reasoning: null,
                    error: "permission_denied",
                  });
                }
              },
            );
          }
        },
      );
    } catch (e) {
      resolve({
        complexity: null,
        reasoning: null,
        error: String(e),
      });
    }
  });
}
