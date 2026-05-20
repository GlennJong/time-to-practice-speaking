# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Environment Variables

- **VITE_GAS_URL**: 本地開發用的 Google Apps Script Web App URL（範例: https://script.google.com/macros/s/xxx/exec）。
  - 在本地開發可於 `.env` 檔案中加入 `VITE_GAS_URL=...`。

### GitHub Actions Secrets

以下 secrets 用於 staging/production 分流部署：

# Practice2Gether

Practice2Gether is a private English speaking practice booking service for a small invited group. Members sign in with email verification, publish available practice slots, book time with other members, and manage their own schedule from a mobile-friendly dashboard.

## Features

- Invite-only access with email + OTP verification.
- Slot publishing for hosts, with support for adding multiple time slots at once.
- Automatic 30-minute snapping and 1-hour slot duration when creating new openings.
- Conflict checks to prevent overlapping slots with your own existing bookings.
- Booking flow for open slots, including cancel booking and cancel slot actions.
- Google Meet booking link returned after a successful reservation.
- List and grid views for browsing schedules.
- Filters for viewing all slots, your own slots, or other hosts.
- Manual refresh from the dashboard.
- First-time onboarding tour that explains how to publish and book slots.
- Practice guide modal with visual instructions.
- Local persistence for the last login profile and onboarding state.
- Developer bypass mode for local testing without the real backend.
- Responsive layout tuned for mobile and desktop.

## Tech Stack

- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- Google Apps Script backend

## Project Structure

- [src/App.tsx](src/App.tsx) contains the main booking flow, auth flow, onboarding, and dashboard logic.
- [src/components/](src/components) contains the reusable UI pieces used by the service.
- [public/](public) stores the static assets used by the app and practice guide.

## Getting Started

### Requirements

- Node.js 18+.
- npm.
- A deployed Google Apps Script Web App endpoint for the backend API.

### Install

```bash
npm install
```

### Configure Environment

Create a local `.env` file and point the app to your Google Apps Script endpoint:

```bash
VITE_GAS_URL=https://script.google.com/macros/s/xxx/exec
```

If `VITE_GAS_URL` is missing, the app shows a service unavailable overlay and blocks normal usage.

### Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Build and Check

```bash
npm run build
npm run lint
```

Use these before shipping changes to confirm the app still compiles and passes linting.

## Available Scripts

- `npm run dev`: start the Vite development server.
- `npm run build`: type-check and build the app for the current environment.
- `npm run build:prod`: build for production deployment.
- `npm run build:staging`: build for staging deployment.
- `npm run lint`: run ESLint.
- `npm run preview`: preview a production build locally.

## Backend Contract

The frontend talks to a Google Apps Script Web App through `VITE_GAS_URL`.

Expected actions include:

- `requestOTP`
- `verifyOTP`
- `getSlots`
- `addSlots`
- `bookSlot`
- `cancelSlot`
- `deleteSlot`

## Deployment

The repository is set up for GitFlow-style deployment.

- `prod` triggers production deployment to the GitHub Pages root.
- `staging` triggers staging deployment under the `/staging` path.

Related workflows:

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for production.
- [.github/workflows/deploy-staging.yml](.github/workflows/deploy-staging.yml) for staging.

Published URLs follow this pattern:

- Production: `https://<account>.github.io/<repo>/`
- Staging: `https://<account>.github.io/<repo>/staging/`

Each deployment also emits a `version.json` file with build metadata.

## Development Notes

- Use the developer bypass button on the landing page when you need to test the booking flow without OTP verification.
- The dashboard shows the next two weeks of active slots and groups them by date.
- Mobile and desktop layouts are intentionally different, so test both when changing the UI.
- The app stores the last used name and email in local storage to speed up repeat logins.

## Troubleshooting

- If login or slot loading fails, confirm that `VITE_GAS_URL` is set and reachable.
- If bookings fail unexpectedly, check that the current user does not overlap with an existing slot.
- If the app opens to a blocking overlay, the backend endpoint is missing from the environment.

