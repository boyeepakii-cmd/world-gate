import { useState, type FormEvent } from 'react';
import {
  Mail,
  Receipt,
  ShieldCheck,
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import type { InboxMessage, NavSection, VisaApplication } from '../types';

type AccountTab = 'applications' | 'inbox' | 'receipts' | 'bond' | 'appeals';

interface TravellerPortalViewProps {
  applications: VisaApplication[];
  messages: InboxMessage[];
  activeReference: string;
  initialTab?: AccountTab;
  onSelectReference: (ref: string) => void;
  onNavigate: (section: NavSection) => void;
  onRefreshState: () => Promise<void>;
}

export function TravellerPortalView({
  applications,
  messages,
  activeReference,
  initialTab = 'applications',
  onSelectReference,
  onNavigate,
  onRefreshState,
}: TravellerPortalViewProps) {
  const [tab, setTab] = useState<AccountTab>(initialTab);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [appealSubject, setAppealSubject] = useState('');
  const [appealDetails, setAppealDetails] = useState('');
  const [appealSaved, setAppealSaved] = useState(false);

  const activeApp =
    applications.find((a) => a.reference === activeReference) ?? applications[0];

  const refMessages = messages.filter((m) => m.reference === activeApp?.reference);
  const unreadCount = refMessages.filter((m) => !m.read).length;

  const handlePaymentAction = async (action: 'pay_fee' | 'deposit_bond' | 'flag_dispute') => {
    if (!activeApp) return;
    setBusyAction(action);
    try {
      await fetch(`/api/applications/${activeApp.reference}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorName: activeApp.fullName,
        }),
      });
      await onRefreshState();
    } finally {
      setBusyAction(null);
    }
  };

  const handleMarkRead = async (id: string) => {
    await fetch(`/api/inbox/${id}/read`, { method: 'PATCH' });
    await onRefreshState();
  };

  const handleAppealSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeApp || !appealDetails.trim()) return;
    setBusyAction('appeal');
    setAppealSaved(false);
    try {
      await fetch('/api/inbox/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: activeApp.reference,
          subject: appealSubject.trim() || 'Record correction / appeal request',
          details: appealDetails.trim(),
        }),
      });
      setAppealSubject('');
      setAppealDetails('');
      setAppealSaved(true);
      await onRefreshState();
    } finally {
      setBusyAction(null);
    }
  };

  if (!activeApp) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-600">No applications found in the registry.</p>
          <button
            type="button"
            onClick={() => onNavigate('apply')}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg"
          >
            Apply for Visa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-8">
      {/* Reference-Based Account Header */}
      <div className="bg-[#0B1B35] text-white rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-300">
              My World Gate Account · Reference-based digital account (not a bank account)
            </div>
            <div className="flex flex-wrap items-baseline gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight">
                {activeApp.reference}
              </h1>
              <span className="text-sm text-slate-300">
                {activeApp.fullName} · {activeApp.nationality}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="ref-switcher" className="text-xs text-slate-300">
              Switch Reference:
            </label>
            <select
              id="ref-switcher"
              value={activeApp.reference}
              onChange={(e) => onSelectReference(e.target.value)}
              className="px-3 py-2 text-sm font-mono bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {applications.map((a) => (
                <option key={a.reference} value={a.reference} className="text-slate-900">
                  {a.reference} — {a.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-xs text-slate-400">Account type</div>
            <div className="mt-1 font-semibold">Traveller</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Application status</div>
            <div className="mt-1 font-semibold">{activeApp.status}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Destination &amp; Port</div>
            <div className="mt-1 font-semibold">{activeApp.destinationCountry}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Travel &amp; Expiry Status</div>
            <div className="mt-1 font-semibold">
              {activeApp.travelStatus}
              {activeApp.daysRemaining !== null && activeApp.travelStatus === 'Entered'
                ? ` (${activeApp.daysRemaining}d left)`
                : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        {(
          [
            { id: 'applications', label: 'My applications' },
            { id: 'inbox', label: `Immigration inbox (${unreadCount})` },
            { id: 'receipts', label: 'Payment receipts' },
            { id: 'bond', label: 'Security bond' },
            { id: 'appeals', label: 'Corrections & appeals' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-white text-[#0B1B35] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0B1B35]">Visa Application Dossier</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted {new Date(activeApp.submittedAt).toLocaleString()}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-700">
                Passport: {activeApp.passportNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Arrival airport</div>
                <div className="mt-0.5 font-medium text-[#0B1B35]">{activeApp.arrivalAirport}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Requested visa duration</div>
                <div className="mt-0.5 font-medium text-[#0B1B35]">
                  {activeApp.requestedDuration === '6 months'
                    ? '6 months (maximum proposed)'
                    : activeApp.requestedDuration}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Officer review decision</div>
                <div className="mt-0.5 font-medium text-[#0B1B35]">{activeApp.officerDecision}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Police clearance verification</div>
                <div className="mt-0.5 font-medium text-[#0B1B35]">{activeApp.policeStatus}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-3">
                Identity &amp; Document Verification Checkmarks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {[
                  { label: 'Passport photograph', ok: activeApp.documents.passportPhoto },
                  { label: 'Live biometric face verification', ok: activeApp.documents.biometricFace },
                  { label: 'Local police clearance certificate', ok: activeApp.documents.policeClearance },
                  { label: 'Proof of available travel funds', ok: activeApp.documents.proofOfFunds },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <FileCheck2
                      className={`w-4 h-4 shrink-0 ${doc.ok ? 'text-[#16A34A]' : 'text-amber-600'}`}
                    />
                    <span className="text-slate-700">{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {activeApp.officerRemarks && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                <div className="text-xs font-medium text-slate-500">Latest Officer Remarks ({activeApp.officerName})</div>
                <p className="mt-1 text-slate-800">{activeApp.officerRemarks}</p>
              </div>
            )}
          </div>

          {/* Six-month visitor visa timeline & reminders */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1D4ED8]" />
              <h2 className="text-lg font-bold text-[#0B1B35]">Visitor Stay &amp; Expiry Schedule</h2>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Maximum 6-month visitor stay subject to national visa rules. Automatic reminders dispatch at 30 days, 15 days, and 7 days prior to expiry.
            </p>

            <div className="space-y-3 text-sm border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Entry timestamp</span>
                <span className="font-mono tabular-nums text-[#0B1B35]">
                  {activeApp.entryTimestamp ? new Date(activeApp.entryTimestamp).toLocaleString() : 'Not yet entered'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Exit timestamp</span>
                <span className="font-mono tabular-nums text-[#0B1B35]">
                  {activeApp.exitTimestamp ? new Date(activeApp.exitTimestamp).toLocaleString() : 'In-country / Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized expiry date</span>
                <span className="font-mono tabular-nums text-[#0B1B35]">
                  {activeApp.visaExpiryDate ?? 'Calculated upon arrival'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-slate-700">Automated Reminder Milestones</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[30, 15, 7].map((milestone) => {
                  const triggered =
                    activeApp.daysRemaining !== null && activeApp.daysRemaining <= milestone;
                  return (
                    <div
                      key={milestone}
                      className={`p-2.5 rounded-lg border ${
                        triggered
                          ? 'border-amber-300 bg-amber-50 text-amber-800 font-semibold'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {milestone}-day notice
                    </div>
                  );
                })}
              </div>
            </div>

            {activeApp.travelStatus === 'Overstay alert' && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Overstay alert flagged:</span> Case routed to an authorized officer for lawful review. You may submit a correction or appeal immediately.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'inbox' && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-[#1D4ED8]" />
              <div>
                <h2 className="text-lg font-bold text-[#0B1B35]">Immigration Inbox</h2>
                <p className="text-xs text-slate-500">
                  Official messages for reference {activeApp.reference}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {refMessages.length} messages · {unreadCount} unread
            </span>
          </div>

          {refMessages.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No messages logged for this visa reference yet.
            </div>
          ) : (
            refMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  msg.read ? 'bg-white' : 'bg-blue-50/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-[#0B1B35]">{msg.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    {!msg.read && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#1D4ED8]">Unread</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#0B1B35]">{msg.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{msg.body}</p>
                </div>
                {!msg.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(msg.id)}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shrink-0 whitespace-nowrap"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'receipts' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#1D4ED8]" />
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">Payment Receipts ($10 USD Proposed Fee)</h2>
              <p className="text-xs text-slate-500">
                Illustrative fee tracking; applicable only where authorized by national law.
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Application / Departure Fee Status</div>
              <div className="text-lg font-bold font-mono tabular-nums text-[#0B1B35]">
                {activeApp.feeStatus}
              </div>
              <div className="text-xs font-mono text-slate-600">Receipt: {activeApp.feeReceiptNo}</div>
            </div>

            {activeApp.feeStatus === 'Unpaid' ? (
              <button
                type="button"
                disabled={busyAction === 'pay_fee'}
                onClick={() => handlePaymentAction('pay_fee')}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap"
              >
                {busyAction === 'pay_fee' ? 'Recording receipt...' : 'Record $10 USD Demo Payment'}
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#16A34A]">
                <CheckCircle2 className="w-4 h-4" />
                Receipt verified
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'bond' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">
                Destination-Country Security Bond ($2,000 USD Proposed)
              </h2>
              <p className="text-xs text-slate-500">
                Held strictly in a destination government-designated account with published refund and dispute protections.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Bond Requirement</div>
              <div className="mt-1 text-xl font-bold font-mono tabular-nums text-[#0B1B35]">
                {activeApp.bondRequired ? `$${activeApp.bondAmountUsd.toLocaleString()} USD` : 'Not required'}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Escrow Status</div>
              <div className="mt-1 text-base font-semibold text-[#0B1B35]">{activeApp.bondStatus}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-500">Government Account Receipt</div>
              <div className="mt-1 text-xs font-mono text-slate-700 break-all">{activeApp.bondReceiptNo}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {activeApp.bondRequired && activeApp.bondStatus === 'Awaiting payment' && (
              <button
                type="button"
                disabled={busyAction === 'deposit_bond'}
                onClick={() => handlePaymentAction('deposit_bond')}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 disabled:opacity-60"
              >
                {busyAction === 'deposit_bond'
                  ? 'Confirming government escrow...'
                  : 'Record $2,000 USD Government Escrow Deposit'}
              </button>
            )}

            {activeApp.bondRequired &&
              activeApp.bondStatus !== 'Awaiting payment' &&
              activeApp.bondStatus !== 'Dispute review' && (
                <button
                  type="button"
                  disabled={busyAction === 'flag_dispute'}
                  onClick={() => handlePaymentAction('flag_dispute')}
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Request Bond Refund / Dispute Review
                </button>
              )}
          </div>
        </div>
      )}

      {tab === 'appeals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#1D4ED8]" />
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">Traveller Correction &amp; Appeal Process</h2>
              <p className="text-xs text-slate-500">
                Required safeguard: challenge incorrect biometric flags, overstay notices, or officer decisions through documented review.
              </p>
            </div>
          </div>

          <form onSubmit={handleAppealSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label htmlFor="appeal-subject" className="block text-xs font-medium text-slate-700 mb-1.5">
                Subject
              </label>
              <input
                id="appeal-subject"
                type="text"
                value={appealSubject}
                onChange={(e) => setAppealSubject(e.target.value)}
                placeholder="e.g. Request correction of departure timestamp or officer review"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label htmlFor="appeal-details" className="block text-xs font-medium text-slate-700 mb-1.5">
                Supporting explanation
              </label>
              <textarea
                id="appeal-details"
                rows={4}
                required
                value={appealDetails}
                onChange={(e) => setAppealDetails(e.target.value)}
                placeholder="Describe the record to be corrected or the grounds for appeal..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <button
              type="submit"
              disabled={busyAction === 'appeal'}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0B1B35] rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {busyAction === 'appeal' ? 'Submitting appeal...' : 'Submit Correction / Appeal Request'}
            </button>

            {appealSaved && (
              <div className="text-xs font-medium text-[#16A34A]">
                Appeal logged to your Immigration Inbox and the tamper-evident audit trail.
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
