/**
 * ============================================================================
 * STATS TRACKER - Single Source of Truth (Streak + Daily Stats)
 * ============================================================================
 *
 * This file now contains the full streak calculation implementation.
 * It replaces the previous split across multiple modules.
 *
 * Design highlights:
 * - Streaks are calendar-day based in the user's local timezone.
 * - Pure functions and injectable `now` for testability.
 * - Derived activity log (`YYYY-MM-DD` keys) for auditability.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Milliseconds in one day */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Date format for activity log keys */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get the start of the day (midnight) for a given date in local timezone
 * @param {Date|number} date - Date object or timestamp
 * @returns {Date} - Date at midnight local time
 */
export const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Convert a timestamp to a local date string (YYYY-MM-DD)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string}
 */
export const timestampToDateString = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a date string (YYYY-MM-DD) to a Date object at midnight local time
 * @param {string} dateString
 * @returns {Date}
 */
export const dateStringToDate = (dateString) => {
    if (!DATE_FORMAT_REGEX.test(dateString)) {
        throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
    }
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
};

/**
 * Get today's date string in YYYY-MM-DD format
 * @param {number} [now=Date.now()]
 * @returns {string}
 */
export const getTodayDateString = (now = Date.now()) => timestampToDateString(now);

/**
 * Get yesterday's date string in YYYY-MM-DD format
 * @param {number} [now=Date.now()]
 * @returns {string}
 */
export const getYesterdayDateString = (now = Date.now()) => timestampToDateString(now - MS_PER_DAY);

/**
 * Get the difference in calendar days between two dates
 * @param {string} dateString1
 * @param {string} dateString2
 * @returns {number}
 */
export const getDayDifference = (dateString1, dateString2) => {
    const date1 = dateStringToDate(dateString1);
    const date2 = dateStringToDate(dateString2);
    return Math.round((date1 - date2) / MS_PER_DAY);
};

/**
 * Subtract N days from a date string
 * @param {string} dateString
 * @param {number} days
 * @returns {string}
 */
export const subtractDays = (dateString, days) => {
    const date = dateStringToDate(dateString);
    date.setDate(date.getDate() - days);
    return timestampToDateString(date.getTime());
};

// ============================================================================
// ACTIVITY LOG
// ============================================================================

/**
 * Build an activity log from solve history
 * @param {Object} solveHistory - { problemId: timestamp }
 * @returns {Object} - { 'YYYY-MM-DD': count }
 */
export const buildActivityLog = (solveHistory) => {
    const activityLog = {};

    if (!solveHistory || typeof solveHistory !== 'object') {
        return activityLog;
    }

    for (const [problemId, timestamp] of Object.entries(solveHistory)) {
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            console.warn(`Invalid timestamp for problem ${problemId}:`, timestamp);
            continue;
        }

        const dateString = timestampToDateString(timestamp);
        activityLog[dateString] = (activityLog[dateString] || 0) + 1;
    }

    return activityLog;
};

/**
 * Get sorted list of active dates (newest first)
 * @param {Object} activityLog
 * @returns {string[]}
 */
export const getSortedActiveDates = (activityLog) => {
    return Object.keys(activityLog)
        .filter(date => activityLog[date] > 0)
        .sort((a, b) => b.localeCompare(a));
};

// ============================================================================
// STREAK CALCULATION
// ============================================================================

/**
 * Calculate the longest streak ever achieved from activity log
 * @param {Object} activityLog - { 'YYYY-MM-DD': count }
 * @returns {number}
 */
export const calculateLongestStreakFromLog = (activityLog) => {
    const sortedDates = getSortedActiveDates(activityLog).sort();

    if (sortedDates.length === 0) return 0;
    if (sortedDates.length === 1) return 1;

    let longestStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const diff = getDayDifference(sortedDates[i], sortedDates[i - 1]);

        if (diff === 1) {
            currentRun++;
            longestStreak = Math.max(longestStreak, currentRun);
        } else {
            currentRun = 1;
        }
    }

    return longestStreak;
};

/**
 * Calculate current streak from activity log
 * @param {Object} activityLog - { 'YYYY-MM-DD': count }
 * @param {Object} [options={}]
 * @param {number} [options.now=Date.now()]
 * @param {boolean} [options.allowGracePeriod=false]
 * @returns {{ currentStreak:number, longestStreak:number, lastActiveDate:(string|null), isActiveToday:boolean, isAtRisk:boolean, streakDates:string[] }}
 */
export const calculateStreakFromLog = (activityLog, options = {}) => {
    const { now = Date.now(), allowGracePeriod = false } = options;

    const today = getTodayDateString(now);
    const yesterday = getYesterdayDateString(now);

    const sortedDates = getSortedActiveDates(activityLog);

    if (sortedDates.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null,
            isActiveToday: false,
            isAtRisk: false,
            streakDates: [],
        };
    }

    const mostRecentDate = sortedDates[0];
    const isActiveToday = mostRecentDate === today;

    let streakStartDate = null;
    let isAtRisk = false;

    if (isActiveToday) {
        streakStartDate = today;
    } else if (mostRecentDate === yesterday) {
        streakStartDate = yesterday;
        isAtRisk = true;
    } else if (allowGracePeriod) {
        const twoDaysAgo = subtractDays(today, 2);
        if (mostRecentDate === twoDaysAgo) {
            streakStartDate = twoDaysAgo;
            isAtRisk = true;
        }
    }

    if (!streakStartDate) {
        const longestStreak = calculateLongestStreakFromLog(activityLog);
        return {
            currentStreak: 0,
            longestStreak,
            lastActiveDate: mostRecentDate,
            isActiveToday: false,
            isAtRisk: false,
            streakDates: [],
        };
    }

    const streakDates = [];
    let currentDate = streakStartDate;
    let streak = 0;

    while (activityLog[currentDate] > 0) {
        streakDates.push(currentDate);
        streak++;
        currentDate = subtractDays(currentDate, 1);
    }

    const longestStreak = Math.max(streak, calculateLongestStreakFromLog(activityLog));

    return {
        currentStreak: streak,
        longestStreak,
        lastActiveDate: mostRecentDate,
        isActiveToday,
        isAtRisk,
        streakDates,
    };
};

/**
 * Calculate streak directly from solve history
 * @param {Object} solveHistory - { problemId: timestamp }
 * @param {Object} [options={}]
 * @returns {{ currentStreak:number, longestStreak:number, lastActiveDate:(string|null), isActiveToday:boolean, isAtRisk:boolean, streakDates:string[] }}
 */
export const calculateStreak = (solveHistory, options = {}) => {
    const activityLog = buildActivityLog(solveHistory);
    return calculateStreakFromLog(activityLog, options);
};

// ============================================================================
// STATS HELPERS
// ============================================================================

/**
 * Check if a timestamp is from today (local time)
 * @param {number} timestamp
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
export const isToday = (timestamp, now = Date.now()) => {
    const today = getTodayDateString(now);
    return timestampToDateString(timestamp) === today;
};

/**
 * Check if a timestamp is from yesterday (local time)
 * @param {number} timestamp
 * @param {number} [now=Date.now()]
 * @returns {boolean}
 */
export const isYesterday = (timestamp, now = Date.now()) => {
    const yesterday = getYesterdayDateString(now);
    return timestampToDateString(timestamp) === yesterday;
};

/**
 * Get activity count for today
 * @param {Object} solveHistory
 * @param {number} [now=Date.now()]
 * @returns {number}
 */
export const getCountToday = (solveHistory, now = Date.now()) => {
    if (!solveHistory) return 0;
    return Object.values(solveHistory).filter(ts => isToday(ts, now)).length;
};

/**
 * Get activity count for a specific date
 * @param {Object} solveHistory
 * @param {string} dateString
 * @returns {number}
 */
export const getCountForDate = (solveHistory, dateString) => {
    if (!solveHistory) return 0;
    return Object.values(solveHistory).filter(ts => timestampToDateString(ts) === dateString).length;
};

// ============================================================================
// STATS (OPTIONS-BASED)
// ============================================================================

/**
 * Calculate stats from solve histories
 * @param {Object} [primaryHistory={}]
 * @param {Object} [secondaryHistory={}]
 * @param {Object} [options={}]
 * @param {number} [options.now=Date.now()]
 * @param {boolean} [options.allowGracePeriod=false]
 * @returns {{ totalSolved:number, solvedToday:number, currentStreak:number, bestStreak:number, isActiveToday:boolean, isAtRisk:boolean, lastActiveDate:(string|null) }}
 */
export const calculateStatsWithOptions = (
    primaryHistory = {},
    secondaryHistory = {},
    options = {}
) => {
    const { now = Date.now(), allowGracePeriod = false } = options;

    const mergedHistory = { ...primaryHistory, ...secondaryHistory };

    const totalSolved = Object.keys(mergedHistory).length;
    const solvedToday = getCountToday(mergedHistory, now);

    const streakResult = calculateStreak(mergedHistory, { now, allowGracePeriod });
    const bestStreak = streakResult.longestStreak;

    return {
        totalSolved,
        solvedToday,
        currentStreak: streakResult.currentStreak,
        bestStreak,
        isActiveToday: streakResult.isActiveToday,
        isAtRisk: streakResult.isAtRisk,
        lastActiveDate: streakResult.lastActiveDate,
    };
};

// ============================================================================
// SOLVE HISTORY MANAGEMENT
// ============================================================================

export const markProblemSolved = (currentHistory = {}, problemId, timestamp = Date.now()) => {
    return {
        ...currentHistory,
        [problemId]: timestamp,
    };
};

export const unmarkProblemSolved = (currentHistory = {}, problemId) => {
    const updated = { ...currentHistory };
    delete updated[problemId];
    return updated;
};

export const toggleProblemSolved = (currentHistory = {}, problemId) => {
    if (currentHistory[problemId]) {
        return unmarkProblemSolved(currentHistory, problemId);
    }
    return markProblemSolved(currentHistory, problemId);
};

export const createSolvedMapFromHistory = (solveHistory = {}) => {
    const solvedMap = {};
    for (const problemId in solveHistory) {
        solvedMap[problemId] = true;
    }
    return solvedMap;
};

// ============================================================================
// DEBUGGING & AUDITING UTILITIES
// ============================================================================

export const getStreakDebugSummary = (solveHistory, options = {}) => {
    const activityLog = buildActivityLog(solveHistory);
    const result = calculateStreakFromLog(activityLog, options);
    const today = getTodayDateString(options.now);

    return [
        `=== Streak Debug Summary ===`,
        `Today: ${today}`,
        `Current Streak: ${result.currentStreak} days`,
        `Best Streak: ${result.longestStreak} days`,
        `Active Today: ${result.isActiveToday ? 'Yes' : 'No'}`,
        `At Risk: ${result.isAtRisk ? 'Yes ⚠️' : 'No'}`,
        `Last Active: ${result.lastActiveDate || 'Never'}`,
        `Streak Dates: ${result.streakDates.join(', ') || 'None'}`,
        `Activity Log:`,
        ...Object.entries(activityLog)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 10)
            .map(([date, count]) => `  ${date}: ${count} problem(s)`),
    ].join('\n');
};

export const validateSolveHistory = (solveHistory) => {
    const issues = [];

    if (!solveHistory || typeof solveHistory !== 'object') {
        return { valid: false, issues: ['Solve history is not an object'] };
    }

    for (const [problemId, timestamp] of Object.entries(solveHistory)) {
        if (!problemId) {
            issues.push('Found empty problem ID');
        }
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            issues.push(`Invalid timestamp for problem ${problemId}: ${timestamp}`);
        }
        if (timestamp < 0) {
            issues.push(`Negative timestamp for problem ${problemId}: ${timestamp}`);
        }
        if (timestamp > Date.now() + MS_PER_DAY) {
            issues.push(`Future timestamp for problem ${problemId}: ${new Date(timestamp)}`);
        }
    }

    return {
        valid: issues.length === 0,
        issues,
    };
};
