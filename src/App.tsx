import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CANDIDATES } from './data/initialCandidates';
import { INITIAL_CLIENTS } from './data/clientsData';
import { Candidate, FilterState, CandidateStatus, CandidateWorkflowStatus, ActivePage, Client, ClientMandate, CandidateTimelineEvent, PipelineNotification } from './types';
import { getOrGenerateCandidateTimeline } from './utils/timelineUtils';
import {
  createHiringStatusNotification,
  createNewCandidateNotification,
  createClientOnboardingNotification,
  createMandateNotification,
  createCandidateSubmissionNotification,
  createBulkHiringNotification,
  generateSeedNotifications,
} from './utils/notificationUtils';
import { Header } from './components/Header';
import { FilterEngine } from './components/FilterEngine';
import { CandidatesTable } from './components/CandidatesTable';
import { CandidateModal } from './components/CandidateModal';
import { NewCandidateModal } from './components/NewCandidateModal';
import { NewClientModal } from './components/NewClientModal';
import { EmailModal } from './components/EmailModal';
import { CommandPalette } from './components/CommandPalette';
import { ImportDataModal } from './components/ImportDataModal';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ClientsPage } from './components/ClientsPage';
import { LoginPage } from './components/LoginPage';
import { auth, onAuthStateChanged, firebaseSignOut, User } from './firebase';
import {
  subscribeToCandidates,
  subscribeToClients,
  saveCandidateToFirestore,
  deleteCandidateFromFirestore,
  saveClientToFirestore,
} from './services/firestoreData';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'candidates_filter_engine_data_v1';
const STORAGE_CLIENTS_KEY = 'clients_filter_engine_data_v1';
const STORAGE_PIPELINE_NOTIFICATIONS_KEY = 'jobvio_pipeline_notifications_v2';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  targetRole: 'ALL',
  location: 'ALL',
  maxExpectedCtc: 44, // Matches the screenshot ₹44 LPA exactly
  status: 'ALL',
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<
    User | { email?: string | null; displayName?: string | null; uid?: string } | null
  >(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor auth state changes
  useEffect(() => {
    const isDemo = localStorage.getItem('jobvio_demo_session') === 'true';
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthLoading(false);
      } else if (isDemo) {
        setCurrentUser({
          email: 'recruiter@jobvio.com',
          displayName: 'Demo Recruiter (Admin)',
          uid: 'demo-recruiter-uid',
        });
        setAuthLoading(false);
      } else {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Candidate pool state with local storage fallback
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CANDIDATES;
  });

  // Active top-level page: overview, candidates, or clients
  const [activePage, setActivePage] = useState<ActivePage>('overview');

  // Client accounts and mandates state with local storage fallback
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CLIENTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

  // Listen to Firestore real-time updates when authenticated with Firebase
  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubCandidates = subscribeToCandidates((remoteCandidates) => {
      if (remoteCandidates && remoteCandidates.length > 0) {
        setCandidates(remoteCandidates);
      }
    });
    const unsubClients = subscribeToClients((remoteClients) => {
      if (remoteClients && remoteClients.length > 0) {
        setClients(remoteClients);
      }
    });
    return () => {
      unsubCandidates();
      unsubClients();
    };
  }, [currentUser]);

  // Filters state
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isCandidateModalEditMode, setIsCandidateModalEditMode] = useState(false);
  const [isNewCandidateModalOpen, setIsNewCandidateModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Pipeline Activity Notifications state with local storage fallback
  const [pipelineNotifications, setPipelineNotifications] = useState<PipelineNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PIPELINE_NOTIFICATIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return generateSeedNotifications(INITIAL_CANDIDATES, INITIAL_CLIENTS);
  });

  // Save to localStorage when pipelineNotifications change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PIPELINE_NOTIFICATIONS_KEY, JSON.stringify(pipelineNotifications));
    } catch (e) {
      console.error('Failed to persist pipeline notifications', e);
    }
  }, [pipelineNotifications]);

  const addPipelineNotification = (notif: PipelineNotification) => {
    setPipelineNotifications((prev) => [notif, ...prev]);
  };

  const handleClearNotifications = () => {
    setPipelineNotifications([]);
    try {
      localStorage.removeItem(STORAGE_PIPELINE_NOTIFICATIONS_KEY);
    } catch {
      // ignore
    }
  };

  const handleMarkNotificationsAsRead = () => {
    setPipelineNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleSelectNotification = (notif: PipelineNotification) => {
    setPipelineNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isUnread: false } : n))
    );
    if (notif.targetCandidateId) {
      const target = candidates.find((c) => c.id === notif.targetCandidateId);
      if (target) {
        setActiveCandidate(target);
        setIsCandidateModalOpen(true);
        setIsCandidateModalEditMode(false);
      } else {
        setActivePage('candidates');
      }
    } else if (notif.targetClientId) {
      setActivePage('clients');
    }
  };

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Save to localStorage when candidates change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }, [candidates]);

  // Save to localStorage when clients change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Failed to persist clients to localStorage', e);
    }
  }, [clients]);

  // Client management handlers
  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    saveClientToFirestore(newClient).catch((err) => console.warn('Firestore client save error:', err));
    
    // Send notification in the pipeline activity section
    const notif = createClientOnboardingNotification(newClient);
    addPipelineNotification(notif);

    showToast(`Added client partner: ${newClient.name}`);
  };

  const handleAddMandate = (clientId: string, newMandate: ClientMandate) => {
    let clientName = 'Client Partner';
    setClients((prev) =>
      prev.map((cli) => {
        if (cli.id === clientId) {
          clientName = cli.name;
          const updated: Client = {
            ...cli,
            activeMandatesCount: cli.activeMandatesCount + 1,
            mandates: [newMandate, ...cli.mandates],
          };
          saveClientToFirestore(updated).catch((err) => console.warn('Firestore mandate save error:', err));
          return updated;
        }
        return cli;
      })
    );

    // Send notification in the pipeline activity section
    const notif = createMandateNotification(clientName, newMandate, clientId);
    addPipelineNotification(notif);

    showToast(`Added job mandate: [${newMandate.title}]`);
  };

  const handleSubmitCandidateToClient = (
    candidate: Candidate,
    mandate: ClientMandate,
    client: Client
  ) => {
    const dateFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newSubmissionEvent: CandidateTimelineEvent = {
      id: `evt-submit-${Date.now()}`,
      type: 'SUBMISSION',
      title: `Submitted to ${client.name}`,
      description: `Submitted for mandate: ${mandate.title} (${mandate.department}), budget ₹${mandate.budgetLpa} LPA`,
      date: dateFormatted,
      time: timeFormatted,
      timestamp: Date.now(),
      author: 'Account Manager',
      client: client.name,
      fromStatus: candidate.status,
      toStatus: candidate.status === 'SOURCED' ? 'SCREENING' : candidate.status,
      metaBadge: 'Submission',
    };

    const currentTimeline = candidate.timeline || getOrGenerateCandidateTimeline(candidate);
    const updatedCandidate: Candidate = {
      ...candidate,
      client: client.name,
      timeline: [newSubmissionEvent, ...currentTimeline],
      notes: [
        `Submitted for ${mandate.title} at ${client.name} (${dateFormatted})`,
        ...(candidate.notes || []),
      ],
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidate.id ? updatedCandidate : c))
    );
    saveCandidateToFirestore(updatedCandidate).catch((err) =>
      console.warn('Firestore candidate submit error:', err)
    );

    // Send notification in the pipeline activity section
    const notif = createCandidateSubmissionNotification(candidate, client, mandate);
    addPipelineNotification(notif);

    showToast(`Submitted ${candidate.name} to ${client.name} for [${mandate.title}]!`, 'success');
  };

  const handleViewCandidateById = (id: string) => {
    const c = candidates.find((cand) => cand.id === id);
    if (c) {
      setActiveCandidate(c);
      setIsCandidateModalEditMode(false);
      setIsCandidateModalOpen(true);
    }
  };

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute unique roles and locations for filters
  const availableRoles = useMemo(() => {
    const defaultRoles = [
      'React Developer',
      'UI/UX Designer',
      'Backend Engineer',
      'Data Analyst',
      'Product Manager',
    ];
    const poolRoles = Array.from(new Set(candidates.map((c) => c.role)));
    return Array.from(new Set([...defaultRoles, ...poolRoles]));
  }, [candidates]);

  const availableLocations = useMemo(() => {
    const defaultLocations = [
      'Bangalore',
      'Delhi NCR',
      'Pune',
      'Mumbai',
      'Hyderabad',
      'Raipur',
      'Remote',
    ];
    const poolLocations = Array.from(new Set(candidates.map((c) => c.location)));
    return Array.from(new Set([...defaultLocations, ...poolLocations]));
  }, [candidates]);

  // Filter candidates according to all criteria
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesRole = c.role.toLowerCase().includes(q);
        const matchesSkill = c.skills.some((s) => s.toLowerCase().includes(q));
        const matchesLocation = c.location.toLowerCase().includes(q);

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesId &&
          !matchesRole &&
          !matchesSkill &&
          !matchesLocation
        ) {
          return false;
        }
      }

      // 2. Target Role
      if (filters.targetRole !== 'ALL' && c.role !== filters.targetRole) {
        return false;
      }

      // 3. Location
      if (filters.location !== 'ALL' && c.location !== filters.location) {
        return false;
      }

      // 4. Max Expected CTC
      if (c.expectedCtcLpa > filters.maxExpectedCtc) {
        return false;
      }

      // 5. Status
      if (filters.status !== 'ALL' && c.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [candidates, filters]);

  // Next candidate ID generator
  const nextCandidateId = useMemo(() => {
    const maxNum = candidates.reduce((max, c) => {
      const match = c.id.match(/CAN-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 903);
    return `CAN-${maxNum + 1}`;
  }, [candidates]);

  // Filter management
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    showToast('Filters reset to default values', 'info');
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredCandidates.map((c) => c.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // CRUD Actions
  const handleViewCandidate = (candidate: Candidate) => {
    setActiveCandidate(candidate);
    setIsCandidateModalEditMode(false);
    setIsCandidateModalOpen(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setActiveCandidate(candidate);
    setIsCandidateModalEditMode(true);
    setIsCandidateModalOpen(true);
  };

  const handleUpdateCandidate = (updated: Candidate) => {
    let candidateToSave = updated;
    const previous = candidates.find((c) => c.id === updated.id);
    const existingTimeline = updated.timeline || (previous ? getOrGenerateCandidateTimeline(previous) : []);
    const now = new Date();

    if (previous && previous.status !== updated.status) {
      const newEvent: CandidateTimelineEvent = {
        id: `evt-status-${Date.now()}`,
        type: 'STATUS_CHANGE',
        title: `Stage Changed to ${updated.status}`,
        description: `Status transitioned from [${previous.status}] to [${updated.status}].`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        author: 'Talent Desk Lead',
        fromStatus: previous.status,
        toStatus: updated.status,
        client: updated.client || previous.client,
        metaBadge: updated.status,
      };
      candidateToSave = {
        ...updated,
        timeline: [newEvent, ...existingTimeline],
      };
    } else if (
      previous &&
      (previous.role !== updated.role ||
        previous.expectedCtcLpa !== updated.expectedCtcLpa ||
        previous.client !== updated.client)
    ) {
      const newEvent: CandidateTimelineEvent = {
        id: `evt-edit-${Date.now()}`,
        type: 'NOTE',
        title: `Profile Record Updated`,
        description: `Updated role to ${updated.role}, CTC to ₹${updated.expectedCtcLpa} LPA${
          updated.client ? `, Client: ${updated.client}` : ''
        }.`,
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        author: 'Talent Desk Lead',
        fromStatus: updated.status,
        toStatus: updated.status,
        client: updated.client || previous.client,
        metaBadge: 'Profile Updated',
      };
      candidateToSave = {
        ...updated,
        timeline: [newEvent, ...existingTimeline],
      };
    }

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateToSave.id ? candidateToSave : c))
    );
    setActiveCandidate(candidateToSave);
    saveCandidateToFirestore(candidateToSave).catch((err) =>
      console.warn('Firestore candidate save error:', err)
    );

    // Send notification in the pipeline activity section
    if (previous && previous.status !== updated.status) {
      const notif = createHiringStatusNotification(candidateToSave, previous.status);
      addPipelineNotification(notif);
    } else {
      const notif = createHiringStatusNotification(candidateToSave);
      addPipelineNotification(notif);
    }

    showToast(`Updated candidate profile: ${candidateToSave.name}`);
  };

  const handleStatusChange = (candidate: Candidate, newStatus: CandidateWorkflowStatus) => {
    if (candidate.status === newStatus) return;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newEvent: CandidateTimelineEvent = {
      id: `evt-status-${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: `Stage Changed: ${newStatus}`,
      description: `Candidate stage updated from [${candidate.status}] to [${newStatus}].`,
      date: dateFormatted,
      time: timeFormatted,
      timestamp: Date.now(),
      author: 'Recruiter Desk',
      fromStatus: candidate.status,
      toStatus: newStatus,
      client: candidate.client,
      metaBadge: newStatus,
    };

    const existingTimeline = candidate.timeline || getOrGenerateCandidateTimeline(candidate);
    const updatedCandidate: Candidate = {
      ...candidate,
      status: newStatus,
      timeline: [newEvent, ...existingTimeline],
    };

    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
    );
    if (activeCandidate && activeCandidate.id === updatedCandidate.id) {
      setActiveCandidate(updatedCandidate);
    }
    saveCandidateToFirestore(updatedCandidate).catch((err) =>
      console.warn('Firestore candidate status error:', err)
    );

    // Send notification in the pipeline activity section
    const notif = createHiringStatusNotification(updatedCandidate, candidate.status);
    addPipelineNotification(notif);

    showToast(`${candidate.name} transitioned to [${newStatus}]`);
  };

  const handleBulkStatusChange = (newStatus: CandidateWorkflowStatus) => {
    if (selectedIds.length === 0) return;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setCandidates((prev) =>
      prev.map((c) => {
        if (selectedIds.includes(c.id)) {
          const existingTimeline = c.timeline || getOrGenerateCandidateTimeline(c);
          const newEvent: CandidateTimelineEvent = {
            id: `evt-bulk-${Date.now()}-${c.id}`,
            type: 'STATUS_CHANGE',
            title: `Bulk Stage Transition: ${newStatus}`,
            description: `Batch status updated from [${c.status}] to [${newStatus}].`,
            date: dateFormatted,
            time: timeFormatted,
            timestamp: Date.now(),
            author: 'Talent Lead',
            fromStatus: c.status,
            toStatus: newStatus,
            client: c.client,
            metaBadge: newStatus,
          };
          const updated: Candidate = {
            ...c,
            status: newStatus,
            timeline: [newEvent, ...existingTimeline],
          };
          saveCandidateToFirestore(updated).catch((err) =>
            console.warn('Firestore bulk save error:', err)
          );
          return updated;
        }
        return c;
      })
    );

    // Send notification in the pipeline activity section
    const notif = createBulkHiringNotification(selectedIds.length, newStatus);
    addPipelineNotification(notif);

    showToast(`Updated ${selectedIds.length} candidate(s) to [${newStatus}]`);
  };

  const handleDeleteCandidate = (candidate: Candidate) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${candidate.name} (${candidate.id}) from the candidate pool?`
      )
    ) {
      setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      setSelectedIds((prev) => prev.filter((id) => id !== candidate.id));
      deleteCandidateFromFirestore(candidate.id).catch((err) =>
        console.warn('Firestore candidate delete error:', err)
      );
      showToast(`Removed candidate: ${candidate.name}`, 'info');
    }
  };

  const handleAddCandidate = (newCandidate: Candidate) => {
    const now = new Date();
    const candidateWithTimeline: Candidate = {
      ...newCandidate,
      timeline:
        newCandidate.timeline && newCandidate.timeline.length > 0
          ? newCandidate.timeline
          : [
              {
                id: `evt-created-${Date.now()}`,
                type: 'CREATED',
                title: 'Candidate Profile Sourced',
                description: `Added ${newCandidate.name} to talent pool for ${newCandidate.role} (${newCandidate.experienceYears} yrs exp, ₹${newCandidate.expectedCtcLpa} LPA).`,
                date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now(),
                author: 'Talent Acquisition Desk',
                toStatus: newCandidate.status,
                metaBadge: 'New Candidate',
              },
            ],
    };
    setCandidates((prev) => [candidateWithTimeline, ...prev]);
    saveCandidateToFirestore(candidateWithTimeline).catch((err) =>
      console.warn('Firestore candidate add error:', err)
    );

    // Send notification in the pipeline activity section
    const notif = createNewCandidateNotification(candidateWithTimeline);
    addPipelineNotification(notif);

    showToast(`Added candidate: ${candidateWithTimeline.name} (${candidateWithTimeline.id})`);
  };

  // Bulk actions
  const selectedCandidates = useMemo(() => {
    return candidates.filter((c) => selectedIds.includes(c.id));
  }, [candidates, selectedIds]);

  const handleExportCsv = () => {
    const targetCandidates =
      selectedCandidates.length > 0 ? selectedCandidates : filteredCandidates;

    if (targetCandidates.length === 0) {
      showToast('No candidates available to export', 'error');
      return;
    }

    const headers = [
      'ID',
      'Candidate Name',
      'Email',
      'Phone',
      'Target Role',
      'Experience (Years)',
      'Expected CTC (LPA)',
      'Location',
      'Skills Matrix',
      'Status',
      'Current Company',
      'Notice Period',
    ];

    const rows = targetCandidates.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${c.role.replace(/"/g, '""')}"`,
      c.experienceYears.toString(),
      c.expectedCtcLpa.toString(),
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.skills.join(', ').replace(/"/g, '""')}"`,
      c.status,
      `"${(c.currentCompany || '').replace(/"/g, '""')}"`,
      `"${(c.noticePeriod || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `candidates_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Exported ${targetCandidates.length} candidate record(s) to CSV`,
      'success'
    );
  };

  // Import data handler (replace or append)
  const handleImportData = (newCandidates: Candidate[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setCandidates(newCandidates);
      setSelectedIds([]);
      setFilters(DEFAULT_FILTERS);
      showToast(`Loaded ${newCandidates.length} candidate records into database`, 'success');
    } else {
      // Append mode: merge avoiding duplicate IDs
      setCandidates((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const toAdd = newCandidates.filter((c) => !existingIds.has(c.id));
        return [...prev, ...toAdd];
      });
      showToast(`Appended candidate records to database`, 'success');
    }
  };

  // Reset demo data to match exact screenshot state
  const handleResetToDemoData = () => {
    setCandidates(INITIAL_CANDIDATES);
    setSelectedIds([]);
    setFilters(DEFAULT_FILTERS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Database reset to official reference state (12 candidates)', 'info');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-xs text-gray-500 font-mono">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span>Authenticating Jobvio Enterprise Session...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginPage
        onSuccess={(demoUser) => {
          if (demoUser) {
            setCurrentUser(demoUser);
          }
          showToast('Welcome to Jobvio enterprise cloud portal.');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Top Header */}
      <Header
        activePage={activePage}
        onPageChange={setActivePage}
        candidateCount={candidates.length}
        clientCount={clients.length}
        onOpenNewCandidate={() => setIsNewCandidateModalOpen(true)}
        onOpenNewClient={() => setIsNewClientModalOpen(true)}
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => handleFilterChange({ searchQuery: query })}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenImportData={() => setIsImportModalOpen(true)}
        onTriggerToast={showToast}
        currentUser={currentUser}
        pipelineNotifications={pipelineNotifications}
        onClearNotifications={handleClearNotifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        onSelectNotification={handleSelectNotification}
        onSignOut={async () => {
          localStorage.removeItem('jobvio_demo_session');
          try {
            await firebaseSignOut(auth);
          } catch {
            // ignore
          }
          setCurrentUser(null);
          showToast('Signed out of Jobvio.', 'info');
        }}
      />

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        {/* Page 1: Overview Dashboard */}
        {activePage === 'overview' && (
          <OverviewDashboard
            candidates={candidates}
            clients={clients}
            pipelineNotifications={pipelineNotifications}
            onNavigate={setActivePage}
            onSelectStatusFilter={(status) => {
              handleFilterChange({ status });
              setActivePage('candidates');
            }}
            onOpenNewCandidate={() => setIsNewCandidateModalOpen(true)}
            onOpenNewClient={() => setIsNewClientModalOpen(true)}
            onExportCsv={handleExportCsv}
            onOpenMatchWithRole={(role) => {
              handleFilterChange({ targetRole: role });
              setActivePage('candidates');
            }}
            onViewCandidate={handleViewCandidate}
          />
        )}

        {/* Page 2: Candidates Database & Filter Engine */}
        {activePage === 'candidates' && (
          <div className="space-y-6">
            {/* Multi Filter Engine */}
            <FilterEngine
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableRoles={availableRoles}
              availableLocations={availableLocations}
            />

            {/* Candidates Data Table */}
            <CandidatesTable
              candidates={filteredCandidates}
              totalCount={candidates.length}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onViewCandidate={handleViewCandidate}
              onEditCandidate={handleEditCandidate}
              onDeleteCandidate={handleDeleteCandidate}
              onEmailSelected={() => setIsEmailModalOpen(true)}
              onExportCsv={handleExportCsv}
              onOpenNewCandidate={() => setIsNewCandidateModalOpen(true)}
              onOpenImportData={() => setIsImportModalOpen(true)}
              onUpdateStatus={handleStatusChange}
              onBulkStatusChange={handleBulkStatusChange}
            />
          </div>
        )}

        {/* Page 3: Client Data & Hiring Mandates */}
        {activePage === 'clients' && (
          <ClientsPage
            clients={clients}
            candidates={candidates}
            onAddClient={handleAddClient}
            onAddMandate={handleAddMandate}
            onInspectCandidate={handleViewCandidateById}
            onSubmitCandidateToClient={handleSubmitCandidateToClient}
          />
        )}
      </main>

      {/* View / Edit Candidate Modal */}
      <CandidateModal
        candidate={activeCandidate}
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        onUpdate={handleUpdateCandidate}
        initialEditMode={isCandidateModalEditMode}
        availableClients={clients.map((c) => c.name)}
      />

      {/* Add New Candidate Modal */}
      <NewCandidateModal
        isOpen={isNewCandidateModalOpen}
        onClose={() => setIsNewCandidateModalOpen(false)}
        onAdd={handleAddCandidate}
        nextCandidateId={nextCandidateId}
        existingRoles={availableRoles}
        existingLocations={availableLocations}
      />

      {/* Add New Client Partner Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onAdd={handleAddClient}
      />

      {/* Email Selected Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        selectedCandidates={selectedCandidates}
        onSent={(count) => {
          showToast(`Dispatched message to ${count} candidate(s)`);
          setSelectedIds([]);
        }}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        candidates={candidates}
        onSelectCandidate={handleViewCandidate}
        onSelectStatusFilter={(status: CandidateStatus) => {
          handleFilterChange({ status });
          setActivePage('candidates');
        }}
        onResetFilters={handleResetFilters}
        onOpenNewCandidate={() => setIsNewCandidateModalOpen(true)}
        onOpenNewClient={() => setIsNewClientModalOpen(true)}
        onNavigate={setActivePage}
      />

      {/* Import / Reset Data Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-black text-white text-xs font-medium rounded shadow-lg animate-in slide-in-from-bottom-2 duration-150"
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
