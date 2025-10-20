import React from "react";

const SettingsTab = ({ settings, handleToggle, handleChange }) => {
  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          🎨 Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme</p>
            </div>
            <button
              onClick={() => handleToggle("darkMode")}
              className={`w-14 h-7 rounded-full transition ${
                settings.darkMode ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.darkMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Show Difficulty</p>
              <p className="text-sm text-gray-400">
                Display problem difficulty levels
              </p>
            </div>
            <button
              onClick={() => handleToggle("showDifficulty")}
              className={`w-14 h-7 rounded-full transition ${
                settings.showDifficulty ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showDifficulty ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Show Topics</p>
              <p className="text-sm text-gray-400">
                Display problem topic tags
              </p>
            </div>
            <button
              onClick={() => handleToggle("showTopics")}
              className={`w-14 h-7 rounded-full transition ${
                settings.showTopics ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.showTopics ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Torture Mode Settings */}
      <div className="bg-[#1b1b22] rounded-xl p-6 border-2 border-red-600">
        <h2 className="text-xl font-semibold text-red-400 mb-4">
          🔥 Torture Mode
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Torture Mode</p>
              <p className="text-sm text-gray-400">
                Blocks distracting websites until daily goal is met
              </p>
            </div>
            <button
              onClick={() => handleToggle("tortureMode")}
              className={`w-14 h-7 rounded-full transition ${
                settings.tortureMode ? "bg-red-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.tortureMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Hyper Torture Mode</p>
              <p className="text-sm text-gray-400">
                Blocks ALL websites except coding platforms
              </p>
            </div>
            <button
              onClick={() => handleToggle("hyperTortureMode")}
              className={`w-14 h-7 rounded-full transition ${
                settings.hyperTortureMode ? "bg-red-700" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.hyperTortureMode ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {(settings.tortureMode || settings.hyperTortureMode) && (
            <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4 mt-4">
              <p className="text-red-300 text-sm">
                ⚠️ Warning: With torture mode enabled, you won't be able to
                access blocked sites until you complete your daily problem goal!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          🔔 Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Enable Notifications</p>
              <p className="text-sm text-gray-400">
                Get reminders for daily challenges
              </p>
            </div>
            <button
              onClick={() => handleToggle("notifications")}
              className={`w-14 h-7 rounded-full transition ${
                settings.notifications ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.notifications ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Sound Effects</p>
              <p className="text-sm text-gray-400">Play sounds on actions</p>
            </div>
            <button
              onClick={() => handleToggle("soundEffects")}
              className={`w-14 h-7 rounded-full transition ${
                settings.soundEffects ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.soundEffects ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Problem Settings */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          🎯 Problem Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">
                Auto-Advance to Next Problem
              </p>
              <p className="text-sm text-gray-400">
                Automatically move to next problem after solving
              </p>
            </div>
            <button
              onClick={() => handleToggle("autoSolveNext")}
              className={`w-14 h-7 rounded-full transition ${
                settings.autoSolveNext ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.autoSolveNext ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-white font-medium block mb-2">
              Preferred Difficulty
            </label>
            <select
              value={settings.preferredDifficulty}
              onChange={(e) =>
                handleChange("preferredDifficulty", e.target.value)
              }
              className="w-full bg-[#2b2b33] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy Only</option>
              <option value="medium">Medium Only</option>
              <option value="hard">Hard Only</option>
            </select>
          </div>

          <div>
            <label className="text-white font-medium block mb-2">
              Daily Goal (problems per day)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.dailyGoal}
              onChange={(e) =>
                handleChange("dailyGoal", parseInt(e.target.value))
              }
              className="w-full bg-[#2b2b33] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="flex justify-center">
        <p className="text-gray-400 text-sm italic">
          ✓ Settings are automatically saved
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
