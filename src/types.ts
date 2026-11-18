export type UserRole =
  | 'traveller'
  | 'immigration_officer'
  | 'airport_admin'
  | 'police_verification'
  | 'payment_management'
  | 'global_super_admin';

export type NavSection =
  | 'home'
  | 'apply'
  | 'account'
  | 'inbox'
  | 'arrival'
  | 'departure'
  | 'security'
  | 'fees'
  | 'offices'
  | 'network';

export type VisaDuration = '30 days' | '90 days' | '6 months';

export type ApplicationStatus =
  | 'Under review'
  | 'Approved'
  | 'Additional documents requested'
  | 'Rejected';

export type OfficerDecision =
  | 'Pending review'
  | 'Approve (subject to checks)'
  | 'Request more documents'
  | 'Reject with lawful reason';

export type PoliceStatus =
  | 'Pending verification'
  | 'Verified by issuing authority'
  | 'Clarification needed';

export type FeeStatus = 'Unpaid' | 'Paid ($10 USD)';

export type BondStatus =
  | 'Not required'
  | 'Awaiting payment'
  | 'Held in government escrow'
  | 'Refund eligible (departed)'
  | 'Refunded'
  | 'Dispute review';

export type TravelStatus =
  | 'Pre-arrival'
  | 'Entered'
  | 'Departed'
  | 'Overstay alert';

export interface DocumentChecklist {
  passportPhoto: boolean;
  biometricFace: boolean;
  policeClearance: boolean;
  proofOfFunds: boolean;
}

export interface AiDocumentAssessment {
  summary: string;
  riskLevel: 'Low' | 'Standard' | 'Elevated';
  checks: string[];
  legalNote: string;
  analyzedAt: string;
}

export interface VisaApplication {
  reference: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  phone: string;
  email: string;
  residentialAddress: string;
  destinationCountry: string;
  arrivalAirport: string;
  requestedDuration: VisaDuration;
  documents: DocumentChecklist;
  submittedAt: string;
  status: ApplicationStatus;
  officerDecision: OfficerDecision;
  officerRemarks: string;
  officerName: string;
  policeStatus: PoliceStatus;
  policeAuthorityRef: string;
  policeNotes: string;
  feeStatus: FeeStatus;
  feeReceiptNo: string;
  bondRequired: boolean;
  bondAmountUsd: number;
  bondStatus: BondStatus;
  bondReceiptNo: string;
  travelStatus: TravelStatus;
  entryTimestamp: string | null;
  entryAirport: string | null;
  exitTimestamp: string | null;
  exitAirport: string | null;
  visaExpiryDate: string | null;
  daysRemaining: number | null;
  aiAssessment: AiDocumentAssessment | null;
}

export interface InboxMessage {
  id: string;
  reference: string;
  title: string;
  body: string;
  category:
    | 'Received'
    | 'Action required'
    | 'Payment information'
    | 'Pending'
    | 'Decision'
    | 'Expiry reminder'
    | 'Appeal';
  createdAt: string;
  read: boolean;
}

export interface CountryNode {
  code: string;
  name: string;
  airports: string[];
  immigrationAuthority: string;
  policeAgency: string;
  feeApproved: boolean;
  feeAmountUsd: number;
  bondAuthorized: boolean;
  bondAmountUsd: number;
  maxVisitorDays: number;
  status: 'Active bilateral' | 'Pilot agreement' | 'Pending legislative review';
}

export interface AirportCheckpointEvent {
  id: string;
  reference: string;
  travellerName: string;
  airportCode: string;
  direction: 'Arrival' | 'Departure';
  biometricMatch: boolean;
  passportAiPassed: boolean;
  officerReviewed: boolean;
  offlineCached: boolean;
  timestamp: string;
  notes: string;
}

export interface AuditLogEntry {
  id: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  targetRef: string;
  details: string;
  timestamp: string;
}

export interface DashboardMetrics {
  applicationsReceived: number;
  pendingReviews: number;
  approved: number;
  additionalChecks: number;
}

export interface WorldGateState {
  applications: VisaApplication[];
  messages: InboxMessage[];
  countries: CountryNode[];
  checkpointEvents: AirportCheckpointEvent[];
  auditLogs: AuditLogEntry[];
  metrics: DashboardMetrics;
  offlineAirportMode: boolean;
}

export interface RoleProfile {
  role: UserRole;
  label: string;
  shortLabel: string;
  actorName: string;
  credentialId: string;
  jurisdiction: string;
  summary: string;
}
