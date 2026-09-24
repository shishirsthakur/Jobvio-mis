import React, { useState } from 'react';
import { X, Upload, FileText, Check, Database, RefreshCw, AlertTriangle } from 'lucide-react';
import { Candidate } from '../types';
import { INITIAL_CANDIDATES, EXTENDED_CANDIDATES } from '../data/initialCandidates';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (candidates: Candidate[], mode: 'replace' | 'append') => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'presets' | 'paste' | 'file'>('presets');
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewCandidates, setPreviewCandidates] = useState<Candidate[] | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Parse pasted content
  const handleParseText = () => {
    setParseError(null);
    if (!pastedText.trim()) {
      setParseError('Please paste JSON or CSV candidate data first.');
      return;
    }

    try {
      // First try JSON
      if (pastedText.trim().startsWith('[') || pastedText.trim().startsWith('{')) {
        const parsed = JSON.parse(pastedText);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        
        const validCandidates: Candidate[] = list.map((item, idx) => ({
          id: item.id || `CAN-${900 + idx}`,
          name: item.name || 'Unnamed Candidate',
          email: item.email || `candidate${idx}@example.com`,
          phone: item.phone || '+91 98000 00000',
          role: item.role || 'Software Engineer',
          experienceYears: Number(item.experienceYears) || 3.0,
          expectedCtcLpa: Number(item.expectedCtcLpa) || 20.0,
          location: item.location || 'Bangalore',
          skills: Array.isArray(item.skills) ? item.skills : ['React', 'TypeScript'],
          status: item.status || 'SCREENING',
          currentCompany: item.currentCompany || 'Tech Corp',
          noticePeriod: item.noticePeriod || '30 Days',
          avatarUrl: item.avatarUrl,
          notes: Array.isArray(item.notes) ? item.notes : ['Imported record'],
          createdAt: item.createdAt || new Date().toISOString().split('T')[0],
        }));

        setPreviewCandidates(validCandidates);
        return;
      }

      // Try CSV parsing
      const lines = pastedText.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const parsedFromCsv: Candidate[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (row.length < 3) continue;

          parsedFromCsv.push({
            id: row[0] || `CAN-${900 + i}`,
            name: row[1] || `Candidate ${i}`,
            email: row[2] || `candidate${i}@example.com`,
            role: row[3] || 'Software Engineer',
            experienceYears: parseFloat(row[4]) || 3.0,
            expectedCtcLpa: parseFloat(row[5]) || 20.0,
            location: row[6] || 'Bangalore',
            skills: row[7] ? row[7].split(';').map((s) => s.trim()) : ['React', 'TypeScript'],
            status: (row[8] as any) || 'SCREENING',
            currentCompany: row[9] || 'Tech Corp',
            noticePeriod: row[10] || '30 Days',
            createdAt: new Date().toISOString().split('T')[0],
          });
        }

        if (parsedFromCsv.length > 0) {
          setPreviewCandidates(parsedFromCsv);
          return;
        }
      }

      setParseError('Could not parse text format. Please provide valid JSON or CSV data.');
    } catch (err: any) {
      setParseError(`Parsing error: ${err.message}`);
    }
  };

  const handleFileUpload = (file: File) => {
    setParseError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPastedText(content);
      setActiveTab('paste');
    };
    reader.onerror = () => {
      setParseError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleApplyImport = (candidatesToImport: Candidate[]) => {
    onImport(candidatesToImport, importMode);
    onClose();
  };

  return (
    <div
      id="import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="import-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-950">
                Candidate Data Manager & Importer
              </h2>
              <p className="text-[11px] text-gray-500">
                Load official specification datasets or import custom candidate records
              </p>
            </div>
          </div>
          <button
            id="import-modal-close-btn"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/40 text-xs px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('presets');
              setPreviewCandidates(null);
            }}
            className={`px-3 py-2 font-medium border-b-2 transition -mb-[1px] cursor-pointer ${
              activeTab === 'presets'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Standard Datasets
          </button>
          <button
            onClick={() => {
              setActiveTab('paste');
              setPreviewCandidates(null);
            }}
            className={`px-3 py-2 font-medium border-b-2 transition -mb-[1px] cursor-pointer ${
              activeTab === 'paste'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Paste JSON / CSV
          </button>
          <button
            onClick={() => {
              setActiveTab('file');
              setPreviewCandidates(null);
            }}
            className={`px-3 py-2 font-medium border-b-2 transition -mb-[1px] cursor-pointer ${
              activeTab === 'file'
                ? 'border-black text-black font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Upload File
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* Tab 1: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition bg-white flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>Official Spec Dataset</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 font-mono text-[10px] rounded text-gray-600">
                      12 Candidates
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Matches the exact UI layout from the original screen specification (CAN-892 to CAN-903).
                  </p>
                </div>
                <button
                  id="load-official-spec-data-btn"
                  onClick={() => handleApplyImport(INITIAL_CANDIDATES)}
                  className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded font-medium transition cursor-pointer"
                >
                  Load (12 Records)
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition bg-white flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>Extended Candidate Pool</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 font-mono text-[10px] rounded text-gray-600">
                      18 Candidates
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Adds DevOps, Frontend Architects, Mobile Engineers, Data Engineers, and Product Designers.
                  </p>
                </div>
                <button
                  id="load-extended-spec-data-btn"
                  onClick={() => handleApplyImport(EXTENDED_CANDIDATES)}
                  className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded font-medium transition cursor-pointer"
                >
                  Load (18 Records)
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Paste JSON or CSV */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Paste JSON Array or CSV records
                </label>
                <textarea
                  id="import-raw-textarea"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Example JSON:
[
  {
    "id": "CAN-950",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "React Developer",
    "experienceYears": 5.0,
    "expectedCtcLpa": 24.0,
    "location": "Bangalore",
    "skills": ["React", "TypeScript"],
    "status": "INTERVIEWING"
  }
]`}
                  rows={8}
                  className="w-full font-mono text-[11px] p-3 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  id="parse-pasted-data-btn"
                  onClick={handleParseText}
                  className="px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded font-medium transition cursor-pointer"
                >
                  Parse & Validate
                </button>
                {previewCandidates && (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Ready to import {previewCandidates.length} candidate(s)
                  </span>
                )}
              </div>

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {previewCandidates && previewCandidates.length > 0 && (
                <div className="border border-gray-200 rounded p-3 bg-gray-50/50 space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-semibold text-gray-800 text-[11px]">
                    Previewing First 5 Records:
                  </div>
                  {previewCandidates.slice(0, 5).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-white p-2 border border-gray-100 rounded text-[11px]"
                    >
                      <div>
                        <span className="font-mono text-gray-500 mr-2">{c.id}</span>
                        <span className="font-semibold text-gray-900">{c.name}</span>
                        <span className="text-gray-400 ml-2">({c.role})</span>
                      </div>
                      <span className="font-mono font-medium">₹{c.expectedCtcLpa} LPA</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Upload File */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`p-8 border-2 border-dashed rounded-lg text-center transition cursor-pointer ${
                  dragOver
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json,.csv,.txt';
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-800 text-xs">
                  Click or drag and drop a JSON or CSV file here
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports candidate JSON export or comma-separated CSV spreadsheets
                </p>
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-black focus:ring-black"
                />
                Replace Entire Pool
              </label>
              <label className="text-[11px] font-medium text-gray-700 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-black focus:ring-black"
                />
                Append / Merge Records
              </label>
            </div>

            {previewCandidates && (
              <button
                id="apply-import-candidates-btn"
                onClick={() => handleApplyImport(previewCandidates)}
                className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded font-medium transition cursor-pointer"
              >
                Apply Import ({previewCandidates.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
