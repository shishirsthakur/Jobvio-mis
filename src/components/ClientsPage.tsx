import React, { useState, useMemo } from 'react';
import {
  Building2,
  Briefcase,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  UserCheck,
  Award,
  AlertCircle,
  X,
  Send,
  Eye,
} from 'lucide-react';
import { Client, ClientMandate, Candidate } from '../types';

interface ClientsPageProps {
  clients: Client[];
  candidates: Candidate[];
  onAddClient: (newClient: Client) => void;
  onAddMandate: (clientId: string, newMandate: ClientMandate) => void;
  onInspectCandidate: (candidateId: string) => void;
  onSubmitCandidateToClient: (candidate: Candidate, mandate: ClientMandate, client: Client) => void;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  candidates,
  onAddClient,
  onAddMandate,
  onInspectCandidate,
  onSubmitCandidateToClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected mandate for live candidate matching modal/drawer
  const [matchingMandate, setMatchingMandate] = useState<{
    client: Client;
    mandate: ClientMandate;
  } | null>(null);

  // Modals for adding client / mandate
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddMandateModalOpen, setIsAddMandateModalOpen] = useState<string | null>(null); // holds clientId

  // Form states for adding client
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('FinTech / Payments');
  const [newClientHq, setNewClientHq] = useState('');
  const [newClientManager, setNewClientManager] = useState('Aditya Vardhan');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTier, setNewClientTier] = useState<'Tier 1 Exclusive' | 'Preferred Partner' | 'Standard Retainer'>('Preferred Partner');

  // Form states for adding mandate
  const [mandateTitle, setMandateTitle] = useState('React Developer');
  const [mandateDept, setMandateDept] = useState('');
  const [mandateLocation, setMandateLocation] = useState('Bangalore');
  const [mandateMinExp, setMandateMinExp] = useState(3);
  const [mandateMaxExp, setMandateMaxExp] = useState(7);
  const [mandateBudget, setMandateBudget] = useState(25);
  const [mandateSkills, setMandateSkills] = useState('React, TypeScript, Redux');
  const [mandateOpenings, setMandateOpenings] = useState(1);
  const [mandateUrgency, setMandateUrgency] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('HIGH');

  // Unique industries
  const industries = useMemo(() => {
    const set = new Set(clients.map((c) => c.industry));
    return ['ALL', ...Array.from(set)];
  }, [clients]);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        client.name.toLowerCase().includes(q) ||
        client.accountManager.toLowerCase().includes(q) ||
        client.industry.toLowerCase().includes(q) ||
        client.mandates.some((m) => m.title.toLowerCase().includes(q) || m.targetSkills.some((s) => s.toLowerCase().includes(q)));

      const matchesIndustry = industryFilter === 'ALL' || client.industry === industryFilter;
      const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [clients, searchQuery, industryFilter, statusFilter]);

  // Compute matches for the active mandate
  const matchedCandidates = useMemo(() => {
    if (!matchingMandate) return [];
    const { mandate } = matchingMandate;

    return candidates
      .map((candidate) => {
        let score = 0;

        // Role title match
        const roleLower = candidate.role.toLowerCase();
        const targetLower = mandate.title.toLowerCase();
        if (roleLower.includes(targetLower) || targetLower.includes(roleLower)) {
          score += 40;
        }

        // Skills match
        const requiredSkillsLower = mandate.targetSkills.map((s) => s.toLowerCase());
        const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase());
        const matchingSkills = candidateSkillsLower.filter((s) =>
          requiredSkillsLower.some((req) => req.includes(s) || s.includes(req))
        );
        const skillMatchRatio =
          requiredSkillsLower.length > 0
            ? matchingSkills.length / requiredSkillsLower.length
            : 0;
        score += Math.round(skillMatchRatio * 35);

        // Experience match
        if (
          candidate.experienceYears >= mandate.experienceMinYears &&
          candidate.experienceYears <= mandate.experienceMaxYears + 2
        ) {
          score += 15;
        } else if (candidate.experienceYears >= mandate.experienceMinYears - 1) {
          score += 8;
        }

        // Budget match
        if (candidate.expectedCtcLpa <= mandate.budgetLpa) {
          score += 10;
        } else if (candidate.expectedCtcLpa <= mandate.budgetLpa * 1.1) {
          score += 5;
        }

        return {
          candidate,
          matchScore: Math.min(score, 98),
          matchingSkills,
        };
      })
      .filter((item) => item.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [matchingMandate, candidates]);

  // Submit client form
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const initials = newClientName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created: Client = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      name: newClientName.trim(),
      logoText: initials || 'CL',
      industry: newClientIndustry,
      headquarters: newClientHq || 'Bangalore, India',
      accountManager: newClientManager,
      contactEmail: newClientEmail || `hiring@${newClientName.toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: newClientPhone || '+91 80 4000 1000',
      status: 'ACTIVE',
      activeMandatesCount: 0,
      totalPlacements: 0,
      avgClosureDays: 20,
      contractTier: newClientTier,
      mandates: [],
    };

    onAddClient(created);
    setIsAddClientModalOpen(false);
    setNewClientName('');
    setNewClientHq('');
    setNewClientEmail('');
    setNewClientPhone('');
  };

  // Submit mandate form
  const handleCreateMandateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddMandateModalOpen) return;

    const skillsArr = mandateSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newMandate: ClientMandate = {
      id: `MAN-${Date.now().toString().slice(-4)}`,
      title: mandateTitle,
      department: mandateDept || 'Engineering Pod',
      location: mandateLocation,
      experienceMinYears: mandateMinExp,
      experienceMaxYears: mandateMaxExp,
      budgetLpa: mandateBudget,
      targetSkills: skillsArr.length ? skillsArr : ['React', 'TypeScript'],
      openPositions: mandateOpenings,
      filledPositions: 0,
      status: 'OPEN',
      urgency: mandateUrgency,
    };

    onAddMandate(isAddMandateModalOpen, newMandate);
    setIsAddMandateModalOpen(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-950 tracking-tight">
            Client Directory & Mandate Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-add-client-modal"
            onClick={() => setIsAddClientModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-black text-white hover:bg-neutral-800 rounded transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client Account</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            id="clients-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter clients, roles, skills, or account manager..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-mono text-[10px] uppercase font-semibold text-gray-400">Industry:</span>
            <select
              id="clients-industry-select"
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-black"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === 'ALL' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="font-mono text-[10px] uppercase font-semibold text-gray-400">Status:</span>
            <select
              id="clients-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:border-black"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="STRATEGIC">Strategic</option>
              <option value="ONBOARDING">Onboarding</option>
            </select>
          </div>

          {(searchQuery || industryFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIndustryFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Client Accounts Grid */}
      <div className="space-y-6">
        {filteredClients.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500 font-mono text-xs">
            [NO CLIENT ACCOUNTS MATCH CURRENT QUERY]
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs"
            >
              {/* Client Header Banner */}
              <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-black text-white font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                    {client.logoText}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-gray-950">
                        {client.name}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                          client.status === 'STRATEGIC'
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : client.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {client.status}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white text-gray-600 rounded border border-gray-200">
                        {client.contractTier}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {client.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {client.headquarters}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {client.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:border-l sm:border-gray-200 sm:pl-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Account Lead</div>
                    <div className="font-semibold text-xs text-gray-900">
                      {client.accountManager}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {client.totalPlacements} Hires Placed
                    </div>
                  </div>

                  <button
                    id={`btn-add-mandate-${client.id}`}
                    onClick={() => setIsAddMandateModalOpen(client.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-gray-300 rounded hover:bg-white bg-gray-50 text-gray-800 transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Mandate</span>
                  </button>
                </div>
              </div>

              {/* Client Mandates List */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                    Active Hiring Mandates ({client.mandates.length})
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Target SLA: {client.avgClosureDays} days
                  </span>
                </div>

                {client.mandates.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400 font-mono">
                    [No active mandates open for this client. Click "Add Mandate" above.]
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {client.mandates.map((mandate) => (
                      <div
                        key={mandate.id}
                        className="border border-gray-200 rounded-lg p-3.5 bg-white hover:border-black transition flex flex-col justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-gray-400">
                                  {mandate.id}
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                    mandate.urgency === 'HIGH'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                  }`}
                                >
                                  [{mandate.urgency}]
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-gray-950 mt-0.5">
                                {mandate.title}
                              </h4>
                              <div className="text-xs text-gray-500">
                                {mandate.department} • {mandate.location}
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                                mandate.status === 'FILLED'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : mandate.status === 'OFFERED'
                                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                                  : 'bg-gray-50 text-gray-800 border-gray-200'
                              }`}
                            >
                              [{mandate.status}]
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-2.5 border-t border-gray-100">
                            <div>
                              <span className="text-gray-400 block text-[10px]">Experience</span>
                              <span className="font-mono font-medium text-gray-800">
                                {mandate.experienceMinYears} - {mandate.experienceMaxYears} Yrs
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px]">Budget Cap</span>
                              <span className="font-mono font-medium text-gray-900">
                                ₹{mandate.budgetLpa.toFixed(1)} LPA
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5">
                            <span className="text-[10px] text-gray-400 block mb-1">Target Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {mandate.targetSkills.map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-50 border border-gray-200 text-gray-700 rounded"
                                >
                                  [{sk}]
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-[11px] text-gray-500 font-mono">
                            Openings: <span className="font-bold text-gray-900">{mandate.openPositions - mandate.filledPositions}</span> of {mandate.openPositions}
                          </div>

                          <button
                            id={`btn-match-mandate-${mandate.id}`}
                            onClick={() => setMatchingMandate({ client, mandate })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-black text-white hover:bg-neutral-800 rounded transition cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Run Candidate Match</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Candidate Matching Drawer / Popover Modal */}
      {matchingMandate && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Matching Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] px-1.5 py-0.2 bg-black text-white rounded">
                    MATCH ENGINE
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    {matchingMandate.client.name} • {matchingMandate.mandate.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-950">
                  Candidate Matches for [{matchingMandate.mandate.title}]
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Target Budget: ₹{matchingMandate.mandate.budgetLpa} LPA • Exp: {matchingMandate.mandate.experienceMinYears}-{matchingMandate.mandate.experienceMaxYears} Yrs • Skills: {matchingMandate.mandate.targetSkills.join(', ')}
                </p>
              </div>

              <button
                onClick={() => setMatchingMandate(null)}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-white text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matching Candidates List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                <span className="font-mono font-semibold text-gray-700">
                  Discovered {matchedCandidates.length} Qualified Profiles
                </span>
                <span className="text-gray-400 font-mono">
                  Ranked by Multi-Dimensional Fit Score
                </span>
              </div>

              {matchedCandidates.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-gray-400">
                  [NO POOL CANDIDATES PASS THE MINIMUM QUALIFICATION THRESHOLD]
                </div>
              ) : (
                matchedCandidates.map(({ candidate, matchScore, matchingSkills }) => (
                  <div
                    key={candidate.id}
                    className="border border-gray-200 rounded-lg p-3.5 hover:border-black transition bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      {candidate.avatarUrl ? (
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {candidate.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-900">
                            {candidate.id}
                          </span>
                          <span className="font-bold text-sm text-gray-950">
                            {candidate.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold">
                            {matchScore}% FIT
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5">
                          {candidate.role} • {candidate.experienceYears} Yrs Exp • {candidate.location}
                        </div>

                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          <span className="text-[10px] text-gray-400 font-mono">Matched:</span>
                          {matchingSkills.map((sk) => (
                            <span
                              key={sk}
                              className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 text-emerald-900 rounded font-medium"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-gray-950">
                          ₹{candidate.expectedCtcLpa.toFixed(1)} LPA
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          Status: [{candidate.status}]
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setMatchingMandate(null);
                            onInspectCandidate(candidate.id);
                          }}
                          className="px-2.5 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 font-medium text-gray-800 transition cursor-pointer flex items-center gap-1"
                          title="View complete dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                        <button
                          onClick={() => {
                            onSubmitCandidateToClient(candidate, matchingMandate.mandate, matchingMandate.client);
                          }}
                          className="px-2.5 py-1 text-xs bg-black text-white hover:bg-neutral-800 rounded font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Submit candidate dossier directly to client account"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Matching algorithm factors title, skill intersection, experience band, and budget tolerance.</span>
              <button
                onClick={() => setMatchingMandate(null)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-800 hover:bg-gray-100 font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
                  Create Client Account
                </h3>
                <p className="text-xs text-gray-500">
                  Register new corporate hiring partner in Jobvio MIS
                </p>
              </div>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Swiggy Technologies"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Industry Vertical</label>
                  <input
                    type="text"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    placeholder="e.g. FinTech / SaaS"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Headquarters</label>
                  <input
                    type="text"
                    value={newClientHq}
                    onChange={(e) => setNewClientHq(e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Account Lead</label>
                  <select
                    value={newClientManager}
                    onChange={(e) => setNewClientManager(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Aditya Vardhan">Aditya Vardhan</option>
                    <option value="Neha Sharma">Neha Sharma</option>
                    <option value="Rahul Mukherjee">Rahul Mukherjee</option>
                    <option value="Priya Kulkarni">Priya Kulkarni</option>
                    <option value="Daniel Phillips">Daniel Phillips</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contract Tier</label>
                  <select
                    value={newClientTier}
                    onChange={(e) => setNewClientTier(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Tier 1 Exclusive">Tier 1 Exclusive</option>
                    <option value="Preferred Partner">Preferred Partner</option>
                    <option value="Standard Retainer">Standard Retainer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Recruitment Contact Email</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="hiring@company.com"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 80 4000 1000"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-black text-white rounded font-semibold hover:bg-neutral-800 transition cursor-pointer"
                >
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Mandate Modal */}
      {isAddMandateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider font-mono">
                  Open New Job Mandate
                </h3>
                <p className="text-xs text-gray-500">
                  Define requisition requirements and target skills
                </p>
              </div>
              <button
                onClick={() => setIsAddMandateModalOpen(null)}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-gray-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMandateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Job Title *</label>
                  <select
                    value={mandateTitle}
                    onChange={(e) => setMandateTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  >
                    <option value="React Developer">React Developer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={mandateDept}
                    onChange={(e) => setMandateDept(e.target.value)}
                    placeholder="e.g. Core Platform UI"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Location</label>
                  <select
                    value={mandateLocation}
                    onChange={(e) => setMandateLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Min Exp (Yrs)</label>
                  <input
                    type="number"
                    value={mandateMinExp}
                    onChange={(e) => setMandateMinExp(Number(e.target.value))}
                    min={0}
                    max={20}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Max Exp (Yrs)</label>
                  <input
                    type="number"
                    value={mandateMaxExp}
                    onChange={(e) => setMandateMaxExp(Number(e.target.value))}
                    min={1}
                    max={25}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Budget Cap (₹ LPA)</label>
                  <input
                    type="number"
                    value={mandateBudget}
                    onChange={(e) => setMandateBudget(Number(e.target.value))}
                    step="0.5"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Open Positions</label>
                  <input
                    type="number"
                    value={mandateOpenings}
                    onChange={(e) => setMandateOpenings(Number(e.target.value))}
                    min={1}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Urgency</label>
                  <select
                    value={mandateUrgency}
                    onChange={(e) => setMandateUrgency(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black bg-white"
                  >
                    <option value="HIGH">High Urgency</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="NORMAL">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Target Skills (comma separated) *</label>
                <input
                  type="text"
                  required
                  value={mandateSkills}
                  onChange={(e) => setMandateSkills(e.target.value)}
                  placeholder="React, TypeScript, Next.js, Redux"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMandateModalOpen(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 font-medium text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-black text-white rounded font-semibold hover:bg-neutral-800 transition cursor-pointer"
                >
                  Save Mandate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
