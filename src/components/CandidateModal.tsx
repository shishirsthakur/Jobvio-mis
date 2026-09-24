import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  Clock,
  User,
  ArrowRight,
  Send,
  Sparkles,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import { Candidate, CandidateStatus, CandidateTimelineEvent } from '../types';
import { CandidateTimeline } from './CandidateTimeline';
import { getOrGenerateCandidateTimeline } from '../utils/timelineUtils';

interface CandidateModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Candidate) => void;
  initialEditMode?: boolean;
  availableClients?: string[];
}

const ALL_STATUSES: Exclude<CandidateStatus, 'ALL'>[] = [
  'SOURCED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEWING',
  'OFFERED',
  'JOINED',
  'REJECTED',
];

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onUpdate,
  initialEditMode = false,
  availableClients = [],
}) => {
  if (!isOpen || !candidate) return null;

  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [formData, setFormData] = useState<Candidate>({ ...candidate });
  const [newSkill, setNewSkill] = useState('');
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline'>('profile');

  useEffect(() => {
    setIsEditing(initialEditMode);
    if (candidate) {
      setFormData({ ...candidate });
    }
  }, [candidate, initialEditMode]);

  const timelineEvents = useMemo(() => {
    return getOrGenerateCandidateTimeline(candidate);
  }, [candidate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedToSave: Candidate = { ...formData };

    // Record status change event in timeline if status changed
    if (formData.status !== candidate.status) {
      const now = new Date();
      const newEvent: CandidateTimelineEvent = {
        id: `evt-status-${Date.now()}`,
        type: 'STATUS_CHANGE',
        title: `Stage Changed to ${formData.status}`,
        description: `Candidate profile updated: stage moved from [${candidate.status}] to [${formData.status}].`,
        date: now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        author: 'Recruitment Lead',
        fromStatus: candidate.status,
        toStatus: formData.status,
        client: formData.client || candidate.client,
        metaBadge: formData.status,
      };
      const currentTimeline =
        candidate.timeline || getOrGenerateCandidateTimeline(candidate);
      updatedToSave.timeline = [newEvent, ...currentTimeline];
    }

    onUpdate(updatedToSave);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const text = newNote.trim();
      const now = new Date();
      const noteEvent: CandidateTimelineEvent = {
        id: `evt-note-${Date.now()}`,
        type: 'NOTE',
        title: 'Recruiter Assessment Note',
        description: text,
        date: now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        author: 'Lead Recruiter',
        client: candidate.client,
        metaBadge: 'Note',
      };
      const currentTimeline =
        candidate.timeline || getOrGenerateCandidateTimeline(candidate);
      const updatedNotes = [...(candidate.notes || []), text];
      const updatedCandidate: Candidate = {
        ...candidate,
        notes: updatedNotes,
        timeline: [noteEvent, ...currentTimeline],
      };
      setFormData(updatedCandidate);
      onUpdate(updatedCandidate);
      setNewNote('');
    }
  };

  const handleQuickStatusChange = (st: Exclude<CandidateStatus, 'ALL'>) => {
    if (st === candidate.status) return;
    const now = new Date();
    const newEvent: CandidateTimelineEvent = {
      id: `evt-status-${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: `Stage Changed to ${st}`,
      description: `Status transitioned from [${candidate.status}] to [${st}].`,
      date: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      author: 'Talent Desk Lead',
      fromStatus: candidate.status,
      toStatus: st,
      client: candidate.client,
      metaBadge: st,
    };
    const currentTimeline =
      candidate.timeline || getOrGenerateCandidateTimeline(candidate);
    const updated: Candidate = {
      ...candidate,
      status: st,
      timeline: [newEvent, ...currentTimeline],
    };
    setFormData(updated);
    onUpdate(updated);
  };

  return (
    <div
      id="candidate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="candidate-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={candidate.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center font-bold text-gray-700 text-xs">
                {candidate.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold px-1.5 py-0.2 bg-white border border-gray-200 rounded text-gray-700">
                  {candidate.id}
                </span>
                <h2 className="text-base font-bold text-gray-950">
                  {isEditing ? 'Edit Candidate Profile' : candidate.name}
                </h2>
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                {candidate.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                id="modal-toggle-edit-mode-btn"
                onClick={() => setIsEditing(true)}
                className="text-xs px-2.5 py-1 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Edit Details
              </button>
            )}
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-black rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (when not editing) */}
        {!isEditing && (
          <div className="px-6 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
            <div className="flex items-center gap-1 -mb-px">
              <button
                id="candidate-modal-tab-profile"
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-black text-gray-950 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate Dossier</span>
              </button>
              <button
                id="candidate-modal-tab-timeline"
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'border-black text-gray-950 bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Status & Submission Timeline</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    activeTab === 'timeline'
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {timelineEvents.length}
                </span>
              </button>
            </div>

            {/* Quick status pill in tab header */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-gray-400">Current Stage:</span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-900">
                [{candidate.status}]
              </span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Current CTC (₹ LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.currentCtc || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentCtc: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="e.g. 14.0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Expected CTC (₹ LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.expectedCtcLpa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedCtcLpa: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Client Partner
                  </label>
                  <input
                    type="text"
                    value={formData.client || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    placeholder="e.g. Stripe, Razorpay"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Current Company
                  </label>
                  <input
                    type="text"
                    value={formData.currentCompany || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentCompany: e.target.value,
                      })
                    }
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills edit */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Skills Matrix
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-800"
                    >
                      [{s}]
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add skill (e.g. Next.js)..."
                    className="flex-1 px-3 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded font-medium text-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : activeTab === 'timeline' ? (
            /* Timeline View Mode */
            <CandidateTimeline
              candidate={candidate}
              onUpdateCandidate={onUpdate}
              availableClients={availableClients}
            />
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Top summary card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50/80 border border-gray-200 rounded">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400">
                    Target Role
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {candidate.role}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400">
                    Experience
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5 font-mono">
                    {candidate.experienceYears} Years
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400">
                    Compensation
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    ₹{candidate.expectedCtcLpa.toFixed(1)} LPA
                    {candidate.currentCtc && (
                      <span className="text-[10px] text-gray-500 font-normal ml-1">
                        (Cur: ₹{candidate.currentCtc.toFixed(1)})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-gray-400">
                    Client & Status
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-block font-mono text-[11px] px-2 py-0.5 rounded ${
                        candidate.status === 'OFFERED' ||
                        candidate.status === 'JOINED'
                          ? 'bg-black text-white font-semibold'
                          : 'border border-gray-200 bg-white text-gray-800 font-medium'
                      }`}
                    >
                      [{candidate.status}]
                    </span>
                    {candidate.client && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                        {candidate.client}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-gray-600">{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{candidate.location}</span>
                </div>
                {candidate.currentCompany && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>Current: {candidate.currentCompany}</span>
                  </div>
                )}
                {candidate.noticePeriod && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Notice Period: {candidate.noticePeriod}</span>
                  </div>
                )}
              </div>

              {/* Skills matrix */}
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Skills Matrix
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-800 font-mono text-[11px] rounded"
                    >
                      [{skill}]
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview & Evaluation Notes */}
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Evaluation & Interview Log
                </h4>
                <div className="space-y-2 mb-3">
                  {candidate.notes && candidate.notes.length > 0 ? (
                    candidate.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white border border-gray-200 rounded text-gray-700 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="flex-1">{note}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No notes logged yet.</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log an interviewer note..."
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-black focus:border-black text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded font-medium text-gray-700 transition"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Timeline Highlights Preview */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] uppercase font-semibold text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Chronological History Highlights</span>
                  </div>
                  <button
                    type="button"
                    id="view-full-timeline-btn"
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs font-semibold text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Timeline ({timelineEvents.length} events)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {timelineEvents.slice(0, 2).map((ev, i) => (
                    <div
                      key={ev.id || i}
                      onClick={() => setActiveTab('timeline')}
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-800 uppercase">
                          {ev.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-gray-900">
                          {ev.title}
                        </span>
                        {ev.client && (
                          <span className="font-mono text-[10px] text-gray-500">
                            • {ev.client}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 shrink-0">
                        {ev.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Status Bar inside View */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-[10px] uppercase font-semibold text-gray-500 mb-2">
                  Update Candidate Stage
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleQuickStatusChange(st)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-semibold uppercase rounded transition cursor-pointer ${
                        candidate.status === st
                          ? 'bg-black text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      [{st}]
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
