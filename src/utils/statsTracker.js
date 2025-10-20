/**
 * Utility functions for tracking problem-solving statistics
 */

/**
 * Check if a timestamp is from today
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {boolean}
 */
export const isToday = (timestamp) => {
    const today = new Date();
    const date = new Date(timestamp);

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

/**
 * Calculate streak based on solve history
 * @param {Object} solveHistory - { problemId: timestamp }
 * @returns {number} - Current streak count
 */
export const calculateStreak = (solveHistory) => {
    if (!solveHistory || Object.keys(solveHistory).length === 0) {
        return 0;
    }

    // Get all timestamps and sort them in descending order (newest first)
    const timestamps = Object.values(solveHistory).sort((a, b) => b - a);

    if (timestamps.length === 0) return 0;

    const now = Date.now();
    const mostRecentSolve = timestamps[0];

    // If the most recent solve is more than 24 hours ago, streak is 0
    // (Haven't solved anything recently)
    if (now - mostRecentSolve > 24 * 60 * 60 * 1000) {
        return 0;
    }

    // Start with streak of 1 for the most recent solve
    let streak = 1;
    let lastStreakTimestamp = mostRecentSolve;

    // Go through timestamps from newest to oldest
    for (let i = 1; i < timestamps.length; i++) {
        const currentTimestamp = timestamps[i];
        const timeDiff = lastStreakTimestamp - currentTimestamp;

        // If this solve is within 24 hours of the last streak timestamp, continue checking
        if (timeDiff <= 24 * 60 * 60 * 1000) {
            // Only increment streak if this is a different "streak window"
            // We use 24-hour windows from each streak point
            const previousStreakWindow = Math.floor(lastStreakTimestamp / (24 * 60 * 60 * 1000));
            const currentStreakWindow = Math.floor(currentTimestamp / (24 * 60 * 60 * 1000));

            if (previousStreakWindow !== currentStreakWindow) {
                streak++;
                lastStreakTimestamp = currentTimestamp;
            }
        } else {
            // Gap is more than 24 hours, streak chain is broken at this point
            break;
        }
    }

    return streak;
};

/**
 * Calculate stats from solve histories
 * @param {Object} randomSolveHistory - { problemId: timestamp }
 * @param {Object} a2zSolveHistory - { problemId: timestamp }
 * @param {number} currentBestStreak - Current best streak value from storage
 * @returns {Object} - { totalSolved, solvedToday, currentStreak, bestStreak }
 */
export const calculateStats = (randomSolveHistory = {}, a2zSolveHistory = {}, currentBestStreak = 0) => {
    // Combine both solve histories
    const allSolveHistory = { ...randomSolveHistory, ...a2zSolveHistory };

    // Total solved = count of all problems
    const totalSolved = Object.keys(allSolveHistory).length;

    // Today solved = count of problems solved today
    const solvedToday = Object.values(allSolveHistory).filter(timestamp =>
        isToday(timestamp)
    ).length;

    // Calculate streak from combined history
    const currentStreak = calculateStreak(allSolveHistory);

    // Update best streak if current streak is higher
    const bestStreak = Math.max(currentStreak, currentBestStreak);

    return {
        totalSolved,
        solvedToday,
        currentStreak,
        bestStreak,
    };
};

/**
 * Mark a problem as solved and update solve history
 * @param {Object} currentHistory - Current solve history
 * @param {string|number} problemId - Problem ID to mark as solved
 * @returns {Object} - Updated solve history
 */
export const markProblemSolved = (currentHistory, problemId) => {
    return {
        ...currentHistory,
        [problemId]: Date.now(),
    };
};

/**
 * Unmark a problem as solved
 * @param {Object} currentHistory - Current solve history
 * @param {string|number} problemId - Problem ID to unmark
 * @returns {Object} - Updated solve history
 */
export const unmarkProblemSolved = (currentHistory, problemId) => {
    const updated = { ...currentHistory };
    delete updated[problemId];
    return updated;
};

/**
 * Toggle a problem's solved status
 * @param {Object} currentHistory - Current solve history
 * @param {string|number} problemId - Problem ID to toggle
 * @returns {Object} - Updated solve history
 */
export const toggleProblemSolved = (currentHistory, problemId) => {
    if (currentHistory[problemId]) {
        return unmarkProblemSolved(currentHistory, problemId);
    } else {
        return markProblemSolved(currentHistory, problemId);
    }
};

/**
 * Create a solved map (boolean) from solve history (timestamps)
 * For backward compatibility with existing UI components
 * @param {Object} solveHistory - { problemId: timestamp }
 * @returns {Object} - { problemId: true }
 */
export const createSolvedMapFromHistory = (solveHistory) => {
    const solvedMap = {};
    for (const problemId in solveHistory) {
        solvedMap[problemId] = true;
    }
    return solvedMap;
};
