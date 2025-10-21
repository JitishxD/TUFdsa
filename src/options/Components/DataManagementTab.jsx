import React from "react";

const DataManagementTab = ({
  stats,
  syncData,
  localData,
  exportAllData,
  exportSyncData,
  exportLocalData,
  importData,
  clearSyncData,
  clearLocalData,
  clearAllData,
}) => {
  return (
    <div className="space-y-6">
      {/* Storage Statistics */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          📊 Storage Statistics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#2b2b33] p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.sync}</div>
            <div className="text-sm text-gray-400 mt-1">Sync Storage Keys</div>
          </div>
          <div className="bg-[#2b2b33] p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-purple-400">
              {stats.local}
            </div>
            <div className="text-sm text-gray-400 mt-1">Local Storage Keys</div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          📤 Export Data
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Download your extension data as a JSON file for backup or transfer
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={exportAllData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            📦 Export All Data
          </button>
          <button
            onClick={exportSyncData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            ☁️ Export Sync Only
          </button>
          <button
            onClick={exportLocalData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            💾 Export Local Only
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          📥 Import Data
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Restore your extension data from a previously exported backup file
        </p>
        <div className="flex items-center justify-center">
          <label className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-medium cursor-pointer">
            📂 Choose Backup File
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          ⚠️ Importing will merge with existing data. Duplicate keys will be
          overwritten.
        </p>
      </div>

      {/* Data Preview Section */}
      <div className="bg-[#1b1b22] rounded-xl p-6">
        <h2 className="text-xl font-semibold text-indigo-300 mb-4">
          🔍 Data Preview
        </h2>

        {/* Sync Data */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-blue-300 mb-2">
            ☁️ Sync Storage Data:
          </h3>
          <div className="bg-[#0e0e12] p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {syncData ? JSON.stringify(syncData, null, 2) : "No data"}
            </pre>
          </div>
        </div>

        {/* Local Data */}
        <div>
          <h3 className="text-lg font-medium text-purple-300 mb-2">
            💾 Local Storage Data:
          </h3>
          <div className="bg-[#0e0e12] p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {localData ? JSON.stringify(localData, null, 2) : "No data"}
            </pre>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-4">
          ⚠️ Danger Zone
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          These actions are irreversible. Please export your data before
          clearing!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={clearSyncData}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            🗑️ Clear Sync Data
          </button>
          <button
            onClick={clearLocalData}
            className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            🗑️ Clear Local Data
          </button>
          <button
            onClick={clearAllData}
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg transition font-medium"
          >
            ❌ Clear ALL Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagementTab;
