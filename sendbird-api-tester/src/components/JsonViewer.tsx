import React from 'react';

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
  let jsonString: string;
  try {
    jsonString = JSON.stringify(data, null, 2);
  } catch {
    jsonString = String(data);
  }

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
    <div
      className="bg-[#0D0A1C] rounded-lg border border-[#2E2A52] p-4 overflow-auto"
      style={{ maxHeight }}
    >
      <pre className="font-mono text-sm whitespace-pre-wrap break-words m-0">
        {highlighted}
      </pre>
    </div>
  );
};

export default JsonViewer;
