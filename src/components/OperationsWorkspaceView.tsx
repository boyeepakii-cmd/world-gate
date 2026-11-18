import { useState } from 'react';
import {
  Copy,
  Check,
  PlaneLanding,
  PlaneTakeoff,
  ShieldCheck,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Cpu,
  BadgeCheck,
  DollarSign,
  Globe2,
  Building2,
  Search,
} from 'lucide-react';
import { ASSETS, ROLE_PROFILES, SECURITY_MODULES } from '../constants';
import { ResilientImage } from './ResilientImage';
import type {
  AirportCheckpointEvent,
  AuditLogEntry,
  CountryNode,
  DashboardMetrics,
  OfficerDecision,
  PoliceStatus,
  UserRole,
  VisaApplication,
} from '../types';

export type OpsPane = 'officer' | 'airport' | 'police' | 'payments' | 'governance';

interface OperationsWorkspaceViewProps {
  activeRole: UserRole;
  actorDisplayName: string;
  initialPane?: OpsPane;
  applications: VisaApplication[];
  countries: CountryNode[];
  checkpointEvents: AirportCheckpointEvent[];
  auditLogs: AuditLogEntry[];
  metrics: DashboardMetrics;
  offlineAirportMode: boolean;
  onSwitchRole: (role: UserRole) => void;
  onRefreshState: () => Promise<void>;
}

export function OperationsWorkspaceView({
  activeRole,
  actorDisplayName,
  initialPane = 'officer',
  applications,
  countries,
  checkpointEvents,
  auditLogs,
  metrics,
  offlineAirportMode,
  onSwitchRole,
  onRefreshState,
}: OperationsWorkspaceViewProps) {
  const [pane, setPane] = useState<OpsPane>(initialPane);
  const [selectedRef, setSelectedRef] = useState<string>(applications[0]?.reference ?? 'WG-2026-008521');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'overstay'>('all');

  // Officer review controls
  const selectedApp = applications.find((a) => a.reference === selectedRef) ?? applications[0];
  const [decisionDraft, setDecisionDraft] = useState<OfficerDecision>(
    selectedApp?.officerDecision ?? 'Pending review'
  );
  const [remarksDraft, setRemarksDraft] = useState<string>(selectedApp?.officerRemarks ?? '');
  const [copiedRecord, setCopiedRecord] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Airport terminal controls
  const [gateDirection, setGateDirection] = useState<'Arrival' | 'Departure'>('Arrival');
  const [gateRef, setGateRef] = useState<string>(applications[0]?.reference ?? 'WG-2026-008521');
  const [gateAirport, setGateAirport] = useState<string>(
    applications[0]?.arrivalAirport ?? 'LHR — London Heathrow'
  );
  const [gateBiometricOk, setGateBiometricOk] = useState(true);
  const [gatePassportOk, setGatePassportOk] = useState(true);
  const [gateNotes, setGateNotes] = useState('');
  const [gateBusy, setGateBusy] = useState(false);

  // Police notes draft
  const [policeNotesMap, setPoliceNotesMap] = useState<Record<string, string>>({});

  const selectApplication = (app: VisaApplication) => {
    setSelectedRef(app.reference);
    setDecisionDraft(app.officerDecision);
    setRemarksDraft(app.officerRemarks);
    setAiError(null);
  };

  const filteredApps = applications.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.destinationCountry.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'pending') return a.status === 'Under review' || a.status === 'Additional documents requested';
    if (statusFilter === 'approved') return a.status === 'Approved';
    if (statusFilter === 'overstay') return a.travelStatus === 'Overstay alert';
    return true;
  });

  const handleSaveDecision = async () => {
    if (!selectedApp) return;
    setSavingDecision(true);
    try {
      await fetch(`/api/applications/${selectedApp.reference}/officer-review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerDecision: decisionDraft,
          officerRemarks: remarksDraft,
          officerName: actorDisplayName,
        }),
      });
      await onRefreshState();
    } finally {
      setSavingDecision(false);
    }
  };

  const handleRunPassportAi = async () => {
    if (!selectedApp) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const resp = await fetch('/api/ai/analyze-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: selectedApp.reference }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Passport AI verification failed.');
      }
      await onRefreshState();
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unable to reach Passport AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyRecord = async () => {
    if (!selectedApp) return;
    const text = `WORLD GATE REVIEW RECORD\nReference: ${selectedApp.reference}\nApplicant: ${selectedApp.fullName} (${selectedApp.nationality})\nPassport: ${selectedApp.passportNumber}\nDestination: ${selectedApp.destinationCountry} (${selectedApp.arrivalAirport})\nDecision: ${decisionDraft}\nOfficer: ${actorDisplayName}\nRemarks: ${remarksDraft}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(true);
      setTimeout(() => setCopiedRecord(false), 2000);
    } catch {
      setCopiedRecord(false);
    }
  };

  const handleRecordCheckpoint = async () => {
    setGateBusy(true);
    try {
      await fetch('/api/airport/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: gateRef,
          direction: gateDirection,
          airportCode: gateAirport,
          biometricMatch: gateBiometricOk,
          passportAiPassed: gatePassportOk,
          notes: gateNotes.trim() || undefined,
        }),
      });
      setGateNotes('');
      await onRefreshState();
    } finally {
      setGateBusy(false);
    }
  };

  const handleToggleOffline = async () => {
    await fetch('/api/airport/toggle-offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offline: !offlineAirportMode }),
    });
    await onRefreshState();
  };

  const handleSyncOffline = async () => {
    await fetch('/api/airport/sync-offline', { method: 'POST' });
    await onRefreshState();
  };

  const handlePoliceUpdate = async (ref: string, policeStatus: PoliceStatus) => {
    await fetch(`/api/applications/${ref}/police-verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        policeStatus,
        policeNotes: policeNotesMap[ref] || `Updated to ${policeStatus}`,
        verifierName: actorDisplayName,
      }),
    });
    await onRefreshState();
  };

  const handlePaymentAdmin = async (
    ref: string,
    action: 'pay_fee' | 'deposit_bond' | 'refund_bond' | 'flag_dispute'
  ) => {
    await fetch(`/api/applications/${ref}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, actorName: actorDisplayName }),
    });
    await onRefreshState();
  };

  const handleCountryToggle = async (
    code: string,
    patch: Partial<Pick<CountryNode, 'feeApproved' | 'bondAuthorized' | 'status'>>
  ) => {
    await fetch(`/api/countries/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await onRefreshState();
  };

  const cachedEventsCount = checkpointEvents.filter((e) => e.offlineCached).length;
  const overstayCases = applications.filter((a) => a.travelStatus === 'Overstay alert');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Workspace Sidebar (250px) */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-white border border-slate-200 rounded-xl p-4 space-y-5">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Role Context</div>
            <div className="mt-1 text-sm font-bold text-[#0B1B35]">{actorDisplayName}</div>
            <div className="mt-2">
              <label htmlFor="sidebar-role-select" className="sr-only">
                Switch demonstration role
              </label>
              <select
                id="sidebar-role-select"
                value={activeRole}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  onSwitchRole(nextRole);
                  if (nextRole === 'immigration_officer') setPane('officer');
                  if (nextRole === 'airport_admin') setPane('airport');
                  if (nextRole === 'police_verification') setPane('police');
                  if (nextRole === 'payment_management') setPane('payments');
                  if (nextRole === 'global_super_admin') setPane('governance');
                }}
                className="w-full px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                {ROLE_PROFILES.map((rp) => (
                  <option key={rp.role} value={rp.role}>
                    {rp.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <nav aria-label="Operations modules" className="space-y-1 border-t border-slate-200 pt-4">
            {(
              [
                { id: 'officer', label: 'Immigration Control Panel', icon: Building2 },
                { id: 'airport', label: 'Airport Arrival & Departure', icon: PlaneLanding },
                { id: 'police', label: 'Security & Police Liaison', icon: ShieldCheck },
                { id: 'payments', label: 'Payment & Bond Treasury', icon: DollarSign },
                { id: 'governance', label: 'Global Network & Audit', icon: Globe2 },
              ] as const
            ).map((nav) => {
              const Icon = nav.icon;
              const active = pane === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setPane(nav.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors text-left ${
                    active
                      ? 'bg-[#0B1B35] text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{nav.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 leading-relaxed">
            Demonstration environment. Official decisions require authenticated officers and an auditable government system.
          </div>
        </aside>

        {/* Main Operations Viewport */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* PANE 1: IMMIGRATION CONTROL PANEL */}
          {pane === 'officer' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Immigration Admin · Demonstration Dashboard
                  </div>
                  <h1 className="text-2xl font-bold text-[#0B1B35]">
                    Immigration Department Control Panel
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={ASSETS.officerAvatar}
                    alt="Authorized immigration officer portrait"
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-[#0B1B35]">{actorDisplayName}</div>
                    <div className="text-slate-500">Officer Decision Authority</div>
                  </div>
                </div>
              </div>

              {/* 4 KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#0B1B35]">
                    {metrics.applicationsReceived.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Applications received</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-700">
                    {metrics.pendingReviews.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Pending reviews</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#16A34A]">
                    {metrics.approved.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Approved</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="text-2xl font-bold font-mono tabular-nums text-[#1D4ED8]">
                    {metrics.additionalChecks.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">Additional checks</div>
                </div>
              </div>

              {/* Overstay Alerts Banner if any */}
              {overstayCases.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-sm text-red-900">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">
                        {overstayCases.length} Overstay Case Alert(s) requiring officer review:
                      </span>{' '}
                      {overstayCases.map((c) => `${c.reference} (${c.fullName})`).join(', ')}. Alerts require lawful review and appeal verification before police liaison.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectApplication(overstayCases[0])}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-800 bg-white border border-red-300 rounded-lg hover:bg-red-100 shrink-0 whitespace-nowrap"
                  >
                    Inspect Alert Case
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Application Queue Table */}
                <div className="xl:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-bold text-[#0B1B35]">Application Queue</h2>
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(
                          [
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'approved', label: 'Approved' },
                            { id: 'overstay', label: 'Overstay' },
                          ] as const
                        ).map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                              statusFilter === f.id
                                ? 'bg-white text-[#0B1B35] shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by reference, name, passport, or destination..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                          <th className="py-2.5 px-4">Reference</th>
                          <th className="py-2.5 px-3">Applicant</th>
                          <th className="py-2.5 px-3">Destination</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredApps.map((app) => {
                          const isSelected = app.reference === selectedApp?.reference;
                          return (
                            <tr
                              key={app.reference}
                              onClick={() => selectApplication(app)}
                              className={`cursor-pointer transition-colors h-11 ${
                                isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-4 font-mono font-semibold tabular-nums text-[#0B1B35] whitespace-nowrap">
                                {app.reference}
                              </td>
                              <td className="py-2.5 px-3 text-slate-800">{app.fullName}</td>
                              <td className="py-2.5 px-3 text-slate-600">{app.destinationCountry}</td>
                              <td className="py-2.5 px-4 font-medium whitespace-nowrap">
                                <span
                                  className={
                                    app.status === 'Approved'
                                      ? 'text-[#16A34A]'
                                      : app.status === 'Rejected'
                                      ? 'text-red-700'
                                      : 'text-amber-700'
                                  }
                                >
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Application Review Panel */}
                {selectedApp && (
                  <div className="xl:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <div className="text-xs font-medium text-slate-500">Application review</div>
                        <div className="mt-1 flex items-baseline gap-3">
                          <h2 className="text-xl font-bold font-mono tabular-nums text-[#0B1B35]">
                            {selectedApp.reference}
                          </h2>
                          <span className="text-sm text-slate-600">
                            {selectedApp.fullName} · {selectedApp.nationality}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Passport <span className="font-mono">{selectedApp.passportNumber}</span> ·{' '}
                          {selectedApp.destinationCountry} ({selectedApp.arrivalAirport}) ·{' '}
                          {selectedApp.requestedDuration}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRunPassportAi}
                        disabled={aiLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0B1B35] rounded-lg hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        {aiLoading ? 'Analyzing dossier...' : 'Run Passport AI Check'}
                      </button>
                    </div>

                    {aiError && (
                      <div className="p-3.5 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg">
                        {aiError}
                      </div>
                    )}

                    {selectedApp.aiAssessment && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#0B1B35]">
                            Passport AI Advisory Assessment
                          </span>
                          <span className="font-mono font-semibold text-slate-700">
                            Tier: {selectedApp.aiAssessment.riskLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedApp.aiAssessment.summary}
                        </p>
                        <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                          {selectedApp.aiAssessment.checks.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                        <div className="text-[11px] text-slate-500 pt-1">
                          {selectedApp.aiAssessment.legalNote}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div>
                        <div className="text-slate-500">Police clearance</div>
                        <div className="mt-0.5 font-semibold text-[#0B1B35]">{selectedApp.policeStatus}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Fee ($10 USD)</div>
                        <div className="mt-0.5 font-semibold text-[#0B1B35]">{selectedApp.feeStatus}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Security bond</div>
                        <div className="mt-0.5 font-semibold text-[#0B1B35]">{selectedApp.bondStatus}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-slate-700">
                        Officer decision
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(
                          [
                            'Pending review',
                            'Approve (subject to checks)',
                            'Request more documents',
                            'Reject with lawful reason',
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setDecisionDraft(opt)}
                            className={`px-3.5 py-2.5 text-left text-xs font-medium rounded-lg border transition-colors ${
                              decisionDraft === opt
                                ? 'border-[#1D4ED8] bg-blue-50 text-[#0B1B35] font-semibold'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="officer-remarks" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Officer remarks
                      </label>
                      <textarea
                        id="officer-remarks"
                        rows={3}
                        value={remarksDraft}
                        onChange={(e) => setRemarksDraft(e.target.value)}
                        placeholder="Record lawful rationale, missing document notes, or arrival conditions..."
                        className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyRecord}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                      >
                        {copiedRecord ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedRecord ? 'Copied review record' : 'Copy review record'}
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDecision}
                        disabled={savingDecision}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 disabled:opacity-60"
                      >
                        {savingDecision ? 'Saving decision...' : 'Record Officer Decision'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANE 2: AIRPORT ARRIVAL & DEPARTURE */}
          {pane === 'airport' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Connected Airport Terminals · Entry &amp; Exit Checkpoints
                  </div>
                  <h1 className="text-2xl font-bold text-[#0B1B35]">
                    Airport Arrival &amp; Departure Control
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleOffline}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      offlineAirportMode
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    {offlineAirportMode ? 'Offline Cache Mode Active' : 'Enable Offline Airport Mode'}
                  </button>

                  {cachedEventsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleSyncOffline}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Sync {cachedEventsCount} Cached Record(s)
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setGateDirection('Arrival')}
                      className={`flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                        gateDirection === 'Arrival'
                          ? 'bg-white text-[#0B1B35] shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      <PlaneLanding className="w-4 h-4" />
                      Airport Arrival
                    </button>
                    <button
                      type="button"
                      onClick={() => setGateDirection('Departure')}
                      className={`flex-1 inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                        gateDirection === 'Departure'
                          ? 'bg-white text-[#0B1B35] shadow-sm'
                          : 'text-slate-600'
                      }`}
                    >
                      <PlaneTakeoff className="w-4 h-4" />
                      Airport Departure
                    </button>
                  </div>

                  <div>
                    <label htmlFor="gate-ref" className="block text-xs font-medium text-slate-700 mb-1">
                      Traveller Visa Reference
                    </label>
                    <select
                      id="gate-ref"
                      value={gateRef}
                      onChange={(e) => {
                        setGateRef(e.target.value);
                        const match = applications.find((a) => a.reference === e.target.value);
                        if (match) setGateAirport(match.arrivalAirport);
                      }}
                      className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg bg-white"
                    >
                      {applications.map((a) => (
                        <option key={a.reference} value={a.reference}>
                          {a.reference} — {a.fullName} ({a.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gate-airport" className="block text-xs font-medium text-slate-700 mb-1">
                      Terminal Checkpoint
                    </label>
                    <select
                      id="gate-airport"
                      value={gateAirport}
                      onChange={(e) => setGateAirport(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {countries.flatMap((c) => c.airports).map((ap) => (
                        <option key={ap} value={ap}>
                          {ap}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={gatePassportOk}
                        onChange={(e) => setGatePassportOk(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8]"
                      />
                      Passport AI optical &amp; cryptographic check passed
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={gateBiometricOk}
                        onChange={(e) => setGateBiometricOk(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8]"
                      />
                      Authorized checkpoint face match verified
                    </label>
                  </div>

                  <div>
                    <label htmlFor="gate-notes" className="block text-xs font-medium text-slate-700 mb-1">
                      Checkpoint officer notes
                    </label>
                    <input
                      id="gate-notes"
                      type="text"
                      value={gateNotes}
                      onChange={(e) => setGateNotes(e.target.value)}
                      placeholder="Optional gate lane or bond receipt verification note"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={gateBusy}
                    onClick={handleRecordCheckpoint}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 disabled:opacity-60"
                  >
                    {gateBusy
                      ? 'Logging checkpoint...'
                      : gateDirection === 'Arrival'
                      ? 'Record Lawful Arrival Timestamp'
                      : 'Record Departure & Trigger Bond Eligibility'}
                  </button>
                </div>

                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#0B1B35]">Recent Airport Checkpoint Events</h2>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {checkpointEvents.length} logged
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                          <th className="py-2.5 px-4">Direction</th>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Airport</th>
                          <th className="py-2.5 px-3">Sync</th>
                          <th className="py-2.5 px-4">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {checkpointEvents.map((ev) => (
                          <tr key={ev.id} className="h-11 hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-[#0B1B35]">{ev.direction}</td>
                            <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">{ev.reference}</td>
                            <td className="py-2.5 px-3 text-slate-600">{ev.airportCode}</td>
                            <td className="py-2.5 px-3">
                              <span className={ev.offlineCached ? 'text-amber-700 font-semibold' : 'text-[#16A34A]'}>
                                {ev.offlineCached ? 'Offline cache' : 'Synced'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                              {new Date(ev.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANE 3: SECURITY, BIOMETRICS & POLICE LIAISON */}
          {pane === 'police' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Universal Airport Security Network · Lawful Police Liaison
                </div>
                <h1 className="text-2xl font-bold text-[#0B1B35]">
                  Security, Biometrics &amp; Police Verification
                </h1>
              </div>

              <div className="bg-[#0B1B35] text-white rounded-xl p-6 space-y-2">
                <div className="text-xs font-semibold text-blue-300">Important security principle</div>
                <p className="text-sm text-slate-200 leading-relaxed max-w-4xl">
                  Face recognition verifies a traveller strictly at an authorized checkpoint, not continuously across public cameras. All automated alerts must be reviewed by authenticated human officers with formal correction and appeal procedures.
                </p>
              </div>

              {/* Police Clearance Verification Queue */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0B1B35]">
                      Issuing-Authority Police Clearance Verification
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify submitted clearance certificates directly with provincial/national issuing agencies.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-200">
                  {applications.map((app) => (
                    <div
                      key={app.reference}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono font-bold text-[#0B1B35]">{app.reference}</span>
                          <span>·</span>
                          <span>{app.fullName}</span>
                          <span>·</span>
                          <span className="font-mono">{app.policeAuthorityRef}</span>
                        </div>
                        <div className="text-sm font-semibold text-[#0B1B35]">
                          Status: {app.policeStatus}
                        </div>
                        <p className="text-xs text-slate-600">{app.policeNotes}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          value={policeNotesMap[app.reference] ?? ''}
                          onChange={(e) =>
                            setPoliceNotesMap({ ...policeNotesMap, [app.reference]: e.target.value })
                          }
                          placeholder="Verification note..."
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handlePoliceUpdate(app.reference, 'Verified by issuing authority')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A34A] rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Verify Clearance
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePoliceUpdate(app.reference, 'Clarification needed')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                        >
                          Request Clarification
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10 Security Modules Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h2 className="text-base font-bold text-[#0B1B35]">
                    Connected Airport Security Modules
                  </h2>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 font-medium">
                      <th className="py-2.5 px-5">Module</th>
                      <th className="py-2.5 px-5">Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {SECURITY_MODULES.map((m) => (
                      <tr key={m.module} className="h-11">
                        <td className="py-2.5 px-5 font-semibold text-[#0B1B35] whitespace-nowrap">{m.module}</td>
                        <td className="py-2.5 px-5 text-slate-600">{m.fn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANE 4: PAYMENT & BOND TREASURY */}
          {pane === 'payments' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Authorized Government Accounts · Reconciliation &amp; Refunds
                </div>
                <h1 className="text-2xl font-bold text-[#0B1B35]">
                  Payment Management &amp; Security Bond Escrow
                </h1>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-3">Destination</th>
                        <th className="py-3 px-3">$10 Fee</th>
                        <th className="py-3 px-3">$2,000 Bond Status</th>
                        <th className="py-3 px-3">Travel Status</th>
                        <th className="py-3 px-4">Reconciliation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {applications.map((app) => (
                        <tr key={app.reference} className="h-12">
                          <td className="py-3 px-4 font-mono font-bold text-[#0B1B35] whitespace-nowrap">
                            {app.reference}
                          </td>
                          <td className="py-3 px-3 text-slate-700">{app.destinationCountry}</td>
                          <td className="py-3 px-3 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {app.feeStatus}
                          </td>
                          <td className="py-3 px-3 font-medium text-[#0B1B35]">{app.bondStatus}</td>
                          <td className="py-3 px-3 text-slate-600">{app.travelStatus}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-2">
                              {app.feeStatus === 'Unpaid' && (
                                <button
                                  type="button"
                                  onClick={() => handlePaymentAdmin(app.reference, 'pay_fee')}
                                  className="px-2.5 py-1 text-xs font-medium text-white bg-[#1D4ED8] rounded hover:bg-blue-800 whitespace-nowrap"
                                >
                                  Collect $10 Fee
                                </button>
                              )}
                              {app.bondRequired && app.bondStatus === 'Awaiting payment' && (
                                <button
                                  type="button"
                                  onClick={() => handlePaymentAdmin(app.reference, 'deposit_bond')}
                                  className="px-2.5 py-1 text-xs font-medium text-white bg-[#0B1B35] rounded hover:bg-slate-800 whitespace-nowrap"
                                >
                                  Confirm $2,000 Escrow
                                </button>
                              )}
                              {(app.bondStatus === 'Refund eligible (departed)' ||
                                (app.bondStatus === 'Held in government escrow' &&
                                  app.travelStatus === 'Departed')) && (
                                <button
                                  type="button"
                                  onClick={() => handlePaymentAdmin(app.reference, 'refund_bond')}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#16A34A] rounded hover:bg-emerald-700 whitespace-nowrap"
                                >
                                  Release $2,000 Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PANE 5: GLOBAL GOVERNANCE & AUDIT */}
          {pane === 'governance' && (
            <div className="space-y-6">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Global Super Admin · Sovereign Country Authorizations
                </div>
                <h1 className="text-2xl font-bold text-[#0B1B35]">
                  Country Network Governance &amp; Audit Logs
                </h1>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h2 className="text-base font-bold text-[#0B1B35]">
                    Participating Government Authorizations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each participating country independently authorizes fee rules, bond rules, and connected airports.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium">
                        <th className="py-3 px-4">Country</th>
                        <th className="py-3 px-3">Immigration Authority</th>
                        <th className="py-3 px-3">$10 Fee Law</th>
                        <th className="py-3 px-3">$2,000 Bond</th>
                        <th className="py-3 px-4">Treaty Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {countries.map((c) => (
                        <tr key={c.code} className="h-12">
                          <td className="py-3 px-4 font-semibold text-[#0B1B35]">{c.name}</td>
                          <td className="py-3 px-3 text-slate-600">{c.immigrationAuthority}</td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleCountryToggle(c.code, { feeApproved: !c.feeApproved })}
                              className={`px-2.5 py-1 rounded border font-medium ${
                                c.feeApproved
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                  : 'border-slate-300 bg-white text-slate-600'
                              }`}
                            >
                              {c.feeApproved ? 'Approved' : 'Not approved'}
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleCountryToggle(c.code, { bondAuthorized: !c.bondAuthorized })
                              }
                              className={`px-2.5 py-1 rounded border font-medium ${
                                c.bondAuthorized
                                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                                  : 'border-slate-300 bg-white text-slate-600'
                              }`}
                            >
                              {c.bondAuthorized ? 'Authorized ($2k)' : 'Waived'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              aria-label={`Treaty status for ${c.name}`}
                              value={c.status}
                              onChange={(e) =>
                                handleCountryToggle(c.code, {
                                  status: e.target.value as CountryNode['status'],
                                })
                              }
                              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                            >
                              <option value="Active bilateral">Active bilateral</option>
                              <option value="Pilot agreement">Pilot agreement</option>
                              <option value="Pending legislative review">Pending legislative review</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tamper-evident Audit Log */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#0B1B35]">Tamper-Evident Audit Log</h2>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {auditLogs.length} events
                  </span>
                </div>
                <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-[#0B1B35]">{log.action}</span>{' '}
                        <span className="text-slate-500">by {log.actorName}</span> ·{' '}
                        <span className="font-mono text-[#1D4ED8]">{log.targetRef}</span>
                        <div className="text-slate-600 mt-0.5">{log.details}</div>
                      </div>
                      <div className="font-mono tabular-nums text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
