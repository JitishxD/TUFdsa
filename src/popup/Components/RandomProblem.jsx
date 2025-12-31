import React from "react";
import "../Styles/Popup.css";
import FilterToast from "../../newtab/Components/FilterToast";
import RandomProblemCard from "../../newtab/Components/RandomProblemCard";
import { useRandomProblem } from "../../utils/useRandomProblem";

export function RandomProblem({ onBack }) {
  const {
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
    pickRandomProblem,
    applyFiltersAndPickNew,
    toggleSolved,
  } = useRandomProblem();
  // Pick a random problem on initial load if none exists
  // Wait for filters to load, then let the hook's auto-apply handle it if filters exist
  React.useEffect(() => {
    if (!loading && !currentProblem) {
      // Only call pickRandomProblem if no filters are set
      if (filters.length === 0) {
        pickRandomProblem();
      }
    }
  }, [loading, currentProblem, pickRandomProblem, filters.length]);

  // Show loading only during initial load
  if (loading) {
    return (
      <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col items-center justify-center font-sans">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-[360px] max-h-[600px] bg-[#0e0e12] text-white shadow-lg p-6 flex flex-col font-sans overflow-y-auto">
      <RandomProblemCard
        dailyProblem={currentProblem}
        solvedMap={solvedMap}
        pickRandomProblem={pickRandomProblem}
        toggleRandomSolved={toggleSolved}
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
