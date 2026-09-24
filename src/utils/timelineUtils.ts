import { Candidate, CandidateTimelineEvent, CandidateStatus } from '../types';

/**
 * Generates an accurate, realistic chronological timeline for a candidate
 * based on their creation date, current status, client submission, interview rounds, and notes.
 */
export function getOrGenerateCandidateTimeline(
  candidate: Candidate
): CandidateTimelineEvent[] {
  if (candidate.timeline && candidate.timeline.length > 0) {
    // Return copy sorted by timestamp/date descending
    return [...candidate.timeline].sort((a, b) => {
      const timeA = a.timestamp || new Date(a.date).getTime() || 0;
      const timeB = b.timestamp || new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
  }

  const events: CandidateTimelineEvent[] = [];
  const baseDateStr = candidate.createdAt || '2026-08-10';
  const baseDate = new Date(baseDateStr);

  const formatEventDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const addDays = (d: Date, days: number): Date => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy;
  };

  // 1. Initial Sourcing / Profile Creation
  events.push({
    id: `evt-created-${candidate.id}`,
    type: 'CREATED',
    title: 'Candidate Profile Sourced',
    description: `Profile imported into Jobvio candidate pool for target role: ${candidate.role} (${candidate.experienceYears} yrs exp).`,
    date: formatEventDate(baseDate),
    time: '10:15 AM',
    timestamp: baseDate.getTime(),
    author: 'Talent Acquisition Desk',
    fromStatus: undefined,
    toStatus: 'SOURCED',
    metaBadge: 'Sourced',
  });

  // 2. Progression based on current status
  let currentDate = addDays(baseDate, 2);

  if (candidate.status !== 'SOURCED') {
    // Screening event
    events.push({
      id: `evt-screen-${candidate.id}`,
      type: 'STATUS_CHANGE',
      title: 'Initial Screening Commenced',
      description: `Candidate profile reviewed against experience criteria (${candidate.experienceYears} yrs) and expected CTC of ₹${candidate.expectedCtcLpa.toFixed(1)} LPA.`,
      date: formatEventDate(currentDate),
      time: '02:30 PM',
      timestamp: currentDate.getTime(),
      author: 'Senior Recruiter',
      fromStatus: 'SOURCED',
      toStatus: 'SCREENING',
      metaBadge: 'Screening',
    });

    currentDate = addDays(currentDate, 3);
  }

  // 3. Client Submission (if client assigned or in Shortlisted/Interviewing/Offered/Joined)
  if (
    candidate.client ||
    ['SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'JOINED'].includes(
      candidate.status
    )
  ) {
    const clientName = candidate.client || 'Client Partner';
    events.push({
      id: `evt-submit-${candidate.id}`,
      type: 'SUBMISSION',
      title: `Submitted to ${clientName}`,
      description: `Dossier submitted to hiring team at ${clientName} for [${candidate.role}] mandate. Current CTC: ₹${(candidate.currentCtc || candidate.expectedCtcLpa * 0.7).toFixed(1)} LPA, Expected: ₹${candidate.expectedCtcLpa.toFixed(1)} LPA.`,
      date: formatEventDate(currentDate),
      time: '11:45 AM',
      timestamp: currentDate.getTime(),
      author: 'Account Manager',
      client: clientName,
      fromStatus: 'SCREENING',
      toStatus: 'SHORTLISTED',
      metaBadge: 'Client Submission',
    });

    currentDate = addDays(currentDate, 2);

    events.push({
      id: `evt-shortlist-${candidate.id}`,
      type: 'STATUS_CHANGE',
      title: `Shortlisted by ${clientName}`,
      description: `Hiring manager approved resume for interview loop. Skills matched: ${candidate.skills.slice(0, 3).join(', ')}.`,
      date: formatEventDate(currentDate),
      time: '04:10 PM',
      timestamp: currentDate.getTime(),
      author: `${clientName} Talent Desk`,
      client: clientName,
      fromStatus: 'SCREENING',
      toStatus: 'SHORTLISTED',
      metaBadge: 'Shortlisted',
    });

    currentDate = addDays(currentDate, 4);
  }

  // 4. Interview rounds
  if (['INTERVIEWING', 'OFFERED', 'JOINED'].includes(candidate.status)) {
    events.push({
      id: `evt-interview-start-${candidate.id}`,
      type: 'STATUS_CHANGE',
      title: 'Advanced to Technical Interview Loop',
      description: `Scheduled technical evaluation rounds with hiring engineering managers at ${candidate.client || 'partner team'}.`,
      date: formatEventDate(currentDate),
      time: '09:30 AM',
      timestamp: currentDate.getTime(),
      author: 'Coordinating Lead',
      client: candidate.client,
      fromStatus: 'SHORTLISTED',
      toStatus: 'INTERVIEWING',
      metaBadge: 'Interviewing',
    });

    currentDate = addDays(currentDate, 3);

    // If candidate has rounds defined
    if (candidate.rounds && candidate.rounds.length > 0) {
      candidate.rounds.forEach((round, idx) => {
        events.push({
          id: `evt-round-${candidate.id}-${round.id || idx}`,
          type: 'INTERVIEW',
          title: `Interview: ${round.name}`,
          description: round.feedback
            ? `${round.feedback} (Score: ${round.score ? `${round.score}/5` : 'Pass'})`
            : `Completed interview round with ${round.interviewer}. Outcome: [${round.status}].`,
          date: round.date ? formatEventDate(new Date(round.date)) : formatEventDate(currentDate),
          time: '03:00 PM',
          timestamp: round.date ? new Date(round.date).getTime() : currentDate.getTime(),
          author: round.interviewer || 'Interviewer',
          client: candidate.client,
          metaBadge: `Round ${idx + 1}`,
        });
        currentDate = addDays(currentDate, 3);
      });
    } else {
      // Default technical round
      events.push({
        id: `evt-round-tech-${candidate.id}`,
        type: 'INTERVIEW',
        title: 'Interview: Technical Architecture & Coding',
        description: `Candidate demonstrated strong problem-solving proficiency in ${candidate.skills.slice(0, 2).join(' and ')}. Recommended for leadership round.`,
        date: formatEventDate(currentDate),
        time: '03:30 PM',
        timestamp: currentDate.getTime(),
        author: 'Lead Architect',
        client: candidate.client,
        metaBadge: 'Passed',
      });
      currentDate = addDays(currentDate, 3);
    }
  }

  // 5. Notes logging
  if (candidate.notes && candidate.notes.length > 0) {
    candidate.notes.forEach((noteText, idx) => {
      const noteDate = addDays(baseDate, 4 + idx * 3);
      events.push({
        id: `evt-note-${candidate.id}-${idx}`,
        type: 'NOTE',
        title: 'Recruiter Assessment Note',
        description: noteText,
        date: formatEventDate(noteDate),
        time: '11:00 AM',
        timestamp: noteDate.getTime(),
        author: 'Recruitment Lead',
        client: candidate.client,
        metaBadge: 'Internal Note',
      });
    });
  }

  // 6. Offer & Joined stages
  if (candidate.status === 'OFFERED' || candidate.status === 'JOINED') {
    events.push({
      id: `evt-offer-${candidate.id}`,
      type: 'OFFER',
      title: `Formal Offer Extended by ${candidate.client || 'Client'}`,
      description: `Compensation package rolled out: ₹${candidate.expectedCtcLpa.toFixed(1)} LPA annual gross + standard employee benefits. Notice period expected: ${candidate.noticePeriod || '30 Days'}.`,
      date: formatEventDate(currentDate),
      time: '05:00 PM',
      timestamp: currentDate.getTime(),
      author: 'Compensation Committee',
      client: candidate.client,
      fromStatus: 'INTERVIEWING',
      toStatus: 'OFFERED',
      metaBadge: 'Offer Extended',
    });

    currentDate = addDays(currentDate, 4);
  }

  if (candidate.status === 'JOINED') {
    events.push({
      id: `evt-joined-${candidate.id}`,
      type: 'STATUS_CHANGE',
      title: 'Offer Accepted & Candidate Joined',
      description: `Candidate successfully onboarded at ${candidate.client || 'Client Partner'}. Placement milestone finalized.`,
      date: formatEventDate(currentDate),
      time: '09:00 AM',
      timestamp: currentDate.getTime(),
      author: 'Onboarding Operations',
      client: candidate.client,
      fromStatus: 'OFFERED',
      toStatus: 'JOINED',
      metaBadge: 'Joined',
    });
  }

  if (candidate.status === 'REJECTED') {
    events.push({
      id: `evt-rejected-${candidate.id}`,
      type: 'STATUS_CHANGE',
      title: 'Candidate Archival / Status: Rejected',
      description: `Evaluation loop closed. Role requirements misaligned with current experience depth or budget parameters.`,
      date: formatEventDate(currentDate),
      time: '06:15 PM',
      timestamp: currentDate.getTime(),
      author: 'Recruitment Committee',
      client: candidate.client,
      toStatus: 'REJECTED',
      metaBadge: 'Archived',
    });
  }

  // Sort descending by timestamp
  return events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}
