import React from "react";

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-indigo-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Problems Solved</p>
            <p className="text-3xl font-bold text-indigo-400">
              {stats.totalSolved}
            </p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
      </div>

      <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-yellow-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.currentStreak}
            </p>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </div>

      <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-green-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Solved Today</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.solvedToday}
            </p>
          </div>
          <div className="text-4xl">✅</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
