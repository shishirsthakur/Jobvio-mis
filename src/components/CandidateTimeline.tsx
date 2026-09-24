import React, { useState, useMemo } from 'react';
import {
  Candidate,
  CandidateTimelineEvent,
  TimelineEventType,
  CandidateStatus,
} from '../types';
import {
  Clock,
  ArrowRightLeft,
  Building2,
  Calendar,
  MessageSquare,
  Award,
  Sparkles,
  Plus,
  Filter,
  ArrowUpDown,
  Send,
  UserCheck,
  CheckCircle2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getOrGenerateCandidateTimeline } from '../utils/timelineUtils';

interface CandidateTimelineProps {
  candidate: Candidate;
  onUpdateCandidate: (updated: Candidate) => void;
  availableClients?: string[];
}

const ALL_STATUS_OPTIONS: Exclude<CandidateStatus, 'ALL'>[] = [
  'SOURCED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEWING',
  'OFFERED',
  'JOINED',
  'REJECTED',
];

export const CandidateTimeline: React.FC<CandidateTimelineProps> = ({
  candidate,
  onUpdateCandidate,
  availableClients = [],
}) => {
  const [filterType, setFilterType] = useState<TimelineEventType | 'ALL'>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST_FIRST' | 'OLDEST_FIRST'>('NEWEST_FIRST');
  const [showAddAction, setShowAddAction] = useState(false);
  const [actionType, setActionType] = useState<'STATUS_CHANGE' | 'SUBMISSION' | 'NOTE'>('STATUS_CHANGE');

  // Form states for manual additions
  const [targetStatus, setTargetStatus] = useState<Exclude<CandidateStatus, 'ALL'>>(
    candidate.status === 'JOINED' ? 'JOINED' : 'INTERVIEWING'
  );
  const [submissionClient, setSubmissionClient] = useState(
    candidate.client || availableClients[0] || 'Swiggy'
  );
  const [actionTitle, setActionTitle] = useState('');
  const [actionDescription, setActionDescription] = useState('');
  const [authorName, setAuthorName] = useState('Recruitment Desk');

  // Get active timeline
  const fullTimeline = useMemo(() => {
    return getOrGenerateCandidateTimeline(candidate);
  }, [candidate]);

  // Compute stats
  const stats = useMemo(() => {
    const statusChanges = fullTimeline.filter((e) => e.type === 'STATUS_CHANGE').length;
    const submissions = fullTimeline.filter((e) => e.type === 'SUBMISSION').length;
    const interviews = fullTimeline.filter((e) => e.type === 'INTERVIEW').length;

    // Days in pipeline calculation
    const oldest = fullTimeline[fullTimeline.length - 1];
    const createdTimestamp = oldest?.timestamp || new Date(candidate.createdAt || '2026-08-01').getTime();
    const daysInPipeline = Math.max(
      1,
      Math.floor((Date.now() - createdTimestamp) / (1000 * 60 * 60 * 24))
    );

    return {
      statusChanges,
      submissions,
      interviews,
      daysInPipeline,
    };
  }, [fullTimeline, candidate.createdAt]);

  // Filtered and sorted events
  const displayedEvents = useMemo(() => {
    let list = fullTimeline;
    if (filterType !== 'ALL') {
      list = list.filter((e) => e.type === filterType);
    }

    return [...list].sort((a, b) => {
      const timeA = a.timestamp || new Date(a.date).getTime() || 0;
      const timeB = b.timestamp || new Date(b.date).getTime() || 0;
      return sortOrder === 'NEWEST_FIRST' ? timeB - timeA : timeA - timeB;
    });
  }, [fullTimeline, filterType, sortOrder]);

  // Handler for adding a new event
  const handleRecordEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let newEvent: CandidateTimelineEvent;
    let updatedCandidate: Candidate = { ...candidate };

    if (actionType === 'STATUS_CHANGE') {
      newEvent = {
        id: `evt-${Date.now()}`,
        type: 'STATUS_CHANGE',
        title: actionTitle.trim() || `Stage Transitioned: ${targetStatus}`,
        description:
          actionDescription.trim() ||
          `Candidate stage updated from [${candidate.status}] to [${targetStatus}].`,
        date: dateFormatted,
        time: timeFormatted,
        timestamp: Date.now(),
        author: authorName.trim() || 'Recruiter Lead',
        fromStatus: candidate.status,
        toStatus: targetStatus,
        client: candidate.client,
        metaBadge: targetStatus,
      };

      updatedCandidate = {
        ...updatedCandidate,
        status: targetStatus,
        timeline: [newEvent, ...fullTimeline],
      };
    } else if (actionType === 'SUBMISSION') {
      const selectedClientName = submissionClient.trim() || 'Client Partner';
      newEvent = {
        id: `evt-${Date.now()}`,
        type: 'SUBMISSION',
        title: actionTitle.trim() || `Submitted to ${selectedClientName}`,
        description:
          actionDescription.trim() ||
          `Candidate profile submitted for client review at ${selectedClientName} for ${candidate.role} opening.`,
        date: dateFormatted,
        time: timeFormatted,
        timestamp: Date.now(),
        author: authorName.trim() || 'Account Manager',
        client: selectedClientName,
        fromStatus: candidate.status,
        toStatus: candidate.status === 'SOURCED' ? 'SCREENING' : candidate.status,
        metaBadge: 'Submission',
      };

      updatedCandidate = {
        ...updatedCandidate,
        client: selectedClientName,
        timeline: [newEvent, ...fullTimeline],
        notes: [
          `Submitted to ${selectedClientName} on ${dateFormatted}`,
          ...(updatedCandidate.notes || []),
        ],
      };
    } else {
      // NOTE
      newEvent = {
        id: `evt-${Date.now()}`,
        type: 'NOTE',
        title: actionTitle.trim() || 'Activity & Evaluation Log',
        description: actionDescription.trim() || 'Recruiter note recorded.',
        date: dateFormatted,
        time: timeFormatted,
        timestamp: Date.now(),
        author: authorName.trim() || 'Talent Lead',
        client: candidate.client,
        metaBadge: 'Note',
      };

      updatedCandidate = {
        ...updatedCandidate,
        timeline: [newEvent, ...fullTimeline],
        notes: [
          actionDescription.trim() || actionTitle.trim(),
          ...(updatedCandidate.notes || []),
        ],
      };
    }

    onUpdateCandidate(updatedCandidate);
    setShowAddAction(false);
    setActionTitle('');
    setActionDescription('');
  };

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'SUBMISSION':
        return <Send className="w-3.5 h-3.5" />;
      case 'INTERVIEW':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'OFFER':
        return <Award className="w-3.5 h-3.5" />;
      case 'NOTE':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'CREATED':
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const getEventStyles = (type: TimelineEventType) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return {
          nodeBg: 'bg-black text-white border-neutral-900',
          badgeBg: 'bg-gray-100 text-gray-900 border-gray-300',
          accent: 'border-l-black',
        };
      case 'SUBMISSION':
        return {
          nodeBg: 'bg-indigo-600 text-white border-indigo-700',
          badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          accent: 'border-l-indigo-600',
        };
      case 'INTERVIEW':
        return {
          nodeBg: 'bg-amber-600 text-white border-amber-700',
          badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
          accent: 'border-l-amber-500',
        };
      case 'OFFER':
        return {
          nodeBg: 'bg-emerald-600 text-white border-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          accent: 'border-l-emerald-600',
        };
      case 'NOTE':
        return {
          nodeBg: 'bg-sky-600 text-white border-sky-700',
          badgeBg: 'bg-sky-50 text-sky-900 border-sky-200',
          accent: 'border-l-sky-500',
        };
      case 'CREATED':
      default:
        return {
          nodeBg: 'bg-gray-700 text-white border-gray-800',
          badgeBg: 'bg-gray-100 text-gray-800 border-gray-300',
          accent: 'border-l-gray-400',
        };
    }
  };

  return (
    <div id="candidate-timeline-view" className="space-y-4 text-xs">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded">
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 block">
            Current Stage
          </span>
          <span className="font-mono font-bold text-gray-950 inline-block mt-0.5">
            [{candidate.status}]
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 block">
            Client Submissions
          </span>
          <span className="font-mono font-bold text-gray-950 inline-block mt-0.5">
            {stats.submissions} {stats.submissions === 1 ? 'Submission' : 'Submissions'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 block">
            Stage Transitions
          </span>
          <span className="font-mono font-bold text-gray-950 inline-block mt-0.5">
            {stats.statusChanges} Recorded
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 block">
            Active in Pipeline
          </span>
          <span className="font-mono font-bold text-gray-950 inline-block mt-0.5">
            {stats.daysInPipeline} Days
          </span>
        </div>
      </div>

      {/* Filter and Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition ${
              filterType === 'ALL'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Events ({fullTimeline.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('STATUS_CHANGE')}
            className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition flex items-center gap-1 ${
              filterType === 'STATUS_CHANGE'
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Status Changes ({stats.statusChanges})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SUBMISSION')}
            className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition flex items-center gap-1 ${
              filterType === 'SUBMISSION'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>Submissions ({stats.submissions})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('INTERVIEW')}
            className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition flex items-center gap-1 ${
              filterType === 'INTERVIEW'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Interviews ({stats.interviews})</span>
          </button>
        </div>

        {/* Right side: Sort order & Log activity trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSortOrder((prev) =>
                prev === 'NEWEST_FIRST' ? 'OLDEST_FIRST' : 'NEWEST_FIRST'
              )
            }
            title="Toggle chronological order"
            className="px-2 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-mono text-[11px] rounded flex items-center gap-1 cursor-pointer"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortOrder === 'NEWEST_FIRST' ? 'Newest First' : 'Oldest First'}</span>
          </button>

          <button
            type="button"
            id="toggle-log-activity-btn"
            onClick={() => setShowAddAction(!showAddAction)}
            className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white font-semibold text-[11px] rounded flex items-center gap-1 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Log Event</span>
            {showAddAction ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Manual Activity Logging Drawer */}
      {showAddAction && (
        <form
          onSubmit={handleRecordEvent}
          className="p-3.5 bg-gray-50 border border-gray-200 rounded space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="font-semibold text-gray-950 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              Record Candidate Milestone / Activity
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActionType('STATUS_CHANGE')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  actionType === 'STATUS_CHANGE'
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                Status Change
              </button>
              <button
                type="button"
                onClick={() => setActionType('SUBMISSION')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  actionType === 'SUBMISSION'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                Client Submission
              </button>
              <button
                type="button"
                onClick={() => setActionType('NOTE')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  actionType === 'NOTE'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}
              >
                Evaluation Note
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionType === 'STATUS_CHANGE' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">
                  New Candidate Stage
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) =>
                    setTargetStatus(e.target.value as Exclude<CandidateStatus, 'ALL'>)
                  }
                  className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black font-mono text-xs"
                >
                  {ALL_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === candidate.status ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {actionType === 'SUBMISSION' && (
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">
                  Client Partner Organization
                </label>
                <input
                  type="text"
                  value={submissionClient}
                  onChange={(e) => setSubmissionClient(e.target.value)}
                  placeholder="e.g. Stripe Technologies, Razorpay"
                  className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">
                Activity Title
              </label>
              <input
                type="text"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                placeholder={
                  actionType === 'STATUS_CHANGE'
                    ? `Transition to ${targetStatus}`
                    : actionType === 'SUBMISSION'
                    ? `Submitted to ${submissionClient || 'Client'}`
                    : 'Recruiter Assessment Log'
                }
                className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">
                Logged By (Recruiter / Role)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Aditya Vardhan (Lead)"
                className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-gray-600 uppercase mb-1">
              Detailed Activity Description / Feedback Notes
            </label>
            <textarea
              rows={2}
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              placeholder="Provide context, interview scores, compensation details, client remarks..."
              className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-black text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddAction(false)}
              className="px-3 py-1 border border-gray-200 rounded text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-black hover:bg-neutral-800 text-white rounded font-semibold transition cursor-pointer text-xs flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Event</span>
            </button>
          </div>
        </form>
      )}

      {/* Chronological Vertical Timeline Track */}
      <div className="relative pl-6 pt-2 pb-2">
        {/* Continuous Connecting Vertical Rail Line */}
        <div
          className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200"
          aria-hidden="true"
        />

        {displayedEvents.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded text-gray-500">
            No events found matching current filter category.
          </div>
        ) : (
          <div className="space-y-4">
            {displayedEvents.map((event, index) => {
              const styles = getEventStyles(event.type);

              return (
                <div
                  key={event.id || index}
                  className="relative group transition-all duration-150"
                >
                  {/* Timeline Node Icon Circle */}
                  <div
                    className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-xs z-10 ${styles.nodeBg}`}
                    title={event.type}
                  >
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event Card Content */}
                  <div className="bg-white border border-gray-200 rounded-md p-3.5 shadow-xs hover:border-gray-300 transition-colors ml-2">
                    {/* Top Row: Meta Badge, Date, Time & Author */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${styles.badgeBg}`}
                        >
                          {event.type.replace('_', ' ')}
                        </span>

                        {/* Status Transition Pill if applicable */}
                        {event.fromStatus && event.toStatus && (
                          <div className="flex items-center gap-1 font-mono text-[10px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-semibold">
                            <span>[{event.fromStatus}]</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-black font-bold">[{event.toStatus}]</span>
                          </div>
                        )}

                        {/* Client Tag */}
                        {event.client && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">
                            <Building2 className="w-3 h-3 text-gray-500" />
                            {event.client}
                          </span>
                        )}
                      </div>

                      {/* Timestamp & Recruiter */}
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {event.date}
                        </span>
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {event.time}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-gray-900 mb-1">
                      {event.title}
                    </h4>

                    {/* Description */}
                    {event.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Footer author */}
                    {event.author && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Recorded by: <strong className="text-gray-700 font-medium">{event.author}</strong></span>
                        <span className="font-mono text-gray-400">ID: {event.id}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
