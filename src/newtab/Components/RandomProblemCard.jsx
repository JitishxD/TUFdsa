import React from "react";
import FilterPanel from "../../popup/Components/FilterPanel";
import DataSourceSwitcher from "./DataSourceSwitcher";
import { normalizeProblem } from "../util";
import { getProblemCounts } from "../../utils/problemFilters";
import { getDifficultyBg } from "../../utils/uiHelpers";

const RandomProblemCard = ({
  dailyProblem,
  solvedMap,
  pickRandomProblem,
  toggleRandomSolved,
  filters,
  setFilters,
  matchMode,
  setMatchMode,
  onApplyFilters,
  showFilters,
  setShowFilters,
  dataSource,
  setDataSource,
}) => {
  // Compute counts using helper
  const { total: totalProblemsCount, filtered: filteredProblemsCount } =
    getProblemCounts(dataSource, filters, solvedMap, matchMode);

  const {
    isGfgProblem,
    isCode360Problem,
    problemId,
    problemTitle,
    problemDifficulty,
    problemTopics,
    problemDescription,
    problemUrl,
    problemUniqueId,
  } = normalizeProblem(dailyProblem, dataSource);

  return (
    <div>
      {/* Data Source Switcher */}
      <div className="mb-3">
        <DataSourceSwitcher
          dataSource={dataSource}
          setDataSource={setDataSource}
          colorScheme="purple"
        />
      </div>

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
          dataSource={dataSource}
        />
      )}

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-indigo-500 transition-all">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-indigo-400">
            🎯 Random Challenge
          </h3>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${getDifficultyBg(
              problemDifficulty
            )}`}
          >
            {problemDifficulty}
          </span>
        </div>

        <div className="text-xs text-gray-400 mt-3 mb-3 flex items-center gap-2">
          <span className="text-gray-300">Available:</span>
          <span className="bg-[#2b2b33] text-indigo-300 px-2 py-0.5 rounded font-semibold text-sm">
            {totalProblemsCount}
          </span>
          <span className="text-gray-400">→</span>
          <span className="bg-indigo-700 text-white px-2 py-0.5 rounded font-semibold text-sm">
            {filteredProblemsCount}
          </span>
          <span className="text-gray-400">after filters</span>
        </div>

        <div className="mb-3">
          {/* Problem Title with ID Badge */}
          <div className="flex items-start gap-2 mb-3">
            <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded font-mono font-semibold">
              #{problemId}
            </span>
            <h4 className="text-base font-semibold text-white flex-1">
              {problemTitle}
            </h4>
          </div>

          {/* Topics */}
          {problemTopics && problemTopics.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2 font-semibold">
                Topics:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {problemTopics.slice(0, 5).map((topic, idx) => (
                  <span
                    key={idx}
                    className="bg-[#2b2b33] text-indigo-300 text-xs px-2 py-1 rounded"
                  >
                    {topic}
                  </span>
                ))}
                {problemTopics.length > 5 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{problemTopics.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {problemDescription && (
            <div className="bg-[#0e0e12] p-3 rounded-lg mb-3">
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                {problemDescription}
              </p>
            </div>
          )}

          {/* Show message when no problem available */}
          {!dailyProblem && (
            <div className="bg-[#0e0e12] p-4 rounded-lg mb-3 border border-yellow-800/50">
              <p className="text-yellow-300 text-sm text-center font-medium">
                ⚠️ No problems match the selected filters
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Please adjust your filters or try a different data source
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          {dailyProblem ? (
            <a
              href={problemUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm text-center mb-3 shadow-md hover:shadow-lg"
            >
              🚀 Solve on{" "}
              {isGfgProblem
                ? "GeeksforGeeks"
                : isCode360Problem
                  ? "Code360"
                  : "LeetCode"}
            </a>
          ) : (
            <button
              disabled
              className="block w-full bg-gray-700 text-gray-400 px-4 py-2.5 rounded-lg font-semibold text-sm text-center mb-3 cursor-not-allowed"
            >
              🚀 Solve on{" "}
              {dataSource === "gfg"
                ? "GeeksforGeeks"
                : dataSource === "code360"
                  ? "Code360"
                  : "LeetCode"}
            </button>
          )}

          {/* New Random Button */}
          <button
            onClick={pickRandomProblem}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition font-medium text-sm mb-3"
          >
            🎲 New Random
          </button>

          {/* Mark random as solved */}
          {dailyProblem && (
            <div>
              <button
                onClick={() => toggleRandomSolved(problemUniqueId)}
                className={`w-full px-4 py-2 rounded-lg transition font-semibold text-sm shadow-sm ${
                  solvedMap[problemUniqueId]
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                }`}
              >
                {solvedMap[problemUniqueId]
                  ? "✅ Solved - Click to Unmark"
                  : "Mark as Solved"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RandomProblemCard;
