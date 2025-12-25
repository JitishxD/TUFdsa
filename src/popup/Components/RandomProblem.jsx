import React from "react";
import { useState, useEffect } from "react";
import "../Styles/Popup.css";
import leetCodeProblems from "../../problem-data/leetCodeAllProblemDump.json";
import {
  toggleProblemSolved,
  createSolvedMapFromHistory,
} from "../../utils/statsTracker";
import { applyFilters } from "../../utils/problemFilters";
import FilterPanel from "./FilterPanel";
import FilterToast from "../../newtab/Components/FilterToast";
import RandomProblemCard from "../../newtab/Components/RandomProblemCard";
import gfgData from "../../problem-data/gfg_problems.json";

export function RandomProblem({ onBack }) {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [solvedMap, setSolvedMap] = useState({}); // { problemId: true/false }
  const [randomSolveHistory, setRandomSolveHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [matchMode, setMatchMode] = useState("all");
  const [filteredProblems, setFilteredProblems] = useState(leetCodeProblems);
  const [showFilterToast, setShowFilterToast] = useState(false);
  const [dataSource, setDataSource] = useState("leetcode");
  const isInitialLoadRef = React.useRef(true);
  const hasAutoAppliedRef = React.useRef(false);

  // Load solved status and current problem from Chrome storage on mount
  useEffect(() => {
    const initialize = (result) => {
      const history = result.randomSolveHistory || {};
      setRandomSolveHistory(history);
      setSolvedMap(createSolvedMapFromHistory(history));

      // Load saved filters and filter state
      if (result.savedFilters) {
        setFilters(result.savedFilters.filters || []);
        setMatchMode(result.savedFilters.matchMode || "all");
      }

      // If there's a stored problem, use it; otherwise pick a random one
      if (result.currentRandomProblem) {
        setCurrentProblem(result.currentRandomProblem);
      } else {
        pickRandomProblem();
      }
      setLoading(false);
    };

    // Try promise-based get first, fallback to callback
    try {
      chrome.storage.sync
        .get(["randomSolveHistory", "currentRandomProblem", "savedFilters"])
        .then(initialize);
    } catch (e) {
      chrome.storage.sync.get(
        ["randomSolveHistory", "currentRandomProblem", "savedFilters"],
        initialize
      );
    }

    // Listen for storage changes to keep popup in sync
    const storageListener = (changes, areaName) => {
      if (areaName === "sync" && changes.currentRandomProblem) {
        const newVal = changes.currentRandomProblem.newValue;
        if (newVal) setCurrentProblem(newVal);
      }
      if (areaName === "sync" && changes.randomSolveHistory) {
        const newHistory = changes.randomSolveHistory.newValue || {};
        setRandomSolveHistory(newHistory);
        setSolvedMap(createSolvedMapFromHistory(newHistory));
      }
    };

    chrome.storage.onChanged.addListener(storageListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  // Save solved status to Chrome storage whenever it changes
  useEffect(() => {
    if (Object.keys(solvedMap).length > 0) {
      chrome.storage.sync.set({ solvedMap });
    }
  }, [solvedMap]);

  // Save current problem to storage whenever it changes
  useEffect(() => {
    if (currentProblem) {
      chrome.storage.sync.set({ currentRandomProblem: currentProblem });
    }
  }, [currentProblem]);

  // Save all filter state to storage whenever any filter property changes
  useEffect(() => {
    // Skip saving on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    chrome.storage.sync.set({
      savedFilters: {
        filters,
        matchMode,
      },
    });
  }, [filters, matchMode]);

  // Note: We intentionally do NOT recompute filteredProblems on every filter change
  // to keep the "Apply" button as the source of truth. We only auto-apply once on load below.

  // Call onApply (applyFiltersAndPickNew) once on initial load if filters exist
  useEffect(() => {
    if (!loading && !hasAutoAppliedRef.current && filters.length > 0) {
      hasAutoAppliedRef.current = true;
      applyFiltersAndPickNew();
    }
  }, [filters, matchMode, solvedMap, loading]);

  const pickRandomProblem = () => {
    // Determine source problems based on dataSource
    const sourceProblems =
      dataSource === "gfg" ? gfgData.problems || [] : leetCodeProblems || [];
    // Use filtered problems if filters are active
    const problemPool =
      filteredProblems.length > 0 ? filteredProblems : sourceProblems;
    if (problemPool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * problemPool.length);
    setCurrentProblem(problemPool[randomIndex]);
  };

  const applyFiltersAndPickNew = () => {
    const sourceProblems =
      dataSource === "gfg" ? gfgData.problems || [] : leetCodeProblems || [];
    const filtered = applyFilters(
      sourceProblems,
      filters,
      solvedMap,
      matchMode
    );
    setFilteredProblems(filtered);

    if (filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      setCurrentProblem(filtered[randomIndex]);

      // Show toast notification
      setShowFilterToast(true);
      setTimeout(() => setShowFilterToast(false), 2200);
    } else {
      alert(
        "No problems match the selected filters. Please adjust your filters."
      );
    }
  };

  const toggleSolved = (problemId) => {
    const updatedHistory = toggleProblemSolved(randomSolveHistory, problemId);
    setRandomSolveHistory(updatedHistory);
    setSolvedMap(createSolvedMapFromHistory(updatedHistory));

    // Save to Chrome storage
    chrome.storage.sync.set({ randomSolveHistory: updatedHistory });
  };

  // When dataSource changes, update filteredProblems and pick a new problem
  useEffect(() => {
    const sourceProblems =
      dataSource === "gfg" ? gfgData.problems || [] : leetCodeProblems || [];
    setFilteredProblems(sourceProblems);

    if (sourceProblems.length > 0) {
      const randomIndex = Math.floor(Math.random() * sourceProblems.length);
      setCurrentProblem(sourceProblems[randomIndex]);
    } else {
      setCurrentProblem(null);
    }

    // Clear any stored problem to avoid mismatch on reload
    try {
      chrome.storage.sync.remove(["currentRandomProblem"]);
    } catch (e) {
      chrome.storage.sync.set({ currentRandomProblem: null });
    }
  }, [dataSource]);
  if (loading || !currentProblem) {
    return (
      <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col items-center justify-center font-sans">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

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
    <div className="w-[360px] max-h-[600px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col font-sans overflow-y-auto">
      <RandomProblemCard
        dailyProblem={currentProblem}
        solvedMap={solvedMap}
        pickRandomProblem={pickRandomProblem}
        toggleRandomSolved={toggleSolved}
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

      {/* Back Button */}
      <button
        onClick={onBack}
        className="bg-[#2b2b33] hover:bg-[#383844] mt-4 px-4 py-2 rounded-lg text-gray-300 transition"
      >
        ← Back
      </button>

      {/* Filter Applied Toast */}
      <FilterToast show={showFilterToast} />
    </div>
  );
}

export default RandomProblem;
