import leetCodeProblems from "../problem-data/leetCodeAllProblemDump.json";

/**
 * Extract unique values from the problem dataset
 */
export const getFilterOptions = () => {
    const difficulties = new Set();
    const topics = new Set();
    const languages = new Set();

    leetCodeProblems.forEach((problem) => {
        if (problem.difficulty) difficulties.add(problem.difficulty);
        if (problem.topics) {
            problem.topics.forEach((topic) => topics.add(topic));
        }
        if (problem.language) {
            problem.language.forEach((lang) => languages.add(lang));
        }
    });

    return {
        difficulties: Array.from(difficulties).sort(),
        topics: Array.from(topics).sort(),
        languages: Array.from(languages).sort(),
    };
};

/**
 * Filter operators
 */
export const OPERATORS = {
    IS: "is",
    IS_NOT: "is not",
    CONTAINS: "contains",
    NOT_CONTAINS: "does not contain",
};

/**
 * Available filter types
 */
export const FILTER_TYPES = {
    STATUS: "Status",
    DIFFICULTY: "Difficulty",
    TOPICS: "Topics",
    LANGUAGE: "Language",
};

/**
 * Get operators for each filter type
 */
export const getOperatorsForFilter = (filterType) => {
    switch (filterType) {
        case FILTER_TYPES.STATUS:
        case FILTER_TYPES.DIFFICULTY:
            return [OPERATORS.IS, OPERATORS.IS_NOT];
        case FILTER_TYPES.TOPICS:
        case FILTER_TYPES.LANGUAGE:
            return [
                OPERATORS.CONTAINS,
                OPERATORS.NOT_CONTAINS,
                OPERATORS.IS,
                OPERATORS.IS_NOT,
            ];
        default:
            return [OPERATORS.IS];
    }
};

/**
 * Get options for each filter type
 */
export const getOptionsForFilter = (filterType, filterOptions) => {
    switch (filterType) {
        case FILTER_TYPES.STATUS:
            return ["Solved", "Unsolved"];
        case FILTER_TYPES.DIFFICULTY:
            return filterOptions.difficulties;
        case FILTER_TYPES.TOPICS:
            return filterOptions.topics;
        case FILTER_TYPES.LANGUAGE:
            return filterOptions.languages;
        default:
            return [];
    }
};

/**
 * Apply a single filter to a problem
 */
const matchSingleFilter = (problem, filter, solvedMap) => {
    const { filterType, operator, values } = filter;

    // No values selected means no filtering
    if (!values || values.length === 0) return true;

    switch (filterType) {
        case FILTER_TYPES.STATUS: {
            const isSolved = solvedMap[problem.problem_id] || false;
            const hasStatusMatch = values.some((status) => {
                if (status === "Solved") return isSolved;
                if (status === "Unsolved") return !isSolved;
                return false;
            });

            if (operator === OPERATORS.IS) return hasStatusMatch;
            if (operator === OPERATORS.IS_NOT) return !hasStatusMatch;
            return true;
        }

        case FILTER_TYPES.DIFFICULTY: {
            const hasDifficultyMatch = values.includes(problem.difficulty);
            if (operator === OPERATORS.IS) return hasDifficultyMatch;
            if (operator === OPERATORS.IS_NOT) return !hasDifficultyMatch;
            return true;
        }

        case FILTER_TYPES.TOPICS: {
            if (!problem.topics) return false;

            if (operator === OPERATORS.CONTAINS) {
                // At least one selected topic must be in problem topics
                return values.some((topic) => problem.topics.includes(topic));
            }
            if (operator === OPERATORS.NOT_CONTAINS) {
                // None of the selected topics should be in problem topics
                return !values.some((topic) => problem.topics.includes(topic));
            }
            if (operator === OPERATORS.IS) {
                // Problem topics must exactly match selected topics (same set)
                if (problem.topics.length !== values.length) return false;
                return values.every((topic) => problem.topics.includes(topic));
            }
            if (operator === OPERATORS.IS_NOT) {
                // Problem topics must not exactly match selected topics
                if (problem.topics.length !== values.length) return true;
                return !values.every((topic) => problem.topics.includes(topic));
            }
            return true;
        }

        case FILTER_TYPES.LANGUAGE: {
            if (!problem.language) return false;

            if (operator === OPERATORS.CONTAINS) {
                return values.some((lang) => problem.language.includes(lang));
            }
            if (operator === OPERATORS.NOT_CONTAINS) {
                return !values.some((lang) => problem.language.includes(lang));
            }
            if (operator === OPERATORS.IS) {
                if (problem.language.length !== values.length) return false;
                return values.every((lang) => problem.language.includes(lang));
            }
            if (operator === OPERATORS.IS_NOT) {
                if (problem.language.length !== values.length) return true;
                return !values.every((lang) => problem.language.includes(lang));
            }
            return true;
        }

        default:
            return true;
    }
};

/**
 * Apply all filters to the problem list
 * @param {Array} problems - List of all problems
 * @param {Array} filters - Active filters
 * @param {Object} solvedMap - Map of solved problems
 * @param {String} matchMode - 'all' or 'any'
 * @returns {Array} Filtered problems
 */
export const applyFilters = (problems, filters, solvedMap, matchMode = "all") => {
    if (!filters || filters.length === 0) return problems;

    // Only apply filters that have values selected
    const activeFilters = filters.filter(
        (f) => f.values && f.values.length > 0
    );

    if (activeFilters.length === 0) return problems;

    return problems.filter((problem) => {
        if (matchMode === "all") {
            // Problem must match ALL filters
            return activeFilters.every((filter) =>
                matchSingleFilter(problem, filter, solvedMap)
            );
        } else {
            // Problem must match ANY filter
            return activeFilters.some((filter) =>
                matchSingleFilter(problem, filter, solvedMap)
            );
        }
    });
};

/**
 * Create a default filter object
 */
export const createDefaultFilter = (id) => ({
    id,
    filterType: FILTER_TYPES.DIFFICULTY,
    operator: OPERATORS.IS,
    values: [],
});
