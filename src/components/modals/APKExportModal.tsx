import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { downloadDirectAPK, PackageDataBackup } from '../../utils/downloadDirectAPK';

interface APKExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBackupData?: PackageDataBackup;
}

export const APKExportModal: React.FC<APKExportModalProps> = ({
  isOpen,
  onClose,
  userBackupData,
}) => {
  const { install, isInstalled } = usePWAInstall();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState('Aura-Expense-Manager.apk');

  if (!isOpen) return null;

  const currentAppUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.href
      : 'https://ais-dev-xya2klilgvskgzulkkfimt-211067390459.asia-northeast1.run.app';

  const handleDownloadAPK = async () => {
    try {
      setDownloading(true);
      const result = await downloadDirectAPK(currentAppUrl, userBackupData);
      setDownloadedFileName(result.fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (e) {
      console.error('Failed to download direct APK', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Direct Android APK (Aura-Expense-Manager.apk)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Single file direct install · No ZIP extraction needed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs">
          {/* Main Direct APK Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-850 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/60 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Direct Download
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Aura-Expense-Manager.apk
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                  Downloads the direct Android application package file directly to your device. No extraction or unzipping needed.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">v1.2.0</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Build 102</span>
              </div>
            </div>

            {/* Spec Details Pill Grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-white/90 dark:bg-slate-800/80 rounded-xl border border-indigo-100/80 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Format</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Direct .apk</span>
              </div>
              <div className="p-2 bg-white/90 dark:bg-slate-800/80 rounded-xl border border-indigo-100/80 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Package</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">com.aura.finance</span>
              </div>
              <div className="p-2 bg-white/90 dark:bg-slate-800/80 rounded-xl border border-indigo-100/80 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Data Sync</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Preserved
                </span>
              </div>
            </div>

            {/* Primary Download Button */}
            <button
              onClick={handleDownloadAPK}
              disabled={downloading}
              className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:bg-slate-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{downloadedFileName} Downloaded! Check Downloads</span>
                </>
              ) : downloading ? (
                <>
                  <Download className="w-4 h-4 animate-bounce text-indigo-400" />
                  <span>Preparing &amp; Downloading Direct APK...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Direct APK (Aura-Expense-Manager.apk)</span>
                </>
              )}
            </button>
          </div>

          {/* Simple 2-Step Android Installation Guide */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>How to Install on Android in 2 Steps</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">Tap the downloaded APK</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pull down your notification bar or open your <strong>Files / Downloads</strong> app, then tap <strong className="text-slate-800 dark:text-slate-200">Aura-Expense-Manager.apk</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs">Tap &ldquo;Install&rdquo;</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap &ldquo;Install&rdquo;. If Android prompts <em>&ldquo;Install unknown apps&rdquo;</em>, toggle <strong>Allow from this source</strong> once, then tap Install. Aura is immediately available on your Android home screen!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Browser Web App Installation (Alternative) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Alternative: Instant 1-Tap Home Screen Install
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">0 MB Download</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Install Aura instantly through Chrome without downloading any file. Runs fullscreen just like a native app.
            </p>

            <button
              onClick={() => install()}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>{isInstalled ? 'App Already Installed' : 'Add to Home Screen (Instant)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Personal Data &amp; UPI Links Preserved</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
