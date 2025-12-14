import { useState } from "react";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";

const QuickAccessCard = () => {
  const [problemNumber, setProblemNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input
    const num = parseInt(problemNumber.trim());
    if (!problemNumber.trim() || isNaN(num) || num < 1) {
      setError("Please enter a valid problem number");
      return;
    }

    // Find the problem in the dump file
    const problem = leetCodeProblems.find(
      (p) => p.frontend_id === num.toString()
    );

    if (!problem) {
      setError(`Problem #${num} not found`);
      return;
    }

    // Clear error and open LeetCode page using the problem slug
    setError("");
    window.open(
      `https://leetcode.com/problems/${problem.problem_slug}/`,
      "_blank"
    );
    setProblemNumber(""); // Clear input after opening
  };

  const handleInputChange = (e) => {
    setProblemNumber(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-purple-500 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-purple-400">🔍 Quick Access</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Enter LeetCode Problem Number
          </label>
          <input
            type="text"
            value={problemNumber}
            onChange={handleInputChange}
            placeholder="e.g., 1, 42, 234"
            className={`w-full bg-[#2b2b33] text-white px-4 py-2.5 rounded-lg text-sm border ${
              error ? "border-red-500" : "border-gray-600"
            } focus:border-purple-500 focus:outline-none transition`}
            autoComplete="off"
          />
          {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg transition font-semibold text-sm shadow-md hover:shadow-lg"
        >
          🚀 Open Problem
        </button>
      </form>

      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Tip: You can also press Enter to quickly open the problem
        </p>
      </div>
    </div>
  );
};

export default QuickAccessCard;
