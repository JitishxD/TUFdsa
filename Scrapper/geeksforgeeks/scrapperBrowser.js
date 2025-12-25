const BASE_URL =
    "https://practiceapi.geeksforgeeks.org/api/vr/problems/?pageMode=explore&sortBy=latest";

async function fetchAllProblems() {
    let allResults = [];
    let page = 1;
    let hasNext = true;
    let totalPagesFetched = 0;

    while (hasNext) {
        const url = `${BASE_URL}&page=${page}`;
        console.log(`Fetching page ${page}...`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Request failed at page ${page}`);
        }

        const data = await response.json();
        totalPagesFetched++;

        // Append problems
        if (Array.isArray(data.results)) {
            allResults.push(...data.results);
        }

        // Pagination logic
        if (data.next) {
            page = data.next;
        } else {
            hasNext = false;
        }
    }

    // Add metadata
    return {
        metadata: {
            totalProblems: allResults.length,
            pagesFetched: totalPagesFetched,
            fetchedAt: new Date().toISOString(),
            source: "GeeksforGeeks Practice API"
        },
        problems: allResults
    };
}

// Download helper
function downloadJSON(data, filename = "gfg_problems.json") {
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
        const result = await fetchAllProblems();
        console.log("Total problems fetched:", result.metadata.totalProblems);

        downloadJSON(result);
    } catch (err) {
        console.error(err);
    }
})();
