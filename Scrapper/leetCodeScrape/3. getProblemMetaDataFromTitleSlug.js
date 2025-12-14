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
      return { titleSlug, ...data.data.question }; // append titleSlug
    }
    return null;
  } catch (err) {
    console.error(`❌ Error fetching ${titleSlug}:`, err);
    return null;
  }
};

const fetchAllData = async () => {
  try {
    const file = await fs.readFile("refinedAllData.json", "utf-8");
    const titles = JSON.parse(file);

    const allData = [];

    // for (const item of titles) {
    for (let i = 0; i < 1 && i < titles.length; i++) {
      const item = titles[i];
      console.log(`Fetching: ${item.titleSlug}...`);
      const questionData = await fetchQuestionData(item.titleSlug);
      if (questionData) {
        allData.push(questionData);
        console.log(`✅ Fetched: ${item.titleSlug}`);
      }
      // optional delay
      await new Promise((res) => setTimeout(res, 200));
    }

    await fs.writeFile("ProblemMeta.json", JSON.stringify(allData, null, 2));
    console.log("🎉 All data saved to allProblemMeta.json");

  } catch (err) {
    console.error("❌ Error:", err);
  }
};

fetchAllData();
