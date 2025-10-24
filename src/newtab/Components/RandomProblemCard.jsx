import React, { useState } from "react";
import FilterPanel from "../../popup/Components/FilterPanel";

const RandomProblemCard = ({
  dailyProblem,
  solvedMap,
  pickRandomProblem,
  toggleRandomSolved,
  getDifficultyBg,
  filters,
  setFilters,
  matchMode,
  setMatchMode,
  onApplyFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  if (!dailyProblem) return null;

  return (
    <div>
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full mb-3 bg-gradient-to-r from-[#1b1b22] to-[#252530] hover:from-[#2b2b33] hover:to-[#2d2d3a] text-indigo-400 hover:text-indigo-300 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm border border-gray-800/50 hover:border-indigo-500/50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-indigo-500/10"
      >
        <span
          className={`transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`}
        >
          {showFilters ? "▲" : "▼"}
        </span>
        <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
        {filters.length > 0 && (
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/30 animate-pulse">
            {filters.length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          matchMode={matchMode}
          setMatchMode={setMatchMode}
          onApply={onApplyFilters}
          variant="newtab"
        />
      )}

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-indigo-500 transition-all">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-indigo-400">
            🎯 Random Challenge
          </h3>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyBg(
              dailyProblem.difficulty
            )}`}
          >
            {dailyProblem.difficulty}
          </span>
        </div>

        <div className="mb-3">
          {/* Problem Title with ID Badge */}
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded font-mono font-semibold">
              #{dailyProblem.frontend_id}
            </span>
            <h4 className="text-base font-semibold text-white flex-1">
              {dailyProblem.title}
            </h4>
          </div>

          {/* Topics */}
          {dailyProblem.topics && dailyProblem.topics.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                Topics:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dailyProblem.topics.slice(0, 5).map((topic, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2b2b33] text-indigo-300 text-xs px-2 py-1 rounded"
                  >
                    {topic}
                  </span>
                ))}
                {dailyProblem.topics.length > 5 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{dailyProblem.topics.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {dailyProblem.description && (
            <div className="bg-[#0e0e12] p-3 rounded-lg mb-3">
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                {dailyProblem.description}
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <a
            href={`https://leetcode.com/problems/${dailyProblem.problem_slug}/`}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm text-center mb-3 shadow-md hover:shadow-lg"
          >
            🚀 Solve on LeetCode
          </a>

          {/* New Random Button */}
          <button
            onClick={pickRandomProblem}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm mb-3"
          >
            🎲 New Random
          </button>

          {/* Mark random as solved */}
          <div>
            <button
              onClick={() => toggleRandomSolved(dailyProblem.problem_id)}
              className={`w-full px-4 py-2 rounded-lg transition font-semibold text-sm shadow-sm ${
                solvedMap[dailyProblem.problem_id]
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              {solvedMap[dailyProblem.problem_id]
                ? "✅ Solved - Click to Unmark"
                : "Mark as Solved"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomProblemCard;
