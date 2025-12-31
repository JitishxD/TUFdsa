const DataSourceSwitcher = ({
  dataSource,
  setDataSource,
  colorScheme = "purple",
}) => {
  const isPurple = colorScheme === "purple";

  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="text-sm text-gray-400">Source:</span>
      <div className="flex bg-[#0e0e12] rounded-lg p-1 border border-gray-800">
        <button
          onClick={() => setDataSource("leetcode")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            dataSource === "leetcode"
              ? isPurple
                ? "bg-purple-600 text-white"
                : "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          LeetCode
        </button>
        <button
          onClick={() => setDataSource("gfg")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            dataSource === "gfg"
              ? isPurple
                ? "bg-purple-600 text-white"
                : "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          GeeksforGeeks
        </button>
        <button
          onClick={() => setDataSource("code360")}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
            dataSource === "code360"
              ? isPurple
                ? "bg-purple-600 text-white"
                : "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Code360
        </button>
      </div>
    </div>
  );
};

export default DataSourceSwitcher;
