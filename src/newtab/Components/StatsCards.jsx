import React from "react";

/**
 * {
 *    stats.totalSolved: Total problems solved
 *    stats.currentStreak: Current streak count
 *    stats.bestStreak: Best streak ever achieved
 *    stats.solvedToday: Problems solved today
 *    stats.isAtRisk: (optional) Whether streak needs activity today to continue
 *    stats.isActiveToday: (optional) Whether user has been active today
 * }
 */
const StatsCards = ({ stats }) => {
  // Determine streak status for visual feedback
  const isStreakAtRisk = stats.isAtRisk && !stats.isActiveToday;
  const hasActiveStreak = stats.currentStreak > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Problems Solved Card */}
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

      {/* Current Streak Card - with "at risk" indicator */}
      <div
        className={`bg-[#1b1b22] rounded-lg p-4 border transition ${
          isStreakAtRisk
            ? "border-amber-500 animate-pulse"
            : "border-gray-800 hover:border-yellow-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">
              Current Streak
              {isStreakAtRisk && (
                <span className="ml-1 text-amber-400 text-[10px]">
                  (solve today!)
                </span>
              )}
            </p>
            <p
              className={`text-3xl font-bold ${
                isStreakAtRisk ? "text-amber-400" : "text-yellow-400"
              }`}
            >
              {stats.currentStreak}
            </p>
          </div>
          <div className="text-4xl">{isStreakAtRisk ? "⚠️" : "🔥"}</div>
        </div>
      </div>

      {/* Best Streak Card */}
      <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-orange-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Best Streak</p>
            <p className="text-3xl font-bold text-orange-400">
              {stats.bestStreak}
            </p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>
      </div>

      {/* Solved Today Card - with check mark when active */}
      <div
        className={`bg-[#1b1b22] rounded-lg p-4 border transition ${
          stats.isActiveToday
            ? "border-green-500"
            : "border-gray-800 hover:border-green-500"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Solved Today</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.solvedToday}
            </p>
          </div>
          <div className="text-4xl">{stats.isActiveToday ? "✅" : "📝"}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
