import React, { useState } from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'settings' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running in standalone mode
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>App ist bereits als PWA installiert</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Thai Hasi als App auf dem Gerät installieren"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FF7A00]/15 hover:bg-[#FF7A00]/25 text-[#FF7A00] border border-[#FF7A00]/30 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">App installieren</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'settings' && (
        <div className={`p-4 rounded-2xl bg-[#1C1C1E] border border-[#323236] space-y-3 ${className}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00] shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Progressive Web App (PWA)</h3>
                <p className="text-xs text-[#8E8E93]">
                  Installiere Thai Hasi auf deinem Smartphone, Tablet oder Desktop für Offline-Lernen.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] text-black font-semibold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Wird installiert...' : 'Jetzt auf Homescreen installieren'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-2 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3D] text-[#A1A1AA] hover:text-white text-xs font-medium transition cursor-pointer"
            >
              Anleitung (iOS / Android)
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal for iOS Safari / Manual Installation */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#1C1C1E] border border-[#3A3A3E] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF7A00]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Thai Hasi installieren</h3>
                  <p className="text-xs text-[#8E8E93]">App ohne App Store direkt auf deinem Homescreen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-[#2C2C2E] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-[#141416] p-4 rounded-xl border border-[#2E2E32]">
                <p className="text-xs text-[#FF7A00] font-semibold uppercase tracking-wider">
                  Für iPhone & iPad (Safari):
                </p>
                <ol className="text-xs text-[#D4D4D8] space-y-2.5 list-decimal pl-4">
                  <li>
                    Öffne diese Seite in <strong className="text-white">Safari</strong>.
                  </li>
                  <li className="flex items-center gap-1.5 flex-wrap">
                    Tippe unten in der Safari-Leiste auf den <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2C2C2E] text-white font-medium"><Share2 className="w-3 h-3" /> Teilen</span>-Button.
                  </li>
                  <li className="flex items-center gap-1.5 flex-wrap">
                    Scrolle etwas nach unten und wähle <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#2C2C2E] text-white font-medium"><PlusSquare className="w-3 h-3" /> Zum Home-Bildschirm</span>.
                  </li>
                  <li>
                    Tippe oben rechts auf <strong className="text-white">„Hinzufügen“</strong>. Fertig!
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-[#141416] p-4 rounded-xl border border-[#2E2E32]">
                <p className="text-xs text-[#FF7A00] font-semibold uppercase tracking-wider">
                  Für Android / Chrome / Edge / Desktop:
                </p>
                <ol className="text-xs text-[#D4D4D8] space-y-2.5 list-decimal pl-4">
                  {isInstallable ? (
                    <li>
                      Klicke direkt auf den Button unten, um den automatischen Browser-Installationsdialog zu öffnen.
                    </li>
                  ) : (
                    <>
                      <li>
                        Tippe oben rechts im Browser auf das <strong className="text-white">Drei-Punkte-Menü (⋮)</strong>.
                      </li>
                      <li>
                        Wähle <strong className="text-white">„App installieren“</strong> oder <strong className="text-white">„Zum Startbildschirm hinzufügen“</strong>.
                      </li>
                    </>
                  )}
                  <li>
                    Bestätige die Installation. Die App öffnet sich künftig eigenständig im Vollbildmodus ohne Adressleiste!
                  </li>
                </ol>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF881A] text-black font-semibold text-xs transition cursor-pointer"
                >
                  Jetzt automatisch installieren
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3D] text-[#E4E4E7] text-xs font-semibold transition cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
