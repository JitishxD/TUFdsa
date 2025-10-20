import React from "react";

const TortureModeWarning = ({ settings }) => {
  if (!settings.tortureMode && !settings.hyperTortureMode) {
    return null;
  }

  return (
    <div className="mt-6 bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl">🔥</div>
        <div>
          <h3 className="text-lg font-bold text-red-400 mb-1">
            {settings.hyperTortureMode
              ? "⚠️ Hyper Torture Mode Active!"
              : "⚠️ Torture Mode Active!"}
          </h3>
          <p className="text-red-300 text-sm">
            {settings.hyperTortureMode
              ? "You must solve a problem before browsing. Stay focused!"
              : "Redirects are enabled. Time to grind!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TortureModeWarning;
