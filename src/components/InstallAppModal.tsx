import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Share2, 
  Laptop, 
  ExternalLink,
  Info,
  Layers,
  Terminal
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'usb' | 'qr'>('pwa');

  const appUrl = 'https://ais-pre-2o2rindmabhkebvlotecqo-885505213722.asia-east1.run.app';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install, open this app in Chrome/Safari on your phone and select 'Add to Home Screen'!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 font-bold text-xl">
              ৳
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Install App on Mobile
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  PWA Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Use ExpenseTracker directly on your phone like a native app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-3 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'pwa'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Install on Mobile (PWA)
          </button>

          <button
            onClick={() => setActiveTab('usb')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'usb'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            USB Debugging / APK
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'qr'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR / Web Link
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300 text-sm">

          {activeTab === 'pwa' && (
            <div className="space-y-4">
              {/* Direct Install Button if supported */}
              {deferredPrompt && !isInstalled && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      One-Click Browser Install
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Your browser supports instant installation!
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Install Now
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  ExpenseTracker is installed as a Progressive Web App on your device!
                </div>
              )}

              {/* Mobile Phone Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-slate-500">
                  How to Install on Phone Homescreen
                </h4>

                {/* Android Steps */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      🤖
                    </span>
                    Android (Chrome / Edge / Samsung Internet)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <li>Open <strong>{appUrl}</strong> on your phone Chrome browser.</li>
                    <li>Tap the <strong>3 dots (⋮)</strong> menu in the top-right corner.</li>
                    <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</li>
                    <li>The app icon will appear on your phone home screen!</li>
                  </ol>
                </div>

                {/* iOS Steps */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">
                      🍎
                    </span>
                    iPhone / iPad (Safari)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <li>Open <strong>Safari</strong> on your iPhone and visit the app link.</li>
                    <li>Tap the <strong>Share button (⎋)</strong> at the bottom bar.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top right. Done!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usb' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  USB Debugging & Source Export
                </div>
                If you want to debug via USB or bundle an Android APK, follow these steps:
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                  Option A: Chrome USB Inspection
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Enable <strong>USB Debugging</strong> in Android Developer Options on your phone.</li>
                  <li>Connect phone to PC via USB cable.</li>
                  <li>Open <strong>chrome://inspect</strong> in PC Chrome browser.</li>
                  <li>Open app link on phone Chrome to debug live via DevTools!</li>
                </ol>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                  Option B: Export Source Code & Build Android APK
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Click <strong>Settings</strong> at the top menu of AI Studio.</li>
                  <li>Select <strong>Export to GitHub</strong> or <strong>Download ZIP</strong>.</li>
                  <li>In your exported folder, add Capacitor to generate an APK:
                    <div className="mt-1 p-2 bg-slate-900 text-emerald-400 font-mono rounded text-[11px]">
                      npm install @capacitor/core @capacitor/cli @capacitor/android<br/>
                      npx cap init ExpenseTracker com.expense.app<br/>
                      npm run build<br/>
                      npx cap add android<br/>
                      npx cap open android
                    </div>
                  </li>
                  <li>Build APK in Android Studio and transfer via USB cable to your phone!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan with your phone camera or copy the live mobile URL:
              </p>

              {/* QR Image fallback using quick chart API */}
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}`}
                    alt="App QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 font-mono w-64 text-center"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg flex items-center gap-1 shadow-sm transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs">
          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Open Live Mobile Web App <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
