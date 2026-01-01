import { describe, it, expect } from "vitest";

import {
  // Date utilities
  getStartOfDay,
  timestampToDateString,
  dateStringToDate,
  getTodayDateString,
  getYesterdayDateString,
  getDayDifference,
  subtractDays,
  // Activity log
  buildActivityLog,
  getSortedActiveDates,
  // Streak calculation
  calculateStreakFromLog,
  calculateLongestStreakFromLog,
  calculateStreak,
  // Stats helpers
  isToday,
  isYesterday,
  getCountToday,
  getCountForDate,
  calculateStatsWithOptions,
  // History management
  markProblemSolved,
  unmarkProblemSolved,
  toggleProblemSolved,
  createSolvedMapFromHistory,
  // Debug utilities
  getStreakDebugSummary,
  validateSolveHistory,
} from "./statsTracker.js";

// --------- TEST UTILITIES ---------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Create a mock timestamp for a specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {number} [hour=12] - Hour of the day (0-23)
 * @returns {number} - Timestamp
 */
const makeTimestamp = (dateStr, hour = 12) => {
  const date = dateStringToDate(dateStr);
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
};

/**
 * Create a mock solve history with activities on specific dates
 * @param {Object} dateMap - { 'YYYY-MM-DD': [problemIds] } or { 'YYYY-MM-DD': count }
 * @returns {Object} - Solve history
 */
const makeSolveHistory = (dateMap) => {
  const history = {};
  let idCounter = 1;

  for (const [dateStr, value] of Object.entries(dateMap)) {
    const timestamp = makeTimestamp(dateStr);

    if (Array.isArray(value)) {
      // Specific problem IDs
      for (const id of value) {
        history[id] = timestamp;
      }
    } else if (typeof value === "number") {
      // Generate N problem IDs
      for (let i = 0; i < value; i++) {
        history[`problem_${idCounter++}`] = timestamp;
      }
    }
  }

  return history;
};

// --------- DATE UTILITY TESTS ---------

describe("Date utilities", () => {
  it("formats timestamp to date string", () => {
    const now = new Date(2026, 0, 1, 15, 30, 0);
    expect(timestampToDateString(now.getTime())).toBe("2026-01-01");
  });

  it("parses date string to date", () => {
    const parsed = dateStringToDate("2026-01-01");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(1);
  });

  it("computes day differences", () => {
    expect(getDayDifference("2026-01-05", "2026-01-01")).toBe(4);
    expect(getDayDifference("2026-01-01", "2026-01-05")).toBe(-4);
  });

  it("subtracts days from a date string", () => {
    expect(subtractDays("2026-01-05", 3)).toBe("2026-01-02");
    expect(subtractDays("2026-01-01", 1)).toBe("2025-12-31");
  });
});

// --------- ACTIVITY LOG TESTS ---------

describe("Activity log", () => {
  it("builds activity log and sorts active dates", () => {
    const history = makeSolveHistory({
      "2026-01-01": 3,
      "2026-01-02": 2,
      "2026-01-04": 1,
    });

    const log = buildActivityLog(history);
    expect(log["2026-01-01"]).toBe(3);
    expect(log["2026-01-02"]).toBe(2);
    expect(log["2026-01-04"]).toBe(1);
    expect(log["2026-01-03"]).toBeUndefined();

    const sorted = getSortedActiveDates(log);
    expect(sorted[0]).toBe("2026-01-04");
    expect(sorted[1]).toBe("2026-01-02");
    expect(sorted[2]).toBe("2026-01-01");
  });

  it("handles empty or null history", () => {
    const emptyLog = buildActivityLog({});
    expect(Object.keys(emptyLog)).toHaveLength(0);

    const nullLog = buildActivityLog(null);
    expect(Object.keys(nullLog)).toHaveLength(0);
  });
});

// --------- STREAK CALCULATION TESTS ---------

describe("Streak calculation", () => {
  const today = "2026-01-01";
  const todayTimestamp = makeTimestamp(today, 15);

  it("counts consecutive days including today", () => {
    const history = makeSolveHistory({
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(3);
    expect(result.isActiveToday).toBe(true);
    expect(result.isAtRisk).toBe(false);
  });

  it("resets streak when last activity is 2+ days ago", () => {
    const history = makeSolveHistory({
      "2025-12-28": 1,
      "2025-12-29": 1,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(0);
    expect(result.isActiveToday).toBe(false);
  });

  it("marks streak at risk when last activity is yesterday", () => {
    const history = makeSolveHistory({
      "2025-12-30": 1,
      "2025-12-31": 1,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(2);
    expect(result.isActiveToday).toBe(false);
    expect(result.isAtRisk).toBe(true);
  });

  it("breaks streak across gaps", () => {
    const history = makeSolveHistory({
      "2025-12-28": 1,
      "2025-12-29": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(2);
  });

  it("treats multiple solves in a day as one streak day", () => {
    const history = makeSolveHistory({
      "2025-12-31": 5,
      "2026-01-01": 3,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(2);
  });

  it("handles empty history", () => {
    const result = calculateStreak({}, { now: todayTimestamp });
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(0);
  });

  it("handles single activity today", () => {
    const history = makeSolveHistory({
      "2026-01-01": 1,
    });
    const result = calculateStreak(history, { now: todayTimestamp });

    expect(result.currentStreak).toBe(1);
  });
});

// --------- LONGEST STREAK TESTS ---------

describe("Longest streak", () => {
  it("finds longest streak with gaps", () => {
    const log = {
      "2025-12-01": 1,
      "2025-12-02": 1,
      "2025-12-03": 1,
      "2025-12-10": 1,
      "2025-12-11": 1,
      "2025-12-12": 1,
      "2025-12-13": 1,
      "2025-12-14": 1,
      "2025-12-20": 1,
    };
    const longest = calculateLongestStreakFromLog(log);
    expect(longest).toBe(5);
  });

  it("finds current streak as longest", () => {
    const history = makeSolveHistory({
      "2025-12-28": 1,
      "2025-12-29": 1,
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });
    const log = buildActivityLog(history);
    const longest = calculateLongestStreakFromLog(log);
    expect(longest).toBe(5);
  });
});

// --------- STATS TESTS ---------

describe("calculateStatsWithOptions", () => {
  const today = "2026-01-01";
  const todayTimestamp = makeTimestamp(today, 15);

  it("combines random and a2z histories", () => {
    const randomHistory = makeSolveHistory({
      "2025-12-31": ["r1", "r2"],
      "2026-01-01": ["r3"],
    });
    const a2zHistory = makeSolveHistory({
      "2025-12-31": ["a1"],
      "2026-01-01": ["a2", "a3"],
    });

    const stats = calculateStatsWithOptions(randomHistory, a2zHistory, {
      now: todayTimestamp,
    });

    expect(stats.totalSolved).toBe(6);
    expect(stats.solvedToday).toBe(3);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(2);
  });

  it("updates best streak when current streak grows", () => {
    const history = makeSolveHistory({
      "2025-12-25": 1,
      "2025-12-26": 1,
      "2025-12-27": 1,
      "2025-12-28": 1,
      "2025-12-29": 1,
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });

    const stats = calculateStatsWithOptions(
      history,
      {},
      {
        now: todayTimestamp,
      },
    );

    expect(stats.currentStreak).toBe(8);
    expect(stats.bestStreak).toBe(8);
  });
});

// --------- HELPER FUNCTION TESTS ---------

describe("Helper functions", () => {
  const today = "2026-01-01";
  const todayTimestamp = makeTimestamp(today, 15);

  it("detects today and yesterday correctly", () => {
    expect(isToday(makeTimestamp("2026-01-01", 8), todayTimestamp)).toBe(true);
    expect(isToday(makeTimestamp("2026-01-01", 23), todayTimestamp)).toBe(true);
    expect(isToday(makeTimestamp("2025-12-31", 23), todayTimestamp)).toBe(
      false,
    );

    expect(isYesterday(makeTimestamp("2025-12-31", 12), todayTimestamp)).toBe(
      true,
    );
    expect(isYesterday(makeTimestamp("2025-12-30", 12), todayTimestamp)).toBe(
      false,
    );
  });

  it("counts activities by date", () => {
    const history = makeSolveHistory({
      "2025-12-31": 2,
      "2026-01-01": 4,
    });

    expect(getCountToday(history, todayTimestamp)).toBe(4);
    expect(getCountForDate(history, "2025-12-31")).toBe(2);
  });
});

// --------- HISTORY MANAGEMENT TESTS ---------

describe("History management", () => {
  it("marks problems as solved", () => {
    const history = {};
    const updated = markProblemSolved(history, "problem123");
    expect(updated["problem123"]).toBeDefined();
    expect(typeof updated["problem123"]).toBe("number");
  });

  it("unmarks problems as solved", () => {
    const history = { p1: 12345, p2: 67890 };
    const updated = unmarkProblemSolved(history, "p1");

    expect(updated["p1"]).toBeUndefined();
    expect(updated["p2"]).toBe(67890);
  });

  it("toggles solved problems", () => {
    const history = { p1: 12345 };

    const afterToggleOff = toggleProblemSolved(history, "p1");
    expect(afterToggleOff["p1"]).toBeUndefined();

    const afterToggleOn = toggleProblemSolved(afterToggleOff, "p1");
    expect(afterToggleOn["p1"]).toBeDefined();
  });

  it("creates solved map from history", () => {
    const history = { p1: 12345, p2: 67890, p3: 11111 };
    const solvedMap = createSolvedMapFromHistory(history);

    expect(solvedMap["p1"]).toBe(true);
    expect(solvedMap["p2"]).toBe(true);
    expect(solvedMap["p3"]).toBe(true);
  });
});

// --------- VALIDATION TESTS ---------

describe("Validation", () => {
  it("accepts valid history", () => {
    const history = { p1: Date.now(), p2: Date.now() - MS_PER_DAY };
    const result = validateSolveHistory(history);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects invalid timestamps", () => {
    const history = { p1: "not-a-number" };
    const result = validateSolveHistory(history);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("rejects future timestamps", () => {
    const history = { p1: Date.now() + MS_PER_DAY * 2 };
    const result = validateSolveHistory(history);
    expect(result.valid).toBe(false);
  });

  it("rejects null input", () => {
    const result = validateSolveHistory(null);
    expect(result.valid).toBe(false);
  });
});

// --------- EDGE CASE TESTS ---------

describe("Edge cases", () => {
  it("handles midnight boundary", () => {
    const lateNight = new Date(2025, 11, 31, 23, 59, 0);
    const earlyMorning = new Date(2026, 0, 1, 0, 1, 0);

    const history = {
      p1: lateNight.getTime(),
      p2: earlyMorning.getTime(),
    };

    const log = buildActivityLog(history);
    expect(log["2025-12-31"]).toBe(1);
    expect(log["2026-01-01"]).toBe(1);

    const result = calculateStreak(history, {
      now: makeTimestamp("2026-01-01", 12),
    });
    expect(result.currentStreak).toBe(2);
  });

  it("handles year boundary", () => {
    const history = makeSolveHistory({
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
      "2026-01-02": 1,
    });
    const result = calculateStreak(history, {
      now: makeTimestamp("2026-01-02", 12),
    });
    expect(result.currentStreak).toBe(4);
  });

  it("handles month boundary", () => {
    const history = makeSolveHistory({
      "2026-01-30": 1,
      "2026-01-31": 1,
      "2026-02-01": 1,
    });
    const result = calculateStreak(history, {
      now: makeTimestamp("2026-02-01", 12),
    });
    expect(result.currentStreak).toBe(3);
  });

  it("handles leap year", () => {
    const history = makeSolveHistory({
      "2024-02-28": 1,
      "2024-02-29": 1,
      "2024-03-01": 1,
    });
    const result = calculateStreak(history, {
      now: makeTimestamp("2024-03-01", 12),
    });
    expect(result.currentStreak).toBe(3);
  });
});

// --------- GRACE PERIOD TESTS ---------

describe("Grace period", () => {
  const today = "2026-01-03";
  const todayTimestamp = makeTimestamp(today, 12);

  it("breaks streak without grace period", () => {
    const history = makeSolveHistory({
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });
    const result = calculateStreak(history, {
      now: todayTimestamp,
      allowGracePeriod: false,
    });
    expect(result.currentStreak).toBe(0);
  });

  it("preserves streak with grace period", () => {
    const history = makeSolveHistory({
      "2025-12-30": 1,
      "2025-12-31": 1,
      "2026-01-01": 1,
    });
    const result = calculateStreak(history, {
      now: todayTimestamp,
      allowGracePeriod: true,
    });
    expect(result.currentStreak).toBe(3);
    expect(result.isAtRisk).toBe(true);
  });
});
