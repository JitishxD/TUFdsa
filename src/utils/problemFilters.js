import leetCodeProblems from "../problem-data/leetCodeAllProblemDump.json";
import gfgData from "../problem-data/gfg_problems.json";
import code360Data from "../problem-data/code360_problems_indexed.json";

/**
 * Extract unique values from the problem dataset
 */
export const getFilterOptions = (dataSource = "leetcode") => {
    const difficulties = new Set();
    const topics = new Set();
    const companies = new Set();
    const languages = new Set();

    let sourceProblems;
    if (dataSource === "gfg") {
        sourceProblems = gfgData.problems || [];
    } else if (dataSource === "code360") {
        sourceProblems = code360Data.problems || [];
    } else {
        sourceProblems = leetCodeProblems || [];
    }

    sourceProblems.forEach((problem) => {
        // Difficulty keys differ between sources; support both
        const diff = problem.difficulty || problem.problem_level || null;
        if (diff) difficulties.add(diff);

        // Topics: LeetCode uses `topics`, GFG uses `tags.topic_tags`, Code360 uses `practice_topics`
        if (problem.topics) {
            problem.topics.forEach((topic) => topics.add(topic));
        }
        if (problem.tags?.topic_tags) {
            problem.tags.topic_tags.forEach((topic) => topics.add(topic));
        }
        if (dataSource === "code360" && problem.practice_topics) {
            problem.practice_topics.forEach((topic) => {
                if (topic) topics.add(topic);
            });
        }

        // Company tags: GFG uses `tags.company_tags`, Code360 uses `company_list` array with `name` field
        if (problem.tags?.company_tags) {
            problem.tags.company_tags.forEach((c) => companies.add(c));
        }
        if (dataSource === "code360" && Array.isArray(problem.company_list)) {
            problem.company_list.forEach((company) => {
                if (company?.name) companies.add(company.name);
            });
        }

        // Languages exist primarily in LeetCode dump
        if (problem.language) {
            problem.language.forEach((lang) => languages.add(lang));
        }
    });

    return {
        difficulties: Array.from(difficulties).sort(),
        topics: Array.from(topics).sort(),
        languages: Array.from(languages).sort(),
        companies: Array.from(companies).sort(),
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
    COMPANY: "Company",
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
        case FILTER_TYPES.COMPANY:
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
        case FILTER_TYPES.COMPANY:
            return filterOptions.companies || [];
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

    // Determine problem type based on data structure
    const isGfgProblem = problem.problem_name !== undefined;
    const isCode360Problem = problem.slug !== undefined && problem.name !== undefined;

    switch (filterType) {
        case FILTER_TYPES.STATUS: {
            // Handle LeetCode, GFG, and Code360 problem IDs
            const problemId = isGfgProblem
                ? (problem.id || problem.index)
                : isCode360Problem
                    ? (problem.id || problem.index)
                    : problem.problem_id;
            const isSolved = solvedMap[problemId] || false;
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
            const difficulty = problem.difficulty || problem.problem_level || null;
            const hasDifficultyMatch = values.includes(difficulty);
            if (operator === OPERATORS.IS) return hasDifficultyMatch;
            if (operator === OPERATORS.IS_NOT) return !hasDifficultyMatch;
            return true;
        }

        case FILTER_TYPES.TOPICS: {
            // Handle LeetCode (problem.topics), GFG (problem.tags.topic_tags), and Code360 (problem.practice_topics) structures
            const topics = isGfgProblem
                ? (problem.tags?.topic_tags || [])
                : isCode360Problem
                    ? (problem.practice_topics || []).filter(Boolean)
                    : (problem.topics || []);

            if (!topics || topics.length === 0) return false;

            if (operator === OPERATORS.CONTAINS) {
                // At least one selected topic must be in problem topics
                return values.some((topic) => topics.includes(topic));
            }
            if (operator === OPERATORS.NOT_CONTAINS) {
                // None of the selected topics should be in problem topics
                return !values.some((topic) => topics.includes(topic));
            }
            if (operator === OPERATORS.IS) {
                // Problem topics must exactly match selected topics (same set)
                if (topics.length !== values.length) return false;
                return values.every((topic) => topics.includes(topic));
            }
            if (operator === OPERATORS.IS_NOT) {
                // Problem topics must not exactly match selected topics
                if (topics.length !== values.length) return true;
                return !values.every((topic) => topics.includes(topic));
            }
            return true;
        }

        case FILTER_TYPES.COMPANY: {
            // Handle GFG (problem.tags.company_tags), Code360 (problem.company_list with name field), and LeetCode
            const companies = isGfgProblem
                ? (problem.tags?.company_tags || [])
                : isCode360Problem
                    ? (Array.isArray(problem.company_list) ? problem.company_list.map(c => c?.name).filter(Boolean) : [])
                    : (problem.company_tags || problem.companies || []);

            if (!companies || companies.length === 0) return false;

            if (operator === OPERATORS.CONTAINS) {
                return values.some((c) => companies.includes(c));
            }
            if (operator === OPERATORS.NOT_CONTAINS) {
                return !values.some((c) => companies.includes(c));
            }
            if (operator === OPERATORS.IS) {
                if (companies.length !== values.length) return false;
                return values.every((c) => companies.includes(c));
            }
            if (operator === OPERATORS.IS_NOT) {
                if (companies.length !== values.length) return true;
                return !values.every((c) => companies.includes(c));
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
 * Get counts for a data source or an explicit problems array.
 * If `dataSource` is provided, the internal dataset will be used.
 * Returns an object: { total, filtered }
 */
export const getProblemCounts = (
    dataSourceOrProblems,
    filters,
    solvedMap,
    matchMode = "all"
) => {
    let problems = [];

    // If a string provided, treat as dataSource key
    if (typeof dataSourceOrProblems === "string") {
        if (dataSourceOrProblems === "gfg") {
            problems = gfgData.problems || [];
        } else if (dataSourceOrProblems === "code360") {
            problems = code360Data.problems || [];
        } else {
            problems = leetCodeProblems || [];
        }
    } else if (Array.isArray(dataSourceOrProblems)) {
        problems = dataSourceOrProblems;
    }

    const total = Array.isArray(problems) ? problems.length : 0;
    // Reuse applyFilters to compute filtered list
    const filtered = applyFilters(problems, filters, solvedMap, matchMode) || [];
    return { total, filtered: Array.isArray(filtered) ? filtered.length : 0 };
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
