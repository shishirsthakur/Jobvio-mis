import React, { useMemo } from 'react';
import {
  Users,
  Building2,
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Sparkles,
  ExternalLink,
  Activity,
  UserCheck,
  Send,
} from 'lucide-react';
import { Candidate, Client, ActivePage, CandidateStatus, PipelineNotification } from '../types';
import { getOrGenerateCandidateTimeline } from '../utils/timelineUtils';

interface OverviewDashboardProps {
  candidates: Candidate[];
  clients: Client[];
  onNavigate: (page: ActivePage) => void;
  onSelectStatusFilter?: (status: CandidateStatus) => void;
  onOpenNewCandidate?: () => void;
  onOpenNewClient?: () => void;
  onExportCsv: () => void;
  onOpenMatchWithRole?: (role: string) => void;
  onViewCandidate?: (candidate: Candidate) => void;
  pipelineNotifications?: PipelineNotification[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  candidates,
  clients,
  onNavigate,
  onSelectStatusFilter,
  onOpenNewCandidate,
  onOpenNewClient,
  onExportCsv,
  onOpenMatchWithRole,
  onViewCandidate,
  pipelineNotifications = [],
}) => {
  // Compute analytics dynamically
  const totalCandidates = candidates.length;
  const interviewingCount = candidates.filter((c) => c.status === 'INTERVIEWING').length;
  const offeredCount = candidates.filter((c) => c.status === 'OFFERED').length;
  const joinedCount = candidates.filter((c) => c.status === 'JOINED').length;
  const shortlistedCount = candidates.filter((c) => c.status === 'SHORTLISTED').length;
  const screeningCount = candidates.filter((c) => c.status === 'SCREENING').length;
  const sourcedCount = candidates.filter((c) => c.status === 'SOURCED').length;
  const rejectedCount = candidates.filter((c) => c.status === 'REJECTED').length;

  // Client stats dynamically computed
  const totalClients = clients.length;
  const uniqueIndustries = new Set(clients.map((c) => c.industry).filter(Boolean)).size;
  const activeClientsCount = clients.filter((c) => c.status === 'ACTIVE').length;

  const totalMandates = clients.reduce(
    (acc, client) => acc + (client.mandates ? client.mandates.length : 0),
    0
  );
  const totalOpenPositions = clients.reduce(
    (acc, client) =>
      acc +
      (client.mandates || []).reduce(
        (mAcc, m) => mAcc + Math.max(0, m.openPositions - m.filledPositions),
        0
      ),
    0
  );

  // Pipeline stages configuration with dynamic values
  const stages: {
    status: CandidateStatus;
    label: string;
    count: number;
    color: string;
    bgColor: string;
  }[] = [
    {
      status: 'SOURCED',
      label: 'Sourced',
      count: sourcedCount,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
    },
    {
      status: 'SCREENING',
      label: 'Screening',
      count: screeningCount,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      status: 'SHORTLISTED',
      label: 'Shortlisted',
      count: shortlistedCount,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
    },
    {
      status: 'INTERVIEWING',
      label: 'Interviewing',
      count: interviewingCount,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
    },
    {
      status: 'OFFERED',
      label: 'Offered',
      count: offeredCount,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
    },
    {
      status: 'JOINED',
      label: 'Joined',
      count: joinedCount,
      color: 'text-black',
      bgColor: 'bg-emerald-100',
    },
    {
      status: 'REJECTED',
      label: 'Archived / Rejected',
      count: rejectedCount,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
    },
  ];

  // Dynamic role distribution computed directly from live candidates
  const roleStats = useMemo(() => {
    const roleMap = new Map<string, { count: number; totalCtc: number }>();
    candidates.forEach((c) => {
      const role = c.role?.trim() || 'General Specialist';
      const curr = roleMap.get(role) || { count: 0, totalCtc: 0 };
      curr.count += 1;
      curr.totalCtc += c.expectedCtcLpa || 0;
      roleMap.set(role, curr);
    });

    return Array.from(roleMap.entries())
      .map(([role, data]) => ({
        role,
        count: data.count,
        avgCtc: data.count > 0 ? (data.totalCtc / data.count).toFixed(1) : '0.0',
        percentage: totalCandidates > 0 ? Math.round((data.count / totalCandidates) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [candidates, totalCandidates]);

  // Dynamic Live Activity Audit Trail from candidates and clients
  const recentActivities = useMemo(() => {
    interface ActivityItem {
      id: string;
      candidateId?: string;
      candidate?: Candidate;
      title: string;
      description: string;
      timeAgo: string;
      timestamp: number;
      badge: string;
      badgeColor: string;
      iconType: 'status' | 'client' | 'note' | 'mandate';
    }

    const items: ActivityItem[] = [];

    // 1. Gather all events from candidates' timelines
    candidates.forEach((cand) => {
      const timeline = cand.timeline || getOrGenerateCandidateTimeline(cand);
      timeline.forEach((ev) => {
        let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
        if (ev.toStatus === 'JOINED') {
          badgeColor = 'bg-emerald-100 text-black border-emerald-300 font-bold';
        } else if (ev.toStatus === 'OFFERED') {
          badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (ev.toStatus === 'INTERVIEWING') {
          badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
        } else if (ev.toStatus === 'SHORTLISTED') {
          badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
        } else if (ev.toStatus === 'REJECTED') {
          badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
        } else if (ev.type === 'SUBMISSION') {
          badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        } else if (ev.type === 'NOTE') {
          badgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
        }

        const t = ev.timestamp || (ev.date ? new Date(ev.date).getTime() : 0);
        items.push({
          id: ev.id || `${cand.id}-${t}`,
          candidateId: cand.id,
          candidate: cand,
          title: `${cand.name} (${cand.id})`,
          description: ev.description || ev.title,
          timeAgo: ev.date ? `${ev.date}${ev.time ? ` at ${ev.time}` : ''}` : 'Recently',
          timestamp: t,
          badge: ev.metaBadge || ev.toStatus || ev.type,
          badgeColor,
          iconType: ev.type === 'SUBMISSION' ? 'client' : ev.type === 'NOTE' ? 'note' : 'status',
        });
      });
    });

    // 2. Add client mandate events
    clients.forEach((cli) => {
      (cli.mandates || []).forEach((m) => {
        items.push({
          id: `cli-${cli.id}-man-${m.id}`,
          title: `${cli.name} Mandate: ${m.title}`,
          description: `Open requisition in ${m.department} (Budget: ₹${m.budgetLpa} LPA, ${m.openPositions} seats, ${m.location}).`,
          timeAgo: 'Active Mandate',
          timestamp: 100, // keep historical mandates present
          badge: 'Mandate',
          badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          iconType: 'mandate',
        });
      });
    });

    // Sort descending by timestamp (newest first)
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  }, [candidates, clients]);

  // Recent 4 updated candidates for quick roster
  const recentCandidatesRoster = useMemo(() => {
    return [...candidates].slice(0, 5);
  }, [candidates]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-950 tracking-tight">
            Overview & Metrics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time synchronization across {totalCandidates} candidates, {totalClients} client accounts, and {totalMandates} active mandates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenNewCandidate && (
            <button
              id="overview-quick-add-cand-btn"
              onClick={onOpenNewCandidate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black text-white hover:bg-neutral-800 rounded transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Candidate</span>
            </button>
          )}
          <button
            id="overview-nav-candidates-btn"
            onClick={() => onNavigate('candidates')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded transition cursor-pointer shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-gray-600" />
            <span>Search Pool</span>
          </button>
          <button
            id="overview-export-csv-btn"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 rounded transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-gray-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip - Dynamically Updated */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Candidate Pool</span>
            <Users className="w-4 h-4 text-gray-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-950">
            {totalCandidates}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold font-mono">100%</span> indexed & active
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Partner Clients</span>
            <Building2 className="w-4 h-4 text-gray-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-950">
            {totalClients}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Across {uniqueIndustries} {uniqueIndustries === 1 ? 'industry' : 'industries'} • {activeClientsCount} active
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Active Mandates</span>
            <Briefcase className="w-4 h-4 text-gray-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-950">
            {totalMandates}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {totalOpenPositions} open positions
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Interviewing</span>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-950">
            {interviewingCount}
          </div>
          <div className="text-[11px] text-purple-700 mt-1">
            {totalCandidates > 0 ? Math.round((interviewingCount / totalCandidates) * 100) : 0}% of active pipeline
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Offers Extended</span>
            <Award className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950">
            {offeredCount}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            Pending final candidate signoff
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs transition hover:border-gray-300">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider">Placed / Joined</span>
            <CheckCircle2 className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-bold font-mono text-gray-950">
            {joinedCount}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Successful talent placements
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Distribution - Auto-updated from candidate statuses */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">
              Pipeline Stage Funnel
            </h2>
            <p className="text-xs text-gray-500">
              Click any stage to filter the candidates table dynamically
            </p>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <span>Open Table View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {stages.map((stage) => {
            const percentage =
              totalCandidates > 0
                ? Math.round((stage.count / totalCandidates) * 100)
                : 0;
            return (
              <button
                key={stage.status}
                onClick={() => {
                  if (onSelectStatusFilter) {
                    onSelectStatusFilter(stage.status);
                  }
                  onNavigate('candidates');
                }}
                className="text-left border border-gray-200 hover:border-black rounded-lg p-3 transition bg-white hover:bg-gray-50/80 cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-gray-500 font-medium">
                    [{stage.status}]
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    {percentage}%
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-gray-950 mt-1">
                  {stage.count}
                </div>
                <div className="text-xs font-medium text-gray-700 mt-0.5 truncate">
                  {stage.label}
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-black h-full transition-all duration-300"
                    style={{ width: `${Math.max(percentage, stage.count > 0 ? 8 : 0)}%` }}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Middle Section: Client Mandates & Role Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Client Accounts & Live Mandates */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
                  Client Partner Mandates
                </h3>
                <p className="text-xs text-gray-500">
                  Open requisitions under active recruitment SLA • Auto-reflects client updates
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onOpenNewClient && (
                  <button
                    id="overview-quick-add-client-btn"
                    onClick={onOpenNewClient}
                    className="text-xs font-semibold px-2.5 py-1 bg-black text-white hover:bg-neutral-800 rounded flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Client</span>
                  </button>
                )}
                <button
                  onClick={() => onNavigate('clients')}
                  className="text-xs font-semibold text-gray-800 hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {clients.map((client) => {
                // Compute live active candidates submitted or assigned to this client
                const clientCandidates = candidates.filter(
                  (c) => c.client && c.client.toLowerCase() === client.name.toLowerCase()
                );
                const activeInPipeline = clientCandidates.filter((c) => c.status !== 'REJECTED').length;
                const joinedWithClient = clientCandidates.filter((c) => c.status === 'JOINED').length;
                const totalPlacementsCount = Math.max(client.totalPlacements, joinedWithClient);

                // Open positions across this client's mandates
                const openPositionsForClient = (client.mandates || []).reduce(
                  (acc, m) => acc + Math.max(0, m.openPositions - m.filledPositions),
                  0
                );

                return (
                  <div
                    key={client.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-black text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {client.logoText}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-950">
                            {client.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-700 rounded border border-gray-200">
                            {client.status}
                          </span>
                          {activeInPipeline > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200 flex items-center gap-1">
                              <UserCheck className="w-2.5 h-2.5" />
                              {activeInPipeline} in pipeline
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.industry} • Lead: {client.accountManager}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:border-l sm:border-gray-100 sm:pl-3">
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-gray-900">
                          {(client.mandates || []).length} Mandates ({openPositionsForClient} Open)
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {totalPlacementsCount} Placed
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('clients')}
                        className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-medium text-gray-800 transition cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {clients.length} hiring partner records</span>
            <button
              onClick={() => onNavigate('clients')}
              className="text-black font-semibold hover:underline cursor-pointer"
            >
              See all {totalMandates} open mandates →
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Role Breakdown & Live Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Target Role Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
                  Role Distribution
                </h3>
                <p className="text-xs text-gray-500">
                  Live supply across engineering & product specializations ({roleStats.length} roles)
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {roleStats.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">
                  No candidate records currently indexed.
                </div>
              ) : (
                roleStats.map((item) => (
                  <div
                    key={item.role}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-medium text-xs text-gray-900 truncate">
                        {item.role}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Avg CTC: ₹{item.avgCtc} LPA • {item.percentage}% of pool
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                        {item.count} cand.
                      </span>
                      {onOpenMatchWithRole && (
                        <button
                          onClick={() => onOpenMatchWithRole(item.role)}
                          title={`Filter candidates for ${item.role}`}
                          className="p-1 text-gray-400 hover:text-black rounded hover:bg-gray-200 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Real-time Audit Trail & Activity Feed */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
                  Pipeline Activity & Audit Trail
                </h3>
                <p className="text-xs text-gray-500">
                  Real-time notifications from hiring changes, candidate stages & client onboardings
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="space-y-3 text-xs max-h-[310px] overflow-y-auto pr-1">
              {pipelineNotifications && pipelineNotifications.length > 0 ? (
                pipelineNotifications.slice(0, 10).map((notif) => {
                  const targetCandidate = notif.targetCandidateId
                    ? candidates.find((c) => c.id === notif.targetCandidateId)
                    : undefined;

                  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (notif.statusBadge === 'JOINED' || notif.statusBadge === 'HIRED') {
                    badgeColor = 'bg-black text-white border-black';
                  } else if (notif.statusBadge === 'OFFERED' || notif.statusBadge === 'OFFER EXTENDED') {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (notif.statusBadge === 'CLIENT ONBOARDED' || notif.statusBadge === 'ONBOARDED') {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (notif.statusBadge === 'INTERVIEWING') {
                    badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  } else if (notif.category === 'MANDATE') {
                    badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  } else if (notif.statusBadge === 'REJECTED') {
                    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50/80 transition border border-gray-100"
                    >
                      <div className="mt-1 shrink-0">
                        {notif.category === 'CLIENT_ONBOARDING' || notif.category === 'MANDATE' ? (
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : notif.statusBadge === 'JOINED' || notif.statusBadge === 'OFFERED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Activity className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold text-gray-900 truncate">
                            {notif.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase shrink-0 font-medium ${badgeColor}`}
                          >
                            {notif.statusBadge}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2 text-[11px] leading-relaxed">
                          {notif.subtitle}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-mono">
                          <span>{notif.timeFormatted}</span>
                          {targetCandidate && onViewCandidate ? (
                            <button
                              onClick={() => onViewCandidate(targetCandidate)}
                              className="text-gray-600 hover:text-black underline flex items-center gap-0.5 cursor-pointer font-sans font-medium"
                            >
                              <span>Inspect Candidate</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ) : notif.category === 'CLIENT_ONBOARDING' || notif.category === 'MANDATE' ? (
                            <button
                              onClick={() => onNavigate('clients')}
                              className="text-gray-600 hover:text-black underline flex items-center gap-0.5 cursor-pointer font-sans font-medium"
                            >
                              <span>View Client</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : recentActivities.length === 0 ? (
                <div className="text-xs text-gray-400 py-4 text-center">
                  No activity events recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50/80 transition border border-gray-50"
                  >
                    <div className="mt-1 shrink-0">
                      <Activity className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-semibold text-gray-900 truncate">
                          {act.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase shrink-0 ${act.badgeColor}`}
                        >
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 text-[11px] leading-relaxed">
                        {act.description}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-mono">
                        <span>{act.timeAgo}</span>
                        {act.candidate && onViewCandidate && (
                          <button
                            onClick={() => onViewCandidate(act.candidate!)}
                            className="text-gray-600 hover:text-black underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Candidate Roster Strip - Instantly reflects candidate pool edits */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
              Recently Modified Candidate Records
            </h3>
            <p className="text-xs text-gray-500">
              Direct access to recent candidate pool profiles • Updates instantly when edited
            </p>
          </div>
          <button
            onClick={() => onNavigate('candidates')}
            className="text-xs font-semibold text-gray-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Pool ({candidates.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {recentCandidatesRoster.map((cand) => (
            <div
              key={cand.id}
              onClick={() => onViewCandidate && onViewCandidate(cand)}
              className="border border-gray-200 hover:border-black rounded-lg p-3 bg-white hover:bg-gray-50/50 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-gray-500 font-medium">
                    {cand.id}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase ${
                      cand.status === 'JOINED'
                        ? 'bg-emerald-100 text-black border border-emerald-300'
                        : cand.status === 'OFFERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : cand.status === 'INTERVIEWING'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : cand.status === 'SHORTLISTED'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : cand.status === 'SCREENING'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {cand.status}
                  </span>
                </div>
                <div className="font-bold text-sm text-gray-900 group-hover:text-black truncate">
                  {cand.name}
                </div>
                <div className="text-xs text-gray-600 truncate mt-0.5">
                  {cand.role}
                </div>
                <div className="text-[11px] text-gray-400 font-mono mt-1">
                  ₹{cand.expectedCtcLpa} LPA • {cand.experienceYears} yrs • {cand.location}
                </div>
              </div>

              {cand.client && (
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="truncate">Client: <strong className="text-gray-900">{cand.client}</strong></span>
                  <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
