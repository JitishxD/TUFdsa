const BASE_URL =
  "https://www.naukri.com/code360/api/v3/public_section/all_problems";

const PAGE_SIZE = 100;

async function fetchAllCode360Problems(search = "") {
  let allProblems = [];
  let page = 1;
  let totalPagesFetched = 0;
  let hasNext = true;

  while (hasNext) {
    const url = `${BASE_URL}?count=${PAGE_SIZE}&page=${page}&search=${encodeURIComponent(
      search,
    )}&naukri_request=true`;

    console.log(`Fetching page ${page}...`);

    const response = await fetch(url, {
      headers: {
        // These headers help avoid being blocked
        accept: "application/json",
        "x-requested-with": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed at page ${page}`);
    }

    const json = await response.json();
    totalPagesFetched++;

    const problems = json?.data?.problem_list ?? [];

    if (problems.length === 0) {
      hasNext = false;
      break;
    }

    allProblems.push(...problems);
    page++;
  }

  return {
    metadata: {
      totalProblems: allProblems.length,
      pagesFetched: totalPagesFetched,
      fetchedAt: new Date().toISOString(),
      source: "Naukri Code360 Public API",
    },
    problems: allProblems,
  };
}

// Download helper (same as your GFG one)
function downloadJSON(data, filename = "code360_problems.json") {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Usage
(async () => {
  try {
    const result = await fetchAllCode360Problems();
    console.log("Total problems fetched:", result.metadata.totalProblems);
    downloadJSON(result);
  } catch (err) {
    console.error(err);
  }
})();
