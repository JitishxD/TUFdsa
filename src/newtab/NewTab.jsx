import { useState, useEffect, useRef } from "react";
import a2zData from "../problem-data/DSAa2zProblems.json";
import Header from "./Components/Header";
import StatsCards from "./Components/StatsCards";
import RandomProblemCard from "./Components/RandomProblemCard";
import A2ZProblemCard from "./Components/A2ZProblemCard";
import TortureModeWarning from "./Components/TortureModeWarning";
import QuickLinks from "./Components/QuickLinks";
import SettingsButton from "./Components/SettingsButton";
import RemoteUpdateToast from "./Components/RemoteUpdateToast";
import FilterToast from "./Components/FilterToast";
import QuickAccessCard from "./Components/QuickAccessCard";
import PotdCard from "./Components/PotdCard";
import SearchProblemCard from "./Components/SearchProblemCard";
import {
  calculateStatsWithOptions,
  toggleProblemSolved,
  createSolvedMapFromHistory,
} from "../utils/statsTracker";
import { useRandomProblem } from "../utils/useRandomProblem";
import { getDifficultyBg } from "../utils/uiHelpers";
import "./Styles/NewTab.css";

export const NewTab = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [a2zProblem, setA2zProblem] = useState(null);
  const [a2zSolvedMap, setA2zSolvedMap] = useState({});
  const [a2zSolveHistory, setA2zSolveHistory] = useState({});
  const [a2zCurrentIndex, setA2zCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    solvedToday: 0,
    totalSolved: 0,
    currentStreak: 0,
    bestStreak: 0,
    isActiveToday: false,
    isAtRisk: false,
  });
  const [settings, setSettings] = useState({
    tortureMode: false,
    hyperTortureMode: false,
  });
  const [quote, setQuote] = useState("");
  const [remoteUpdateToast, setRemoteUpdateToast] = useState(false);
  const isLocalRandomRef = useRef(false);

  // Use shared hook for random problem logic
  const {
    currentProblem: dailyProblem,
    solvedMap,
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    matchMode,
    setMatchMode,
    dataSource,
    setDataSource,
    showFilterToast,
    pickRandomProblem: basePickRandomProblem,
    applyFiltersAndPickNew: baseApplyFiltersAndPickNew,
    toggleSolved: baseToggleSolved,
  } = useRandomProblem();

  // Wrap pickRandomProblem to add isLocalRandomRef logic
  const pickRandomProblem = async () => {
    isLocalRandomRef.current = true;
    await basePickRandomProblem();
    setTimeout(() => (isLocalRandomRef.current = false), 300);
  };

  // Wrap applyFiltersAndPickNew (no need for isLocalRandomRef here as it shows toast)
  const applyFiltersAndPickNew = baseApplyFiltersAndPickNew;

  // Wrap toggleSolved to update stats
  const toggleRandomSolved = (problemId) => {
    baseToggleSolved(problemId);
    // Stats will be updated via storage listener
  };

  const quotes = [
    "Talk is cheap. Show me the code.",
    "First, solve the problem. Then, write the code.",
    "Code is like humor. When you have to explain it, it's bad.",
    "The only way to learn a new programming language is by writing programs in it.",
    "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.",
    "Programming isn't about what you know; it's about what you can figure out.",
    "Every great developer you know got there by solving problems they were unqualified to solve.",
  ];

  useEffect(() => {
    // Set random quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Update time and date
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Load data from Chrome storage
    loadData();

    // Listen for storage changes to sync across contexts (solve histories, settings, A2Z index)
    // Note: random problem changes are handled by the useRandomProblem hook
    const storageListener = async (changes, areaName) => {
      if (areaName === "sync" && changes.currentRandomProblem) {
        const newVal = changes.currentRandomProblem.newValue;
        if (newVal) {
          // Show toast notification when problem changes in another context (popup/sidepanel)
          if (!isLocalRandomRef.current) {
            setRemoteUpdateToast(true);
            setTimeout(() => setRemoteUpdateToast(false), 2200);
          }
        }
      }
      if (
        areaName === "sync" &&
        (changes.randomSolveHistory || changes.a2zSolveHistory)
      ) {
        // Reload both histories from storage to avoid stale state
        const result = await chrome.storage.sync.get([
          "randomSolveHistory",
          "a2zSolveHistory",
        ]);
        const randomHistory = result.randomSolveHistory || {};
        const a2zHistory = result.a2zSolveHistory || {};

        if (changes.a2zSolveHistory) {
          setA2zSolveHistory(a2zHistory);
          setA2zSolvedMap(createSolvedMapFromHistory(a2zHistory));
        }

        // Recalculate stats with fresh data
        updateStats(randomHistory, a2zHistory);
      }
      // Listen for settings changes (torture mode, etc.)
      if (areaName === "sync" && changes.userSettings) {
        const newSettings = changes.userSettings.newValue;
        if (newSettings) {
          setSettings(newSettings);
        }
      }
      // Sync A2Z current index when changed in another context
      if (areaName === "sync" && changes.lastA2zIndex) {
        const newIndex = changes.lastA2zIndex.newValue;
        if (newIndex !== undefined) {
          setA2zCurrentIndex(newIndex);
          setA2zProblem(a2zData[newIndex]);
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => {
      clearInterval(timeInterval);
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  // Filter and dataSource changes are handled by useRandomProblem hook

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timeStr = `${hours % 12 || 12}:${minutes}:${seconds}`;
    const ampm = hours >= 12 ? "PM" : "AM";

    setTime(`${timeStr} ${ampm}`);

    // Set date
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDate(now.toLocaleDateString("en-US", options));

    // Set greeting based on time
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const loadData = async () => {
    try {
      // Load settings
      const settingsData = await chrome.storage.sync.get(["userSettings"]);
      if (settingsData.userSettings) {
        setSettings(settingsData.userSettings);
      }

      // Load solve histories (new system with timestamps)
      // Note: random problem history is handled by useRandomProblem hook
      const historyData = await chrome.storage.sync.get([
        "randomSolveHistory",
        "a2zSolveHistory",
      ]);
      const randomHistory = historyData.randomSolveHistory || {};
      const a2zHistory = historyData.a2zSolveHistory || {};

      setA2zSolveHistory(a2zHistory);
      setA2zSolvedMap(createSolvedMapFromHistory(a2zHistory));

      // Calculate stats using the new system
      const calculatedStats = calculateStatsWithOptions(
        randomHistory,
        a2zHistory,
      );
      setStats(calculatedStats);

      // Load A2Z problem - use last browsed index or default to 0
      const lastA2zIndexData = await chrome.storage.sync.get(["lastA2zIndex"]);
      const a2zIndex = lastA2zIndexData.lastA2zIndex ?? 0;
      setA2zCurrentIndex(a2zIndex);
      setA2zProblem(a2zData[a2zIndex]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Helper function to update stats
  const updateStats = async (randomHistory, a2zHistory) => {
    const calculatedStats = calculateStatsWithOptions(
      randomHistory,
      a2zHistory,
    );
    setStats(calculatedStats);
  };

  // Random problem functions are now provided by useRandomProblem hook
  // (wrapped above to add isLocalRandomRef logic)

  const prevA2zProblem = () => {
    const newIndex =
      a2zCurrentIndex === 0 ? a2zData.length - 1 : a2zCurrentIndex - 1;
    setA2zCurrentIndex(newIndex);
    setA2zProblem(a2zData[newIndex]);
    chrome.storage.sync.set({ lastA2zIndex: newIndex });
  };

  const nextA2zProblem = () => {
    const newIndex =
      a2zCurrentIndex === a2zData.length - 1 ? 0 : a2zCurrentIndex + 1;
    setA2zCurrentIndex(newIndex);
    setA2zProblem(a2zData[newIndex]);
    chrome.storage.sync.set({ lastA2zIndex: newIndex });
  };

  const toggleA2zSolved = async (problemId) => {
    const updatedHistory = toggleProblemSolved(a2zSolveHistory, problemId);

    setA2zSolveHistory(updatedHistory);
    setA2zSolvedMap(createSolvedMapFromHistory(updatedHistory));

    // Update stats - get randomSolveHistory from storage
    const result = await chrome.storage.sync.get(["randomSolveHistory"]);
    const randomHistory = result.randomSolveHistory || {};
    updateStats(randomHistory, updatedHistory);

    // Save to Chrome storage
    chrome.storage.sync.set({ a2zSolveHistory: updatedHistory });
  };

  // toggleRandomSolved is now provided by useRandomProblem hook
  // (wrapped above as toggleRandomSolved to update stats)

  // Update stats when solve histories change
  useEffect(() => {
    const updateStatsFromStorage = async () => {
      const result = await chrome.storage.sync.get([
        "randomSolveHistory",
        "a2zSolveHistory",
      ]);
      const randomHistory = result.randomSolveHistory || {};
      const a2zHistory = result.a2zSolveHistory || {};
      updateStats(randomHistory, a2zHistory);
    };

    // Listen for solve history changes to update stats
    const listener = (changes, areaName) => {
      if (
        areaName === "sync" &&
        (changes.randomSolveHistory || changes.a2zSolveHistory)
      ) {
        updateStatsFromStorage();
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // getDifficultyBg and getDifficultyColor are now imported from utils/uiHelpers

  return (
    <div className="min-h-screen bg-[#0e0e12] text-white p-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Settings Button - Top Right */}
      <SettingsButton />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <Header time={time} date={date} greeting={greeting} quote={quote} />

        {/* Remote update toast */}
        <RemoteUpdateToast show={remoteUpdateToast} />

        {/* Filter Applied Toast */}
        <FilterToast show={showFilterToast} />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* POTD */}
        <div className="grid grid-cols-1 mb-10">
          <PotdCard />
        </div>

        {/* Quick Access & Search */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAccessCard />
          <SearchProblemCard />
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Random Challenge */}
          <RandomProblemCard
            dailyProblem={dailyProblem}
            solvedMap={solvedMap}
            pickRandomProblem={pickRandomProblem}
            toggleRandomSolved={toggleRandomSolved}
            getDifficultyBg={getDifficultyBg}
            filters={filters}
            setFilters={setFilters}
            matchMode={matchMode}
            setMatchMode={setMatchMode}
            onApplyFilters={applyFiltersAndPickNew}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />

          {/* A2Z DSA Problem */}
          <A2ZProblemCard
            a2zProblem={a2zProblem}
            a2zSolvedMap={a2zSolvedMap}
            a2zCurrentIndex={a2zCurrentIndex}
            a2zDataLength={a2zData.length}
            onPrevious={prevA2zProblem}
            onNext={nextA2zProblem}
            onToggleSolved={toggleA2zSolved}
          />
        </div>

        {/* Torture Mode Warning */}
        <TortureModeWarning settings={settings} />

        {/* Quick Links */}
        <QuickLinks />
      </div>
    </div>
  );
};

export default NewTab;
