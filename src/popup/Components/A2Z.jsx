import React, { useState, useEffect } from "react";
import data from "../../problem-data/DSAa2zProblems";
import "../Styles/Popup.css";
import {
  toggleProblemSolved,
  createSolvedMapFromHistory,
} from "../../utils/statsTracker";

function A2Z({ onBack }) {
  const [solvedMap, setSolvedMap] = useState({}); // { problemId: true/false }
  const [a2zSolveHistory, setA2zSolveHistory] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); // For navigation

  // Load data from Chrome storage on mount
  useEffect(() => {
    chrome.storage.sync.get(["a2zSolveHistory", "lastA2zIndex"], (result) => {
      const history = result.a2zSolveHistory || {};
      setA2zSolveHistory(history);
      setSolvedMap(createSolvedMapFromHistory(history));

      // Load the last browsed index, or default to 0
      const lastIndex = result.lastA2zIndex ?? 0;
      setCurrentIndex(lastIndex);
    });

    // Listen for storage changes to sync with other contexts (newtab, etc.)
    const storageListener = (changes, areaName) => {
      if (areaName === "sync" && changes.a2zSolveHistory) {
        const newHistory = changes.a2zSolveHistory.newValue || {};
        setA2zSolveHistory(newHistory);
        setSolvedMap(createSolvedMapFromHistory(newHistory));
      }
      // Sync the current index when changed in another context
      if (areaName === "sync" && changes.lastA2zIndex) {
        const newIndex = changes.lastA2zIndex.newValue;
        if (newIndex !== undefined) {
          setCurrentIndex(newIndex);
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);

  const currentProblem = data[currentIndex];

  // Navigation functions
  const prevProblem = () => {
    const newIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    chrome.storage.sync.set({ lastA2zIndex: newIndex });
  };

  const nextProblem = () => {
    const newIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    chrome.storage.sync.set({ lastA2zIndex: newIndex });
  };

  const toggleSolved = (problemId) => {
    const updatedHistory = toggleProblemSolved(a2zSolveHistory, problemId);
    setA2zSolveHistory(updatedHistory);
    setSolvedMap(createSolvedMapFromHistory(updatedHistory));

    // Save to Chrome storage
    chrome.storage.sync.set({ a2zSolveHistory: updatedHistory });
  };

  if (!currentProblem) {
    return (
      <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col items-center justify-center font-sans">
        <h1 className="text-2xl font-bold text-green-400 mb-4">
          🎉 Congratulations!
        </h1>
        <p className="text-gray-400 text-center mb-6">
          You've solved all available problems!
        </p>

        {onBack && (
          <button
            onClick={onBack}
            className="bg-[#2b2b33] hover:bg-[#383844] mt-6 px-4 py-2 rounded-lg text-gray-300 transition"
          >
            ← Back
          </button>
        )}
      </div>
    );
  }

  const isSolved = solvedMap[currentProblem.id] || false;

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col items-center font-sans">
      {/* Header */}
      <h1 className="text-xl font-bold text-indigo-400 mb-4">DSA_A2Z</h1>

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 w-full mt-2 text-center">
        <h2 className="text-sm text-gray-400 mb-1">
          Problem {currentIndex + 1} of {data.length}
        </h2>
        <h3
          className={`text-xl font-semibold mb-2 ${isSolved ? "text-green-400" : "text-white"}`}
        >
          #{currentProblem.id}: {currentProblem.problemName}
        </h3>

        {/* Difficulty */}
        <p className="mb-4">
          Difficulty:{" "}
          <span
            className={`${
              currentProblem.difficulty === "Easy"
                ? "text-green-400"
                : currentProblem.difficulty === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
            } font-medium`}
          >
            {currentProblem.difficulty}
          </span>
        </p>

        {/* Navigation + Solve Button */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={prevProblem}
            className="bg-[#2b2b33] hover:bg-[#383844] px-3 py-2 rounded-lg text-gray-300 transition"
            title="Previous problem"
          >
            ⬅
          </button>

          <a
            href={currentProblem.problemLink}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg transition font-medium inline-block"
          >
            Solve Problem
          </a>

          <button
            onClick={nextProblem}
            className="bg-[#2b2b33] hover:bg-[#383844] px-3 py-2 rounded-lg text-gray-300 transition"
            title="Next problem"
          >
            ➡
          </button>
        </div>

        {/* Mark as Solved Button */}
        <button
          onClick={() => toggleSolved(currentProblem.id)}
          className={`px-5 py-2 rounded-lg transition font-medium w-full mb-4 ${
            isSolved
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isSolved ? "❌ Unmark as Solved" : "✅ Mark as Solved"}
        </button>

        {/* Links Section */}
        <div className="mt-4 text-sm text-gray-300 space-y-2">
          {currentProblem.leetCodeLink && (
            <p>
              <a
                href={currentProblem.leetCodeLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                📝 View on LeetCode
              </a>
            </p>
          )}

          {currentProblem.resourceLinks &&
            currentProblem.resourceLinks.length > 0 && (
              <>
                {currentProblem.resourceLinks.map((r, i) => (
                  <p key={i}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline"
                    >
                      📚 {r.text || "Editorial / Resource"}
                    </a>
                  </p>
                ))}
              </>
            )}

          {currentProblem.ytLink && (
            <p>
              <a
                href={currentProblem.ytLink}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline"
              >
                🎥 Watch on YouTube
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="bg-[#2b2b33] hover:bg-[#383844] mt-4 px-4 py-2 rounded-lg text-gray-300 transition"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

export default A2Z;
