import React, { useState, useEffect, useRef } from "react";
import {
  getFilterOptions,
  FILTER_TYPES,
  getOperatorsForFilter,
  getOptionsForFilter,
  createDefaultFilter,
} from "../../utils/problemFilters";

const FilterPanel = ({
  filters,
  setFilters,
  matchMode,
  setMatchMode,
  onApply,
  variant = "popup",
}) => {
  // Styling variants based on popup vs newtab
  const styles =
    variant === "popup"
      ? {
          container:
            "bg-gradient-to-br from-[#1b1b22] to-[#15151a] rounded-xl p-4 border border-gray-800/50 shadow-2xl mb-4 backdrop-blur-sm",
          header:
            "text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400",
          matchMode: "text-xs",
          matchSelect:
            "bg-[#2b2b33] text-white px-2 py-1 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer transition-all duration-200 hover:bg-[#323240]",
          filterRow:
            "bg-[#0e0e12]/80 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-all duration-200 backdrop-blur-sm",
          filterSelect:
            "bg-[#2b2b33] text-white text-xs px-2 py-1.5 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer flex-shrink-0 hover:bg-[#323240] transition-all duration-200",
          removeBtn:
            "ml-auto bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-xs px-2 py-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
          badge:
            "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-200",
          valueBtn:
            "w-full bg-[#2b2b33] hover:bg-[#323240] text-gray-300 text-xs px-2 py-1.5 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 text-left flex items-center justify-between",
          dropdown:
            "absolute z-50 mt-1 w-full bg-[#2b2b33] border border-gray-700/50 rounded-lg shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl animate-slideDown",
          option:
            "px-3 py-2 text-xs cursor-pointer transition-all duration-150",
          checkbox:
            "w-3 h-3 border-2 rounded flex items-center justify-center transition-all duration-200",
          checkmark: "text-indigo-600 text-xs font-bold",
          addBtn:
            "w-full mt-3 bg-gradient-to-r from-[#2b2b33] to-[#252530] hover:from-[#323240] hover:to-[#2d2d3a] text-indigo-400 hover:text-indigo-300 text-xs px-3 py-2 rounded-md border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-200 font-medium hover:shadow-lg hover:shadow-indigo-500/10",
          actionBtn:
            "flex-1 text-xs px-3 py-2 rounded-md transition-all duration-200 font-medium hover:shadow-lg active:scale-95",
          gapBadge: "gap-1.5 mb-2",
          gapFilter: "gap-2 mb-2",
          gapAction: "gap-2 mt-4",
          spacing: "space-y-3",
          headerTitle: "🎯 Filter Problems",
          icon: "",
          filterCount: "text-xs font-semibold",
        }
      : {
          container:
            "bg-gradient-to-br from-[#1b1b22] to-[#15151a] rounded-xl p-5 border border-gray-800/50 shadow-2xl mb-5 backdrop-blur-sm",
          header:
            "text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400",
          matchMode: "text-sm",
          matchSelect:
            "bg-[#2b2b33] text-white px-3 py-1.5 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer hover:bg-[#323240] transition-all duration-200",
          filterRow:
            "bg-[#0e0e12]/80 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-200 backdrop-blur-sm",
          filterSelect:
            "bg-[#2b2b33] text-white text-sm px-3 py-2 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer hover:bg-[#323240] transition-all duration-200 flex-shrink-0",
          removeBtn:
            "ml-auto bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 active:scale-95",
          badge:
            "bg-gradient-to-r from-indigo-900/50 to-purple-900/50 text-indigo-300 text-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-indigo-700/30 hover:border-indigo-600/50 transition-all duration-200",
          valueBtn:
            "w-full bg-[#2b2b33] hover:bg-[#323240] text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 text-left flex items-center justify-between",
          dropdown:
            "absolute z-50 mt-1 w-full bg-[#2b2b33] border border-gray-700/50 rounded-lg shadow-2xl max-h-56 overflow-y-auto backdrop-blur-xl animate-slideDown",
          option:
            "px-3 py-2.5 text-sm cursor-pointer transition-all duration-150",
          checkbox:
            "w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200",
          checkmark: "text-indigo-600 text-xs font-bold",
          addBtn:
            "w-full mt-4 bg-gradient-to-r from-[#2b2b33] to-[#252530] hover:from-[#323240] hover:to-[#2d2d3a] text-indigo-400 hover:text-indigo-300 text-sm px-4 py-2.5 rounded-md border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-200 font-medium hover:shadow-lg hover:shadow-indigo-500/10",
          actionBtn:
            "flex-1 text-sm px-4 py-2.5 rounded-md transition-all duration-200 font-medium hover:shadow-lg active:scale-95",
          gapBadge: "gap-2 mb-3",
          gapFilter: "gap-2 mb-3",
          gapAction: "gap-3 mt-4",
          spacing: "space-y-3",
          headerTitle: "🔍 Filter Problems",
          icon: "",
          filterCount: "text-sm font-semibold",
        };

  const [filterOptions, setFilterOptions] = useState({
    difficulties: [],
    topics: [],
    languages: [],
  });
  const [expandedFilter, setExpandedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState({});
  const dropdownRefs = useRef({});
  const searchInputRefs = useRef({});

  useEffect(() => {
    // Load filter options
    const options = getFilterOptions();
    setFilterOptions(options);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInside = Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!clickedInside) {
        setExpandedFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addFilter = () => {
    const newFilter = createDefaultFilter(Date.now());
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId) => {
    setFilters(filters.filter((f) => f.id !== filterId));
  };

  const updateFilter = (filterId, field, value) => {
    setFilters(
      filters.map((f) => {
        if (f.id === filterId) {
          const updated = { ...f, [field]: value };
          // Reset values when filter type changes
          if (field === "filterType") {
            updated.values = [];
            updated.operator = getOperatorsForFilter(value)[0];
          }
          return updated;
        }
        return f;
      })
    );
  };

  const toggleValue = (filterId, value) => {
    setFilters(
      filters.map((f) => {
        if (f.id === filterId) {
          const values = f.values || [];
          const newValues = values.includes(value)
            ? values.filter((v) => v !== value)
            : [...values, value];
          return { ...f, values: newValues };
        }
        return f;
      })
    );
  };

  const removeValue = (filterId, value) => {
    setFilters(
      filters.map((f) => {
        if (f.id === filterId) {
          return { ...f, values: f.values.filter((v) => v !== value) };
        }
        return f;
      })
    );
  };

  const resetFilters = () => {
    setFilters([]);
    setMatchMode("all");
    if (onApply) onApply();
  };

  const toggleDropdown = (filterId) => {
    const newExpandedFilter = expandedFilter === filterId ? null : filterId;
    setExpandedFilter(newExpandedFilter);

    // Clear search when closing dropdown
    if (!newExpandedFilter) {
      setSearchQuery((prev) => ({ ...prev, [filterId]: "" }));
    } else {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRefs.current[filterId]?.focus();
      }, 100);
    }
  };

  const handleSearchChange = (filterId, value) => {
    setSearchQuery((prev) => ({ ...prev, [filterId]: value }));
  };

  const getFilteredOptions = (options, filterId) => {
    const query = searchQuery[filterId] || "";
    if (!query.trim()) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className={styles.container}>
      {/* Header with Filter Count */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={styles.header}>{styles.headerTitle}</h3>
        {filters.length > 0 && (
          <span
            className={`${styles.filterCount} px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30`}
          >
            {filters.length} {filters.length === 1 ? "filter" : "filters"}
          </span>
        )}
      </div>

      {/* Match Mode Selector with improved styling */}
      <div className={`flex items-center gap-2 mb-4 ${styles.matchMode}`}>
        <span className="text-gray-400 font-medium">Match</span>
        <select
          value={matchMode}
          onChange={(e) => setMatchMode(e.target.value)}
          className={styles.matchSelect}
        >
          <option value="all">All</option>
          <option value="any">Any</option>
        </select>
        <span className="text-gray-400">of the following filters</span>
      </div>

      {/* Filter Rows */}
      <div className={styles.spacing}>
        {filters.map((filter, index) => {
          const operators = getOperatorsForFilter(filter.filterType);
          const options = getOptionsForFilter(filter.filterType, filterOptions);
          const isExpanded = expandedFilter === filter.id;

          return (
            <div
              key={filter.id}
              className={styles.filterRow}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`flex items-start ${styles.gapFilter}`}>
                {/* Filter Type Dropdown */}
                <select
                  value={filter.filterType}
                  onChange={(e) =>
                    updateFilter(filter.id, "filterType", e.target.value)
                  }
                  className={styles.filterSelect}
                >
                  {Object.values(FILTER_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {/* Operator Dropdown */}
                <select
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(filter.id, "operator", e.target.value)
                  }
                  className={styles.filterSelect}
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>

                {/* Remove Button */}
                <button
                  onClick={() => removeFilter(filter.id)}
                  className={styles.removeBtn}
                  title="Remove filter"
                >
                  ✕
                </button>
              </div>

              {/* Selected Values Display with improved badges */}
              {filter.values && filter.values.length > 0 && (
                <div className={`flex flex-wrap ${styles.gapBadge}`}>
                  {filter.values.map((value) => (
                    <span key={value} className={styles.badge}>
                      {value}
                      <button
                        onClick={() => removeValue(filter.id, value)}
                        className={
                          variant === "popup"
                            ? "hover:text-indigo-100 ml-0.5 hover:scale-110 transition-transform"
                            : "hover:text-indigo-100 hover:scale-110 transition-transform"
                        }
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Value Selector */}
              <div
                className="relative"
                ref={(el) => (dropdownRefs.current[filter.id] = el)}
              >
                <button
                  onClick={() => toggleDropdown(filter.id)}
                  className={styles.valueBtn}
                >
                  <span
                    className={
                      filter.values?.length > 0 ? "text-white font-medium" : ""
                    }
                  >
                    {filter.values && filter.values.length > 0
                      ? `${filter.values.length} selected`
                      : "Select values..."}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ease-out ${isExpanded ? "rotate-180 text-indigo-400" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className={styles.dropdown}>
                    {/* Search Input */}
                    <div className="sticky top-0 bg-[#2b2b33] p-2 border-b border-gray-700/50 z-10">
                      <div className="relative">
                        <svg
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <input
                          ref={(el) =>
                            (searchInputRefs.current[filter.id] = el)
                          }
                          type="text"
                          placeholder="Search..."
                          value={searchQuery[filter.id] || ""}
                          onChange={(e) =>
                            handleSearchChange(filter.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full ${variant === "popup" ? "text-xs py-1.5 pl-8 pr-3" : "text-sm py-2 pl-8 pr-3"} bg-[#1b1b22] text-white rounded-md border border-gray-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200`}
                        />
                      </div>
                    </div>

                    {/* Options List */}
                    <div
                      className={
                        variant === "popup"
                          ? "max-h-40 overflow-y-auto"
                          : "max-h-48 overflow-y-auto"
                      }
                    >
                      {getFilteredOptions(options, filter.id).length > 0 ? (
                        getFilteredOptions(options, filter.id).map((option) => {
                          const isSelected = filter.values?.includes(option);
                          return (
                            <div
                              key={option}
                              onClick={() => toggleValue(filter.id, option)}
                              className={`${styles.option} ${
                                isSelected
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                  : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`${styles.checkbox} ${
                                    isSelected
                                      ? "border-white bg-white scale-110"
                                      : "border-gray-500"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className={styles.checkmark}>✓</span>
                                  )}
                                </div>
                                <span
                                  className={isSelected ? "font-medium" : ""}
                                >
                                  {option}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className={`${styles.option} text-gray-500 text-center italic`}
                        >
                          No results found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Filter Button with icon */}
      <button onClick={addFilter} className={styles.addBtn}>
        <span className="flex items-center justify-center gap-2">
          <span className="text-lg">+</span>
          <span>Add filter</span>
        </span>
      </button>

      {/* Action Buttons with improved styling */}
      <div className={`flex ${styles.gapAction}`}>
        <button
          onClick={resetFilters}
          className={`${styles.actionBtn} bg-gray-700/80 hover:bg-gray-600 text-white border border-gray-600/50 hover:border-gray-500`}
        >
          Reset
        </button>
        {onApply && (
          <button
            onClick={onApply}
            className={`${styles.actionBtn} bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-500/50`}
          >
            Apply Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
