export type ActivePage = 'overview' | 'candidates' | 'clients';

export type ScreenView =
  | 'candidates'
  | 'pipeline'
  | 'dossier'
  | 'analytics'
  | 'requisitions';

export type CandidateStatus =
  | 'ALL'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'JOINED'
  | 'REJECTED'
  | 'SOURCED';

export type CandidateWorkflowStatus = Exclude<CandidateStatus, 'ALL'>;

export interface InterviewRound {
  id: string;
  name: string;
  interviewer: string;
  date: string;
  status: 'PASSED' | 'SCHEDULED' | 'PENDING' | 'REJECTED';
  score?: number; // out of 5
  feedback?: string;
}

export type TimelineEventType =
  | 'STATUS_CHANGE'
  | 'SUBMISSION'
  | 'INTERVIEW'
  | 'OFFER'
  | 'NOTE'
  | 'CREATED';

export interface CandidateTimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string; // e.g. "2026-08-20" or formatted date
  time?: string; // e.g. "14:30"
  timestamp?: number;
  author?: string; // e.g. "Aditya Vardhan", "System", "Recruitment Lead"
  client?: string; // e.g. "Stripe", "Razorpay"
  fromStatus?: Exclude<CandidateStatus, 'ALL'>;
  toStatus?: Exclude<CandidateStatus, 'ALL'>;
  metaBadge?: string;
}

export interface Candidate {
  id: string; // e.g. "CAN-892"
  name: string;
  email: string;
  phone?: string;
  role: string;
  experienceYears: number;
  expectedCtcLpa: number;
  currentCtc?: number;
  location: string;
  skills: string[];
  status: Exclude<CandidateStatus, 'ALL'>;
  client?: string;
  avatarUrl?: string;
  currentCompany?: string;
  noticePeriod?: string;
  notes?: string[];
  createdAt?: string;
  rounds?: InterviewRound[];
  timeline?: CandidateTimelineEvent[];
  ratings?: {
    technical: number;
    problemSolving: number;
    architecture: number;
    cultureFit: number;
  };
}

export interface ClientMandate {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceMinYears: number;
  experienceMaxYears: number;
  budgetLpa: number;
  targetSkills: string[];
  openPositions: number;
  filledPositions: number;
  status: 'OPEN' | 'INTERVIEWING' | 'OFFERED' | 'FILLED';
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
}

export interface Client {
  id: string;
  name: string;
  logoText: string;
  industry: string;
  headquarters: string;
  accountManager: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ACTIVE' | 'STRATEGIC' | 'ONBOARDING';
  activeMandatesCount: number;
  totalPlacements: number;
  avgClosureDays: number;
  contractTier: 'Tier 1 Exclusive' | 'Preferred Partner' | 'Standard Retainer';
  mandates: ClientMandate[];
  notes?: string;
}

export interface FilterState {
  searchQuery: string;
  targetRole: string;
  location: string;
  maxExpectedCtc: number;
  status: CandidateStatus;
}

export interface JobRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  openings: number;
  budgetMinLpa: number;
  budgetMaxLpa: number;
  status: 'ACTIVE' | 'ON_HOLD' | 'FILLED';
  postedDate: string;
}

export interface PipelineNotification {
  id: string;
  category: 'HIRING' | 'CLIENT_ONBOARDING' | 'MANDATE';
  title: string;
  subtitle: string;
  timestamp: number;
  timeFormatted: string;
  statusBadge: string;
  statusColor: 'emerald' | 'purple' | 'blue' | 'amber' | 'rose' | 'black' | 'indigo' | 'neutral';
  isUnread: boolean;
  targetCandidateId?: string;
  targetClientId?: string;
}
