import fs from "fs/promises";

const url = "https://leetcode.com/graphql/";

const headers = {
  "content-type": "application/json",
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
  variables: { titleSlug }
});

const fetchQuestionData = async (titleSlug) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(graphqlQuery(titleSlug)),
    });
    const data = await response.json();
    if (data.data?.question) {
      return { titleSlug, ...data.data.question };
    }
    return null;
  } catch (err) {
    console.error(`❌ Error fetching ${titleSlug}:`, err);
    return null;
  }
};

// Controlled concurrency function
const parallelFetch = async (titles, concurrency = 5) => {
  const results = [];
  let index = 0;

  const worker = async () => {
    while (index < titles.length) {
      const currentIndex = index++;
      const item = titles[currentIndex];
      console.log(`Fetching: ${item.titleSlug}...`);
      const data = await fetchQuestionData(item.titleSlug);
      if (data) {
        results.push(data);
        console.log(`✅ Fetched: ${item.titleSlug}`);
      }
    }
  };

  // Start N workers
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
};

const fetchAllData = async () => {
  try {
    const file = await fs.readFile("refinedAllData.json", "utf-8");
    const titles = JSON.parse(file);

    const allData = await parallelFetch(titles, 10); // 10 concurrent requests

    await fs.writeFile("allProblemMeta.json", JSON.stringify(allData, null, 2));
    console.log("🎉 All data saved to allProblemMeta.json");

  } catch (err) {
    console.error("❌ Error:", err);
  }
};

fetchAllData();
