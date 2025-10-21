import fs from "fs";

const url = "https://leetcode.com/graphql/";

const headers = {
    "content-type": "application/json",
};

const graphqlQuery = {
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
        questions {
          titleSlug
        }
      }
    }
  `,
    variables: {
        skip: 0,
        limit: 4000,
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
            premiumFilter: { premiumStatus: [], operator: "IS" }
        },
        searchKeyword: "",
        sortBy: { sortField: "FRONTEND_ID", sortOrder: "ASCENDING" }
    }
};

const fetchData = async () => {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(graphqlQuery),
        });

        const data = await response.json();

        fs.writeFileSync("allProblemData.json", JSON.stringify(data, null, 2));
        console.log("✅ Data saved to allProblemData.json");
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
};

fetchData();
