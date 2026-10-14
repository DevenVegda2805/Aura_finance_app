import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Shield,
  Package,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { downloadAppPackage } from '../../utils/downloadAppPackage';

interface APKExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKExportModal: React.FC<APKExportModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  // Use current URL or live Cloud Run app URL
  const currentUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.href
      : 'https://ais-dev-xya2klilgvskgzulkkfimt-211067390459.asia-northeast1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPackage = async () => {
    try {
      setIsZipping(true);
      await downloadAppPackage(currentUrl);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to download app package', e);
    } finally {
      setIsZipping(false);
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Download &amp; Install Aura</h2>
              <p className="text-[11px] text-slate-500">Android APK, PWA, and Offline App Package</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {/* Note explaining why iframe triggers don't download directly */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Why browser installation doesn't start inside this preview window:</strong>
              <p className="mt-0.5 text-amber-800">
                Browsers prohibit automatic app installation prompts from running inside embedded preview frames for security. Use the direct buttons below to download the package or open in your full browser!
              </p>
            </div>
          </div>

          {/* Option 1: Direct File Download (.zip Package) */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-indigo-950">
                  1. Direct Download: Complete App Package
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                Immediate Download
              </span>
            </div>

            <p className="text-indigo-900/80 text-[11px] leading-relaxed">
              Downloads an offline-ready bundle containing the Web App Manifest, vector icons, Android TWA configuration, and complete install instructions.
            </p>

            <button
              onClick={handleDownloadPackage}
              disabled={isZipping}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              {zipSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Package Downloaded Successfully!
                </>
              ) : isZipping ? (
                <>
                  <Download className="w-4 h-4 animate-bounce" />
                  Generating Download Package...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download App Package (.zip)
                </>
              )}
            </button>
          </div>

          {/* Option 2: 1-Click Android .APK Generator via PWABuilder */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-800" />
                <h3 className="text-sm font-bold text-slate-900">
                  2. Generate Signed Android .APK File
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Free via Microsoft
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Use Microsoft's free official builder to compile an installable <strong>.apk</strong> or <strong>.aab</strong> package ready for Android sideloading or sharing.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
              >
                <span>Generate &amp; Download APK</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy App Link'}</span>
              </button>
            </div>
          </div>

          {/* Option 3: Open in Chrome/Browser on Phone for 1-Tap Install */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                3. Open in Browser on Phone / Desktop
              </h3>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Open in Tab</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Open the direct link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone. Then tap the <strong>3-dots menu (⋮)</strong> &rarr; <strong>"Install app"</strong> to add it directly to your home screen!
            </p>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>All personal expense and savings data stays private on your device.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
