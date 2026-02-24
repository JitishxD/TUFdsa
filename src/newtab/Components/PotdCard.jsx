import { openPotd } from "../../utils/potd";

const PotdCard = () => {
  return (
    <div className="bg-[#1b1b22] rounded-xl p-5 border border-gray-800 shadow-xl hover:border-indigo-500 transition-all">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-indigo-400">
          🗓️ Problem of the Day
        </h3>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        One click to open today&apos;s daily challenges on your favorite
        platforms.
      </p>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openPotd("lc")}
            className="flex-1 min-w-[120px] bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            🧩 LeetCode Daily
          </button>
          <button
            type="button"
            onClick={() => openPotd("gfg")}
            className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            📗 GFG POTD
          </button>
        </div>
        <button
          type="button"
          onClick={() => openPotd("all")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          ⚡ Open Both
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Tip: Use this as your warm-up before diving into other problems.
      </p>
    </div>
  );
};

export default PotdCard;
