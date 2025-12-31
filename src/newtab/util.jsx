// Utility helpers shared across newtab components
export function normalizeProblem(problem, dataSource = "leetcode") {
  // Handle null/undefined problem (no matches)
  if (!problem) {
    return {
      isGfgProblem: false,
      isCode360Problem: false,
      problemId: "#",
      problemTitle: "#",
      problemDifficulty: "Unknown",
      problemTopics: [],
      problemDescription: null,
      problemUrl: "#",
      problemUniqueId: null,
    };
  }

  const isGfgProblem =
    dataSource === "gfg" || problem?.problem_name !== undefined;
  const isCode360Problem =
    dataSource === "code360" || problem?.slug !== undefined;

  const problemId = isGfgProblem
    ? problem?.index
    : isCode360Problem
      ? problem?.index
      : problem?.frontend_id || problem?.problem_id;

  const problemTitle = isGfgProblem
    ? problem?.problem_name
    : isCode360Problem
      ? problem?.name
      : problem?.title;

  const problemDifficulty = problem?.difficulty || "Unknown";

  const problemTopics = isGfgProblem
    ? problem?.tags?.topic_tags || []
    : isCode360Problem
      ? (problem?.practice_topics || []).filter(Boolean)
      : problem?.topics || [];

  const problemDescription = isGfgProblem
    ? null
    : isCode360Problem
      ? null
      : Array.isArray(problem?.description)
        ? problem.description.join(" ")
        : problem?.description;

  const problemUrl = isGfgProblem
    ? problem?.problem_url
    : isCode360Problem
      ? `https://www.naukri.com/code360/problems/${problem?.slug}`
      : `https://leetcode.com/problems/${problem?.problem_slug}/`;

  const problemUniqueId = isGfgProblem
    ? problem?.id || problem?.index
    : isCode360Problem
      ? problem?.id || problem?.index
      : problem?.problem_id || problem?.frontend_id;

  return {
    isGfgProblem,
    isCode360Problem,
    problemId,
    problemTitle,
    problemDifficulty,
    problemTopics,
    problemDescription,
    problemUrl,
    problemUniqueId,
  };
}

export default { normalizeProblem };
