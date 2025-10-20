import { useState, useEffect } from "react";
import "./Styles/Options.css";
import SettingsTab from "./Components/SettingsTab";
import DataManagementTab from "./Components/DataManagementTab";
import { calculateStats } from "../utils/statsTracker";

export const Options = () => {
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' or 'data'
  const [syncData, setSyncData] = useState(null);
  const [localData, setLocalData] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [stats, setStats] = useState({ sync: 0, local: 0, totalSolved: 0 });
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

  // Load all data on mount
  useEffect(() => {
    loadAllData();
    loadSettings();

    // Listen for settings changes from other components (like popup)
    const handleStorageChange = (changes, area) => {
      if (area === "sync" && changes.userSettings) {
        setSettings(changes.userSettings.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Auto-save settings whenever they change
  useEffect(() => {
    // Skip saving on initial mount (when settings are being loaded)
    if (settings.darkMode !== undefined) {
      const saveTimeout = setTimeout(async () => {
        try {
          await chrome.storage.sync.set({ userSettings: settings });
          console.log("Settings auto-saved:", settings);
        } catch (error) {
          console.error("Error auto-saving settings:", error);
          showNotification("Error saving settings: " + error.message, "error");
        }
      }, 300); // Debounce for 300ms

      return () => clearTimeout(saveTimeout);
    }
  }, [settings]);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get(["userSettings"]);
      if (result.userSettings) {
        setSettings(result.userSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadAllData = async () => {
    try {
      // Get all sync storage data
      const syncStorage = await chrome.storage.sync.get(null);
      setSyncData(syncStorage);

      // Get all local storage data
      const localStorage = await chrome.storage.local.get(null);
      setLocalData(localStorage);

      // Calculate stats
      const syncKeys = Object.keys(syncStorage).length;
      const localKeys = Object.keys(localStorage).length;

      // Calculate total solved using new system
      const randomHistory = syncStorage.randomSolveHistory || {};
      const a2zHistory = syncStorage.a2zSolveHistory || {};
      const calculatedStats = calculateStats(randomHistory, a2zHistory);

      setStats({
        sync: syncKeys,
        local: localKeys,
        totalSolved: calculatedStats.totalSolved,
      });
    } catch (error) {
      showNotification("Error loading data: " + error.message, "error");
    }
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

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Export all data (sync + local)
  const exportAllData = () => {
    const allData = {
      sync: syncData || {},
      local: localData || {},
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leetcode-extension-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Data exported successfully!", "success");
  };

  // Export only sync storage
  const exportSyncData = () => {
    const data = {
      sync: syncData || {},
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leetcode-sync-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Sync data exported successfully!", "success");
  };

  // Export only local storage
  const exportLocalData = () => {
    const data = {
      local: localData || {},
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leetcode-local-backup-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Local data exported successfully!", "success");
  };

  // Import data from file
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate data structure
        if (!importedData.sync && !importedData.local) {
          throw new Error("Invalid backup file format");
        }

        // Import sync data
        if (importedData.sync && Object.keys(importedData.sync).length > 0) {
          await chrome.storage.sync.set(importedData.sync);
        }

        // Import local data
        if (importedData.local && Object.keys(importedData.local).length > 0) {
          await chrome.storage.local.set(importedData.local);
        }

        // Reload data to show updated values
        await loadAllData();
        showNotification("Data imported successfully!", "success");
      } catch (error) {
        showNotification("Error importing data: " + error.message, "error");
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  // Clear all sync storage
  const clearSyncData = async () => {
    if (
      confirm(
        "Are you sure you want to clear ALL sync storage data? This cannot be undone!"
      )
    ) {
      try {
        await chrome.storage.sync.clear();
        await loadAllData();
        showNotification("Sync storage cleared successfully!", "success");
      } catch (error) {
        showNotification(
          "Error clearing sync storage: " + error.message,
          "error"
        );
      }
    }
  };

  // Clear all local storage
  const clearLocalData = async () => {
    if (
      confirm(
        "Are you sure you want to clear ALL local storage data? This cannot be undone!"
      )
    ) {
      try {
        await chrome.storage.local.clear();
        await loadAllData();
        showNotification("Local storage cleared successfully!", "success");
      } catch (error) {
        showNotification(
          "Error clearing local storage: " + error.message,
          "error"
        );
      }
    }
  };

  // Clear all storage (both sync and local)
  const clearAllData = async () => {
    if (
      confirm(
        "⚠️ WARNING: This will delete ALL extension data (sync + local). This cannot be undone! Are you absolutely sure?"
      )
    ) {
      try {
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();
        await loadAllData();
        showNotification("All storage cleared successfully!", "success");
      } catch (error) {
        showNotification("Error clearing storage: " + error.message, "error");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0e0e12] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">
            ⚙️ Extension Options
          </h1>
          <p className="text-gray-400">
            Configure settings and manage your data
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              notification.type === "success"
                ? "bg-green-900 border border-green-600 text-green-200"
                : "bg-red-900 border border-red-600 text-red-200"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Stats Overview */}
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
          <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-blue-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Sync Storage Keys</p>
                <p className="text-3xl font-bold text-blue-400">{stats.sync}</p>
              </div>
              <div className="text-4xl">☁️</div>
            </div>
          </div>
          <div className="bg-[#1b1b22] rounded-lg p-4 border border-gray-800 hover:border-purple-500 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">Local Storage Keys</p>
                <p className="text-3xl font-bold text-purple-400">
                  {stats.local}
                </p>
              </div>
              <div className="text-4xl">💾</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white"
                : "bg-[#1b1b22] text-gray-400 hover:bg-[#2b2b33]"
            }`}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "data"
                ? "bg-indigo-600 text-white"
                : "bg-[#1b1b22] text-gray-400 hover:bg-[#2b2b33]"
            }`}
          >
            💾 Data Management
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            handleToggle={handleToggle}
            handleChange={handleChange}
          />
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <DataManagementTab
            stats={stats}
            syncData={syncData}
            localData={localData}
            exportAllData={exportAllData}
            exportSyncData={exportSyncData}
            exportLocalData={exportLocalData}
            importData={importData}
            clearSyncData={clearSyncData}
            clearLocalData={clearLocalData}
            clearAllData={clearAllData}
            loadAllData={loadAllData}
          />
        )}
      </div>
    </main>
  );
};

export default Options;
