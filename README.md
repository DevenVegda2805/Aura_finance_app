# Aura — Minimalist Expense & Savings Manager

An Apple Wallet-inspired personal finance management web application designed for clarity, intentional budgeting, and wealth milestone tracking. Features custom interactive SVG data visualizations, category spending limits, automated recurring bill schedules, and Progressive Web App (PWA) installability with Android APK conversion guidance.

---

## ✨ Features

### 📊 Data Visualization & Spending Reports
- **Interactive Category Donut / Pie Chart**: Custom SVG donut chart featuring responsive slice hover highlights, animated stroke arcs, and real-time center detail inspection (category name, spent total, percentage of budget).
- **Multi-Month Comparative Cashflow Bar Graph**: Side-by-side historical tracking of monthly inflow, outflow (spending), and savings across past and active billing cycles.
- **Spending Velocity Curve**: Daily cumulative expenditure progression compared against linear monthly budget ceilings.
- **Merchant & Behavioral Analytics**: Top payee rankings with percentage share of wallet, plus day-of-week spending rhythm heatmaps.

### 🎯 Category Budgets & Pacing
- **Configurable Spending Ceilings**: Set monthly budget limits for each category (Housing, Groceries, Dining, Transit, Shopping, Wellness, Utilities, Entertainment).
- **Early-Warning Thresholds**: Color-coded progress indicators (`On Track` under 75%, `Approaching Cap` at 80%, `Over Budget` when exceeded).
- **Daily Runway Calculations**: Calculates remaining safe-to-spend allowance per day based on days left in the month.

### 🪙 Savings Goals & Milestone Rings
- **Circular Apple Watch-Style Progress Rings**: Visual completion rings for major milestones (Emergency Cushion, Travel, Workstation, Real Estate Down Payment).
- **Target Date & Contribution Engine**: Automatically calculates required monthly contributions to hit milestone deadlines.
- **1-Click Deposit Action**: Quick-deposit chips (+$50, +$100, +$250, +$500, or custom) to celebrate savings progress.

### 🔁 Recurring Transactions & Scheduled Bills
- **Recurring Toggle in Transaction Modal**: Schedule weekly or monthly bills, rent, and subscriptions upon entry.
- **Scheduled Recurring Bills Manager**: Expandable dashboard tracking upcoming due dates, billing frequency, and total monthly recurring commitments.
- **1-Click "Log Due Bill"**: Instantly records an upcoming scheduled bill into the transaction history and automatically advances the next due date.

### 📝 Searchable Ledger & Data Portability
- **Smart Filter & Search**: Search by merchant, note, or category, with segmented filters (`All`, `Expenses`, `Income`, `Savings`, `Recurring`) and sorting options.
- **Export & Backup**: One-click **CSV Download** for spreadsheet import, plus full **JSON Backup & Restore** for total data portability.
- **Multi-Currency Support**: Switch between USD (`$`), EUR (`€`), GBP (`£`), INR (`₹`), CAD (`CA$`), AUD (`AU$`), and JPY (`¥`).

### 📱 PWA & Android APK Installation
- **Installable PWA**: Runs full-screen on Android, iOS, Windows, and macOS with native app appearance, standalone launcher, and custom app icon.
- **APK Packaging Guide**: Integrated modal with step-by-step instructions to generate a signed Android `.apk` or `.aab` file via PWABuilder in under 2 minutes.

---

## 🏗️ Architecture & Component Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AURA ARCHITECTURE                              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    Navigation    │         │   Finance Store  │         │   PWA & Assets   │
│ • Desktop Header │         │ • LocalStorage   │         │ • manifest.json  │
│ • Mobile Tab Bar │         │ • Recurring Sched│         │ • icon.svg       │
│ • Quick Log CTA  │         │ • Export/Import  │         │ • Install Hook   │
└─────────┬────────┘         └─────────┬────────┘         └──────────────────┘
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                PRIMARY VIEWS                                │
├──────────────────────────────┬──────────────────────────────┬───────────────┤
│ 1. Overview Dashboard        │ 2. Category Budgets          │ 3. Analytics  │
│  • Total Balance & Inflow    │  • Monthly Limits            │  • Donut Pie  │
│  • Budget Health Runway      │  • Spent vs Remaining        │  • Multi-Bar  │
│  • Savings Highlights        │  • Daily Safe Pace           │  • Velocity   │
├──────────────────────────────┼──────────────────────────────┼───────────────┤
│ 4. Savings Goals             │ 5. Transaction Ledger        │ 6. Settings   │
│  • Milestone Progress Rings  │  • Search, Filter, Sort      │  • Currency   │
│  • Contribution Engine       │  • Scheduled Bills Drawer    │  • JSON Backup│
│  • Target Date Pacing        │  • CSV Export & Delete       │  • Reset Demo │
└──────────────────────────────┴──────────────────────────────┴───────────────┘
```

---

## 💻 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Storage**: Client-side `localStorage` with seed synchronization

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aura-finance.git
   cd aura-finance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📱 How to Convert to an Android APK

Aura includes a complete Web App Manifest (`public/manifest.json`) and high-resolution maskable icons.

### Method 1: Instant Install on Android (PWA)
1. Open the deployed application URL in Chrome on Android.
2. Tap the three dots menu (⋮) in the top-right corner.
3. Tap **"Install app"** or **"Add to Home Screen"**.
4. The app installs to your home screen with its own standalone window and icon.

### Method 2: Generate Standalone `.apk` with PWABuilder
1. Go to [PWABuilder.com](https://www.pwabuilder.com).
2. Enter your deployed app URL and click **Start**.
3. Click **Package for Android**.
4. Download the generated `.apk` file and install/sideload it onto your Android device.

---

## 📄 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
