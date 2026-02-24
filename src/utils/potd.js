const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const LEETCODE_DAILY_QUERY = `
query questionOfToday {
  activeDailyCodingChallengeQuestion {
    date
    link
    question {
      title
      titleSlug
    }
  }
}
`.trim();

const GFG_POTD_URL = "https://www.geeksforgeeks.org/problem-of-the-day";

class PotdError extends Error {}

async function fetchLeetcodeDailyLink() {
  let response;

  try {
    response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: LEETCODE_DAILY_QUERY }),
    });
  } catch (error) {
    throw new PotdError(
      `Failed to reach LeetCode GraphQL API: ${error?.message || error}`,
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new PotdError(
      `LeetCode API returned HTTP ${response.status}: ${text.slice(0, 200)}`,
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new PotdError("LeetCode API did not return valid JSON.");
  }

  if (data.errors && data.errors.length > 0) {
    throw new PotdError(
      `LeetCode GraphQL errors: ${JSON.stringify(data.errors)}`,
    );
  }

  const daily = data?.data?.activeDailyCodingChallengeQuestion;
  const linkPath = daily?.link;

  if (typeof linkPath !== "string" || !linkPath.startsWith("/")) {
    throw new PotdError(
      `Invalid link field from LeetCode API: ${JSON.stringify(linkPath)}`,
    );
  }

  return `https://leetcode.com${linkPath}`;
}

function openInBrowser(url) {
  try {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  } catch (error) {
    // As a last resort, fall back to window.open
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (innerError) {
      // eslint-disable-next-line no-console
      console.error("Failed to open POTD URL in browser:", innerError);
    }
  }
}

async function openLeetcodeDaily() {
  try {
    const url = await fetchLeetcodeDailyLink();
    openInBrowser(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error opening LeetCode Daily Challenge:", error);
    alert(
      `Failed to open LeetCode Daily Challenge.\n\n${
        error instanceof PotdError ? error.message : "Please try again later."
      }`,
    );
  }
}

function openGfgPotd() {
  try {
    openInBrowser(GFG_POTD_URL);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error opening GFG POTD:", error);
    alert("Failed to open GeeksforGeeks Problem of the Day.");
  }
}

export async function openPotd(site = "all") {
  if (site === "lc") {
    await openLeetcodeDaily();
  } else if (site === "gfg") {
    openGfgPotd();
  } else if (site === "all") {
    await openLeetcodeDaily();
    openGfgPotd();
  }
}

export default {
  openPotd,
};
