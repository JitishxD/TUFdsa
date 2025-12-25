import QuickAccessCard from "../../newtab/Components/QuickAccessCard";

export function QuickAccess({ onBack }) {
  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="bg-[#1b1b22] hover:bg-[#2b2b33] p-2 rounded-lg transition text-gray-400 hover:text-purple-400 mr-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-purple-400">🔍 Quick Access</h2>
      </div>

      {/* QuickAccessCard */}
      <div className="mt-4">
        <QuickAccessCard />
      </div>
    </div>
  );
}

export default QuickAccess;
