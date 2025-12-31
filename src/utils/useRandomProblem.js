import { useState, useEffect, useRef, useCallback } from "react";
import leetCodeProblems from "../problem-data/leetCodeAllProblemDump.json";
import gfgData from "../problem-data/gfg_problems.json";
import code360Data from "../problem-data/code360_problems_indexed.json";
import {
    toggleProblemSolved,
    createSolvedMapFromHistory,
} from "./statsTracker";
import { applyFilters } from "./problemFilters";

/**
 * Shared hook for random problem functionality
 * Used by both NewTab and Popup components to ensure identical behavior
 */
export function useRandomProblem() {
    const [currentProblem, setCurrentProblem] = useState(null);
    const [solvedMap, setSolvedMap] = useState({});
    const [randomSolveHistory, setRandomSolveHistory] = useState({});
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState([]);
    const [matchMode, setMatchMode] = useState("all");
    const [dataSource, setDataSource] = useState("leetcode");
    const [showFilterToast, setShowFilterToast] = useState(false);

    const isInitialLoadRef = useRef(true);
    const hasAutoAppliedRef = useRef(false);

    // Get source problems based on dataSource
    const getSourceProblems = useCallback((source = dataSource) => {
        if (source === "gfg") {
            return gfgData.problems || [];
        } else if (source === "code360") {
            return code360Data.problems || [];
        } else {
            return leetCodeProblems || [];
        }
    }, [dataSource]);

    // Derive filtered problems (not stored, always computed)
    const getFilteredProblems = useCallback((source = dataSource) => {
        const sourceProblems = getSourceProblems(source);
        return applyFilters(sourceProblems, filters, solvedMap, matchMode);
    }, [dataSource, filters, solvedMap, matchMode, getSourceProblems]);

    // Initialize from storage
    useEffect(() => {
        const initialize = async () => {
            try {
                const result = await chrome.storage.sync.get([
                    "randomSolveHistory",
                    "currentRandomProblem",
                    "savedFilters",
                    "randomProblemDataSource",
                ]);

                // Load solve history
                const history = result.randomSolveHistory || {};
                setRandomSolveHistory(history);
                setSolvedMap(createSolvedMapFromHistory(history));

                // Load data source
                if (result.randomProblemDataSource) {
                    setDataSource(result.randomProblemDataSource);
                }

                // Load saved filters
                if (result.savedFilters) {
                    setFilters(result.savedFilters.filters || []);
                    setMatchMode(result.savedFilters.matchMode || "all");
                }

                // Load current problem
                if (result.currentRandomProblem) {
                    setCurrentProblem(result.currentRandomProblem);
                }

                setLoading(false);
            } catch (e) {
                // Fallback to callback API
                chrome.storage.sync.get(
                    [
                        "randomSolveHistory",
                        "currentRandomProblem",
                        "savedFilters",
                        "randomProblemDataSource",
                    ],
                    (result) => {
                        const history = result.randomSolveHistory || {};
                        setRandomSolveHistory(history);
                        setSolvedMap(createSolvedMapFromHistory(history));

                        if (result.randomProblemDataSource) {
                            setDataSource(result.randomProblemDataSource);
                        }

                        if (result.savedFilters) {
                            setFilters(result.savedFilters.filters || []);
                            setMatchMode(result.savedFilters.matchMode || "all");
                        }

                        if (result.currentRandomProblem) {
                            setCurrentProblem(result.currentRandomProblem);
                        }

                        setLoading(false);
                    }
                );
            }
        };

        initialize();

        // Listen for storage changes
        const storageListener = (changes, areaName) => {
            if (areaName === "sync") {
                if (changes.currentRandomProblem) {
                    const newVal = changes.currentRandomProblem.newValue;
                    if (newVal) setCurrentProblem(newVal);
                }
                if (changes.randomSolveHistory) {
                    const newHistory = changes.randomSolveHistory.newValue || {};
                    setRandomSolveHistory(newHistory);
                    setSolvedMap(createSolvedMapFromHistory(newHistory));
                }
                if (changes.randomProblemDataSource) {
                    const newSource = changes.randomProblemDataSource.newValue;
                    if (newSource) setDataSource(newSource);
                }
            }
        };

        chrome.storage.onChanged.addListener(storageListener);

        return () => {
            chrome.storage.onChanged.removeListener(storageListener);
        };
    }, []);

    // Save current problem to storage
    useEffect(() => {
        if (currentProblem && !isInitialLoadRef.current) {
            chrome.storage.sync.set({ currentRandomProblem: currentProblem });
        }
    }, [currentProblem]);

    // Save dataSource to storage
    useEffect(() => {
        if (!isInitialLoadRef.current) {
            chrome.storage.sync.set({ randomProblemDataSource: dataSource });
        }
    }, [dataSource]);

    // Save filters to storage
    useEffect(() => {
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

    // Pick a random problem (always applies current filters)
    const pickRandomProblem = useCallback(async () => {
        const filtered = getFilteredProblems();

        if (filtered.length === 0) {
            setCurrentProblem(null);
            await chrome.storage.sync.set({
                currentRandomProblem: null,
                randomProblemDataSource: dataSource,
            });
            return;
        }

        const randomIndex = Math.floor(Math.random() * filtered.length);
        const problem = filtered[randomIndex];
        setCurrentProblem(problem);

        await chrome.storage.sync.set({
            currentRandomProblem: problem,
            randomProblemDataSource: dataSource,
        });
    }, [getFilteredProblems, dataSource]);

    // Apply filters and pick a new problem
    const applyFiltersAndPickNew = useCallback(async () => {
        const filtered = getFilteredProblems();

        if (filtered.length > 0) {
            const randomIndex = Math.floor(Math.random() * filtered.length);
            const problem = filtered[randomIndex];
            setCurrentProblem(problem);

            await chrome.storage.sync.set({
                currentRandomProblem: problem,
                randomProblemDataSource: dataSource,
            });

            setShowFilterToast(true);
            setTimeout(() => setShowFilterToast(false), 2200);
        } else {
            setCurrentProblem(null);
            await chrome.storage.sync.set({
                currentRandomProblem: null,
                randomProblemDataSource: dataSource,
            });
            setShowFilterToast(false);
        }
    }, [getFilteredProblems, dataSource]);

    // Toggle solved status
    const toggleSolved = useCallback((problemId) => {
        const updatedHistory = toggleProblemSolved(randomSolveHistory, problemId);
        setRandomSolveHistory(updatedHistory);
        setSolvedMap(createSolvedMapFromHistory(updatedHistory));
        chrome.storage.sync.set({ randomSolveHistory: updatedHistory });
    }, [randomSolveHistory]);

    // Auto-apply filters on initial load if they exist
    // This ensures that when filters are loaded from storage, they are applied immediately
    useEffect(() => {
        if (!loading && !hasAutoAppliedRef.current && filters.length > 0) {
            hasAutoAppliedRef.current = true;
            // Always apply filters and pick a new problem, even if currentProblem is set
            // This ensures the stored problem is replaced with a filtered one
            applyFiltersAndPickNew();
        }
    }, [loading, filters.length, applyFiltersAndPickNew]);

    // Handle dataSource change - apply filters and pick new problem
    useEffect(() => {
        if (isInitialLoadRef.current) return;
        applyFiltersAndPickNew();
    }, [dataSource]);

    return {
        // State
        currentProblem,
        solvedMap,
        loading,
        showFilters,
        setShowFilters,
        filters,
        setFilters,
        matchMode,
        setMatchMode,
        dataSource,
        setDataSource,
        showFilterToast,

        // Computed
        getFilteredProblems,
        getSourceProblems,

        // Actions
        pickRandomProblem,
        applyFiltersAndPickNew,
        toggleSolved,
    };
}

