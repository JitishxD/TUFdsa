import React from "react";
import { useState, useEffect } from "react";
import "../Styles/Popup.css";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";

export function RandomProblem({ onBack }) {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [solvedMap, setSolvedMap] = useState({}); // { problemId: true/false }
  const [loading, setLoading] = useState(true);

  // Load solved status and current problem from Chrome storage on mount
  useEffect(() => {
    const initialize = (result) => {
      if (result.solvedMap) {
        setSolvedMap(result.solvedMap);
      }

      // If there's a stored problem, use it; otherwise pick a random one
      if (result.currentRandomProblem) {
        setCurrentProblem(result.currentRandomProblem);
      } else {
        pickRandomProblem();
      }
      setLoading(false);
    };

    // Try promise-based get first, fallback to callback
    try {
      chrome.storage.sync
        .get(["solvedMap", "currentRandomProblem"])
        .then(initialize);
    } catch (e) {
      chrome.storage.sync.get(
        ["solvedMap", "currentRandomProblem"],
        initialize
      );
    }

    // Listen for storage changes to keep popup in sync
    const storageListener = (changes, areaName) => {
      if (areaName === "sync" && changes.currentRandomProblem) {
        const newVal = changes.currentRandomProblem.newValue;
        if (newVal) setCurrentProblem(newVal);
      }
      if (areaName === "sync" && changes.solvedMap) {
        const newSolved = changes.solvedMap.newValue || {};
        setSolvedMap(newSolved);
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  // Save solved status to Chrome storage whenever it changes
  useEffect(() => {
    if (Object.keys(solvedMap).length > 0) {
      chrome.storage.sync.set({ solvedMap });
    }
  }, [solvedMap]);

  // Save current problem to storage whenever it changes
  useEffect(() => {
    if (currentProblem) {
      chrome.storage.sync.set({ currentRandomProblem: currentProblem });
    }
  }, [currentProblem]);

  const pickRandomProblem = () => {
    const randomIndex = Math.floor(Math.random() * leetCodeProblems.length);
    setCurrentProblem(leetCodeProblems[randomIndex]);
  };

  const toggleSolved = (problemId) => {
    setSolvedMap((prev) => ({
      ...prev,
      [problemId]: !prev[problemId],
    }));
  };

  if (loading || !currentProblem) {
    return (
      <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col items-center justify-center font-sans">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const isSolved = solvedMap[currentProblem.problem_id] || false;
  const problemUrl = `https://leetcode.com/problems/${currentProblem.problem_slug}/`;

  return (
    <div className="w-[360px] max-h-[600px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col font-sans overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-indigo-400 mb-2">
          🎲 Random LeetCode Challenge
        </h1>
        <p className="text-gray-400 text-sm">
          Talk is cheap, Show me the code!!
        </p>
      </div>

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 w-full flex flex-col gap-4">
        {/* Problem Header */}
        <div className="text-center border-b border-gray-700 pb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-mono">
              #{currentProblem.frontend_id}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                currentProblem.difficulty === "Easy"
                  ? "bg-green-900 text-green-300"
                  : currentProblem.difficulty === "Medium"
                    ? "bg-yellow-900 text-yellow-300"
                    : "bg-red-900 text-red-300"
              }`}
            >
              {currentProblem.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white">
            {currentProblem.title}
          </h3>
        </div>

        {/* Topics */}
        {currentProblem.topics && currentProblem.topics.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2">
              📚 Topics:
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentProblem.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="bg-[#2b2b33] text-indigo-300 text-xs px-2 py-1 rounded-md"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description Preview */}
        {currentProblem.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-2">
              📝 Description:
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {currentProblem.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <a
            href={problemUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg transition font-medium text-center"
          >
            🚀 Solve on LeetCode
          </a>

          <button
            onClick={() => toggleSolved(currentProblem.problem_id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              isSolved
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-700 hover:bg-gray-800 text-gray-200"
            }`}
          >
            {isSolved ? "✅ Marked as Solved" : "Mark as Solved"}
          </button>

          <button
            onClick={pickRandomProblem}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg transition font-medium"
          >
            🎲 Get Another Random Problem
          </button>
        </div>

        {/* Metadata */}
        <div className="mt-2 pt-3 border-t border-gray-700">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">
            📊 Metadata:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#2b2b33] p-2 rounded">
              <span className="text-gray-500">Problem ID:</span>
              <p className="text-white font-mono">
                {currentProblem.problem_id}
              </p>
            </div>
            <div className="bg-[#2b2b33] p-2 rounded">
              <span className="text-gray-500">Frontend ID:</span>
              <p className="text-white font-mono">
                {currentProblem.frontend_id}
              </p>
            </div>
            <div className="bg-[#2b2b33] p-2 rounded col-span-2">
              <span className="text-gray-500">Slug:</span>
              <p className="text-indigo-300 font-mono break-all">
                {currentProblem.problem_slug}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="bg-[#2b2b33] hover:bg-[#383844] mt-4 px-4 py-2 rounded-lg text-gray-300 transition"
      >
        ← Back
      </button>
    </div>
  );
}

export default RandomProblem;
