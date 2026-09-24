import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { CandidateStatus, FilterState } from '../types';

interface FilterEngineProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableRoles: string[];
  availableLocations: string[];
}

const STATUS_BUTTONS: CandidateStatus[] = [
  'ALL',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEWING',
  'OFFERED',
  'JOINED',
  'REJECTED',
];

export const FilterEngine: React.FC<FilterEngineProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableRoles,
  availableLocations,
}) => {
  return (
    <div className="w-full">
      {/* Title and Reset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1
            id="page-title"
            className="text-2xl font-bold tracking-tight text-gray-950 font-sans"
          >
            Candidates Data
          </h1>
        </div>

        <button
          id="btn-reset-filters"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold uppercase tracking-wider text-gray-800 hover:text-black hover:bg-gray-100 px-2.5 py-1.5 rounded transition cursor-pointer border border-transparent hover:border-gray-200"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>RESET FILTERS</span>
        </button>
      </div>

      {/* Filter Card Container */}
      <div
        id="filter-card-container"
        className="bg-white border border-gray-200 rounded-md p-5 mb-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        {/* Row 1: 4 Column Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pb-5 border-b border-gray-100">
          {/* Column 1: Search Identifier */}
          <div>
            <label
              htmlFor="filter-search-identifier"
              className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5"
            >
              SEARCH IDENTIFIER
            </label>
            <input
              id="filter-search-identifier"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Name, skills, ID, email..."
              className="w-full px-3 py-2 text-xs text-gray-900 bg-white border border-gray-200 rounded placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition"
            />
          </div>

          {/* Column 2: Target Role */}
          <div>
            <label
              htmlFor="filter-target-role"
              className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5"
            >
              TARGET ROLE
            </label>
            <div className="relative">
              <select
                id="filter-target-role"
                value={filters.targetRole}
                onChange={(e) => onFilterChange({ targetRole: e.target.value })}
                className="w-full appearance-none px-3 py-2 pr-8 text-xs text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Column 3: Location */}
          <div>
            <label
              htmlFor="filter-location"
              className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1.5"
            >
              LOCATION
            </label>
            <div className="relative">
              <select
                id="filter-location"
                value={filters.location}
                onChange={(e) => onFilterChange({ location: e.target.value })}
                className="w-full appearance-none px-3 py-2 pr-8 text-xs text-gray-900 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition cursor-pointer"
              >
                <option value="ALL">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Column 4: Max Expected CTC */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="filter-max-ctc"
                className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500"
              >
                MAX EXPECTED CTC
              </label>
              <span
                id="filter-max-ctc-value"
                className="text-xs font-semibold text-gray-900 tracking-tight"
              >
                ₹{filters.maxExpectedCtc} LPA
              </span>
            </div>
            <div className="pt-2.5">
              <input
                id="filter-max-ctc"
                type="range"
                min={10}
                max={50}
                step={1}
                value={filters.maxExpectedCtc}
                onChange={(e) =>
                  onFilterChange({ maxExpectedCtc: Number(e.target.value) })
                }
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Status Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mr-2">
            STATUS:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_BUTTONS.map((status) => {
              const isActive = filters.status === status;
              return (
                <button
                  key={status}
                  id={`status-pill-${status.toLowerCase()}`}
                  onClick={() => onFilterChange({ status })}
                  className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
