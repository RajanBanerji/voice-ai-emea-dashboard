import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getDocsUrl } from '../data/docsUrls';
import type { EndpointDef } from '../data/endpoints';

interface DocsInfoButtonProps {
  endpoint: EndpointDef;
}

// Module-level tracker: stores the close callback of the currently open popover.
// Only one popover should be open at a time.
let activeCloseCallback: (() => void) | null = null;

const DocsInfoButton: React.FC<DocsInfoButtonProps> = ({ endpoint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const docsUrl = getDocsUrl(endpoint.id, endpoint.category);

  // Register/unregister this instance as the active popover
  useEffect(() => {
    if (isOpen) {
      activeCloseCallback = () => setIsOpen(false);
    }
    return () => {
      // Only unregister if this instance is the active one
      if (activeCloseCallback === (() => setIsOpen(false))) {
        activeCloseCallback = null;
      }
    };
  }, [isOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        activeCloseCallback = null;
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        activeCloseCallback = null;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      // Close this popover
      setIsOpen(false);
      activeCloseCallback = null;
    } else {
      // Close any other active popover first, then open this one
      if (activeCloseCallback) {
        activeCloseCallback();
        activeCloseCallback = null;
      }
      // Use setTimeout to ensure the previous close completes before opening
      setTimeout(() => {
        setIsOpen(true);
        activeCloseCallback = () => setIsOpen(false);
      }, 0);
    }
  }, [isOpen]);

  const handleViewDocs = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(docsUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    activeCloseCallback = null;
  }, [docsUrl]);

  const pathParamCount = endpoint.params.filter(p => p.isPathParam).length;

  return (
    <div className="relative flex-shrink-0">
      {/* Info button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-150 ${
          isOpen
            ? 'bg-[#742DDD] text-white shadow-lg shadow-purple-900/40'
            : 'bg-[#252145] text-gray-400 hover:bg-[#742DDD]/30 hover:text-[#8B5CF6]'
        }`}
        title="View API documentation"
        aria-label={`Documentation for ${endpoint.name}`}
      >
        i
      </button>

      {/* Popover panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute right-0 top-7 z-50 w-72 bg-[#16132D] border border-[#2E2A52] rounded-lg shadow-xl shadow-black/40 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'fadeSlideIn 150ms ease-out' }}
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-[#2E2A52] bg-[#0D0A1C]/50">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-[#8B5CF6] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-xs font-semibold text-[#8B5CF6]">
                Sendbird Docs
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 py-3 space-y-2.5">
            {/* Endpoint name */}
            <h4 className="text-sm font-medium text-white leading-tight">
              {endpoint.name}
            </h4>

            {/* Method + Path */}
            <div className="flex items-center gap-1.5">
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase flex-shrink-0"
                style={{
                  backgroundColor:
                    endpoint.method === 'GET' ? '#3B82F6'
                    : endpoint.method === 'POST' ? '#22C55E'
                    : endpoint.method === 'PUT' ? '#F59E0B'
                    : endpoint.method === 'DELETE' ? '#EF4444'
                    : '#A78BFA',
                }}
              >
                {endpoint.method}
              </span>
              <code className="text-[11px] text-gray-400 font-mono truncate">
                {endpoint.path}
              </code>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed">
              {endpoint.description}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#252145] text-gray-400 border border-[#2E2A52]">
                {endpoint.category}
              </span>
              {endpoint.isPremium && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-900/30 text-amber-400 border border-amber-800/40">
                  Premium
                </span>
              )}
              {endpoint.isDestructive && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-900/30 text-red-400 border border-red-800/40">
                  Destructive
                </span>
              )}
              {pathParamCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-purple-900/30 text-purple-300 border border-purple-700/40">
                  {pathParamCount} path param{pathParamCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Footer – View Docs button */}
          <div className="px-3 py-2.5 border-t border-[#2E2A52] bg-[#0D0A1C]/30">
            <button
              onClick={handleViewDocs}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#742DDD] hover:bg-[#6211C8] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Full Documentation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsInfoButton;
