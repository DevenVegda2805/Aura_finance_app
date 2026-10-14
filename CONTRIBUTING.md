# Contributing to Aura

Thank you for your interest in contributing to Aura!

## Development Workflow

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Verify TypeScript and code formatting:
   ```bash
   npm run lint
   npm run build
   ```

5. Commit your changes and open a Pull Request!

## Design Principles
- **Apple Wallet Aesthetic**: Maintain clean card surfaces, single elevation, subtle hairline borders, and unboxed typography.
- **Tabular Figures**: Always format numbers, currency, and percentages with `tabular-nums` for clean vertical alignment.
- **Privacy First**: Ensure all user data continues to persist securely in client storage without unintended network leaks.
