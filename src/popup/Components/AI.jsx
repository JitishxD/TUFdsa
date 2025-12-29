import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  makeCohereRequestWithPermission,
  fetchCodeFromContentScript,
} from "../aiIntegration";

const DEFAULT_PROMPT =
  "State time and space complexity of the following code and then give 4-5 line explanation:\n";

// Reusable Spinner component
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
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export default function AI({ onBack }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs to prevent saving on initial load
  const savePromptTimeoutRef = useRef(null);
  const saveApiKeyTimeoutRef = useRef(null);

  // Load from chrome.storage.sync on mount
  useEffect(() => {
    chrome.storage.sync.get(["aiPrompt", "aiApiKey"], (result) => {
      setAiPrompt(result.aiPrompt || DEFAULT_PROMPT);
      setAiApiKey(result.aiApiKey || "");
      setIsInitialized(true);
    });
  }, []);

  // Debounced save for aiPrompt
  useEffect(() => {
    if (!isInitialized) return;

    if (savePromptTimeoutRef.current) {
      clearTimeout(savePromptTimeoutRef.current);
    }

    savePromptTimeoutRef.current = setTimeout(() => {
      chrome.storage.sync.set({ aiPrompt });
    }, 500);

    return () => {
      if (savePromptTimeoutRef.current) {
        clearTimeout(savePromptTimeoutRef.current);
      }
    };
  }, [aiPrompt, isInitialized]);

  // Debounced save for aiApiKey
  useEffect(() => {
    if (!isInitialized) return;

    if (saveApiKeyTimeoutRef.current) {
      clearTimeout(saveApiKeyTimeoutRef.current);
    }

    saveApiKeyTimeoutRef.current = setTimeout(() => {
      chrome.storage.sync.set({ aiApiKey });
    }, 500);

    return () => {
      if (saveApiKeyTimeoutRef.current) {
        clearTimeout(saveApiKeyTimeoutRef.current);
      }
    };
  }, [aiApiKey, isInitialized]);

  const handleSubmit = useCallback(async () => {
    if (!aiApiKey.trim()) {
      setError("Please enter your Cohere API Key");
      return;
    }

    if (!aiPrompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setAiLoading(true);
    setAiResponse("");
    setError("");

    try {
      const result = await makeCohereRequestWithPermission(aiApiKey, aiPrompt);

      if (result && result.success) {
        setAiResponse(result.text || JSON.stringify(result, null, 2));
      } else {
        const errorMsg = result?.error || "unknown";
        setError(`Error: ${errorMsg}`);
        setAiResponse("");
      }
    } catch (e) {
      setError(`Error: ${String(e)}`);
      setAiResponse("");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, aiApiKey]);

  const handleAttachCode = useCallback(async () => {
    setAiLoading(true);
    setError("");

    try {
      const res = await fetchCodeFromContentScript();
      if (res.success) {
        const codeToAppend = res.data.code;
        setAiPrompt((p) => {
          const currentPrompt = p.trim();
          const fence = "```";
          return currentPrompt
            ? `${currentPrompt}\n\n${fence}\n${codeToAppend}\n${fence}`
            : codeToAppend;
        });
      } else {
        setError(`Could not fetch code: ${res?.error || "Unknown error"}`);
      }
    } catch (e) {
      setError(`Error: ${String(e)}`);
    } finally {
      setAiLoading(false);
    }
  }, [aiResponse]);

  const handleClear = useCallback(() => {
    setAiResponse("");
    setAiPrompt(DEFAULT_PROMPT);
    setError("");
  }, []);

  const promptCharCount = aiPrompt.length;
  const hasApiKey = aiApiKey.trim().length > 0;

  return (
    <div className="w-[360px] min-h-[460px] bg-[#0e0e12] text-white shadow-lg p-4 flex flex-col items-stretch relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          disabled={aiLoading}
        >
          ← Back
        </button>
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <div style={{ width: 48 }} />
      </div>

      {/* API Key Input */}
      <div className="mb-3">
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            placeholder="Cohere API Key"
            value={aiApiKey}
            onChange={(e) => {
              setAiApiKey(e.target.value);
              setError("");
            }}
            disabled={aiLoading}
            className="w-full p-2 pr-10 rounded bg-[#07101d] text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 text-xs"
            disabled={aiLoading}
          >
            {showApiKey ? "🙈" : "👁️"}
          </button>
        </div>
        {!hasApiKey && (
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally and securely
          </p>
        )}
      </div>

      {/* Prompt Textarea */}
      <div className="mb-3">
        <textarea
          rows={5}
          value={aiPrompt}
          onChange={(e) => {
            setAiPrompt(e.target.value);
            setError("");
          }}
          placeholder="Enter your prompt here..."
          disabled={aiLoading}
          className="w-full p-2 rounded bg-[#07101d] text-sm border border-transparent focus:border-indigo-500 focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {promptCharCount > 0 && `${promptCharCount} characters`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-2 p-2 rounded bg-red-900/30 border border-red-700 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mb-3">
        <button
          disabled={aiLoading || !hasApiKey}
          onClick={handleSubmit}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          {aiLoading ? (
            <>
              <Spinner size="sm" />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </button>

        <div className="flex gap-2">
          <button
            disabled={aiLoading}
            onClick={handleAttachCode}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors"
            title="Attach code from clipboard"
          >
            Attach Code
          </button>

          <button
            onClick={handleClear}
            disabled={aiLoading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-3 py-2 rounded font-medium text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Response Area */}
      <div className="mt-1 flex-1 overflow-auto text-xs bg-black p-3 rounded border border-[#1a1a2e] min-h-[120px] max-h-[200px]">
        {aiLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="md" />
              <span>Waiting for AI response...</span>
            </div>
          </div>
        ) : aiResponse ? (
          <div className="markdown-body markdown-body-dark">
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>
        ) : (
          <span className="text-gray-500 italic">
            AI response will appear here. Enter your prompt and click Submit.
          </span>
        )}
      </div>
    </div>
  );
}
