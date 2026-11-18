import type { RoleProfile } from './types';

export const ASSETS = {
  heroGate: '/src/assets/images/hero_smart_gate_1794996944703.jpg',
  commandCenter: '/src/assets/images/officer_command_center_1794996943909.jpg',
  passportScan: '/src/assets/images/biometric_passport_check_1794996942984.jpg',
  officerAvatar: '/src/assets/images/officer_portrait_avatar_1794996943470.jpg',
} as const;

export const ROLE_PROFILES: RoleProfile[] = [
  {
    role: 'traveller',
    label: 'Traveller',
    shortLabel: 'Traveller',
    actorName: 'Tariq Mahmood Siddiqui',
    credentialId: 'WG-2026-008521',
    jurisdiction: 'Applicant Self-Service',
    summary: 'Apply for travel authorization, track your digital reference, read inbox notices, and manage fees or bonds.',
  },
  {
    role: 'immigration_officer',
    label: 'Immigration Officer',
    shortLabel: 'Officer',
    actorName: 'Officer H. Vance',
    credentialId: 'UKBA-409',
    jurisdiction: 'National Immigration Decision Authority',
    summary: 'Review pending visa applications, run advisory Passport AI checks, record lawful decisions, and inspect overstay alerts.',
  },
  {
    role: 'airport_admin',
    label: 'Airport Admin',
    shortLabel: 'Airport',
    actorName: 'Terminal Gate Operations',
    credentialId: 'AIR-LHR-04',
    jurisdiction: 'Participating Airport Checkpoints',
    summary: 'Operate arrival and departure e-Gates, verify checkpoint biometrics, and manage offline airport verification cache.',
  },
  {
    role: 'police_verification',
    label: 'Police Verification',
    shortLabel: 'Police',
    actorName: 'Inspector R. Malik',
    credentialId: 'POL-LIAISON-18',
    jurisdiction: 'Issuing Authority Clearance Desk',
    summary: 'Verify local police clearance certificates through documented, consent-based inter-authority channels.',
  },
  {
    role: 'payment_management',
    label: 'Payment Management',
    shortLabel: 'Payments',
    actorName: 'Escrow & Fee Reconciliation',
    credentialId: 'TREASURY-882',
    jurisdiction: 'Authorized Government Accounts',
    summary: 'Reconcile $10 USD fee receipts, verify $2,000 USD government escrow deposits, and release departure bond refunds.',
  },
  {
    role: 'global_super_admin',
    label: 'Global Super Admin',
    shortLabel: 'Super Admin',
    actorName: 'Global Governance Council',
    credentialId: 'WG-GOV-001',
    jurisdiction: 'Bilateral Country Network & Audit',
    summary: 'Configure participating countries, national fee and bond legal authorizations, and inspect global audit logs.',
  },
];

export const SECURITY_MODULES = [
  { module: 'Passport AI', fn: 'Passport authenticity checks with optical and MRZ verification' },
  { module: 'Face verification', fn: 'Compare traveller with passport photo at authorized checkpoint' },
  { module: 'Biometrics', fn: 'Fingerprint and authorized identity verification with consent' },
  { module: 'Police clearance', fn: 'Verify certificates directly with issuing police authority' },
  { module: 'Financial checks', fn: 'Verify genuine proof of available travel funds' },
  { module: 'Visa database', fn: 'Verify active visa status, duration, and travel conditions' },
  { module: 'Entry records', fn: 'Record lawful arrival timestamp and port of entry' },
  { module: 'Exit records', fn: 'Record departure timestamp and trigger bond refund checks' },
  { module: 'Overstay alerts', fn: 'Flag possible visa expiry violations for officer review' },
  { module: 'Officer portal', fn: 'Authenticated human review, decisions, and appeal records' },
] as const;

export const FINANCIAL_LIFECYCLE_STEPS = [
  {
    step: '01',
    title: 'Application and reference creation',
    detail: 'Traveller submits personal, travel, and document checkmarks and receives a unique reference (e.g. WG-2026-008521).',
  },
  {
    step: '02',
    title: 'Departure fee collection',
    detail: 'Where national law permits, the proposed $10 USD fee can be collected online or at an authorized departure counter.',
  },
  {
    step: '03',
    title: 'Destination-country bond',
    detail: 'When legally authorized by the destination country, the $2,000 USD refundable bond is paid strictly to its verified government account.',
  },
  {
    step: '04',
    title: 'Arrival verification',
    detail: 'Airport immigration verifies passport authenticity, visa status, live checkpoint face match, and official bond receipt.',
  },
  {
    step: '05',
    title: 'Departure confirmation',
    detail: 'Exit timestamp is recorded at departure, automatically flagging the security bond for refund under published conditions.',
  },
] as const;

export const LEGAL_SAFEGUARDS = [
  'A proposed $10 USD fee cannot be imposed universally without individual country legal approval.',
  'Any $2,000 USD security bond requires legally defined eligibility, collection, refund, dispute, and escrow protection rules.',
  'Biometrics and police certificates require explicit legal authority, traveller consent, retention limits, and strict access controls.',
  'Face recognition verifies a traveller strictly at an authorized checkpoint — never continuous public camera surveillance.',
  'Travellers have guaranteed access to human officer review, record correction, and formal appeal procedures.',
  'Visa decisions are made solely by authorized national immigration officers and cannot be guaranteed or automated by AI.',
] as const;

export const ARCHITECTURE_STACK = [
  { layer: 'Frontend & Terminals', spec: 'React TypeScript web portal, mobile traveller access, and airport terminal interfaces' },
  { layer: 'Backend & API Gateway', spec: 'Node.js and Express with country-controlled APIs and standardized bilateral exchange' },
  { layer: 'Security & Audit', spec: 'Zero-trust access control, MFA for officers, encrypted storage, and tamper-evident audit logs' },
  { layer: 'AI Verification', spec: 'Document consistency checks and identity assistance strictly paired with human officer review' },
  { layer: 'Offline Airport Mode', spec: 'Encrypted local verification cache at border terminals with automatic synchronization on reconnect' },
] as const;
