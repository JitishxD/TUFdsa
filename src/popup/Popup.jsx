import { useState, useEffect } from 'react'

import './Popup.css'

import React from "react";

import data from '../problem-data/problems';

export function Popup() {
  const problem = data[14];

  return (
    <div className="w-[360px] min-h-[420px] bg-[#0e0e12] text-white rounded-2xl shadow-lg p-5 flex flex-col items-center font-sans">
      {/* Header */}
      <h1 className="text-lg font-bold text-indigo-400 mb-2">
        Solve LeetCode?
      </h1>
      <p className="text-gray-400 text-sm mb-4">Talk is cheap, Show me the code!!</p>

      {/* Problem Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 w-full text-center">
        <h2 className="text-sm text-gray-400 mb-1">Today's Question</h2>
        <h3 className="text-xl font-semibold mb-4 text-white">
          {problem.problemName}
        </h3>

        <a
          href={problem.problemLink}
          target="_blank"
          rel="noreferrer"
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition font-medium"
        >
          Solve it
        </a>

        {/* Links Section */}
        <div className="mt-5 text-sm text-gray-300 space-y-2">
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

          {/* Problem Links */}
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

export default Popup
