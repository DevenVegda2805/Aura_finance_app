import JSZip from 'jszip';

export async function downloadAppPackage(appUrl: string): Promise<void> {
  const zip = new JSZip();

  // 1. Android Trusted Web Activity (TWA) APK Configuration
  const twaConfig = {
    packageId: 'com.aura.finance.manager',
    host: appUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
    name: 'Aura - Expense & Savings Manager',
    launcherName: 'Aura',
    themeColor: '#F5F5F7',
    navigationColor: '#F5F5F7',
    backgroundColor: '#F5F5F7',
    startUrl: '/',
    iconUrl: '/icon.svg',
    maskableIconUrl: '/icon.svg',
    appVersionName: '1.0.0',
    appVersionCode: 1,
    shortcuts: [
      {
        name: 'Add Expense',
        shortName: 'Add',
        url: '/#add',
        icon: '/icon.svg',
      },
    ],
  };

  zip.file('android-twa-manifest.json', JSON.stringify(twaConfig, null, 2));

  // 2. Web App Manifest
  const manifest = {
    id: '/',
    name: 'Aura - Expense & Savings Manager',
    short_name: 'Aura',
    description:
      'Apple Wallet-inspired personal expense and savings manager with category budgeting, interactive pie charts, visual spending reports, and savings goal tracking.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F5F5F7',
    theme_color: '#F5F5F7',
    orientation: 'portrait-primary',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 3. Android Installation & APK Generation Guide
  const installGuide = `========================================================
AURA - ANDROID & MOBILE INSTALLATION GUIDE
========================================================

YOUR APP URL:
${appUrl}

--------------------------------------------------------
METHOD 1: INSTANT 1-TAP INSTALLATION ON YOUR PHONE (Recommended)
--------------------------------------------------------
1. On your Android phone, open Google Chrome or Samsung Internet.
2. Visit your app link:
   ${appUrl}
3. Tap the Chrome 3-dots menu (⋮) in the top right.
4. Tap "Install App" or "Add to Home Screen".
5. Aura will immediately install with its own app icon, splash screen, and full offline standalone window!

--------------------------------------------------------
METHOD 2: DOWNLOAD STANDALONE .APK FILE (For Sideloading)
--------------------------------------------------------
You can generate a signed .apk file using Microsoft's free PWABuilder:
1. Visit: https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}
2. Click "Package for Android".
3. Click "Download APK".
4. Transfer the .apk file to your phone and install it with 1 tap.

--------------------------------------------------------
PACKAGE CONTENTS:
--------------------------------------------------------
- manifest.json: Web App Manifest
- android-twa-manifest.json: Pre-configured Android Activity configuration
- icon.svg: High-resolution vector application icon
`;

  zip.file('ANDROID_INSTALL_GUIDE.txt', installGuide);

  // 4. Try fetching icon.svg and index.html if available, or generate standard SVG
  try {
    const iconRes = await fetch('/icon.svg');
    if (iconRes.ok) {
      const iconText = await iconRes.text();
      zip.file('icon.svg', iconText);
    }
  } catch {
    // If running in restricted origin
  }

  // 5. Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'aura-mobile-app-package.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
