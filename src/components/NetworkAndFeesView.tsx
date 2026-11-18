import { Globe2, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  ASSETS,
  FINANCIAL_LIFECYCLE_STEPS,
  LEGAL_SAFEGUARDS,
  SECURITY_MODULES,
} from '../constants';
import { ResilientImage } from './ResilientImage';
import type { CountryNode, NavSection } from '../types';

interface NetworkAndFeesViewProps {
  mode: 'network' | 'fees' | 'offices';
  countries: CountryNode[];
  onNavigate: (section: NavSection) => void;
}

export function NetworkAndFeesView({ mode, countries, onNavigate }: NetworkAndFeesViewProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Global Interoperability · Sovereign Rules &amp; Connected Offices
          </div>
          <h1 className="mt-1.5 text-3xl font-bold text-[#0B1B35]">
            {mode === 'fees'
              ? 'Proposed Visa Fees & Refundable Security Bonds'
              : mode === 'offices'
              ? 'Participating Immigration Offices & Security Network'
              : 'Global Country Network & Bilateral Safeguards'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('apply')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 whitespace-nowrap self-start"
        >
          Apply for Visa
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Participating Countries Grid */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-[#1D4ED8]" />
          <h2 className="text-xl font-bold text-[#0B1B35]">
            Participating Countries, Airports &amp; National Authorities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {countries.map((country) => (
            <div key={country.code} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-slate-500">{country.code} · {country.status}</div>
                  <h3 className="mt-0.5 text-lg font-bold text-[#0B1B35]">{country.name}</h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div>
                  <span className="font-semibold text-slate-800">Immigration:</span>{' '}
                  {country.immigrationAuthority}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Police Liaison:</span>{' '}
                  {country.policeAgency}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Connected Airports:</span>{' '}
                  {country.airports.join(', ')}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">$10 Fee</div>
                  <div className="font-semibold text-[#0B1B35]">
                    {country.feeApproved ? 'Approved' : 'Pending'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">$2k Bond</div>
                  <div className="font-semibold text-[#0B1B35]">
                    {country.bondAuthorized ? 'Authorized' : 'Waived'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Max Stay</div>
                  <div className="font-mono font-semibold tabular-nums text-[#0B1B35]">
                    {country.maxVisitorDays}d
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Financial Model 5-step */}
      <section className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1B35]">5-Stage Fee &amp; Refundable Bond Lifecycle</h2>
          <p className="text-sm text-slate-600 mt-1">
            Illustrative proposed amounts ($10 USD application/departure fee and $2,000 USD refundable security bond) apply strictly where authorized by destination law.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {FINANCIAL_LIFECYCLE_STEPS.map((s) => (
            <div key={s.step} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="font-mono text-sm font-bold text-[#1D4ED8]">{s.step}</div>
              <div className="text-sm font-semibold text-[#0B1B35]">{s.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Offices & Security Table */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="h-52 overflow-hidden border-b border-slate-200">
            <ResilientImage
              src={ASSETS.commandCenter}
              alt="National immigration review offices"
              fallbackTitle="National Immigration Offices"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0B1B35]">
              <Building2 className="w-4 h-4 text-[#1D4ED8]" />
              <span>Required Legal &amp; International Safeguards</span>
            </div>
            <ul className="space-y-2.5">
              {LEGAL_SAFEGUARDS.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
            <h2 className="text-base font-bold text-[#0B1B35]">
              Universal Airport Security Network Modules
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
      </section>
    </div>
  );
}
