import { useState } from "react";
import Popup from "./Popup";
import Daily from "./Daily";

export function Home() {
  const [currentPage, setCurrentPage] = useState("welcome"); 
  // "welcome" | "popup" | "daily"

  const handleContinue = () => setCurrentPage("popup");
  const handleDaily = () => setCurrentPage("daily");

  return (
    <div>
      {currentPage === "welcome" && (
        <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white rounded-2xl shadow-lg p-5 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-indigo-400 mb-4">Welcome!</h1>
          <p className="text-gray-400 text-sm mb-6">
            Get ready to solve today's coding challenges
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleContinue}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Continue
            </button>

            <button
              onClick={handleDaily}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
            >
              Daily
            </button>
          </div>
        </div>
      )}

      {currentPage === "popup" && <Popup />}
      {currentPage === "daily" && <Daily />}
    </div>
  );
}

export default Home;