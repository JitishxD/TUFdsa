import React, { useMemo, useState } from "react";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";

const SearchProblemCard = () => {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) return [];

    // Split query into tokens; we'll use soft / score-based matching
    const tokens = trimmedQuery.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];

    const matchesToken = (token, haystack) => {
      if (!token) return true;
      if (haystack.includes(token)) return true;

      // Simple plural/singular handling so "pair" matches "pairs" and vice versa
      if (token.endsWith("s")) {
        const singular = token.slice(0, -1);
        if (singular && haystack.includes(singular)) return true;
      } else if (haystack.includes(token + "s")) {
        return true;
      }

      return false;
    };

    // Score-based search in title + description, case-insensitive, word-order independent
    // This allows extra words like "count" without breaking good matches.
    const scoredMatches = [];

    for (let i = 0; i < leetCodeProblems.length; i++) {
      const p = leetCodeProblems[i];

      // Safely normalize title and description to strings
      const rawTitle = p?.title ?? "";
      const rawDesc = Array.isArray(p?.description)
        ? p.description.join(" ")
        : (p?.description ?? "");

      const title = String(rawTitle).toLowerCase();
      const desc = String(rawDesc).toLowerCase();
      const haystack = `${title} ${desc}`;

      let matched = 0;
      for (const t of tokens) {
        if (matchesToken(t, haystack)) matched += 1;
      }

      // Require at least one token to match, and keep stronger matches first
      if (matched > 0) {
        scoredMatches.push({ problem: p, score: matched });
      }
    }

    // Sort by descending score so best matches (more tokens matched) appear first
    scoredMatches.sort((a, b) => b.score - a.score);

    // Return just the problem objects, capped for performance
    return scoredMatches.slice(0, 25).map((m) => m.problem);
  }, [trimmedQuery]);

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-900 text-green-300";
      case "Medium":
        return "bg-yellow-900 text-yellow-300";
      case "Hard":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

  return (
    <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-indigo-500 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-indigo-400">
          🔍 Search LeetCode Problems
        </h3>
        {trimmedQuery && (
          <span className="text-xs text-gray-400">
            Showing {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or description (min 2 characters)..."
          className="w-full bg-[#0e0e12] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
        {!trimmedQuery && (
          <p className="mt-2 text-xs text-gray-500">
            Start typing to search across all LeetCode problems.
          </p>
        )}
      </div>

      {trimmedQuery && results.length === 0 && (
        <p className="text-sm text-gray-400">
          No problems found matching &quot;{query}&quot;.
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {results.map((problem) => (
            <div
              key={problem.problem_id}
              className="flex items-start justify-between gap-3 bg-[#0e0e12]/60 hover:bg-[#181822] rounded-lg px-3 py-2 border border-gray-800/70 hover:border-indigo-600/60 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    #{problem.frontend_id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getDifficultyBg(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white truncate">
                  {problem.title}
                </p>
                {problem.topics && problem.topics.length > 0 && (
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {problem.topics.slice(0, 3).join(" • ")}
                    {problem.topics.length > 3 &&
                      `  +${problem.topics.length - 3} more`}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <a
                  href={`https://leetcode.com/problems/${problem.problem_slug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProblemCard;
