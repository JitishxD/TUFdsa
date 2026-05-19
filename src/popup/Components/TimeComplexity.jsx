import { useState, useCallback } from "react";
import { fetchCodeFromContentScript } from "../aiIntegration";
import { analyzeTimeComplexityWithPermission } from "../timeComplexityIntegration";

function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function TimeComplexity({ onBack }) {
  const [code, setCode] = useState("");
  const [complexity, setComplexity] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      setError("Please enter or attach code to analyze");
      return;
    }

    setLoading(true);
    setComplexity("");
    setReasoning("");
    setError("");

    try {
      const result = await analyzeTimeComplexityWithPermission(code);

      if (result.error) {
        const msg =
          result.error === "permission_denied"
            ? "Permission denied to contact TimeComplexity.ai"
            : result.error;
        setError(msg);
      } else {
        setComplexity(result.complexity || "Unknown");
        setReasoning(result.reasoning || "");
      }
    } catch (e) {
      setError(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [code]);

  const handleAttachCode = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchCodeFromContentScript();
      if (res.success) {
        setCode(res.data.code);
      } else {
        setError(`Could not fetch code: ${res?.error || "Unknown error"}`);
      }
    } catch (e) {
      setError(`Error: ${String(e)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setCode("");
    setComplexity("");
    setReasoning("");
    setError("");
  }, []);

  const hasResult = complexity || reasoning;

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-4 flex flex-col items-stretch relative">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          disabled={loading}
        >
          ← Back
        </button>
        <h3 className="text-lg font-semibold">TimeComplexity.ai</h3>
        <div style={{ width: 48 }} />
      </div>

      <div className="mb-3">
        <textarea
          rows={8}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="Paste your code here or use Attach Code..."
          disabled={loading}
          className="w-full p-2 rounded bg-[#07101d] text-sm font-mono border border-transparent focus:border-teal-500 focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {code.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{code.length} characters</p>
        )}
      </div>

      {error && (
        <div className="mb-2 p-2 rounded bg-red-900/30 border border-red-700 text-red-300 text-xs">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 mb-3">
        <button
          disabled={loading || !code.trim()}
          onClick={handleAnalyze}
          className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>

        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={handleAttachCode}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors"
            title="Attach code from the active tab"
          >
            Attach Code
          </button>

          <button
            onClick={handleClear}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-1 flex-1 overflow-auto text-sm bg-black p-3 rounded border border-[#1a1a2e] min-h-[120px] max-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="md" />
              <span>Waiting for analysis...</span>
            </div>
          </div>
        ) : hasResult ? (
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Time Complexity
              </p>
              <p className="text-teal-400 font-semibold text-base">{complexity}</p>
            </div>
            {reasoning && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  Reasoning
                </p>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {reasoning}
                </p>
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-500 italic text-xs">
            Results will appear here. Attach or paste code, then click Analyze.
          </span>
        )}
      </div>
    </div>
  );
}
