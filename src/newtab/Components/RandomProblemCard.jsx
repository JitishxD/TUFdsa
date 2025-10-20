import React from "react";

const RandomProblemCard = ({
  dailyProblem,
  solvedMap,
  pickRandomProblem,
  toggleRandomSolved,
  getDifficultyBg,
}) => {
  if (!dailyProblem) return null;

  return (
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
            <p className="text-xs text-gray-400 mb-2 font-semibold">Topics:</p>
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
  );
};

export default RandomProblemCard;
