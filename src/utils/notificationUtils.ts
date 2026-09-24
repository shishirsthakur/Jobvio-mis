import { Candidate, Client, ClientMandate, CandidateStatus, PipelineNotification } from '../types';

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function createHiringStatusNotification(
  candidate: Candidate,
  previousStatus?: CandidateStatus
): PipelineNotification {
  const now = Date.now();
  const timeFormatted = formatTimeAgo(now);

  let title = `${candidate.name} advanced to ${candidate.status}`;
  let subtitle = `${candidate.role}${candidate.client ? ` at ${candidate.client}` : ''} • ₹${candidate.expectedCtcLpa} LPA`;
  let statusBadge = candidate.status;
  let statusColor: PipelineNotification['statusColor'] = 'blue';

  if (candidate.status === 'JOINED') {
    title = `${candidate.name} Joined & Placed!`;
    subtitle = `Official onboarding complete${candidate.client ? ` with ${candidate.client}` : ''} • ₹${candidate.expectedCtcLpa} LPA`;
    statusBadge = 'JOINED';
    statusColor = 'black';
  } else if (candidate.status === 'OFFERED') {
    title = `Offer Extended to ${candidate.name}`;
    subtitle = `Package ₹${candidate.expectedCtcLpa} LPA${candidate.client ? ` by ${candidate.client}` : ''} • ${candidate.role}`;
    statusBadge = 'OFFERED';
    statusColor = 'emerald';
  } else if (candidate.status === 'INTERVIEWING') {
    title = `${candidate.name} Scheduled for Interview`;
    subtitle = `Technical evaluation active${candidate.client ? ` with ${candidate.client}` : ''}`;
    statusBadge = 'INTERVIEWING';
    statusColor = 'purple';
  } else if (candidate.status === 'SHORTLISTED') {
    title = `${candidate.name} Shortlisted`;
    subtitle = `${candidate.role} (${candidate.experienceYears} yrs) passed preliminary match`;
    statusBadge = 'SHORTLISTED';
    statusColor = 'amber';
  } else if (candidate.status === 'SCREENING') {
    title = `${candidate.name} Moved to Screening`;
    subtitle = `Initial recruiter assessment ongoing`;
    statusBadge = 'SCREENING';
    statusColor = 'blue';
  } else if (candidate.status === 'REJECTED') {
    title = `${candidate.name} Stage Closed`;
    subtitle = `Candidate archived from active pipeline`;
    statusBadge = 'REJECTED';
    statusColor = 'rose';
  } else if (previousStatus) {
    subtitle = `Transitioned from [${previousStatus}] to [${candidate.status}]`;
  }

  return {
    id: `notif-hiring-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'HIRING',
    title,
    subtitle,
    timestamp: now,
    timeFormatted,
    statusBadge,
    statusColor,
    isUnread: true,
    targetCandidateId: candidate.id,
  };
}

export function createNewCandidateNotification(candidate: Candidate): PipelineNotification {
  const now = Date.now();
  return {
    id: `notif-cand-new-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'HIRING',
    title: `Candidate Sourced: ${candidate.name}`,
    subtitle: `${candidate.role} • ${candidate.experienceYears} yrs exp • ₹${candidate.expectedCtcLpa} LPA (${candidate.location})`,
    timestamp: now,
    timeFormatted: formatTimeAgo(now),
    statusBadge: 'NEW CANDIDATE',
    statusColor: 'blue',
    isUnread: true,
    targetCandidateId: candidate.id,
  };
}

export function createClientOnboardingNotification(client: Client): PipelineNotification {
  const now = Date.now();
  return {
    id: `notif-client-new-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'CLIENT_ONBOARDING',
    title: `Client Onboarded: ${client.name}`,
    subtitle: `${client.industry} • ${client.headquarters} • Partner Tier: ${client.contractTier} • Account Lead: ${client.accountManager}`,
    timestamp: now,
    timeFormatted: formatTimeAgo(now),
    statusBadge: 'CLIENT ONBOARDED',
    statusColor: 'emerald',
    isUnread: true,
    targetClientId: client.id,
  };
}

export function createMandateNotification(
  clientName: string,
  mandate: ClientMandate,
  clientId?: string
): PipelineNotification {
  const now = Date.now();
  return {
    id: `notif-mandate-new-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'MANDATE',
    title: `New Mandate: ${mandate.title}`,
    subtitle: `Client: ${clientName} • ${mandate.openPositions} open seat(s) • Budget: ₹${mandate.budgetLpa} LPA (${mandate.department})`,
    timestamp: now,
    timeFormatted: formatTimeAgo(now),
    statusBadge: 'MANDATE',
    statusColor: 'indigo',
    isUnread: true,
    targetClientId: clientId,
  };
}

export function createCandidateSubmissionNotification(
  candidate: Candidate,
  client: Client,
  mandate: ClientMandate
): PipelineNotification {
  const now = Date.now();
  return {
    id: `notif-submission-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'HIRING',
    title: `${candidate.name} Submitted to ${client.name}`,
    subtitle: `Requisition: ${mandate.title} (${mandate.department}) • Expected ₹${candidate.expectedCtcLpa} LPA`,
    timestamp: now,
    timeFormatted: formatTimeAgo(now),
    statusBadge: 'SUBMITTED',
    statusColor: 'indigo',
    isUnread: true,
    targetCandidateId: candidate.id,
    targetClientId: client.id,
  };
}

export function createBulkHiringNotification(
  candidateCount: number,
  newStatus: CandidateStatus
): PipelineNotification {
  const now = Date.now();
  return {
    id: `notif-bulk-${now}-${Math.random().toString(36).substring(2, 5)}`,
    category: 'HIRING',
    title: `Bulk Stage Update: ${candidateCount} Candidates`,
    subtitle: `Recruiter team moved batch to [${newStatus}] status`,
    timestamp: now,
    timeFormatted: formatTimeAgo(now),
    statusBadge: `BATCH ${newStatus}`,
    statusColor: 'purple',
    isUnread: true,
  };
}

export function generateSeedNotifications(candidates: Candidate[], clients: Client[]): PipelineNotification[] {
  const notifs: PipelineNotification[] = [];
  const baseTime = Date.now();

  // 1. Client onboardings
  clients.slice(0, 3).forEach((cli, idx) => {
    const t = baseTime - (idx + 1) * 3600 * 1000 * 5;
    notifs.push({
      id: `seed-client-${cli.id}`,
      category: 'CLIENT_ONBOARDING',
      title: `Client Onboarded: ${cli.name}`,
      subtitle: `${cli.industry} • Account Lead: ${cli.accountManager} (${cli.contractTier})`,
      timestamp: t,
      timeFormatted: formatTimeAgo(t),
      statusBadge: 'ONBOARDED',
      statusColor: 'emerald',
      isUnread: idx === 0,
      targetClientId: cli.id,
    });
  });

  // 2. High priority candidate hiring changes (Joined, Offered, Interviewing)
  candidates.forEach((cand, idx) => {
    if (cand.status === 'JOINED' || cand.status === 'OFFERED' || cand.status === 'INTERVIEWING') {
      const t = baseTime - (idx + 1) * 3600 * 1000 * 2;
      let title = `${cand.name} Status Changed`;
      let subtitle = `${cand.role}${cand.client ? ` at ${cand.client}` : ''} • ₹${cand.expectedCtcLpa} LPA`;
      let badge = cand.status;
      let color: PipelineNotification['statusColor'] = 'blue';

      if (cand.status === 'JOINED') {
        title = `${cand.name} Joined & Placed!`;
        subtitle = `Joined${cand.client ? ` ${cand.client}` : ' partner team'} • ₹${cand.expectedCtcLpa} LPA`;
        color = 'black';
      } else if (cand.status === 'OFFERED') {
        title = `Offer Accepted: ${cand.name}`;
        subtitle = `Offer extended by ${cand.client || 'Partner'} • ₹${cand.expectedCtcLpa} LPA`;
        color = 'emerald';
      } else if (cand.status === 'INTERVIEWING') {
        title = `Interview Round Active: ${cand.name}`;
        subtitle = `${cand.role} candidate in final technical evaluation`;
        color = 'purple';
      }

      notifs.push({
        id: `seed-cand-${cand.id}`,
        category: 'HIRING',
        title,
        subtitle,
        timestamp: t,
        timeFormatted: formatTimeAgo(t),
        statusBadge: badge,
        statusColor: color,
        isUnread: idx < 2,
        targetCandidateId: cand.id,
      });
    }
  });

  // Sort descending by timestamp
  return notifs.sort((a, b) => b.timestamp - a.timestamp);
}
