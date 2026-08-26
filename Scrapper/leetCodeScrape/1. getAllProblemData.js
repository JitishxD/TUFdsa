import fs from "fs";

const url = "https://leetcode.com/graphql/";
// LeetCode currently caps each response at 100 regardless of a higher limit.
const PAGE_SIZE = 100;

const headers = {
  "content-type": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const buildQuery = (skip, limit) => ({
  query: `
    query problemsetQuestionListV2(
      $filters: QuestionFilterInput,
      $limit: Int,
      $searchKeyword: String,
      $skip: Int,
      $sortBy: QuestionSortByInput,
      $categorySlug: String
    ) {
      problemsetQuestionListV2(
        filters: $filters
        limit: $limit
        searchKeyword: $searchKeyword
        skip: $skip
        sortBy: $sortBy
        categorySlug: $categorySlug
      ) {
        totalLength
        hasMore
        questions {
          id
          questionFrontendId
          titleSlug
          title
          difficulty
          paidOnly
          status
          topicTags {
            name
            slug
          }
          frequency
          isInMyFavorites
          acRate
          contestPoint
        }
      }
    }
  `,
  variables: {
    skip,
    limit,
    categorySlug: "all-code-essentials",
    filters: {
      filterCombineType: "ALL",
      statusFilter: { questionStatuses: [], operator: "IS" },
      difficultyFilter: { difficulties: [], operator: "IS" },
      languageFilter: { languageSlugs: [], operator: "IS" },
      topicFilter: { topicSlugs: [], operator: "IS" },
      acceptanceFilter: {},
      frequencyFilter: {},
      frontendIdFilter: {},
      lastSubmittedFilter: {},
      publishedFilter: {},
      companyFilter: { companySlugs: [], operator: "IS" },
      positionFilter: { positionSlugs: [], operator: "IS" },
      contestPointFilter: { contestPoints: [], operator: "IS" },
      premiumFilter: { premiumStatus: [], operator: "IS" },
    },
    searchKeyword: "",
    sortBy: { sortField: "FRONTEND_ID", sortOrder: "ASCENDING" },
  },
});

const fetchPage = async (skip, limit) => {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(buildQuery(skip, limit)),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data.data.problemsetQuestionListV2;
};

const fetchData = async () => {
  try {
    const allQuestions = [];
    let skip = 0;
    let totalLength = null;
    let page = 1;

    while (true) {
      console.log(`📄 Fetching page ${page} (skip=${skip}, limit=${PAGE_SIZE})...`);
      const result = await fetchPage(skip, PAGE_SIZE);
      const { questions, hasMore } = result;
      totalLength = result.totalLength ?? totalLength;

      if (!questions?.length) {
        console.log("No more questions returned.");
        break;
      }

      allQuestions.push(...questions);
      console.log(
        `   got ${questions.length} (total so far: ${allQuestions.length}/${totalLength ?? "?"})`,
      );

      skip += questions.length;
      page += 1;

      if (!hasMore || (totalLength != null && allQuestions.length >= totalLength)) {
        break;
      }

      // Be polite between pages
      await new Promise((r) => setTimeout(r, 300));
    }

    // Dedupe by id (safety)
    const seen = new Set();
    const deduped = allQuestions.filter((q) => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });

    const payload = {
      data: {
        problemsetQuestionListV2: {
          totalLength,
          questions: deduped,
        },
      },
    };

    fs.writeFileSync("allProblemData.json", JSON.stringify(payload, null, 2));
    console.log(
      `✅ Saved ${deduped.length} problems to allProblemData.json (API totalLength=${totalLength})`,
    );

    if (totalLength != null && deduped.length !== totalLength) {
      console.warn(
        `⚠️ Count mismatch: fetched ${deduped.length} vs API totalLength ${totalLength}`,
      );
    }
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    process.exitCode = 1;
  }
};

fetchData();
