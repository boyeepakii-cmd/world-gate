import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ROLE_PROFILES } from './constants';
import { HomeView } from './components/HomeView';
import { ApplyVisaView } from './components/ApplyVisaView';
import { TravellerPortalView } from './components/TravellerPortalView';
import { OperationsWorkspaceView, type OpsPane } from './components/OperationsWorkspaceView';
import { NetworkAndFeesView } from './components/NetworkAndFeesView';
import { RoleLoginModal } from './components/RoleLoginModal';
import type { NavSection, UserRole, VisaApplication, WorldGateState } from './types';

export default function App() {
  const [state, setState] = useState<WorldGateState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [section, setSection] = useState<NavSection>('home');
  const [activeRole, setActiveRole] = useState<UserRole>('traveller');
  const [customActorLabel, setCustomActorLabel] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState<string>('WG-2026-008521');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const resp = await fetch('/api/state');
      if (!resp.ok) {
        throw new Error(`Server returned status ${resp.status}`);
      }
      const data: WorldGateState = await resp.json();
      setState(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect to WORLD GATE server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const activeProfile = ROLE_PROFILES.find((r) => r.role === activeRole) ?? ROLE_PROFILES[0];
  const actorDisplayName = customActorLabel || `${activeProfile.actorName} (${activeProfile.credentialId})`;

  const handleSelectRole = (nextRole: UserRole, customBadge?: string) => {
    setActiveRole(nextRole);
    setCustomActorLabel(customBadge ?? null);

    if (nextRole === 'traveller') {
      setSection('account');
    } else if (nextRole === 'immigration_officer') {
      setSection('offices');
    } else if (nextRole === 'airport_admin') {
      setSection('arrival');
    } else if (nextRole === 'police_verification') {
      setSection('security');
    } else if (nextRole === 'payment_management') {
      setSection('fees');
    } else if (nextRole === 'global_super_admin') {
      setSection('network');
    }
  };

  const handleQuickSwitchRole = (role: UserRole, targetSection: NavSection) => {
    setActiveRole(role);
    setCustomActorLabel(null);
    setSection(targetSection);
  };

  const handleApplicationSubmitted = async (newApp: VisaApplication) => {
    setActiveReference(newApp.reference);
    await fetchState();
  };

  const handleNavigate = (target: NavSection) => {
    setSection(target);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resolveOpsPane = (): OpsPane => {
    if (section === 'arrival' || section === 'departure') return 'airport';
    if (section === 'security') return 'police';
    if (activeRole === 'payment_management') return 'payments';
    if (activeRole === 'global_super_admin') return 'governance';
    if (activeRole === 'airport_admin') return 'airport';
    if (activeRole === 'police_verification') return 'police';
    return 'officer';
  };

  const isOperationsSection =
    section === 'offices' ||
    section === 'arrival' ||
    section === 'departure' ||
    section === 'security' ||
    (section === 'fees' && activeRole === 'payment_management') ||
    (section === 'network' && activeRole === 'global_super_admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-lg font-bold tracking-tight text-[#0B1B35] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            WORLD GATE
          </button>

          {/* Zone 2: 5 concise single-line text navigation links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                section === 'home'
                  ? 'border-[#1D4ED8] text-[#0B1B35]'
                  : 'border-transparent hover:text-[#0B1B35]'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('apply')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                section === 'apply'
                  ? 'border-[#1D4ED8] text-[#0B1B35]'
                  : 'border-transparent hover:text-[#0B1B35]'
              }`}
            >
              Apply for Visa
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('account')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                section === 'account' || section === 'inbox'
                  ? 'border-[#1D4ED8] text-[#0B1B35]'
                  : 'border-transparent hover:text-[#0B1B35]'
              }`}
            >
              My Account
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('offices')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                isOperationsSection
                  ? 'border-[#1D4ED8] text-[#0B1B35]'
                  : 'border-transparent hover:text-[#0B1B35]'
              }`}
            >
              Operations
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('network')}
              className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                (section === 'network' || section === 'fees') && !isOperationsSection
                  ? 'border-[#1D4ED8] text-[#0B1B35]'
                  : 'border-transparent hover:text-[#0B1B35]'
              }`}
            >
              Country Network
            </button>
          </nav>

          {/* Zone 3: 1 primary action button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setRoleModalOpen(true)}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-white bg-[#0B1B35] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Portal: {activeProfile.shortLabel}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-700 rounded-lg border border-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-2">
            {(
              [
                { id: 'home', label: 'Home' },
                { id: 'apply', label: 'Apply for Visa' },
                { id: 'account', label: 'My Account' },
                { id: 'inbox', label: 'Immigration Inbox' },
                { id: 'offices', label: 'Operations Console' },
                { id: 'fees', label: 'Fees & Bonds' },
                { id: 'network', label: 'Country Network' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className="block w-full text-left py-2 text-sm font-medium text-slate-700 hover:text-[#0B1B35]"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setRoleModalOpen(true);
              }}
              className="w-full mt-2 py-2.5 text-sm font-semibold text-white bg-[#0B1B35] rounded-lg"
            >
              Switch Role ({activeProfile.shortLabel})
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {loading && (
          <div className="max-w-[1280px] mx-auto px-6 py-16 space-y-6">
            <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-44 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-[760px] mx-auto px-6 py-16">
            <div className="bg-white border border-red-200 rounded-xl p-8 space-y-4">
              <h1 className="text-xl font-bold text-red-900">Unable to load WORLD GATE registry</h1>
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchState}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0B1B35] rounded-lg"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {!loading && state && (
          <>
            {section === 'home' && (
              <HomeView
                metrics={state.metrics}
                countries={state.countries}
                onNavigate={handleNavigate}
                onOpenRoleModal={() => setRoleModalOpen(true)}
                onQuickSwitchRole={handleQuickSwitchRole}
              />
            )}

            {section === 'apply' && (
              <ApplyVisaView
                countries={state.countries}
                onApplicationSubmitted={handleApplicationSubmitted}
                onNavigate={handleNavigate}
              />
            )}

            {(section === 'account' || section === 'inbox') && (
              <TravellerPortalView
                key={`${section}-${activeReference}`}
                applications={state.applications}
                messages={state.messages}
                activeReference={activeReference}
                initialTab={section === 'inbox' ? 'inbox' : 'applications'}
                onSelectReference={setActiveReference}
                onNavigate={handleNavigate}
                onRefreshState={fetchState}
              />
            )}

            {isOperationsSection && (
              <OperationsWorkspaceView
                key={`${section}-${activeRole}`}
                activeRole={activeRole}
                actorDisplayName={actorDisplayName}
                initialPane={resolveOpsPane()}
                applications={state.applications}
                countries={state.countries}
                checkpointEvents={state.checkpointEvents}
                auditLogs={state.auditLogs}
                metrics={state.metrics}
                offlineAirportMode={state.offlineAirportMode}
                onSwitchRole={(r) => {
                  setActiveRole(r);
                  setCustomActorLabel(null);
                }}
                onRefreshState={fetchState}
              />
            )}

            {(section === 'fees' || section === 'network') && !isOperationsSection && (
              <NetworkAndFeesView
                mode={section === 'fees' ? 'fees' : 'network'}
                countries={state.countries}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Institutional Footer mirroring all 10 navigation destinations */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="text-base font-bold tracking-tight text-[#0B1B35]">WORLD GATE</div>
              <div className="mt-1 text-xs text-slate-500">
                One global reference · Secure travel · Connected immigration
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-slate-600">
              {(
                [
                  { id: 'home', label: 'Home' },
                  { id: 'apply', label: 'Apply for Visa' },
                  { id: 'account', label: 'My Account' },
                  { id: 'inbox', label: 'Immigration Inbox' },
                  { id: 'arrival', label: 'Airport Arrival' },
                  { id: 'departure', label: 'Airport Departure' },
                  { id: 'security', label: 'Security & Biometrics' },
                  { id: 'fees', label: 'Fees & Bonds' },
                  { id: 'offices', label: 'Immigration Offices' },
                  { id: 'network', label: 'Country Network' },
                ] as const
              ).map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => handleNavigate(link.id)}
                  className="hover:text-[#0B1B35] whitespace-nowrap"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Demonstration environment only. Participating sovereign governments independently authorize visa eligibility, fees, bonds, and officer decisions.
            </p>
            <button
              type="button"
              onClick={() => setRoleModalOpen(true)}
              className="text-[#1D4ED8] font-medium hover:underline whitespace-nowrap text-left"
            >
              Switch Demonstration Role
            </button>
          </div>
        </div>
      </footer>

      <RoleLoginModal
        isOpen={roleModalOpen}
        activeRole={activeRole}
        onClose={() => setRoleModalOpen(false)}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
}
