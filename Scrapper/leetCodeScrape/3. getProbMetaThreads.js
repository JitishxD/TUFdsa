import fs from "fs/promises";
import fsSync from "fs";

const url = "https://leetcode.com/graphql/";
const OUTPUT = "allProblemMeta.json";
const CONCURRENCY = 8;
const RETRIES = 3;
const DELAY_MS = 120;
const CHECKPOINT_EVERY = 100;

const headers = {
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const graphqlQuery = (titleSlug) => ({
  query: `
    query question($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        difficulty
        content
        topicTags {
          name
        }
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
  `,
  variables: { titleSlug },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fetchQuestionData = async (titleSlug) => {
  let lastErr = null;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(graphqlQuery(titleSlug)),
      });

      if (response.status === 429) {
        const wait = 1000 * attempt;
        console.warn(`⏳ Rate limited on ${titleSlug}, waiting ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
      }
      if (data.data?.question) {
        return { titleSlug, ...data.data.question };
      }
      // Premium / missing content still may return question=null
      return null;
    } catch (err) {
      lastErr = err;
      await sleep(300 * attempt);
    }
  }
  console.error(`❌ Failed ${titleSlug}:`, lastErr?.message || lastErr);
  return null;
};

const loadExisting = async () => {
  if (!fsSync.existsSync(OUTPUT)) return [];
  try {
    const raw = await fs.readFile(OUTPUT, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parallelFetch = async (titles, existingBySlug) => {
  const results = [...existingBySlug.values()];
  let index = 0;
  let done = existingBySlug.size;
  const total = titles.length + existingBySlug.size;
  let sinceCheckpoint = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= titles.length) break;

      const item = titles[currentIndex];
      const data = await fetchQuestionData(item.titleSlug);
      if (data) {
        results.push(data);
        existingBySlug.set(item.titleSlug, data);
      }

      done += 1;
      sinceCheckpoint += 1;
      if (done % 25 === 0 || done === total) {
        console.log(`Progress: ${done}/${total}`);
      }

      if (sinceCheckpoint >= CHECKPOINT_EVERY) {
        sinceCheckpoint = 0;
        await fs.writeFile(OUTPUT, JSON.stringify(results, null, 2));
        console.log(`💾 Checkpoint saved (${results.length} items)`);
      }

      await sleep(DELAY_MS);
    }
  };

  await Promise.all(
    Array.from({ length: CONCURRENCY }, () => worker()),
  );

  return results;
};

const fetchAllData = async () => {
  try {
    const file = await fs.readFile("refinedAllData.json", "utf-8");
    const titles = JSON.parse(file);

    const existing = await loadExisting();
    const existingBySlug = new Map(
      existing
        .filter((q) => q?.titleSlug)
        .map((q) => [q.titleSlug, q]),
    );

    const pending = titles.filter((t) => !existingBySlug.has(t.titleSlug));
    console.log(
      `📋 ${titles.length} total | ${existingBySlug.size} cached | ${pending.length} to fetch`,
    );

    const allData = await parallelFetch(pending, existingBySlug);

    // Keep stable order matching refinedAllData
    const bySlug = new Map(allData.map((q) => [q.titleSlug, q]));
    const ordered = titles.map((t) => bySlug.get(t.titleSlug)).filter(Boolean);

    await fs.writeFile(OUTPUT, JSON.stringify(ordered, null, 2));
    console.log(
      `🎉 Saved ${ordered.length}/${titles.length} to ${OUTPUT}`,
    );
  } catch (err) {
    console.error("❌ Error:", err);
    process.exitCode = 1;
  }
};

fetchAllData();
