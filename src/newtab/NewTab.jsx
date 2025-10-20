import { useState, useEffect, useRef } from "react";
import leetCodeProblems from "../problem-data/leetCodeAllProblemDump.json";
import a2zData from "../problem-data/problems";
import Header from "./Components/Header";
import StatsCards from "./Components/StatsCards";
import RandomProblemCard from "./Components/RandomProblemCard";
import A2ZProblemCard from "./Components/A2ZProblemCard";
import TortureModeWarning from "./Components/TortureModeWarning";
import QuickLinks from "./Components/QuickLinks";
import SettingsButton from "./Components/SettingsButton";
import RemoteUpdateToast from "./Components/RemoteUpdateToast";
import "./Styles/NewTab.css";

export const NewTab = () => {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [greeting, setGreeting] = useState("");
  const [dailyProblem, setDailyProblem] = useState(null);
  const [a2zProblem, setA2zProblem] = useState(null);
  const [a2zSolvedMap, setA2zSolvedMap] = useState({});
  const [solvedMap, setSolvedMap] = useState({});
  const [a2zCurrentIndex, setA2zCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    solvedToday: 0,
    totalSolved: 0,
    currentStreak: 0,
  });
  const [settings, setSettings] = useState({
    tortureMode: false,
    hyperTortureMode: false,
  });
  const [quote, setQuote] = useState("");
  const [remoteUpdateToast, setRemoteUpdateToast] = useState(false);
  const isLocalRandomRef = useRef(false);

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

    // Listen for storage changes to sync random problem across contexts
    const storageListener = (changes, areaName) => {
      if (areaName === "sync" && changes.currentRandomProblem) {
        const newVal = changes.currentRandomProblem.newValue;
        if (newVal) {
          setDailyProblem(newVal);
          // show a toast only if this wasn't a local change
          if (!isLocalRandomRef.current) {
            setRemoteUpdateToast(true);
            setTimeout(() => setRemoteUpdateToast(false), 2200);
          }
        }
      }
      if (areaName === "sync" && changes.solvedMap) {
        const newSolved = changes.solvedMap.newValue || {};
        setSolvedMap(newSolved);
        // update stats totalSolved based on both solved maps
        setStats((prev) => ({
          ...prev,
          totalSolved:
            Object.keys(newSolved).length + Object.keys(a2zSolvedMap).length,
        }));
      }
      // Listen for settings changes (torture mode, etc.)
      if (areaName === "sync" && changes.userSettings) {
        const newSettings = changes.userSettings.newValue;
        if (newSettings) {
          setSettings(newSettings);
        }
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => {
      clearInterval(timeInterval);
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timeStr = `${hours % 12 || 12}:${minutes}`;
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

      // Load solved problems
      const solvedData = await chrome.storage.sync.get([
        "solvedMap",
        "a2zSolvedMap",
      ]);
      const solvedMap = solvedData.solvedMap || {};
      const a2zSolved = solvedData.a2zSolvedMap || {};

      setSolvedMap(solvedMap);
      setA2zSolvedMap(a2zSolved);

      const totalSolved =
        Object.keys(solvedMap).length + Object.keys(a2zSolved).length;

      setStats({
        solvedToday: 0, // You can implement this later with date tracking
        totalSolved,
        currentStreak: 0, // You can implement this later with streak tracking
      });

      // Get the current random problem from sync storage (synced with RandomProblem component)
      const randomProblemData = await chrome.storage.sync.get([
        "currentRandomProblem",
      ]);

      if (randomProblemData.currentRandomProblem) {
        setDailyProblem(randomProblemData.currentRandomProblem);
      } else {
        // If no random problem exists, pick one
        const randomIndex = Math.floor(Math.random() * leetCodeProblems.length);
        const problem = leetCodeProblems[randomIndex];
        setDailyProblem(problem);
        chrome.storage.sync.set({ currentRandomProblem: problem });
      }

      // Load A2Z problem - find first unsolved or use index 0
      const firstUnsolved = a2zData.findIndex(
        (problem) => !a2zSolved[problem.id]
      );
      const a2zIndex = firstUnsolved !== -1 ? firstUnsolved : 0;
      setA2zCurrentIndex(a2zIndex);
      setA2zProblem(a2zData[a2zIndex]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // A2Z Navigation functions
  const pickRandomProblem = async () => {
    try {
      const randomIndex = Math.floor(Math.random() * leetCodeProblems.length);
      const problem = leetCodeProblems[randomIndex];
      setDailyProblem(problem);
      // persist so other parts of the extension (popup) stay in sync
      // mark this change as local so storage listener doesn't show a toast
      isLocalRandomRef.current = true;
      try {
        await chrome.storage.sync.set({ currentRandomProblem: problem });
      } catch (e) {
        // fallback to callback style if promises aren't available
        chrome.storage.sync.set({ currentRandomProblem: problem });
      }
      // reset the local-change flag shortly after
      setTimeout(() => (isLocalRandomRef.current = false), 300);
    } catch (error) {
      console.error("Error picking random problem:", error);
    }
  };

  const prevA2zProblem = () => {
    const newIndex =
      a2zCurrentIndex === 0 ? a2zData.length - 1 : a2zCurrentIndex - 1;
    setA2zCurrentIndex(newIndex);
    setA2zProblem(a2zData[newIndex]);
  };

  const nextA2zProblem = () => {
    const newIndex =
      a2zCurrentIndex === a2zData.length - 1 ? 0 : a2zCurrentIndex + 1;
    setA2zCurrentIndex(newIndex);
    setA2zProblem(a2zData[newIndex]);
  };

  const toggleA2zSolved = (problemId) => {
    const updatedSolvedMap = { ...a2zSolvedMap };

    if (updatedSolvedMap[problemId]) {
      delete updatedSolvedMap[problemId];
    } else {
      updatedSolvedMap[problemId] = true;
    }

    setA2zSolvedMap(updatedSolvedMap);

    // Update stats
    const totalSolved =
      Object.keys(updatedSolvedMap).length +
      stats.totalSolved -
      Object.keys(a2zSolvedMap).length;
    setStats((prev) => ({ ...prev, totalSolved }));

    // Save to Chrome storage
    chrome.storage.sync.set({ a2zSolvedMap: updatedSolvedMap });
  };

  const toggleRandomSolved = (problemId) => {
    if (!problemId) return;
    const updated = { ...solvedMap };
    if (updated[problemId]) delete updated[problemId];
    else updated[problemId] = true;

    setSolvedMap(updated);

    // update stats totalSolved (combine with a2z)
    const totalSolvedCount =
      Object.keys(updated).length + Object.keys(a2zSolvedMap).length;
    setStats((prev) => ({ ...prev, totalSolved: totalSolvedCount }));

    try {
      chrome.storage.sync.set({ solvedMap: updated });
    } catch (e) {
      chrome.storage.sync.set({ solvedMap: updated });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-900 text-green-300";
      case "Medium":
        return "bg-yellow-900 text-yellow-300";
      case "Hard":
        return "bg-red-900 text-red-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  };

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

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Problems Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Random Challenge */}
          <RandomProblemCard
            dailyProblem={dailyProblem}
            solvedMap={solvedMap}
            pickRandomProblem={pickRandomProblem}
            toggleRandomSolved={toggleRandomSolved}
            getDifficultyBg={getDifficultyBg}
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
