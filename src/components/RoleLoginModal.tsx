import { useState } from 'react';
import { X, Shield, KeyRound, Check } from 'lucide-react';
import { ROLE_PROFILES } from '../constants';
import type { UserRole } from '../types';

interface RoleLoginModalProps {
  isOpen: boolean;
  activeRole: UserRole;
  onClose: () => void;
  onSelectRole: (role: UserRole, customBadge?: string) => void;
}

export function RoleLoginModal({ isOpen, activeRole, onClose, onSelectRole }: RoleLoginModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole);
  const [credentialInput, setCredentialInput] = useState('');

  if (!isOpen) return null;

  const currentProfile = ROLE_PROFILES.find((r) => r.role === selectedRole) ?? ROLE_PROFILES[0];

  const handleConfirm = () => {
    onSelectRole(selectedRole, credentialInput.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="role-modal-title">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#1D4ED8]" />
            <h2 id="role-modal-title" className="text-base font-semibold text-slate-900">
              Demonstration Portal Role Access
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portal access dialog"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Switch between the six demonstration perspectives in WORLD GATE. In production, official roles require authenticated government credentials, multi-factor verification, and audit logging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROLE_PROFILES.map((profile) => {
              const isSelected = profile.role === selectedRole;
              return (
                <button
                  key={profile.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(profile.role);
                    setCredentialInput('');
                  }}
                  className={`text-left p-3.5 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[#1D4ED8] bg-blue-50/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">{profile.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1D4ED8] shrink-0" />}
                  </div>
                  <div className="mt-1 text-xs font-mono text-slate-500 tabular-nums">
                    {profile.credentialId} · {profile.jurisdiction}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{profile.summary}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="demo-credential-input" className="block text-xs font-medium text-slate-700 mb-1.5">
                Demonstration Officer / Account Identifier (optional override)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="demo-credential-input"
                  type="text"
                  value={credentialInput}
                  onChange={(e) => setCredentialInput(e.target.value)}
                  placeholder={`${currentProfile.actorName} (${currentProfile.credentialId})`}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0B1B35] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Enter as {currentProfile.shortLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
