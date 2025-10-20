import React from "react";

const A2ZProblemCard = ({
  a2zProblem,
  a2zSolvedMap,
  a2zCurrentIndex,
  a2zDataLength,
  onPrevious,
  onNext,
  onToggleSolved,
}) => {
  if (!a2zProblem) return null;

  return (
    <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-green-500 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-green-400">📚 DSA A2Z</h3>
        <span className="text-xs font-semibold bg-[#2b2b33] text-gray-300 px-3 py-1 rounded-full">
          {a2zCurrentIndex + 1} / {a2zDataLength}
        </span>
      </div>

      <div className="mb-3">
        {/* Problem Title with ID Badge */}
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded font-mono font-semibold">
            #{a2zProblem.id}
          </span>
          <h4
            className={`text-base font-semibold flex-1 ${
              a2zSolvedMap[a2zProblem.id] ? "text-green-400" : "text-white"
            }`}
          >
            {a2zProblem.problemName}
            {a2zSolvedMap[a2zProblem.id] && (
              <span className="ml-2 text-green-400">✓</span>
            )}
          </h4>
        </div>

        {/* Difficulty Badge */}
        <div className="mb-3">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              a2zProblem.difficulty === "Easy"
                ? "bg-green-900 text-green-300"
                : a2zProblem.difficulty === "Medium"
                  ? "bg-yellow-900 text-yellow-300"
                  : "bg-red-900 text-red-300"
            }`}
          >
            {a2zProblem.difficulty}
          </span>
        </div>

        {/* Primary Action Button */}
        <a
          href={a2zProblem.problemLink}
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm text-center mb-3 shadow-md hover:shadow-lg"
        >
          🚀 Start Solving
        </a>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={onPrevious}
            className="flex-1 bg-[#2b2b33] hover:bg-[#383844] px-4 py-2 rounded-lg text-gray-300 transition font-medium text-sm"
            title="Previous problem"
          >
            ← Previous
          </button>

          <button
            onClick={onNext}
            className="flex-1 bg-[#2b2b33] hover:bg-[#383844] px-4 py-2 rounded-lg text-gray-300 transition font-medium text-sm"
            title="Next problem"
          >
            Next →
          </button>
        </div>

        {/* Mark as Solved Button */}
        <button
          onClick={() => onToggleSolved(a2zProblem.id)}
          className={`px-4 py-2 rounded-lg transition font-semibold w-full text-sm shadow-sm ${
            a2zSolvedMap[a2zProblem.id]
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          {a2zSolvedMap[a2zProblem.id]
            ? "✓ Solved - Click to Unmark"
            : "Mark as Solved"}
        </button>

        {/* Resource Links */}
        {(a2zProblem.leetCodeLink ||
          a2zProblem.ytLink ||
          (a2zProblem.resourceLinks &&
            a2zProblem.resourceLinks.length > 0)) && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-2 font-semibold">
              Resources:
            </p>
            <div className="flex flex-wrap gap-2">
              {a2zProblem.leetCodeLink && (
                <a
                  href={a2zProblem.leetCodeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-[#2b2b33] hover:bg-blue-900 text-blue-400 px-3 py-1.5 rounded-lg transition text-xs font-medium"
                >
                  <span>📝</span> LeetCode
                </a>
              )}

              {a2zProblem.ytLink && (
                <a
                  href={a2zProblem.ytLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-[#2b2b33] hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-lg transition text-xs font-medium"
                >
                  <span>🎥</span> YouTube
                </a>
              )}

              {a2zProblem.resourceLinks &&
                a2zProblem.resourceLinks.length > 0 &&
                a2zProblem.resourceLinks[0].href && (
                  <a
                    href={a2zProblem.resourceLinks[0].href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-[#2b2b33] hover:bg-indigo-900 text-indigo-400 px-3 py-1.5 rounded-lg transition text-xs font-medium"
                  >
                    <span>📚</span> Editorial
                  </a>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default A2ZProblemCard;
