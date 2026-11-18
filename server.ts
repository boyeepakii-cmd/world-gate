import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  AirportCheckpointEvent,
  AuditLogEntry,
  CountryNode,
  DashboardMetrics,
  InboxMessage,
  OfficerDecision,
  PoliceStatus,
  UserRole,
  VisaApplication,
  WorldGateState,
} from './src/types.ts';

dotenv.config();

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const initialCountries: CountryNode[] = [
  {
    code: 'GBR',
    name: 'United Kingdom',
    airports: ['LHR — London Heathrow', 'LGW — London Gatwick', 'MAN — Manchester'],
    immigrationAuthority: 'UK Border & Visas Authority',
    policeAgency: 'National Crime & Record Liaison',
    feeApproved: true,
    feeAmountUsd: 10,
    bondAuthorized: true,
    bondAmountUsd: 2000,
    maxVisitorDays: 180,
    status: 'Active bilateral',
  },
  {
    code: 'ARE',
    name: 'United Arab Emirates',
    airports: ['DXB — Dubai International', 'AUH — Zayed International'],
    immigrationAuthority: 'Federal Authority for Identity & Citizenship',
    policeAgency: 'Ministry of Interior Clearance Desk',
    feeApproved: true,
    feeAmountUsd: 10,
    bondAuthorized: false,
    bondAmountUsd: 0,
    maxVisitorDays: 180,
    status: 'Active bilateral',
  },
  {
    code: 'FIN',
    name: 'Finland (Schengen EES)',
    airports: ['HEL — Helsinki-Vantaa'],
    immigrationAuthority: 'Finnish Immigration Service (Migri)',
    policeAgency: 'National Police Board Verification Unit',
    feeApproved: true,
    feeAmountUsd: 10,
    bondAuthorized: true,
    bondAmountUsd: 2000,
    maxVisitorDays: 90,
    status: 'Active bilateral',
  },
  {
    code: 'SGP',
    name: 'Singapore',
    airports: ['SIN — Singapore Changi'],
    immigrationAuthority: 'Immigration & Checkpoints Authority (ICA)',
    policeAgency: 'Singapore Police Force Liaison',
    feeApproved: true,
    feeAmountUsd: 10,
    bondAuthorized: true,
    bondAmountUsd: 2000,
    maxVisitorDays: 180,
    status: 'Pilot agreement',
  },
  {
    code: 'PAK',
    name: 'Pakistan',
    airports: ['ISB — Islamabad International', 'KHI — Jinnah International', 'LHE — Allama Iqbal'],
    immigrationAuthority: 'Directorate General of Immigration & Passports',
    policeAgency: 'Provincial Police Character Certificate Registry',
    feeApproved: true,
    feeAmountUsd: 10,
    bondAuthorized: false,
    bondAmountUsd: 0,
    maxVisitorDays: 180,
    status: 'Active bilateral',
  },
  {
    code: 'CAN',
    name: 'Canada',
    airports: ['YYZ — Toronto Pearson', 'YVR — Vancouver International'],
    immigrationAuthority: 'Immigration, Refugees and Citizenship Canada',
    policeAgency: 'RCMP Civil Record Verification Channel',
    feeApproved: false,
    feeAmountUsd: 10,
    bondAuthorized: true,
    bondAmountUsd: 2000,
    maxVisitorDays: 180,
    status: 'Pending legislative review',
  },
];

const initialApplications: VisaApplication[] = [
  {
    reference: 'WG-2026-008521',
    fullName: 'Tariq Mahmood Siddiqui',
    nationality: 'Pakistan',
    passportNumber: 'PK4928174',
    phone: '+92 300 5189042',
    email: 't.siddiqui@example.org',
    residentialAddress: 'House 14, Street 7, Sector F-8/3, Islamabad',
    destinationCountry: 'United Kingdom',
    arrivalAirport: 'LHR — London Heathrow',
    requestedDuration: '6 months',
    documents: {
      passportPhoto: true,
      biometricFace: true,
      policeClearance: true,
      proofOfFunds: true,
    },
    submittedAt: '2026-11-16T09:30:00Z',
    status: 'Under review',
    officerDecision: 'Pending review',
    officerRemarks: 'Passport verification pending; awaiting final issuing-authority police confirmation.',
    officerName: 'Officer H. Vance (UKBA-409)',
    policeStatus: 'Pending verification',
    policeAuthorityRef: 'POL-ISB-2026-8812',
    policeNotes: 'Certificate submitted; queued for provincial registry hash confirmation.',
    feeStatus: 'Paid ($10 USD)',
    feeReceiptNo: 'FEE-WG-2026-90412',
    bondRequired: true,
    bondAmountUsd: 2000,
    bondStatus: 'Awaiting payment',
    bondReceiptNo: 'Pending deposit to UK Border designated escrow',
    travelStatus: 'Pre-arrival',
    entryTimestamp: null,
    entryAirport: null,
    exitTimestamp: null,
    exitAirport: null,
    visaExpiryDate: null,
    daysRemaining: null,
    aiAssessment: null,
  },
  {
    reference: 'WG-2026-008519',
    fullName: 'Amina Al-Mansoor',
    nationality: 'United Arab Emirates',
    passportNumber: 'AE8821049',
    phone: '+971 50 412 8830',
    email: 'amina.mansoor@example.org',
    residentialAddress: 'Al Wasl District, Villa 29, Dubai',
    destinationCountry: 'Finland (Schengen EES)',
    arrivalAirport: 'HEL — Helsinki-Vantaa',
    requestedDuration: '90 days',
    documents: {
      passportPhoto: true,
      biometricFace: true,
      policeClearance: true,
      proofOfFunds: true,
    },
    submittedAt: '2026-11-10T11:15:00Z',
    status: 'Approved',
    officerDecision: 'Approve (subject to checks)',
    officerRemarks: 'All biometric and Schengen EES pre-checks cleared. Entered via HEL Gate 04.',
    officerName: 'Officer K. Lindholm (FI-118)',
    policeStatus: 'Verified by issuing authority',
    policeAuthorityRef: 'MOI-DXB-2026-4410',
    policeNotes: 'Verified clean record via bilateral digital channel.',
    feeStatus: 'Paid ($10 USD)',
    feeReceiptNo: 'FEE-WG-2026-89941',
    bondRequired: true,
    bondAmountUsd: 2000,
    bondStatus: 'Held in government escrow',
    bondReceiptNo: 'BND-FIN-2026-77102',
    travelStatus: 'Entered',
    entryTimestamp: '2026-11-12T14:22:00Z',
    entryAirport: 'HEL — Helsinki-Vantaa',
    exitTimestamp: null,
    exitAirport: null,
    visaExpiryDate: '2026-12-03',
    daysRemaining: 15,
    aiAssessment: {
      summary: 'Passport MRZ checksum valid, facial comparison consistent at gate, and financial proof aligns with 90-day stay.',
      riskLevel: 'Low',
      checks: [
        'MRZ cryptographic check verified',
        'Issuing police clearance confirmed',
        'Escrow bond receipt matched to destination authority',
      ],
      legalNote: 'Advisory verification only; final entry authorized by Officer K. Lindholm.',
      analyzedAt: '2026-11-10T11:18:00Z',
    },
  },
  {
    reference: 'WG-2026-008497',
    fullName: 'Daniel Okafor',
    nationality: 'United Kingdom',
    passportNumber: 'UK7712903',
    phone: '+44 7700 900412',
    email: 'd.okafor@example.org',
    residentialAddress: '42 Camden High Street, London',
    destinationCountry: 'Singapore',
    arrivalAirport: 'SIN — Singapore Changi',
    requestedDuration: '6 months',
    documents: {
      passportPhoto: true,
      biometricFace: true,
      policeClearance: true,
      proofOfFunds: true,
    },
    submittedAt: '2026-05-15T08:00:00Z',
    status: 'Approved',
    officerDecision: 'Approve (subject to checks)',
    officerRemarks: 'Approved 6-month visitor authorization; exit alert triggered past day 180.',
    officerName: 'Officer W. Tan (ICA-204)',
    policeStatus: 'Verified by issuing authority',
    policeAuthorityRef: 'ACRO-UK-2026-1190',
    policeNotes: 'Verified valid.',
    feeStatus: 'Paid ($10 USD)',
    feeReceiptNo: 'FEE-WG-2026-61022',
    bondRequired: true,
    bondAmountUsd: 2000,
    bondStatus: 'Held in government escrow',
    bondReceiptNo: 'BND-SGP-2026-50921',
    travelStatus: 'Overstay alert',
    entryTimestamp: '2026-05-19T19:05:00Z',
    entryAirport: 'SIN — Singapore Changi',
    exitTimestamp: null,
    exitAirport: null,
    visaExpiryDate: '2026-11-15',
    daysRemaining: -3,
    aiAssessment: {
      summary: 'Initial entry cleared; automated exit monitoring flagged 3 days past authorized 6-month visitor window.',
      riskLevel: 'Elevated',
      checks: [
        'Authorized 180-day stay limit exceeded',
        '30-day, 15-day, and 7-day notices dispatched',
        'Awaiting officer review prior to any police liaison',
      ],
      legalNote: 'Overstay alert requires lawful officer verification and traveller appeal check before action.',
      analyzedAt: '2026-11-16T00:05:00Z',
    },
  },
  {
    reference: 'WG-2026-008462',
    fullName: 'Sanaullah Qureshi',
    nationality: 'Pakistan',
    passportNumber: 'PK3301948',
    phone: '+92 321 8840192',
    email: 's.qureshi@example.org',
    residentialAddress: 'Model Town Block C, Lahore',
    destinationCountry: 'United Arab Emirates',
    arrivalAirport: 'DXB — Dubai International',
    requestedDuration: '30 days',
    documents: {
      passportPhoto: true,
      biometricFace: true,
      policeClearance: true,
      proofOfFunds: true,
    },
    submittedAt: '2026-10-18T10:20:00Z',
    status: 'Approved',
    officerDecision: 'Approve (subject to checks)',
    officerRemarks: 'Verified arrival and departure via DXB Terminal 3.',
    officerName: 'Officer R. Al-Hashimi (UAE-772)',
    policeStatus: 'Verified by issuing authority',
    policeAuthorityRef: 'POL-LHE-2026-3921',
    policeNotes: 'Confirmed.',
    feeStatus: 'Paid ($10 USD)',
    feeReceiptNo: 'FEE-WG-2026-72011',
    bondRequired: false,
    bondAmountUsd: 0,
    bondStatus: 'Not required',
    bondReceiptNo: 'N/A under bilateral waiver',
    travelStatus: 'Departed',
    entryTimestamp: '2026-10-20T06:45:00Z',
    entryAirport: 'DXB — Dubai International',
    exitTimestamp: '2026-11-08T22:15:00Z',
    exitAirport: 'DXB — Dubai International',
    visaExpiryDate: '2026-11-19',
    daysRemaining: 0,
    aiAssessment: null,
  },
];

const initialMessages: InboxMessage[] = [
  {
    id: 'msg-1',
    reference: 'WG-2026-008521',
    title: 'Application received',
    body: 'Your application is registered and awaiting verification under reference WG-2026-008521.',
    category: 'Received',
    createdAt: '2026-11-16T09:31:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    reference: 'WG-2026-008521',
    title: 'Biometric verification',
    body: 'Please complete identity verification at an authorized location or upload your live biometric confirmation.',
    category: 'Action required',
    createdAt: '2026-11-16T09:45:00Z',
    read: false,
  },
  {
    id: 'msg-3',
    reference: 'WG-2026-008521',
    title: 'Security bond instructions',
    body: 'Check the destination government’s official payment instructions for the refundable $2,000 USD bond (payable strictly to the UK Border designated escrow account).',
    category: 'Payment information',
    createdAt: '2026-11-16T10:12:00Z',
    read: false,
  },
  {
    id: 'msg-4',
    reference: 'WG-2026-008521',
    title: 'Visa decision',
    body: 'Your application decision will appear here after official review by an authorized immigration officer.',
    category: 'Pending',
    createdAt: '2026-11-16T10:15:00Z',
    read: false,
  },
  {
    id: 'msg-5',
    reference: 'WG-2026-008519',
    title: '15-day visitor visa reminder',
    body: 'Your 90-day Schengen authorization via Helsinki-Vantaa expires on 2026-12-03. Verified departure triggers automatic $2,000 USD bond refund eligibility.',
    category: 'Expiry reminder',
    createdAt: '2026-11-18T00:01:00Z',
    read: false,
  },
];

const initialCheckpointEvents: AirportCheckpointEvent[] = [
  {
    id: 'chk-101',
    reference: 'WG-2026-008519',
    travellerName: 'Amina Al-Mansoor',
    airportCode: 'HEL — Helsinki-Vantaa',
    direction: 'Arrival',
    biometricMatch: true,
    passportAiPassed: true,
    officerReviewed: true,
    offlineCached: false,
    timestamp: '2026-11-12T14:22:00Z',
    notes: 'e-Gate facial check matched passport photo; bond receipt verified.',
  },
  {
    id: 'chk-102',
    reference: 'WG-2026-008462',
    travellerName: 'Sanaullah Qureshi',
    airportCode: 'DXB — Dubai International',
    direction: 'Departure',
    biometricMatch: true,
    passportAiPassed: true,
    officerReviewed: true,
    offlineCached: false,
    timestamp: '2026-11-08T22:15:00Z',
    notes: 'Exit timestamp recorded; departure fee settled at counter.',
  },
];

const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud-1',
    actorRole: 'immigration_officer',
    actorName: 'Officer K. Lindholm (FI-118)',
    action: 'Approved visa application',
    targetRef: 'WG-2026-008519',
    details: 'Cleared subject to Schengen EES arrival verification and bond deposit.',
    timestamp: '2026-11-10T11:20:00Z',
  },
  {
    id: 'aud-2',
    actorRole: 'airport_admin',
    actorName: 'HEL Gate Operations',
    action: 'Recorded lawful arrival',
    targetRef: 'WG-2026-008519',
    details: 'Entry timestamp logged at Helsinki-Vantaa Gate 04.',
    timestamp: '2026-11-12T14:22:00Z',
  },
  {
    id: 'aud-3',
    actorRole: 'police_verification',
    actorName: 'Islamabad Clearance Desk',
    action: 'Queued police certificate check',
    targetRef: 'WG-2026-008521',
    details: 'Awaiting provincial registry hash verification under lawful consent.',
    timestamp: '2026-11-16T09:50:00Z',
  },
];

const initialMetrics: DashboardMetrics = {
  applicationsReceived: 12580,
  pendingReviews: 2410,
  approved: 8950,
  additionalChecks: 1220,
};

const state: WorldGateState = {
  applications: initialApplications,
  messages: initialMessages,
  countries: initialCountries,
  checkpointEvents: initialCheckpointEvents,
  auditLogs: initialAuditLogs,
  metrics: initialMetrics,
  offlineAirportMode: false,
};

function addAudit(actorRole: UserRole, actorName: string, action: string, targetRef: string, details: string) {
  state.auditLogs.unshift({
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorRole,
    actorName,
    action,
    targetRef,
    details,
    timestamp: new Date().toISOString(),
  });
}

function generateReference(): string {
  const num = 8522 + state.applications.length;
  return `WG-2026-${String(num).padStart(6, '0')}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/state', (_req, res) => {
    res.json(state);
  });

  app.post('/api/applications', (req, res) => {
    const body = req.body ?? {};
    if (!body.fullName || !body.passportNumber || !body.destinationCountry || !body.email) {
      res.status(400).json({ error: 'Full name, passport number, email, and destination country are required.' });
      return;
    }

    const country = state.countries.find((c) => c.name === body.destinationCountry);
    const bondRequired = country ? country.bondAuthorized : true;
    const bondAmountUsd = country && country.bondAuthorized ? country.bondAmountUsd : 0;
    const reference = generateReference();
    const now = new Date().toISOString();

    const newApp: VisaApplication = {
      reference,
      fullName: String(body.fullName).trim(),
      nationality: String(body.nationality || 'Pakistan').trim(),
      passportNumber: String(body.passportNumber).trim().toUpperCase(),
      phone: String(body.phone || '').trim(),
      email: String(body.email).trim(),
      residentialAddress: String(body.residentialAddress || '').trim(),
      destinationCountry: String(body.destinationCountry).trim(),
      arrivalAirport: String(body.arrivalAirport || (country?.airports[0] ?? 'International Arrival Terminal')).trim(),
      requestedDuration: body.requestedDuration || '90 days',
      documents: {
        passportPhoto: Boolean(body.documents?.passportPhoto),
        biometricFace: Boolean(body.documents?.biometricFace),
        policeClearance: Boolean(body.documents?.policeClearance),
        proofOfFunds: Boolean(body.documents?.proofOfFunds),
      },
      submittedAt: now,
      status: 'Under review',
      officerDecision: 'Pending review',
      officerRemarks: 'Newly registered demonstration application awaiting officer review.',
      officerName: 'Unassigned Queue',
      policeStatus: body.documents?.policeClearance ? 'Pending verification' : 'Clarification needed',
      policeAuthorityRef: `POL-REQ-${reference.slice(-6)}`,
      policeNotes: body.documents?.policeClearance
        ? 'Certificate checkmark recorded; awaiting issuing authority confirmation.'
        : 'Police clearance certificate not yet marked complete.',
      feeStatus: 'Unpaid',
      feeReceiptNo: 'Pending $10 USD departure/application fee',
      bondRequired,
      bondAmountUsd,
      bondStatus: bondRequired ? 'Awaiting payment' : 'Not required',
      bondReceiptNo: bondRequired
        ? `Pending deposit to ${country?.immigrationAuthority ?? 'destination authority'}`
        : 'Not required for destination',
      travelStatus: 'Pre-arrival',
      entryTimestamp: null,
      entryAirport: null,
      exitTimestamp: null,
      exitAirport: null,
      visaExpiryDate: null,
      daysRemaining: null,
      aiAssessment: null,
    };

    state.applications.unshift(newApp);
    state.metrics.applicationsReceived += 1;
    state.metrics.pendingReviews += 1;

    state.messages.unshift(
      {
        id: `msg-${Date.now()}-4`,
        reference,
        title: 'Visa decision',
        body: 'Your application decision will appear here after official review by an authorized officer.',
        category: 'Pending',
        createdAt: now,
        read: false,
      },
      {
        id: `msg-${Date.now()}-3`,
        reference,
        title: 'Security bond instructions',
        body: bondRequired
          ? `Destination authority authorizes a refundable $${bondAmountUsd.toLocaleString()} USD bond payable strictly to ${country?.immigrationAuthority ?? 'the government-designated account'}.`
          : 'No destination security bond is currently required for this bilateral corridor.',
        category: 'Payment information',
        createdAt: now,
        read: false,
      },
      {
        id: `msg-${Date.now()}-2`,
        reference,
        title: 'Biometric verification',
        body: 'Please complete identity verification at an authorized location prior to travel.',
        category: 'Action required',
        createdAt: now,
        read: false,
      },
      {
        id: `msg-${Date.now()}-1`,
        reference,
        title: 'Application received',
        body: `Your application is registered and awaiting verification under reference ${reference}.`,
        category: 'Received',
        createdAt: now,
        read: false,
      }
    );

    addAudit('traveller', newApp.fullName, 'Submitted demonstration visa application', reference, `${newApp.nationality} → ${newApp.destinationCountry} (${newApp.requestedDuration})`);
    res.status(201).json(newApp);
  });

  app.patch('/api/applications/:ref/officer-review', (req, res) => {
    const appRecord = state.applications.find((a) => a.reference === req.params.ref);
    if (!appRecord) {
      res.status(404).json({ error: 'Visa reference not found.' });
      return;
    }

    const decision = req.body.officerDecision as OfficerDecision;
    const remarks = String(req.body.officerRemarks ?? '').trim();
    const officerName = String(req.body.officerName || 'Officer H. Vance (UKBA-409)');

    const previousStatus = appRecord.status;
    appRecord.officerDecision = decision;
    appRecord.officerRemarks = remarks || appRecord.officerRemarks;
    appRecord.officerName = officerName;

    if (decision === 'Approve (subject to checks)') {
      appRecord.status = 'Approved';
      if (previousStatus === 'Under review') state.metrics.pendingReviews = Math.max(0, state.metrics.pendingReviews - 1);
      if (previousStatus === 'Additional documents requested') state.metrics.additionalChecks = Math.max(0, state.metrics.additionalChecks - 1);
      if (previousStatus !== 'Approved') state.metrics.approved += 1;
    } else if (decision === 'Request more documents') {
      appRecord.status = 'Additional documents requested';
      if (previousStatus === 'Under review') state.metrics.pendingReviews = Math.max(0, state.metrics.pendingReviews - 1);
      if (previousStatus === 'Approved') state.metrics.approved = Math.max(0, state.metrics.approved - 1);
      if (previousStatus !== 'Additional documents requested') state.metrics.additionalChecks += 1;
    } else if (decision === 'Reject with lawful reason') {
      appRecord.status = 'Rejected';
      if (previousStatus === 'Under review') state.metrics.pendingReviews = Math.max(0, state.metrics.pendingReviews - 1);
      if (previousStatus === 'Approved') state.metrics.approved = Math.max(0, state.metrics.approved - 1);
      if (previousStatus === 'Additional documents requested') state.metrics.additionalChecks = Math.max(0, state.metrics.additionalChecks - 1);
    } else {
      appRecord.status = 'Under review';
    }

    const now = new Date().toISOString();
    state.messages.unshift({
      id: `msg-${Date.now()}`,
      reference: appRecord.reference,
      title: `Officer decision updated: ${appRecord.status}`,
      body: `${officerName} recorded "${decision}". Remarks: ${appRecord.officerRemarks}`,
      category: 'Decision',
      createdAt: now,
      read: false,
    });

    addAudit('immigration_officer', officerName, `Set decision: ${decision}`, appRecord.reference, appRecord.officerRemarks);
    res.json(appRecord);
  });

  app.patch('/api/applications/:ref/police-verify', (req, res) => {
    const appRecord = state.applications.find((a) => a.reference === req.params.ref);
    if (!appRecord) {
      res.status(404).json({ error: 'Visa reference not found.' });
      return;
    }

    const policeStatus = req.body.policeStatus as PoliceStatus;
    const policeNotes = String(req.body.policeNotes ?? '').trim();
    const verifierName = String(req.body.verifierName || 'Police Liaison Officer');

    appRecord.policeStatus = policeStatus;
    if (policeNotes) appRecord.policeNotes = policeNotes;
    if (policeStatus === 'Verified by issuing authority') {
      appRecord.documents.policeClearance = true;
    }

    addAudit('police_verification', verifierName, `Police verification: ${policeStatus}`, appRecord.reference, appRecord.policeNotes);
    res.json(appRecord);
  });

  app.patch('/api/applications/:ref/payment', (req, res) => {
    const appRecord = state.applications.find((a) => a.reference === req.params.ref);
    if (!appRecord) {
      res.status(404).json({ error: 'Visa reference not found.' });
      return;
    }

    const action = req.body.action as 'pay_fee' | 'deposit_bond' | 'refund_bond' | 'flag_dispute';
    const actorName = String(req.body.actorName || 'Payment Reconciliation Desk');
    const now = new Date().toISOString();

    if (action === 'pay_fee') {
      appRecord.feeStatus = 'Paid ($10 USD)';
      appRecord.feeReceiptNo = `FEE-WG-2026-${Math.floor(10000 + Math.random() * 89999)}`;
      state.messages.unshift({
        id: `msg-${Date.now()}`,
        reference: appRecord.reference,
        title: 'Application fee receipt issued ($10 USD)',
        body: `Proposed $10 USD fee receipt ${appRecord.feeReceiptNo} recorded for ${appRecord.reference}.`,
        category: 'Payment information',
        createdAt: now,
        read: false,
      });
      addAudit('payment_management', actorName, 'Recorded $10 USD fee payment', appRecord.reference, appRecord.feeReceiptNo);
    } else if (action === 'deposit_bond') {
      appRecord.bondRequired = true;
      appRecord.bondAmountUsd = 2000;
      appRecord.bondStatus = 'Held in government escrow';
      appRecord.bondReceiptNo = `BND-${appRecord.destinationCountry.slice(0, 3).toUpperCase()}-2026-${Math.floor(10000 + Math.random() * 89999)}`;
      state.messages.unshift({
        id: `msg-${Date.now()}`,
        reference: appRecord.reference,
        title: 'Refundable security bond receipt ($2,000 USD)',
        body: `Escrow bond receipt ${appRecord.bondReceiptNo} confirmed in destination government account. Refundable upon verified timely departure.`,
        category: 'Payment information',
        createdAt: now,
        read: false,
      });
      addAudit('payment_management', actorName, 'Confirmed $2,000 USD escrow bond deposit', appRecord.reference, appRecord.bondReceiptNo);
    } else if (action === 'refund_bond') {
      appRecord.bondStatus = 'Refunded';
      state.messages.unshift({
        id: `msg-${Date.now()}`,
        reference: appRecord.reference,
        title: 'Security bond refunded ($2,000 USD)',
        body: `Verified departure confirmed. Your $2,000 USD security bond (${appRecord.bondReceiptNo}) has been released to the original funding account.`,
        category: 'Payment information',
        createdAt: now,
        read: false,
      });
      addAudit('payment_management', actorName, 'Processed $2,000 USD bond refund', appRecord.reference, appRecord.bondReceiptNo);
    } else if (action === 'flag_dispute') {
      appRecord.bondStatus = 'Dispute review';
      addAudit('payment_management', actorName, 'Opened bond dispute/protection review', appRecord.reference, 'Awaiting reconciliation review.');
    }

    res.json(appRecord);
  });

  app.post('/api/airport/checkpoint', (req, res) => {
    const { reference, direction, airportCode, biometricMatch, passportAiPassed, notes } = req.body ?? {};
    const appRecord = state.applications.find((a) => a.reference === reference);
    if (!appRecord) {
      res.status(404).json({ error: 'Visa reference not found in global registry.' });
      return;
    }

    const now = new Date();
    const iso = now.toISOString();

    if (direction === 'Arrival') {
      const days = appRecord.requestedDuration === '30 days' ? 30 : appRecord.requestedDuration === '90 days' ? 90 : 180;
      const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      appRecord.travelStatus = 'Entered';
      appRecord.entryTimestamp = iso;
      appRecord.entryAirport = airportCode || appRecord.arrivalAirport;
      appRecord.visaExpiryDate = expiry.toISOString().slice(0, 10);
      appRecord.daysRemaining = days;
    } else {
      appRecord.travelStatus = 'Departed';
      appRecord.exitTimestamp = iso;
      appRecord.exitAirport = airportCode || appRecord.arrivalAirport;
      appRecord.daysRemaining = 0;
      if (appRecord.bondStatus === 'Held in government escrow') {
        appRecord.bondStatus = 'Refund eligible (departed)';
      }
      if (appRecord.feeStatus === 'Unpaid') {
        appRecord.feeStatus = 'Paid ($10 USD)';
        appRecord.feeReceiptNo = `DEP-FEE-${Math.floor(10000 + Math.random() * 89999)}`;
      }
    }

    const event: AirportCheckpointEvent = {
      id: `chk-${Date.now()}`,
      reference: appRecord.reference,
      travellerName: appRecord.fullName,
      airportCode: airportCode || appRecord.arrivalAirport,
      direction: direction === 'Departure' ? 'Departure' : 'Arrival',
      biometricMatch: Boolean(biometricMatch),
      passportAiPassed: Boolean(passportAiPassed),
      officerReviewed: true,
      offlineCached: state.offlineAirportMode,
      timestamp: iso,
      notes: String(notes || `${direction} processed at authorized e-Gate checkpoint.`),
    };

    state.checkpointEvents.unshift(event);
    addAudit(
      'airport_admin',
      `${event.airportCode} Terminal`,
      `Recorded ${event.direction.toLowerCase()}`,
      appRecord.reference,
      event.offlineCached ? 'Stored in encrypted offline terminal cache pending sync.' : event.notes
    );

    res.status(201).json({ application: appRecord, event });
  });

  app.post('/api/airport/toggle-offline', (req, res) => {
    state.offlineAirportMode = Boolean(req.body?.offline);
    addAudit(
      'airport_admin',
      'Airport Terminal Operations',
      state.offlineAirportMode ? 'Enabled offline airport verification cache' : 'Restored live global network sync',
      'SYSTEM',
      'Encrypted local cache mode updated.'
    );
    res.json({ offlineAirportMode: state.offlineAirportMode });
  });

  app.post('/api/airport/sync-offline', (_req, res) => {
    let syncedCount = 0;
    for (const ev of state.checkpointEvents) {
      if (ev.offlineCached) {
        ev.offlineCached = false;
        syncedCount += 1;
      }
    }
    state.offlineAirportMode = false;
    addAudit('airport_admin', 'Airport Terminal Operations', 'Synchronized offline checkpoint cache', 'SYSTEM', `${syncedCount} cached terminal events reconciled.`);
    res.json({ syncedCount, checkpointEvents: state.checkpointEvents, offlineAirportMode: false });
  });

  app.post('/api/inbox/appeal', (req, res) => {
    const { reference, subject, details } = req.body ?? {};
    if (!reference || !details) {
      res.status(400).json({ error: 'Visa reference and appeal/correction details are required.' });
      return;
    }
    const now = new Date().toISOString();
    const msg: InboxMessage = {
      id: `msg-${Date.now()}`,
      reference,
      title: subject || 'Correction / appeal request logged',
      body: `Traveller submission recorded: ${String(details).trim()} — Queued for independent officer review.`,
      category: 'Appeal',
      createdAt: now,
      read: true,
    };
    state.messages.unshift(msg);
    addAudit('traveller', 'Applicant Self-Service', 'Filed correction/appeal request', reference, String(details).trim());
    res.status(201).json(msg);
  });

  app.patch('/api/inbox/:id/read', (req, res) => {
    const msg = state.messages.find((m) => m.id === req.params.id);
    if (msg) msg.read = true;
    res.json({ ok: true });
  });

  app.patch('/api/countries/:code', (req, res) => {
    const country = state.countries.find((c) => c.code === req.params.code);
    if (!country) {
      res.status(404).json({ error: 'Country not found.' });
      return;
    }
    if (typeof req.body.feeApproved === 'boolean') country.feeApproved = req.body.feeApproved;
    if (typeof req.body.bondAuthorized === 'boolean') {
      country.bondAuthorized = req.body.bondAuthorized;
      country.bondAmountUsd = country.bondAuthorized ? 2000 : 0;
    }
    if (req.body.status) country.status = req.body.status;

    addAudit(
      'global_super_admin',
      'Global Governance Council',
      'Updated bilateral country rules',
      country.code,
      `${country.name}: Fee=${country.feeApproved ? '$10 approved' : 'Not approved'}, Bond=${country.bondAuthorized ? '$2,000 authorized' : 'Waived'}, Status=${country.status}`
    );
    res.json(country);
  });

  app.post('/api/ai/analyze-application', async (req, res) => {
    const { reference } = req.body ?? {};
    const appRecord = state.applications.find((a) => a.reference === reference);
    if (!appRecord) {
      res.status(404).json({ error: 'Visa reference not found.' });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment. Configure it in Settings > Secrets to run live Passport AI verification.',
      });
      return;
    }

    try {
      const prompt = `Analyze this demonstration visa application for an immigration officer's human review. Remember: AI never makes final visa decisions and must flag missing checks or overstay alerts neutrally.
Application Reference: ${appRecord.reference}
Applicant Name: ${appRecord.fullName}
Nationality: ${appRecord.nationality}
Passport Number: ${appRecord.passportNumber}
Destination: ${appRecord.destinationCountry} (${appRecord.arrivalAirport})
Requested Duration: ${appRecord.requestedDuration}
Submitted Documents Checkmarks: Passport Photo=${appRecord.documents.passportPhoto}, Live Biometric Face=${appRecord.documents.biometricFace}, Police Clearance=${appRecord.documents.policeClearance}, Proof of Funds=${appRecord.documents.proofOfFunds}
Police Clearance Status: ${appRecord.policeStatus}
Fee Status: ${appRecord.feeStatus}
Bond Status: ${appRecord.bondStatus}
Travel Status: ${appRecord.travelStatus} (Days remaining: ${appRecord.daysRemaining ?? 'Pre-arrival'})`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are the WORLD GATE Passport & Document Verification AI assistant supporting human immigration officers. Output concise, factual verification notes in JSON. Never approve or reject a visa yourself; always emphasize officer review and due process.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              riskLevel: { type: Type.STRING, enum: ['Low', 'Standard', 'Elevated'] },
              checks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              legalNote: { type: Type.STRING },
            },
            required: ['summary', 'riskLevel', 'checks', 'legalNote'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const assessment = {
        summary: String(parsed.summary || 'Document consistency check completed.'),
        riskLevel: (['Low', 'Standard', 'Elevated'].includes(parsed.riskLevel) ? parsed.riskLevel : 'Standard') as 'Low' | 'Standard' | 'Elevated',
        checks: Array.isArray(parsed.checks) ? parsed.checks.map(String) : ['Document metadata reviewed'],
        legalNote: String(parsed.legalNote || 'Advisory assessment only; final decision belongs solely to an authorized immigration officer.'),
        analyzedAt: new Date().toISOString(),
      };

      appRecord.aiAssessment = assessment;
      addAudit('immigration_officer', appRecord.officerName, 'Ran Passport AI verification check', appRecord.reference, `Risk tier: ${assessment.riskLevel}`);
      res.json(assessment);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI verification service error.';
      res.status(502).json({ error: `Gemini AI verification request failed: ${message}` });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WORLD GATE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WORLD GATE server:', err);
  process.exit(1);
});
