import React from "react";

const FilterToast = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg border border-indigo-400/50 animate-slideDown">
      🎯 Filters applied! New problem loaded
    </div>
  );
};

export default FilterToast;
