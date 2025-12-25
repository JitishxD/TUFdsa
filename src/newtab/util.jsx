// Utility helpers shared across newtab components
export function normalizeProblem(problem, dataSource = "leetcode") {
  const isGfgProblem =
    dataSource === "gfg" || problem?.problem_name !== undefined;

  const problemId = isGfgProblem
    ? problem?.index
    : problem?.frontend_id || problem?.problem_id;

  const problemTitle = isGfgProblem ? problem?.problem_name : problem?.title;

  const problemDifficulty = problem?.difficulty || "Unknown";

  const problemTopics = isGfgProblem
    ? problem?.tags?.topic_tags || []
    : problem?.topics || [];

  const problemDescription = isGfgProblem
    ? null
    : Array.isArray(problem?.description)
      ? problem.description.join(" ")
      : problem?.description;

  const problemUrl = isGfgProblem
    ? problem?.problem_url
    : `https://leetcode.com/problems/${problem?.problem_slug}/`;

  const problemUniqueId = isGfgProblem
    ? problem?.id || problem?.index
    : problem?.problem_id || problem?.frontend_id;

  return {
    isGfgProblem,
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
