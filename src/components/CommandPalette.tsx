import React, { useState, useEffect } from 'react';
import { Search, X, User, Filter, RotateCcw, Plus, LayoutGrid, Users, Briefcase, Building2 } from 'lucide-react';
import { Candidate, CandidateStatus, ActivePage } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onSelectStatusFilter: (status: CandidateStatus) => void;
  onResetFilters: () => void;
  onOpenNewCandidate: () => void;
  onOpenNewClient?: () => void;
  onNavigate?: (page: ActivePage) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  candidates,
  onSelectCandidate,
  onSelectStatusFilter,
  onResetFilters,
  onOpenNewCandidate,
  onOpenNewClient,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCandidates = query.trim()
    ? candidates.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
        );
      })
    : candidates.slice(0, 6);

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, navigate pages, or execute action..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 text-xs divide-y divide-gray-100">
          {/* Navigation Jumps */}
          {onNavigate && (
            <div className="py-2">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Switch Pages
              </div>
              <div className="grid grid-cols-3 gap-1 px-2 pt-1">
                <button
                  onClick={() => {
                    onNavigate('overview');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-100 hover:border-black hover:bg-gray-50 text-left font-medium text-xs text-gray-800 cursor-pointer"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-gray-600" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('candidates');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-100 hover:border-black hover:bg-gray-50 text-left font-medium text-xs text-gray-800 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-gray-600" />
                  <span>Candidates</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('clients');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-100 hover:border-black hover:bg-gray-50 text-left font-medium text-xs text-gray-800 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-gray-600" />
                  <span>Clients & Jobs</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="py-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Quick Actions
            </div>
            <button
              onClick={() => {
                onOpenNewCandidate();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 transition cursor-pointer text-gray-800"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
              <span>Create New Candidate Record</span>
            </button>
            {onOpenNewClient && (
              <button
                onClick={() => {
                  onOpenNewClient();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 transition cursor-pointer text-gray-800"
              >
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Register New Client Partner</span>
              </button>
            )}
            <button
              onClick={() => {
                onResetFilters();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-gray-100 transition cursor-pointer text-gray-800"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset All Candidate Filters</span>
            </button>
          </div>

          {/* Pipeline Stage Quick Jumps */}
          <div className="py-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Filter by Pipeline Stage
            </div>
            <div className="grid grid-cols-2 gap-1 px-2 pt-1">
              {(['INTERVIEWING', 'OFFERED', 'SCREENING', 'JOINED'] as CandidateStatus[]).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onSelectStatusFilter(st);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-left font-mono text-[11px] text-gray-700 cursor-pointer"
                  >
                    <Filter className="w-3 h-3 text-gray-400" />
                    <span>[{st}]</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Candidate matching list */}
          <div className="py-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Candidates ({filteredCandidates.length})
            </div>
            {filteredCandidates.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-400">
                No matching candidates found for "{query}"
              </div>
            ) : (
              filteredCandidates.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCandidate(c);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rounded hover:bg-gray-100 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                    <div>
                      <span className="font-semibold text-gray-900">{c.name}</span>
                      <span className="text-gray-400 font-mono text-[11px] ml-2">
                        {c.id}
                      </span>
                      <span className="text-gray-500 text-[11px] ml-2 font-normal">
                        • {c.role} ({c.location})
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      c.status === 'OFFERED' || c.status === 'JOINED'
                        ? 'bg-black text-white'
                        : 'border border-gray-200 text-gray-700'
                    }`}
                  >
                    [{c.status}]
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-end text-[11px] text-gray-400">
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
