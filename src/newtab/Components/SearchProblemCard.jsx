import React, { useMemo, useState } from "react";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";
import gfgData from "../../problem-data/gfg_problems.json";
import code360Data from "../../problem-data/code360_problems_indexed.json";
import DataSourceSwitcher from "./DataSourceSwitcher";
import { normalizeProblem } from "../util";

const SearchProblemCard = () => {
  const [query, setQuery] = useState("");
  const [dataSource, setDataSource] = useState("leetcode"); // "leetcode", "gfg", or "code360"

  const trimmedQuery = query.trim().toLowerCase();

  // Get the appropriate problems array based on data source
  const problems = useMemo(() => {
    if (dataSource === "gfg") {
      return gfgData.problems || [];
    }
    if (dataSource === "code360") {
      return code360Data.problems || [];
    }
    return leetCodeProblems || [];
  }, [dataSource]);

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

    for (let i = 0; i < problems.length; i++) {
      const p = problems[i];

      // Handle different data structures
      let rawTitle, rawDesc, topics;

      if (dataSource === "gfg") {
        rawTitle = p?.problem_name ?? "";
        rawDesc = ""; // GFG doesn't have description in the JSON
        topics = p?.tags?.topic_tags || [];
      } else if (dataSource === "code360") {
        rawTitle = p?.name ?? "";
        rawDesc = ""; // Code360 doesn't have description in the JSON
        topics = (p?.practice_topics || []).filter(Boolean);
      } else {
        rawTitle = p?.title ?? "";
        rawDesc = Array.isArray(p?.description)
          ? p.description.join(" ")
          : (p?.description ?? "");
        topics = p?.topics || [];
      }

      const title = String(rawTitle).toLowerCase();
      const desc = String(rawDesc).toLowerCase();
      const topicsStr = topics.map((t) => String(t).toLowerCase()).join(" ");
      const haystack = `${title} ${desc} ${topicsStr}`;

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
  }, [trimmedQuery, problems, dataSource]);

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
          🔍 Search Problems
        </h3>
        {trimmedQuery && (
          <span className="text-xs text-gray-400">
            Showing {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* Data Source Switcher */}
      <DataSourceSwitcher
        dataSource={dataSource}
        setDataSource={setDataSource}
        colorScheme="indigo"
      />

      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search by title or description (min 2 characters)...`}
          className="w-full bg-[#0e0e12] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
        {!trimmedQuery && (
          <p className="mt-2 text-xs text-gray-500">
            Start typing to search across all{" "}
            {dataSource === "leetcode"
              ? "LeetCode"
              : dataSource === "gfg"
                ? "GeeksforGeeks"
                : "Code360"}{" "}
            problems.
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
          {results.map((problem, idx) => {
            const {
              problemId,
              problemTitle,
              problemDifficulty,
              problemTopics,
              problemUrl,
              problemUniqueId,
            } = normalizeProblem(problem, dataSource);

            const uniqueKey = problemUniqueId ?? idx;

            return (
              <div
                key={uniqueKey}
                className="flex items-start justify-between gap-3 bg-[#0e0e12]/60 hover:bg-[#181822] rounded-lg px-3 py-2 border border-gray-800/70 hover:border-indigo-600/60 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                      #{problemId}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getDifficultyBg(
                        problemDifficulty
                      )}`}
                    >
                      {problemDifficulty}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">
                    {problemTitle}
                  </p>
                  {problemTopics && problemTopics.length > 0 && (
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                      {problemTopics.slice(0, 3).join(" • ")}
                      {problemTopics.length > 3 &&
                        `  +${problemTopics.length - 3} more`}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <a
                    href={problemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition"
                  >
                    Open
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchProblemCard;
