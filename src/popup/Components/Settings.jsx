import React, { useState, useEffect } from "react";
import "../Styles/Popup.css";

export function Settings({ onBack }) {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    autoSolveNext: false,
    showDifficulty: true,
    dailyGoal: 1,
    preferredDifficulty: "all",
    showTopics: true,
    soundEffects: false,
    tortureMode: false,
    hyperTortureMode: false,
  });

  const [saved, setSaved] = useState(false);

  // Load settings from Chrome storage on mount
  useEffect(() => {
    chrome.storage.sync.get(["userSettings"], (result) => {
      if (result.userSettings) {
        setSettings(result.userSettings);
      }
    });
  }, []);

  // Save settings to Chrome storage
  const saveSettings = () => {
    chrome.storage.sync.set({ userSettings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="w-[360px] max-h-[600px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col font-sans overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-indigo-400 mb-2">⚙️ Settings</h1>
        <p className="text-gray-400 text-sm">
          Customize your LeetCode experience
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-[#1b1b22] rounded-xl p-5 w-full flex flex-col gap-4">
        {/* Appearance Section */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold text-indigo-300 mb-3">
            🎨 Appearance
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white">Dark Mode</p>
              <p className="text-xs text-gray-500">Use dark theme</p>
            </div>
            <button
              onClick={() => handleToggle("darkMode")}
              className={`w-12 h-6 rounded-full transition ${
                settings.darkMode ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Show Difficulty</p>
              <p className="text-xs text-gray-500">
                Display problem difficulty
              </p>
            </div>
            <button
              onClick={() => handleToggle("showDifficulty")}
              className={`w-12 h-6 rounded-full transition ${
                settings.showDifficulty ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.showDifficulty ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Torture Mode Section */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold text-red-400 mb-3">
            🔥 Torture Mode
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 pr-2">
              <p className="text-sm text-white">Torture Mode</p>
              <p className="text-xs text-gray-500">
                Disable/enable redirects when browsing
              </p>
            </div>
            <button
              onClick={() => handleToggle("tortureMode")}
              className={`w-12 h-6 rounded-full transition ${
                settings.tortureMode ? "bg-red-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.tortureMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 pr-2">
              <p className="text-sm text-white">Hyper Torture Mode</p>
              <p className="text-xs text-gray-500">
                Forces you to solve a problem every time you open a new page
              </p>
            </div>
            <button
              onClick={() => handleToggle("hyperTortureMode")}
              className={`w-12 h-6 rounded-full transition ${
                settings.hyperTortureMode ? "bg-red-700" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.hyperTortureMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Warning message when either mode is enabled */}
          {(settings.tortureMode || settings.hyperTortureMode) && (
            <div className="mt-3 p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg">
              <p className="text-xs text-red-300">
                ⚠️ Warning:{" "}
                {settings.hyperTortureMode ? "Hyper Torture" : "Torture"} Mode
                is active!
                {settings.hyperTortureMode
                  ? " You must solve a problem on every new page."
                  : " Redirects are enabled."}
              </p>
            </div>
          )}
        </div>

        {/* Notifications Section */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold text-indigo-300 mb-3">
            🔔 Notifications
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white">Enable Notifications</p>
              <p className="text-xs text-gray-500">Get daily reminders</p>
            </div>
            <button
              onClick={() => handleToggle("notifications")}
              className={`w-12 h-6 rounded-full transition ${
                settings.notifications ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Sound Effects</p>
              <p className="text-xs text-gray-500">Play sounds on actions</p>
            </div>
            <button
              onClick={() => handleToggle("soundEffects")}
              className={`w-12 h-6 rounded-full transition ${
                settings.soundEffects ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.soundEffects ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Problem Settings Section */}
        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold text-indigo-300 mb-3">
            📝 Problem Settings
          </h3>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white">Auto-advance</p>
              <p className="text-xs text-gray-500">Go to next after solving</p>
            </div>
            <button
              onClick={() => handleToggle("autoSolveNext")}
              className={`w-12 h-6 rounded-full transition ${
                settings.autoSolveNext ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.autoSolveNext ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-white">Show Topics</p>
              <p className="text-xs text-gray-500">Display problem topics</p>
            </div>
            <button
              onClick={() => handleToggle("showTopics")}
              className={`w-12 h-6 rounded-full transition ${
                settings.showTopics ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  settings.showTopics ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="mb-3">
            <label className="text-sm text-white block mb-2">
              Preferred Difficulty
            </label>
            <select
              value={settings.preferredDifficulty}
              onChange={(e) =>
                handleChange("preferredDifficulty", e.target.value)
              }
              className="w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy Only</option>
              <option value="medium">Medium Only</option>
              <option value="hard">Hard Only</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white block mb-2">
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
              className="w-full bg-[#2b2b33] text-white px-3 py-2 rounded-lg text-sm border border-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-sm font-semibold text-indigo-300 mb-3">
            ℹ️ About
          </h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Version: 1.0.0</p>
            <p>LeetCode Problem Tracker</p>
            <p className="text-gray-500 mt-2">
              Built with ❤️ for competitive programmers
            </p>
          </div>
        </div>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-2 rounded-lg text-sm text-center mt-4">
          ✅ Settings saved successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="flex-1 bg-[#2b2b33] hover:bg-[#383844] text-gray-300 px-4 py-2 rounded-lg transition"
        >
          ← Back
        </button>
        <button
          onClick={saveSettings}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium"
        >
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
