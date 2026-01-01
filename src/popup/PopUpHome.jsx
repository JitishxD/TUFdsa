import { useState, useEffect } from "react";
import RandomProblem from "./Components/RandomProblem";
import A2Z from "./Components/A2Z";
import Settings from "./Components/Settings";
import QuickAccess from "./Components/QuickAccess";
import SearchProblem from "./Components/SearchProblem";
import { calculateStatsWithOptions } from "../utils/statsTracker";
import AI from "./Components/AI";

export function PopUpHome() {
  const [currentPage, setCurrentPage] = useState("PopUpHome");
  // "PopUpHome" | "RandomProblem" | "A2Z" | "Settings" | "QuickAccess" | "SearchProblem"
  const [stats, setStats] = useState({
    totalSolved: 0,
    solvedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
    isActiveToday: false,
    isAtRisk: false,
  });

  useEffect(() => {
    // Load stats on mount
    loadStats();

    // Listen for storage changes to update stats in real-time
    const storageListener = (changes, areaName) => {
      if (
        areaName === "sync" &&
        (changes.randomSolveHistory || changes.a2zSolveHistory)
      ) {
        loadStats();
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);

  const loadStats = async () => {
    try {
      const result = await chrome.storage.sync.get([
        "randomSolveHistory",
        "a2zSolveHistory",
      ]);
      const randomHistory = result.randomSolveHistory || {};
      const a2zHistory = result.a2zSolveHistory || {};
      const calculatedStats = calculateStatsWithOptions(
        randomHistory,
        a2zHistory
      );
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleContinue = () => setCurrentPage("RandomProblem");
  const handleA2Z = () => setCurrentPage("A2Z");
  const handleSettings = () => setCurrentPage("Settings");
  const handleQuickAccess = () => setCurrentPage("QuickAccess");
  const handleSearchProblem = () => setCurrentPage("SearchProblem");

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      // Clear local storage
      chrome.storage.local.clear(function () {
        let error = chrome.runtime.lastError;
        if (error) {
          console.error(error);
        }
      });

      // Clear sync storage
      chrome.storage.sync.clear(function () {
        let error = chrome.runtime.lastError;
        if (error) {
          console.error(error);
        } else {
          alert("All progress has been reset!");
          // Reload the page to refresh the UI
          window.location.reload();
        }
      });
    }
  };

  return (
    <div>
      {currentPage === "PopUpHome" && (
        <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-5 flex flex-col items-center justify-center relative">
          {/* Settings Gear Icon - Top Right */}
          <button
            onClick={handleSettings}
            className="absolute top-4 right-4 bg-[#1b1b22] hover:bg-[#2b2b33] p-2 rounded-lg transition text-gray-400 hover:text-indigo-400"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-indigo-400 mb-4">Welcome!</h1>
          <p className="text-gray-400 text-base mb-6">
            Another day, another LeetCode problem, so go solve it buddy
          </p>

          <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3">
              <button
                onClick={handleContinue}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                Random Problem
              </button>

              <button
                onClick={handleA2Z}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                DSA A2Z
              </button>
            </div>

            <button
              onClick={() => setCurrentPage("AI")}
              className="w-full bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              🤖 Ask AI
            </button>

            <button
              onClick={handleQuickAccess}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              🔍 Quick Access by Number
            </button>

            <button
              onClick={handleSearchProblem}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              🔎 Search Problems
            </button>
          </div>

          {/* Streak Section */}
          <div className="flex justify-between w-full mt-6 text-center gap-4">
            <div className="w-1/3">
              <p className="text-gray-400 text-sm">Current Streak:</p>
              <p
                className={`text-xl font-bold ${
                  stats.isAtRisk && !stats.isActiveToday ? "text-amber-400" : ""
                }`}
              >
                {stats.currentStreak}{" "}
                {stats.isAtRisk && !stats.isActiveToday ? "⚠️" : "🔥"}
              </p>
              {stats.isAtRisk && !stats.isActiveToday && (
                <p className="text-amber-400 text-xs">Solve today!</p>
              )}
            </div>
            <div className="w-1/3">
              <p className="text-gray-400 text-sm">Best Streak:</p>
              <p className="text-xl font-bold">{stats.bestStreak} 🏆</p>
            </div>
            <div className="w-1/3">
              <p className="text-gray-400 text-sm">Solved Today:</p>
              <p className="text-xl font-bold">{stats.solvedToday} ✅</p>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mt-6 text-sm"
          >
            🔄 Reset All Progress
          </button>
        </div>
      )}

      {currentPage === "QuickAccess" && (
        <QuickAccess onBack={() => setCurrentPage("PopUpHome")} />
      )}
      {currentPage === "RandomProblem" && (
        <RandomProblem onBack={() => setCurrentPage("PopUpHome")} />
      )}
      {currentPage === "A2Z" && (
        <A2Z onBack={() => setCurrentPage("PopUpHome")} />
      )}
      {currentPage === "Settings" && (
        <Settings onBack={() => setCurrentPage("PopUpHome")} />
      )}
      {currentPage === "SearchProblem" && (
        <SearchProblem onBack={() => setCurrentPage("PopUpHome")} />
      )}
      {currentPage === "AI" && (
        <AI onBack={() => setCurrentPage("PopUpHome")} />
      )}
    </div>
  );
}

export default PopUpHome;
