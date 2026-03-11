import React, { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  maxHeight?: string;
}

function highlightJson(json: string): React.ReactNode[] {

  const parts: React.ReactNode[] = [];
  let remaining = json;
  let key = 0;

  // Combined regex that matches JSON tokens in order
  const combined =
    /("(?:\\.|[^"\\])*")\s*(:)|("(?:\\.|[^"\\])*")|([-+]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([\[\]{}])|([,:])/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = combined.exec(remaining)) !== null) {
    // Add any plain text before this match (whitespace, etc.)
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Key: "key":
      parts.push(
        <span key={key++} className="text-purple-400">
          {match[1]}
        </span>
      );
      parts.push(
        <span key={key++} className="text-gray-500">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // String value
      parts.push(
        <span key={key++} className="text-blue-300">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // Number
      parts.push(
        <span key={key++} className="text-orange-400">
          {match[4]}
        </span>
      );
    } else if (match[5]) {
      // Boolean
      parts.push(
        <span key={key++} className="text-sky-400">
          {match[5]}
        </span>
      );
    } else if (match[6]) {
      // Null
      parts.push(
        <span key={key++} className="text-red-400">
          {match[6]}
        </span>
      );
    } else if (match[7]) {
      // Brackets/braces
      parts.push(
        <span key={key++} className="text-gray-500">
          {match[7]}
        </span>
      );
    } else if (match[8]) {
      // Comma or colon (already handled colon with keys above, this catches standalone commas)
      parts.push(
        <span key={key++} className="text-gray-500">
          {match[8]}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, maxHeight = '400px' }) => {
  const [copied, setCopied] = useState(false);

  let jsonString: string;
  try {
    jsonString = JSON.stringify(data, null, 2);
  } catch {
    jsonString = String(data);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {/* ignore */});
  };

  if (!jsonString || jsonString === 'undefined') {
    return (
      <div
        className="bg-[#0D0A1C] rounded-lg border border-[#2E2A52] p-4 font-mono text-sm text-gray-500 overflow-auto"
        style={{ maxHeight }}
      >
        No data
      </div>
    );
  }

  const highlighted = highlightJson(jsonString);

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        title="Copy response JSON"
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all
          opacity-0 group-hover:opacity-100
          ${copied
            ? 'bg-green-700/80 text-green-200 border border-green-600/60'
            : 'bg-[#2E2A52] hover:bg-[#3D3870] text-gray-400 hover:text-gray-200 border border-[#3D3870]'
          }`}
      >
        {copied ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </>
        )}
      </button>
      <div
        className="bg-[#0D0A1C] rounded-lg border border-[#2E2A52] p-4 overflow-auto"
        style={{ maxHeight }}
      >
        <pre className="font-mono text-sm whitespace-pre-wrap break-words m-0">
          {highlighted}
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer;
