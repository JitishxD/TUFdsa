async function convertEmbedToWatch(url) {
  try {
    const u = new URL(url);
    const videoId = u.pathname.split('/')[2]; // Extract ID like "EAR7De6Goz4"
    const time = u.searchParams.get('t'); // Optional timestamp
    let watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    if (time) watchUrl += `&t=${time}s`;
    return watchUrl;
  } catch (e) {
    console.error('Invalid URL:', e);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeTable() {
  const rows = document.querySelectorAll("table tr:not(:first-child)");
  const problems = [];
  // for (const row of rows) {
  // for (i = 0; i < rows.length; i++) {
  for (i = 0; i < 2; i++) {
    const row = rows[i];

    const cells = row.querySelectorAll("td");
    if (cells.length < 9) continue;

    // Problem name + link
    const problemAnchor = cells[1].querySelector("a");
    const problemName = problemAnchor ? problemAnchor.textContent.trim() : "";
    const problemLink = problemAnchor ? problemAnchor.href : "";

    console.log(`⏳ Processing row ${i + 1}/${rows.length}
      ✅🧑‍💻 Processing Problem Name: "`, problemName);

    // Resource links (YouTube, articles, etc.)
    const resourceAnchors = cells[3].querySelectorAll("a");
    const resourceLinks = Array.from(resourceAnchors).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }));

    // Try to open the YouTube embed (if the thumbnail is there)
    let ytLink = "";
    const ytThumbnail = row.querySelector('img[alt="YouTube Link"]');
    if (ytThumbnail) {
      ytThumbnail.click(); // open the embedded player
      console.log("ℹ️ Clicked YouTube icon for:", problemName);
      await sleep(500); // wait a bit for iframe to appear

      ytLink = await convertEmbedToWatch(document.querySelectorAll("iframe")[1].src);
      console.log("➡️ YouTube link found:", ytLink);

      // Close player if it stays open (optional, depends on site)
      const closeBtn = document.querySelector(
        '.rounded-lg.relative.inline-flex.items-center.justify-center.px-3\\.5.py-2.m-1.cursor-pointer.border-b-2.border-l-2.border-r-2.active\\:border-brand.active\\:shadow-none.shadow-lg.bg-gradient-to-tr.from-red-600.to-red-500.hover\\:from-red-500.hover\\:to-red-500.border-red-700.text-white'
      );

      if (closeBtn) closeBtn.click();
    } else {
      console.log("🚧 YouTube link not found:");
    }

    // Practice / LeetCode link
    const leetCodeAnchor = cells[5]?.querySelector("a");
    const leetCodeLink = leetCodeAnchor ? leetCodeAnchor.href : "";

    // Difficulty
    const difficulty = cells[8].textContent.trim();

    problems.push({
      problemName,
      problemLink,
      resourceLinks,
      leetCodeLink,
      ytLink,
      difficulty
    });

    // Optional: wait between rows (if site lags or has modal animations)
    await sleep(1000);
  }

  console.log("✅ Done scraping all rows!");
  console.log(JSON.stringify(problems, null, 2));

  // Copy JSON to clipboard
  if (typeof copy === "function") copy(JSON.stringify(problems, null, 2));

  // Optional: download JSON file
  const blob = new Blob([JSON.stringify(problems, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "problems.json";
  a.click();

  return problems;
}

// Run it
scrapeTable();
