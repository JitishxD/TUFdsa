import { useState, useEffect } from "react";

import "../Styles/Popup.css";

import React from "react";

import data from "../../problem-data/problems";

export function Popup() {
  const [current, setCurrent] = useState(0);
  const [solvedMap, setSolvedMap] = useState({}); // { problemId: true/false }

  const problem = data[current];

  // Load solved status from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("solvedMap")) || {};
    setSolvedMap(saved);
  }, []);

  // Save solved status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("solvedMap", JSON.stringify(solvedMap));
  }, [solvedMap]);

  const prevProblem = () => {
    setCurrent((prev) => (prev === 0 ? data.length - 1 : prev - 1));
  };

  const nextProblem = () => {
    setCurrent((prev) => (prev === data.length - 1 ? 0 : prev + 1));
  };

  const toggleSolved = (id) => {
    setSolvedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isSolved = solvedMap[problem.id] || false; // default false if undefined

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white rounded-2xl shadow-lg p-5 flex flex-col items-center font-sans">
      {/* Header */}
      <h1 className="text-lg font-bold text-indigo-400 mb-2">
        Welcome to the LeetCode Gulag
      </h1>
      <p className="text-gray-400 text-sm mb-4">Never back down, Never what</p>

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 w-full text-center relative">
        <h2 className="text-sm text-gray-400 mb-1">Today's Question</h2>
        <h3 className="text-xl font-semibold mb-4 text-white">
          {problem.problemName}
        </h3>

        {/* Solve + Navigation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={prevProblem}
            className="bg-[#2b2b33] hover:bg-[#383844] px-3 py-2 rounded-lg text-gray-300 transition"
            title="Previous problem"
          >
            ⬅
          </button>

          <a
            href={problem.problemLink}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg transition font-medium"
          >
            Solve it
          </a>

          <button
            onClick={nextProblem}
            className="bg-[#2b2b33] hover:bg-[#383844] px-3 py-2 rounded-lg text-gray-300 transition"
            title="Next problem"
          >
            ➡
          </button>
        </div>

        {/* Solved toggle */}
        <button
          onClick={() => toggleSolved(problem.id)}
          className={`mt-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
            isSolved
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-700 hover:bg-gray-800 text-gray-200"
          }`}
        >
          {isSolved ? "✅ Marked as Solved" : "Mark as Solved"}
        </button>

        {/* Links Section */}
        <div className="mt-4 text-sm text-gray-300 space-y-2">
          <p>
            Difficulty:{" "}
            <span
              className={`${
                problem.difficulty === "Easy"
                  ? "text-green-400"
                  : problem.difficulty === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {problem.difficulty}
            </span>
          </p>

          {problem.leetCodeLink && (
            <p>
              <a
                href={problem.leetCodeLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline"
              >
                View on LeetCode
              </a>
            </p>
          )}

          {problem.resourceLinks.map((r, i) => (
            <p key={i}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline"
              >
                {r.text || "Editorial"}
              </a>
            </p>
          ))}

          {problem.ytLink && (
            <p>
              <a
                href={problem.ytLink}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline"
              >
                Watch on YouTube
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Streak Section */}
      <div className="flex justify-between w-full mt-6 text-center">
        <div className="w-1/2">
          <p className="text-gray-400 text-sm">Current Streak:</p>
          <p className="text-xl font-bold">0</p>
        </div>
        <div className="w-1/2">
          <p className="text-gray-400 text-sm">Best Streak:</p>
          <p className="text-xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}

export default Popup;
