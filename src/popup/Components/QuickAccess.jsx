import { useState } from "react";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";

export function QuickAccess({ onBack }) {
  const [problemNumber, setProblemNumber] = useState("");
  const [error, setError] = useState("");
  const [foundProblem, setFoundProblem] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input
    const num = parseInt(problemNumber.trim());
    if (!problemNumber.trim() || isNaN(num) || num < 1) {
      setError("Please enter a valid problem number");
      setFoundProblem(null);
      return;
    }

    // Find the problem in the dump file
    const problem = leetCodeProblems.find(
      (p) => p.frontend_id === num.toString()
    );

    if (!problem) {
      setError(`Problem #${num} not found`);
      setFoundProblem(null);
      return;
    }

    // Clear error and show the found problem
    setError("");
    setFoundProblem(problem);
  };

  const handleInputChange = (e) => {
    setProblemNumber(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
    if (foundProblem) setFoundProblem(null); // Clear found problem when typing
  };

  const openProblem = () => {
    if (foundProblem) {
      window.open(
        `https://leetcode.com/problems/${foundProblem.problem_slug}/`,
        "_blank"
      );
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-5">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="bg-[#1b1b22] hover:bg-[#2b2b33] p-2 rounded-lg transition text-gray-400 hover:text-indigo-400 mr-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-purple-400">🔍 Quick Access</h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <label className="text-sm text-gray-400 block mb-2">
          Enter LeetCode Problem Number
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={problemNumber}
            onChange={handleInputChange}
            placeholder="e.g., 1, 42, 234"
            className={`flex-1 bg-[#2b2b33] text-white px-4 py-2.5 rounded-lg text-sm border ${
              error ? "border-red-500" : "border-gray-600"
            } focus:border-purple-500 focus:outline-none transition`}
            autoComplete="off"
            autoFocus
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg transition font-semibold text-sm shadow-md hover:shadow-lg"
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
      </form>

      {/* Found Problem Display */}
      {foundProblem && (
        <div className="bg-[#1b1b22] rounded-xl p-4 border border-gray-800 shadow-xl">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-white flex-1">
              {foundProblem.frontend_id}. {foundProblem.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-sm font-medium ${getDifficultyColor(foundProblem.difficulty)}`}
            >
              {foundProblem.difficulty}
            </span>
            {foundProblem.topics && foundProblem.topics.length > 0 && (
              <>
                <span className="text-gray-600">•</span>
                <div className="flex gap-1 flex-wrap">
                  {foundProblem.topics.slice(0, 3).map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#2b2b33] text-gray-400 px-2 py-0.5 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {foundProblem.topics.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{foundProblem.topics.length - 3} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={openProblem}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>🚀 Open Problem</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Help Text */}
      {!foundProblem && !error && (
        <div className="mt-6 p-4 bg-[#1b1b22] rounded-lg border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">
            💡 <span className="font-semibold">Tip:</span> Enter any LeetCode
            problem number to quickly access it.
          </p>
          <p className="text-xs text-gray-500">
            Press Enter or click Search to find the problem
          </p>
        </div>
      )}
    </div>
  );
}

export default QuickAccess;
