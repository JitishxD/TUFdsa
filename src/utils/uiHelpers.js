/**
 * Shared UI helper functions
 */

/**
 * Get background color classes for difficulty badge
 * @param {string} difficulty - Problem difficulty (Easy, Medium, Hard)
 * @returns {string} Tailwind CSS classes for background and text color
 */
export const getDifficultyBg = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-900 text-green-300";
    case "Medium":
      return "bg-yellow-900 text-yellow-300";
    case "Hard":
      return "bg-red-900 text-red-300";
    default:
      return "bg-gray-900 text-gray-300";
  }
};

/**
 * Get text color class for difficulty
 * @param {string} difficulty - Problem difficulty (Easy, Medium, Hard)
 * @returns {string} Tailwind CSS class for text color
 */
export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "text-green-400";
    case "Medium":
      return "text-yellow-400";
    case "Hard":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

