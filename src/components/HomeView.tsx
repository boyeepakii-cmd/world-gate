import { ArrowRight, CheckCircle2, Globe2, ShieldCheck, Building2, FileText, Scale } from 'lucide-react';
import {
  ARCHITECTURE_STACK,
  ASSETS,
  FINANCIAL_LIFECYCLE_STEPS,
  LEGAL_SAFEGUARDS,
} from '../constants';
import { ResilientImage } from './ResilientImage';
import type { CountryNode, DashboardMetrics, NavSection, UserRole } from '../types';

interface HomeViewProps {
  metrics: DashboardMetrics;
  countries: CountryNode[];
  onNavigate: (section: NavSection) => void;
  onOpenRoleModal: () => void;
  onQuickSwitchRole: (role: UserRole, section: NavSection) => void;
}

export function HomeView({
  metrics,
  countries,
  onNavigate,
  onOpenRoleModal,
  onQuickSwitchRole,
}: HomeViewProps) {
  const activeCountries = countries.filter((c) => c.status === 'Active bilateral').length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section: Balanced 2-column split */}
      <section className="max-w-[1280px] mx-auto px-6 pt-10 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div className="space-y-5">
              <div className="text-xs font-medium tracking-wide text-slate-500">
                Global Visa Network · All Connected Airports · Demonstration System
              </div>

              <h1 className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-[#0B1B35] text-balance">
                Your Global Visa. One Reference.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                One World. One Visa Reference. Connected Airports. Secure Travel. Apply for travel authorization, record required verification steps, receive official immigration officer decisions, and track your digital reference from departure to return.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('apply')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap"
                >
                  Apply for Visa
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('account')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#0B1B35] bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  View Digital Account
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0B1B35]">
                  {metrics.applicationsReceived.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Applications received</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0B1B35]">
                  {activeCountries}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Active bilateral corridors</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono tabular-nums text-[#0B1B35]">
                  $10 USD
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Proposed application fee</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-xl overflow-hidden border border-slate-200 min-h-[340px] lg:min-h-[460px]">
            <ResilientImage
              src={ASSETS.heroGate}
              alt="Automated biometric immigration e-Gates inside an international airport terminal"
              fallbackTitle="Connected Airport Automated e-Gates"
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="text-xs font-medium text-slate-200">
                Participating International Airports · Checkpoint Verification
              </div>
              <div className="mt-1 text-lg font-semibold leading-snug">
                Verified biometric identity at authorized airport gates — never continuous public surveillance.
              </div>
            </div>
          </div>
        </div>

        {/* 4-column capability strip below the hero split */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-semibold text-[#0B1B35]">Airport Connected</div>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Participating international airports synchronize arrival and departure records directly with national authorities.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-semibold text-[#0B1B35]">Biometric Identity</div>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Secure optical passport inspection and live face verification at authorized checkpoints with consent.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-semibold text-[#0B1B35]">Immigration Review</div>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Official decisions belong solely to authenticated national immigration officers with full audit trails.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-semibold text-[#0B1B35]">Digital Reference</div>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Every applicant receives a reference-based digital account to track review status, receipts, and bonds.
            </p>
          </div>
        </div>
      </section>

      {/* Proposed Fee & Security Bond Model */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-medium text-slate-500">01. Proposed Financial Model</div>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold text-[#0B1B35] text-balance">
                  Transparent Visa Fees and Refundable Security Bonds
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Illustrative proposed amounts subject to participating country approval and applicable national laws. Payments go strictly to verified government-designated accounts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-medium text-slate-500">Proposed application fee</div>
                  <div className="mt-1.5 text-3xl font-bold font-mono tabular-nums text-[#0B1B35]">
                    $10 <span className="text-base font-medium text-slate-500">USD</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Collected online or at an authorized departure counter where national law permits.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-medium text-slate-500">Proposed security bond</div>
                  <div className="mt-1.5 text-3xl font-bold font-mono tabular-nums text-[#0B1B35]">
                    $2,000 <span className="text-base font-medium text-slate-500">USD</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Refundable destination-country escrow bond where authorized; released upon verified exit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('fees')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] hover:underline"
                >
                  Explore Fees &amp; Bonds Ledger
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-slate-200 border-t lg:border-t-0 border-slate-200">
              {FINANCIAL_LIFECYCLE_STEPS.map((item) => (
                <div key={item.step} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#1D4ED8] pt-0.5 shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0B1B35]">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Role Demonstration Access & 6-Month Visitor Visa */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-[#0B1B35] text-white rounded-xl p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-medium text-slate-300">
                02. Six-Month Visitor Management &amp; Multi-Role Operations
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
                Designed for Travellers, Officers, Airports, Police Liaison, and Treasury Oversight
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Digital entry and exit timestamps drive automated 30-day, 15-day, and 7-day visa expiry reminders. Potential overstay alerts route exclusively to authorized immigration officers, with lawful police liaison and traveller appeal safeguards.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onQuickSwitchRole('immigration_officer', 'offices')}
                className="text-left p-4 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>Immigration Officer Portal</span>
                  <Building2 className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Review applications, run Passport AI checks, and issue lawful decisions.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onQuickSwitchRole('airport_admin', 'arrival')}
                className="text-left p-4 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>Airport Arrival &amp; Departure</span>
                  <Globe2 className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Log checkpoint e-Gate entry/exit timestamps and offline terminal cache.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onQuickSwitchRole('police_verification', 'security')}
                className="text-left p-4 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>Police Clearance Liaison</span>
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Verify clearance certificates with issuing national authorities.
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenRoleModal}
                className="text-left p-4 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>Switch Across All 6 Roles</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
                <div className="mt-1 text-xs text-blue-100">
                  Includes Payment Management and Global Super Admin governance.
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 h-56 lg:h-64">
              <ResilientImage
                src={ASSETS.commandCenter}
                alt="National immigration operations and risk monitoring center"
                fallbackTitle="National Immigration Control Center"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-xs text-white font-medium">
                National Immigration Review Center · Officer-Led Adjudication
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#1D4ED8] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-[#0B1B35]">
                    Reference-Based Digital Account
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    Applicants receive a dedicated travel reference (such as{' '}
                    <span className="font-mono font-medium text-[#0B1B35]">WG-2026-008521</span>) — not a bank account — consolidating visa status, inbox notices, fee receipts, and bond escrow records.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate('inbox')}
                  className="text-sm font-semibold text-[#1D4ED8] hover:underline"
                >
                  Open Immigration Inbox
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('network')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Country Network →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Legal Safeguards */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-8">
            <div className="text-xs font-medium text-slate-500">03. Global Cloud Architecture</div>
            <h2 className="mt-1.5 text-2xl font-bold text-[#0B1B35]">
              Interoperable Sovereign Infrastructure
            </h2>
            <div className="mt-6 divide-y divide-slate-200">
              {ARCHITECTURE_STACK.map((row) => (
                <div key={row.layer} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="text-sm font-semibold text-[#0B1B35]">{row.layer}</div>
                  <div className="mt-0.5 text-sm text-slate-600">{row.spec}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Scale className="w-4 h-4 text-[#1D4ED8]" />
              <span>04. Required Legal &amp; International Safeguards</span>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold text-[#0B1B35]">
              National Sovereignty &amp; Traveller Due Process
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              A worldwide platform cannot grant immigration powers on its own. Participating governments authorize fees, bonds, eligibility, and final visa decisions.
            </p>
            <ul className="mt-5 space-y-3">
              {LEGAL_SAFEGUARDS.map((rule) => (
                <li key={rule} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-1" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
