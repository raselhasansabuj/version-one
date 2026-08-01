import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, X } from 'lucide-react';

interface SecurityLockModalProps {
  isOpen: boolean;
  isAppLocked: boolean;
  savedPin: string | null;
  onSetPin: (pin: string | null) => void;
  onUnlock: () => void;
  onClose: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isOpen,
  isAppLocked,
  savedPin,
  onSetPin,
  onUnlock,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mode, setMode] = useState<'unlock' | 'setup'>(isAppLocked ? 'unlock' : 'setup');

  if (!isOpen && !isAppLocked) return null;

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === savedPin) {
      setPinInput('');
      setErrorMessage('');
      onUnlock();
    } else {
      setErrorMessage('Incorrect PIN passcode. Please try again.');
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 4) {
      setErrorMessage('PIN must be exactly 4 digits.');
      return;
    }
    if (pinInput !== confirmPinInput) {
      setErrorMessage('PINs do not match. Please re-enter.');
      return;
    }

    onSetPin(pinInput);
    setPinInput('');
    setConfirmPinInput('');
    setErrorMessage('');
    onClose();
  };

  const handleRemovePin = () => {
    onSetPin(null);
    setPinInput('');
    setConfirmPinInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center relative">
        
        {!isAppLocked && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {isAppLocked
            ? 'Application Locked'
            : savedPin
            ? 'Manage Security PIN'
            : 'Set 4-Digit Security PIN'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          {isAppLocked
            ? 'Enter your 4-digit PIN to access your personal expense tracker.'
            : 'Protect your financial records with a passcode.'}
        </p>

        {isAppLocked ? (
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              pattern="\d*"
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl font-bold tracking-widest py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errorMessage && (
              <p className="text-xs font-semibold text-rose-500">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
            >
              Unlock Application
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-left mb-1">
                Enter New 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                pattern="\d*"
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-xl font-bold tracking-widest py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 text-left mb-1">
                Confirm PIN
              </label>
              <input
                type="password"
                maxLength={4}
                pattern="\d*"
                placeholder="••••"
                value={confirmPinInput}
                onChange={(e) => setConfirmPinInput(e.target.value)}
                className="w-full text-center text-xl font-bold tracking-widest py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {errorMessage && (
              <p className="text-xs font-semibold text-rose-500">{errorMessage}</p>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Save PIN Passcode
              </button>

              {savedPin && (
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="w-full py-2 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:underline"
                >
                  Disable PIN Security
                </button>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
