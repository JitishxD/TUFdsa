# Streak System

This document explains how the extension calculates **daily activity**, **current streak**, and **best streak**.

The implementation lives in [src/utils/statsTracker.js](src/utils/statsTracker.js).

## Goals / Principles

- **Fair day boundaries**: streaks are based on **calendar days in the user’s local timezone** (not “last 24 hours”).
- **Undoable & auditable**: all stats (including best streak) are derived from the solve history so that toggling a solve on/off correctly updates everything.
- **Centralized**: all streak/stats logic is in one module and exposed via pure functions.

## Data Model

### Solve history (source of truth)

A “solve history” is an object:

```js
{
  [problemId]: timestampMs
}
```

- Stored in `chrome.storage.sync`.
- Timestamps are **milliseconds since epoch**.

The app uses (at least) two histories:

- `randomSolveHistory`
- `a2zSolveHistory`

These are merged when computing stats.

### Activity log (derived)

From solve history we build an “activity log”:

```js
{
  "YYYY-MM-DD": count
}
```

- Keys are local calendar dates.
- Values are “how many problems were solved on that date”.

This is derived by `buildActivityLog(solveHistory)`.

## Day & Timezone Rules

### What counts as “today”

A solve counts toward “today” if its timestamp, when interpreted in the **user’s local time**, falls on today’s calendar date.

Internally, the key conversion is:

- `timestampToDateString(timestampMs)` → `YYYY-MM-DD` using `new Date(timestampMs)`

This means:

- Streak boundaries align with local midnight.
- Traveling across timezones can affect which calendar date a given timestamp maps to (expected for “local calendar day” semantics).

## What the System Calculates

The primary entry point is:

- `calculateStatsWithOptions(primaryHistory, secondaryHistory, { now, allowGracePeriod })`

The returned stats object looks like:

```js
{
  totalSolved: number,
  solvedToday: number,
  currentStreak: number,
  bestStreak: number,
  isActiveToday: boolean,
  isAtRisk: boolean,
  lastActiveDate: string | null
}
```

### `totalSolved`

- Computed as the number of keys in the merged solve history.

### `solvedToday`

- Count of solves whose local date is today.
- Implemented by `getCountToday(mergedHistory, now)`.

### `bestStreak` (longest streak ever)

- Computed **only from solve history** via `calculateLongestStreakFromLog(activityLog)`.
- This is intentionally **not** persisted as a separate “monotonic” counter.

Why:

- If a user accidentally marks a problem solved and later unmarks it, the best streak should revert accordingly.
- History-derived best streak is auditable and consistent across devices.

### `currentStreak`

Current streak is computed from the activity log via `calculateStreakFromLog(activityLog, { now, allowGracePeriod })`.

#### Step 1: Find the “streak anchor day”

Let:

- `today = YYYY-MM-DD` for `now`
- `yesterday = today - 1 day`
- `mostRecentDate = newest date with activity`

Rules:

1. If `mostRecentDate === today`:
   - streak starts at **today**
   - `isActiveToday = true`
   - `isAtRisk = false`

2. Else if `mostRecentDate === yesterday`:
   - streak starts at **yesterday**
   - `isActiveToday = false`
   - `isAtRisk = true` (you haven’t solved today yet, so streak can be lost if you don’t solve today)

3. Else if `allowGracePeriod === true` and `mostRecentDate === (today - 2 days)`:
   - streak starts at **two days ago**
   - `isAtRisk = true`

4. Otherwise:
   - `currentStreak = 0`
   - `isActiveToday = false`
   - `isAtRisk = false`

#### Step 2: Count consecutive active days backwards

Starting from the anchor date, we walk backwards day-by-day while there is activity:

- Include the anchor day if its count > 0
- Then include the previous day if its count > 0
- Stop at the first missing day

That count is `currentStreak`.

Important nuance:

- If the most recent activity is yesterday, `currentStreak` includes **yesterday and earlier consecutive days**, but does **not** include today (since today has no activity yet).

### `lastActiveDate`

- The newest `YYYY-MM-DD` date with activity (or `null` if no activity).

## “At Risk” UX Meaning

The module exposes:

- `isActiveToday`: you already solved at least one problem today.
- `isAtRisk`: your streak is currently “hanging by a thread”. In practice, this means your most recent activity was yesterday (or two days ago if grace is enabled).

UI can use this to show warnings like “Solve today to keep your streak”.

## Merging Multiple Histories

Stats are computed from:

```js
const mergedHistory = { ...randomSolveHistory, ...a2zSolveHistory };
```

Notes:

- If the same `problemId` appears in both, the latter spread wins.
- In typical usage, problem IDs should be unique across sources.

## Marking / Unmarking Solves (Undo Semantics)

The “undo correctness” comes from the fact that the only source of truth is solve history:

- `markProblemSolved(history, problemId, timestamp)` adds/overwrites that key.
- `unmarkProblemSolved(history, problemId)` deletes that key.
- `toggleProblemSolved(history, problemId)` switches between the two.

Because `bestStreak` and `currentStreak` are computed from history, toggling a solve on/off will recompute the streaks accordingly.

## Debugging & Validation

- `validateSolveHistory(solveHistory)` checks for malformed history (e.g., non-numeric timestamps).
- `getStreakDebugSummary(solveHistory, { now, allowGracePeriod })` returns a human-readable summary including:
  - today
  - current streak
  - best streak
  - at-risk / active status
  - last active date
  - recent activity log entries

## Practical Examples

### Example: streak continues and is “at risk”

If you solved on:

- 2026-01-01 (lets say its present today)
- 2025-12-31 (yesterday)
- 2025-12-30

Then:

- `currentStreak = 3`
- `isActiveToday = true`
- `isAtRisk = false`

If you _didn’t_ solve today, but you solved yesterday and the day before:

- `currentStreak = 2`
- `isActiveToday = false`
- `isAtRisk = true`

### Example: undo reverts best streak

If you mark a problem solved on a day that creates a new longest streak and then unmark it:

- The timestamp is removed from solve history.
- Recomputing from history reduces `bestStreak` and/or `currentStreak` accordingly.
- No separate persisted “best streak” counter can get stuck at an inflated value.
