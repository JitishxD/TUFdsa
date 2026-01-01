async function convertEmbedToWatch(url) {
  try {
    const u = new URL(url);
    const videoId = u.pathname.split("/")[2]; // Extract ID like "EAR7De6Goz4"
    const time = u.searchParams.get("t"); // Optional timestamp
    let watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (time) watchUrl += `&t=${time}s`;
    return watchUrl;
  } catch (e) {
    console.error("Invalid URL:", e);
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeTable() {
  const rows = document.querySelectorAll("table tbody tr");
  const problems = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.querySelectorAll("td");

    if (cells.length < 9) continue;

    // Problem name + link
    const problemAnchor = cells[1].querySelector("a");
    const problemName = problemAnchor ? problemAnchor.textContent.trim() : "";
    const problemLink = problemAnchor ? problemAnchor.href : "";

    console.log(`⏳ Processing row ${i + 1}/${rows.length}
      ✅🧑‍💻 Processing Problem Name: "${problemName}"`);

    // Resource links - now in cell index 4 (Editorial+YtLink)
    const resourceContainer = cells[4];
    const resourceAnchors = resourceContainer.querySelectorAll("a");
    const resourceLinks = Array.from(resourceAnchors).map((a) => ({
      text: a.getAttribute("alt") || a.textContent.trim() || "Link",
      href: a.href,
    }));

    // YouTube link - find direct YouTube link (no click needed anymore)
    let ytLink = "";
    const youtubeLinks = resourceContainer.querySelectorAll('a[href*="youtu"]');
    if (youtubeLinks.length > 0) {
      ytLink = youtubeLinks[0].href;
      console.log("➡️ YouTube link found:", ytLink);
    } else {
      console.log("🚧 YouTube link not found");
    }

    // Practice / LeetCode link
    const leetCodeAnchor = cells[5]?.querySelector("a");
    const leetCodeLink = leetCodeAnchor ? leetCodeAnchor.href : "";

    // Difficulty (cell index 8) - now in a badge element
    const difficultyElement = cells[8].querySelector(".difficulty-badge");
    const difficulty = difficultyElement
      ? difficultyElement.textContent.trim()
      : "";

    problems.push({
      problemName,
      problemLink,
      resourceLinks,
      leetCodeLink,
      ytLink,
      difficulty,
    });

    await sleep(500); // Reduced wait time since no modal interactions needed
  }

  console.log("✅ Done scraping all rows!");
  console.log(JSON.stringify(problems, null, 2));

  // Copy JSON to clipboard
  if (typeof copy === "function") copy(JSON.stringify(problems, null, 2));

  // Optional: download JSON file
  const blob = new Blob([JSON.stringify(problems, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "problems.json";
  a.click();

  return problems;
}

// Run it
scrapeTable();
