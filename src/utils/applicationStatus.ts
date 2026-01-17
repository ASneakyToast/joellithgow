/**
 * Application Status Configuration
 *
 * Centralized config for application status values, labels, colors, and groupings.
 * Import this in any component/page that needs status information.
 */

// Status values in order of workflow progression
export const APPLICATION_STATUSES = [
  'draft',
  'preparing',
  'applied',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
  'ghosted'
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

// Interview round types for granular tracking
export const INTERVIEW_ROUNDS = [
  'phone-screen',
  'recruiter-call',
  'technical',
  'take-home',
  'onsite',
  'hiring-manager',
  'team-panel',
  'final',
  'other'
] as const;

export type InterviewRound = typeof INTERVIEW_ROUNDS[number];

// Display labels for each status
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  preparing: 'Preparing',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Closed',
  withdrawn: 'Withdrawn',
  ghosted: 'Ghosted'
};

// Display labels for interview rounds
export const ROUND_LABELS: Record<InterviewRound, string> = {
  'phone-screen': 'Phone Screen',
  'recruiter-call': 'Recruiter Call',
  'technical': 'Technical Interview',
  'take-home': 'Take-Home Assignment',
  'onsite': 'Onsite Interview',
  'hiring-manager': 'Hiring Manager',
  'team-panel': 'Team Panel',
  'final': 'Final Round',
  'other': 'Other'
};

// Badge color variants for each status
export const STATUS_COLORS: Record<ApplicationStatus, 'primary' | 'secondary'> = {
  draft: 'secondary',
  preparing: 'secondary',
  applied: 'primary',
  interviewing: 'primary',
  offered: 'primary',
  rejected: 'secondary',
  withdrawn: 'secondary',
  ghosted: 'secondary'
};

// Status groupings for calculations
export const ACTIVE_STATUSES: ApplicationStatus[] = ['draft', 'preparing', 'applied', 'interviewing'];
export const CLOSED_STATUSES: ApplicationStatus[] = ['offered', 'rejected', 'withdrawn', 'ghosted'];

// Helper to get label for a status
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as ApplicationStatus] || status;
}

// Helper to get color for a status
export function getStatusColor(status: string): 'primary' | 'secondary' {
  return STATUS_COLORS[status as ApplicationStatus] || 'secondary';
}

// Helper to check if status is active
export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status as ApplicationStatus);
}

// Helper to check if status is closed
export function isClosedStatus(status: string): boolean {
  return CLOSED_STATUSES.includes(status as ApplicationStatus);
}

// Helper to get label for an interview round
export function getRoundLabel(round: string): string {
  return ROUND_LABELS[round as InterviewRound] || round;
}
