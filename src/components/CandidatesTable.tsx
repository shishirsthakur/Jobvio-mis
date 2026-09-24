import React from 'react';
import { Eye, Edit3, Trash2, Mail, Download, Plus, UploadCloud } from 'lucide-react';
import { Candidate, CandidateWorkflowStatus } from '../types';

interface CandidatesTableProps {
  candidates: Candidate[];
  totalCount: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onViewCandidate: (candidate: Candidate) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (candidate: Candidate) => void;
  onEmailSelected: () => void;
  onExportCsv: () => void;
  onOpenNewCandidate: () => void;
  onOpenImportData?: () => void;
  onUpdateStatus?: (candidate: Candidate, newStatus: CandidateWorkflowStatus) => void;
  onBulkStatusChange?: (newStatus: CandidateWorkflowStatus) => void;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  totalCount,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onViewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onEmailSelected,
  onExportCsv,
  onOpenNewCandidate,
  onOpenImportData,
  onUpdateStatus,
  onBulkStatusChange,
}) => {
  const allSelected =
    candidates.length > 0 &&
    candidates.every((c) => selectedIds.includes(c.id));
  const someSelected =
    candidates.some((c) => selectedIds.includes(c.id)) && !allSelected;

  // Format currency LPA
  const formatLpa = (ctc: number) => {
    return `₹${ctc.toFixed(1)} LPA`;
  };

  return (
    <div className="w-full">
      {/* Table Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        {/* Left Side: Count & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-600">
          <span id="records-counter-text" className="font-medium text-gray-600">
            Showing {candidates.length} of {totalCount} candidate records
          </span>

          <div className="flex items-center gap-2 ml-1">
            <button
              id="btn-email-selected"
              onClick={onEmailSelected}
              disabled={selectedIds.length === 0}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition cursor-pointer ${
                selectedIds.length > 0
                  ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 shadow-xs'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>
                Email Selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
              </span>
            </button>

            {selectedIds.length > 0 && onBulkStatusChange && (
              <select
                id="bulk-stage-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onBulkStatusChange(e.target.value as CandidateWorkflowStatus);
                    e.target.value = '';
                  }
                }}
                className="px-2 py-1 text-xs rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-xs font-mono font-medium focus:outline-none"
                title="Change stage for selected candidates"
              >
                <option value="" disabled>
                  Stage Action ({selectedIds.length})...
                </option>
                <option value="SCREENING">Mark Screening</option>
                <option value="SHORTLISTED">Mark Shortlisted</option>
                <option value="INTERVIEWING">Schedule Interview</option>
                <option value="OFFERED">Extend Offer</option>
                <option value="JOINED">Mark Joined</option>
                <option value="REJECTED">Archive / Reject</option>
              </select>
            )}

            <button
              id="btn-export-csv"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onOpenImportData && (
              <button
                id="btn-import-data"
                onClick={onOpenImportData}
                title="Import or reset candidate dataset"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition cursor-pointer shadow-xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Import / Reset Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: New Candidate Button */}
        <div>
          <button
            id="btn-new-candidate"
            onClick={onOpenNewCandidate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded transition cursor-pointer shadow-xs tracking-tight"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Candidate</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div
        id="candidates-table-container"
        className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                <th scope="col" className="p-3.5 w-10 text-center">
                  <input
                    id="checkbox-select-all"
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onSelectAll}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                  ID
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                  CANDIDATE NAME
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                  TARGET ROLE
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap text-center">
                  EXP (YRS)
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                  EXPECTED CTC
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap">
                  LOCATION
                </th>
                <th scope="col" className="px-3 py-3.5 min-w-[240px]">
                  SKILLS MATRIX
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap text-center">
                  STATUS
                </th>
                <th scope="col" className="px-3 py-3.5 whitespace-nowrap text-center">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">
                    <p className="text-sm font-medium text-gray-700">
                      No candidate records found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting or resetting your filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => {
                  const isSelected = selectedIds.includes(candidate.id);
                  const isOfferedOrJoined =
                    candidate.status === 'OFFERED' ||
                    candidate.status === 'JOINED';

                  return (
                    <tr
                      key={candidate.id}
                      id={`candidate-row-${candidate.id.toLowerCase()}`}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isSelected ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <input
                          id={`checkbox-${candidate.id.toLowerCase()}`}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(candidate.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="px-3 py-3.5 whitespace-nowrap font-mono text-[11px] font-medium text-gray-700">
                        {candidate.id}
                      </td>

                      {/* Name & Email */}
                      <td className="px-3 py-3.5">
                        <div className="font-semibold text-gray-900 tracking-tight">
                          {candidate.name}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          {candidate.email}
                        </div>
                      </td>

                      {/* Target Role */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-gray-800 font-medium">
                        <div>{candidate.role}</div>
                        {candidate.client && (
                          <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span>{candidate.client}</span>
                          </div>
                        )}
                      </td>

                      {/* Exp (Yrs) */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-center font-mono text-gray-700 font-medium">
                        {candidate.experienceYears.toFixed(1)}
                      </td>

                      {/* Expected CTC */}
                      <td className="px-3 py-3.5 whitespace-nowrap font-medium text-gray-900">
                        <div>{formatLpa(candidate.expectedCtcLpa)}</div>
                        {candidate.currentCtc && (
                          <div className="text-[10px] font-mono text-gray-400">
                            Cur: ₹{candidate.currentCtc.toFixed(1)} LPA
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-gray-600">
                        {candidate.location}
                      </td>

                      {/* Skills Matrix */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[280px]">
                          {candidate.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-block px-1.5 py-0.5 bg-gray-50 border border-gray-200 text-gray-700 font-mono text-[11px] rounded leading-none"
                            >
                              [{skill}]
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-center">
                        {onUpdateStatus ? (
                          <select
                            id={`status-select-${candidate.id.toLowerCase()}`}
                            value={candidate.status}
                            onChange={(e) =>
                              onUpdateStatus(candidate, e.target.value as CandidateWorkflowStatus)
                            }
                            className={`px-2 py-1 text-[11px] font-mono uppercase rounded border transition cursor-pointer font-medium focus:outline-none focus:ring-1 focus:ring-black ${
                              isOfferedOrJoined
                                ? 'bg-black text-white border-black font-semibold'
                                : candidate.status === 'INTERVIEWING'
                                ? 'bg-purple-50 text-purple-800 border-purple-200 font-semibold'
                                : candidate.status === 'SHORTLISTED'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : candidate.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'border-gray-200 bg-white text-gray-800'
                            }`}
                            title="Click to update candidate hiring stage"
                          >
                            <option value="SOURCED">SOURCED</option>
                            <option value="SCREENING">SCREENING</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="INTERVIEWING">INTERVIEWING</option>
                            <option value="OFFERED">OFFERED</option>
                            <option value="JOINED">JOINED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 font-mono text-[11px] uppercase rounded transition ${
                              isOfferedOrJoined
                                ? 'bg-black text-white font-semibold'
                                : 'border border-gray-200 bg-white text-gray-800 font-medium'
                            }`}
                          >
                            [{candidate.status}]
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            id={`action-view-${candidate.id.toLowerCase()}`}
                            onClick={() => onViewCandidate(candidate)}
                            title="View Candidate Profile"
                            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`action-edit-${candidate.id.toLowerCase()}`}
                            onClick={() => onEditCandidate(candidate)}
                            title="Edit Candidate Details"
                            className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`action-delete-${candidate.id.toLowerCase()}`}
                            onClick={() => onDeleteCandidate(candidate)}
                            title="Delete Candidate Record"
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
