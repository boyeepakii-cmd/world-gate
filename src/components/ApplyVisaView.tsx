import { useState, type FormEvent } from 'react';
import { Check, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { ASSETS } from '../constants';
import { ResilientImage } from './ResilientImage';
import type { CountryNode, NavSection, VisaApplication, VisaDuration } from '../types';

interface ApplyVisaViewProps {
  countries: CountryNode[];
  onApplicationSubmitted: (app: VisaApplication) => void;
  onNavigate: (section: NavSection) => void;
}

export function ApplyVisaView({ countries, onApplicationSubmitted, onNavigate }: ApplyVisaViewProps) {
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('Pakistan');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');

  const [destinationCountry, setDestinationCountry] = useState('United Kingdom');
  const selectedCountryObj = countries.find((c) => c.name === destinationCountry) ?? countries[0];
  const [arrivalAirport, setArrivalAirport] = useState(
    selectedCountryObj?.airports[0] ?? 'LHR — London Heathrow'
  );
  const [requestedDuration, setRequestedDuration] = useState<VisaDuration>('90 days');

  const [passportPhoto, setPassportPhoto] = useState(true);
  const [biometricFace, setBiometricFace] = useState(true);
  const [policeClearance, setPoliceClearance] = useState(true);
  const [proofOfFunds, setProofOfFunds] = useState(true);

  const [consentChecked, setConsentChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdApp, setCreatedApp] = useState<VisaApplication | null>(null);

  const handleDestinationChange = (nextCountryName: string) => {
    setDestinationCountry(nextCountryName);
    const found = countries.find((c) => c.name === nextCountryName);
    if (found && found.airports.length > 0) {
      setArrivalAirport(found.airports[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !passportNumber.trim() || !email.trim()) {
      setErrorMsg('Please complete full name, passport number, and email address.');
      return;
    }
    if (!consentChecked) {
      setErrorMsg('Please confirm accuracy and consent to lawful identity verification before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          nationality,
          passportNumber,
          phone,
          email,
          residentialAddress,
          destinationCountry,
          arrivalAirport,
          requestedDuration,
          documents: {
            passportPhoto,
            biometricFace,
            policeClearance,
            proofOfFunds,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not submit application.');
      }
      setCreatedApp(data);
      onApplicationSubmitted(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdApp) {
    return (
      <div className="max-w-[920px] mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#16A34A]">
                Demonstration Application Registered
              </div>
              <h1 className="mt-1 text-2xl font-bold text-[#0B1B35]">
                Your Unique Visa Reference Is Ready
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                This reference-based digital account tracks your immigration review, document status, inbox notifications, and destination bond instructions.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-500">Unique Visa Reference</div>
              <div className="mt-1 text-xl font-bold font-mono tabular-nums text-[#0B1B35]">
                {createdApp.reference}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Destination &amp; Port</div>
              <div className="mt-1 text-sm font-semibold text-[#0B1B35]">{createdApp.destinationCountry}</div>
              <div className="text-xs text-slate-600">{createdApp.arrivalAirport}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Application Status</div>
              <div className="mt-1 text-sm font-semibold text-amber-700">{createdApp.status}</div>
              <div className="text-xs text-slate-600">Requested: {createdApp.requestedDuration}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('account')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 transition-colors"
            >
              Open My World Gate Account
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('inbox')}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Check Immigration Inbox
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatedApp(null);
                setFullName('');
                setPassportNumber('');
                setConsentChecked(false);
              }}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Start Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500">
            WORLD GATE — Apply for Visa · Application Demonstration
          </div>
          <h1 className="mt-1.5 text-3xl font-bold text-[#0B1B35]">
            Traveller Registration &amp; Visa Application
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
            Complete all three sections below to generate a demonstration visa reference. Production deployment connects directly to participating national immigration and passport verification gateways.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Personal information */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">1. Personal information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter details exactly as printed on your travel document.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="wg-full-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full name (as in passport)
                </label>
                <input
                  id="wg-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Tariq Mahmood Siddiqui"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div>
                <label htmlFor="wg-nationality" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nationality
                </label>
                <select
                  id="wg-nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Finland">Finland</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>

              <div>
                <label htmlFor="wg-passport" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Passport number
                </label>
                <input
                  id="wg-passport"
                  type="text"
                  required
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="e.g. PK4928174"
                  className="w-full px-3.5 py-2.5 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div>
                <label htmlFor="wg-phone" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone number
                </label>
                <input
                  id="wg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div>
                <label htmlFor="wg-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="wg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveller@example.org"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="wg-address" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Residential address
                </label>
                <input
                  id="wg-address"
                  type="text"
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="Street, city, postal code, country"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>
            </div>
          </section>

          {/* 2. Travel information */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">2. Travel information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Select destination authority, arrival airport, and requested visitor stay.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wg-destination" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Destination country
                </label>
                <select
                  id="wg-destination"
                  value={destinationCountry}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wg-airport" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Arrival airport
                </label>
                <select
                  id="wg-airport"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  {(selectedCountryObj?.airports ?? ['LHR — London Heathrow']).map((ap) => (
                    <option key={ap} value={ap}>
                      {ap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <span className="block text-xs font-medium text-slate-700 mb-2">
                  Requested visa duration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      { value: '30 days', label: '30 days' },
                      { value: '90 days', label: '90 days' },
                      { value: '6 months', label: '6 months (maximum requested)' },
                    ] as const
                  ).map((opt) => {
                    const active = requestedDuration === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRequestedDuration(opt.value)}
                        className={`px-4 py-3 text-left text-sm rounded-lg border transition-colors ${
                          active
                            ? 'border-[#1D4ED8] bg-blue-50/70 font-semibold text-[#0B1B35]'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Identity and document verification */}
          <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0B1B35]">3. Identity and document verification</h2>
              <p className="text-xs text-slate-600 mt-1">
                Upload documents through the secure production portal. This prototype records demonstration checkmarks only.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'doc-passport',
                  label: 'Passport photograph',
                  checked: passportPhoto,
                  toggle: () => setPassportPhoto(!passportPhoto),
                },
                {
                  id: 'doc-biometric',
                  label: 'Live biometric face verification',
                  checked: biometricFace,
                  toggle: () => setBiometricFace(!biometricFace),
                },
                {
                  id: 'doc-police',
                  label: 'Local police clearance certificate',
                  checked: policeClearance,
                  toggle: () => setPoliceClearance(!policeClearance),
                },
                {
                  id: 'doc-funds',
                  label: 'Proof of available travel funds',
                  checked: proofOfFunds,
                  toggle: () => setProofOfFunds(!proofOfFunds),
                },
              ].map((item) => (
                <label
                  key={item.id}
                  htmlFor={item.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    item.checked ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    id={item.id}
                    type="checkbox"
                    checked={item.checked}
                    onChange={item.toggle}
                    className="w-4 h-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                  />
                  <span className="text-sm font-medium text-slate-800">{item.label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Summary: Financial Requirements & Consent */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="h-40 overflow-hidden border-b border-slate-200">
              <ResilientImage
                src={ASSETS.passportScan}
                alt="Electronic passport optical reader at airport checkpoint"
                fallbackTitle="Biometric Passport Scanner"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#0B1B35]">Financial requirements</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Destination authority: {selectedCountryObj?.immigrationAuthority}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Proposed application fee</span>
                  <span className="font-mono font-bold tabular-nums text-[#0B1B35]">
                    {selectedCountryObj?.feeApproved ? '$10 USD' : 'Pending approval'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Proposed refundable security bond</span>
                  <span className="font-mono font-bold tabular-nums text-[#0B1B35]">
                    {selectedCountryObj?.bondAuthorized ? '$2,000 USD' : 'Not required'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                Bond applies only where authorized by the destination country. Payment must go to its verified government-designated account, with refund terms and receipt.
              </p>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that my information is accurate and consent to lawful identity verification and the destination country’s immigration review.
                </span>
              </label>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Registering application...' : 'Submit demonstration application'}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Reference-based account · No automated rejections</span>
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
