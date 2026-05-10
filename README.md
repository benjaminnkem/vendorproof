# VendorProof — Mobile App

> AI-powered vendor trust and verification for informal Nigerian markets.  
> Built with React Native (Expo) for Squad Hackathon 3.0 — Challenge 01: Proof of Life.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [App Flows](#app-flows)
  - [Boot & Auth Guard](#boot--auth-guard)
  - [Authentication](#authentication)
  - [Onboarding & Verification](#onboarding--verification)
  - [Main App (Tabs)](#main-app-tabs)
- [Screens Reference](#screens-reference)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Connecting to the Backend](#connecting-to-the-backend)
- [Running on Device](#running-on-device)
- [Building for Production](#building-for-production)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Overview

VendorProof is a mobile application that gives informal Nigerian vendors a verifiable digital identity. Vendors complete a one-time AI-powered verification flow — submitting their NIN/CAC and a face selfie — and receive a **Trust Badge** backed by a real Squad payment link. Buyers can scan the badge or click the payment link to pay with confidence.

**Core loop:** Register → Upload document → Face match → AI scores → Trust Badge issued → Share link → Buyers pay via Squad → Score improves over time.

---

## Tech Stack

| Layer              | Library                          | Version | Purpose                                                  |
| ------------------ | -------------------------------- | ------- | -------------------------------------------------------- |
| Framework          | `expo`                           | ~51     | Managed workflow, OTA updates, SDK access                |
| Language           | `typescript`                     | ~5.x    | Full type safety across all files                        |
| Navigation         | `expo-router`                    | v3      | File-based routing, deep links, typed params             |
| Styling            | `nativewind`                     | v4      | Tailwind CSS utility classes for React Native            |
| Animations         | `react-native-reanimated`        | v3      | Native-thread animations and gestures                    |
| State              | `zustand`                        | ^4      | Auth state, onboarding state — lightweight global stores |
| Data fetching      | `@tanstack/react-query`          | ^5      | Mutations, caching, background refetch                   |
| Forms              | `react-hook-form`                | ^7      | Controlled form state with ref-based inputs              |
| Validation         | `zod`                            | ^3      | Runtime schema validation for all form inputs            |
| Form+Zod bridge    | `@hookform/resolvers`            | ^3      | Connects Zod schemas to React Hook Form                  |
| HTTP               | `axios`                          | ^1      | Typed API calls to the NestJS backend                    |
| Charts             | `react-native-chart-kit`         | ^6      | Bar and line charts on the dashboard                     |
| Charts (peer dep)  | `react-native-svg`               | ^15     | Required by chart-kit                                    |
| QR Code            | `react-native-qrcode-svg`        | ^6      | Renders the Trust Badge QR code                          |
| Camera             | `expo-camera`                    | ~15     | Selfie and document capture                              |
| Image picker       | `expo-image-picker`              | ~15     | Gallery fallback for document upload                     |
| Image compression  | `expo-image-manipulator`         | ~12     | Compress uploads before sending                          |
| Secure storage     | `expo-secure-store`              | ~13     | Encrypted JWT + vendor storage on device                 |
| Biometrics         | `expo-local-authentication`      | ~14     | Face ID / fingerprint login                              |
| Blur               | `expo-blur`                      | ~13     | Frosted glass tab bar on iOS                             |
| Icons              | `@expo/vector-icons`             | ~14     | Ionicons, MaterialCommunityIcons, Feather                |
| Notifications      | `expo-notifications`             | ~0.28   | Push notification handling                               |
| Payments (WebView) | `react-native-webview`           | ~13     | Embeds Squad payment page in-app                         |
| Safe area          | `react-native-safe-area-context` | ^4      | Cross-platform safe area insets                          |
| Utilities          | `date-fns`                       | ^4      | Date formatting for transaction timestamps               |
| Utilities          | `nanoid`                         | ^3      | Short unique IDs                                         |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 8.x
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** — `npm install -g eas-cli`
- **Expo Go** on your physical device (iOS or Android) for development

Optional for native builds:

- **Xcode** >= 15 (macOS only, for iOS simulator)
- **Android Studio** with an AVD configured (for Android emulator)

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/benjaminnkem/vendorproof.git
cd vendorproof

# 2. Install dependencies
npm install

# 3. Copy environment file
npm .env.example .env

# 4. Fill in your environment variables (see section below)

# 5. Start the dev server
npm run start
```

Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

---

## Environment Variables

Create a `.env` file in the project root. Never commit this file — it is gitignored.

```env
# Backend API base URL
# Local dev: use your machine's LAN IP, not localhost
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# Squad (use sandbox during development)
EXPO_PUBLIC_SQUAD_BASE_URL=https://sandbox-api-d.squadco.com

# Environment flag
EXPO_PUBLIC_APP_ENV=development

# --- Production values ---
# EXPO_PUBLIC_API_URL=https://api.vendorproof.ng
# EXPO_PUBLIC_SQUAD_BASE_URL=https://api-d.squadco.com
# EXPO_PUBLIC_APP_ENV=production
```

> All variables exposed to the app bundle **must** be prefixed with `EXPO_PUBLIC_`. Variables without this prefix are server-only and will be undefined at runtime.

---

## Project Structure

```
vendorproof-mobile/
│
├── app/                              # Expo Router — every file is a route
│   ├── _layout.tsx                   # Root layout — boot sequence + auth guard
│   │
│   ├── (auth)/                       # Unauthenticated group
│   │   ├── _layout.tsx               # Auth stack + QueryClientProvider
│   │   ├── login.tsx                 # Phone number entry
│   │   ├── verify.tsx                # OTP 6-box entry with countdown
│   │
│   ├── (onboarding)/                 # First-time verification flow (one-time)
│   │   ├── _layout.tsx               # Onboarding stack + QueryClientProvider
│   │   ├── index.tsx                 # Welcome / splash
│   │   ├── register.tsx              # Step 1 — business profile form
│   │   ├── document.tsx              # Step 2 — NIN/CAC upload + AI scan
│   │   ├── selfie.tsx                # Step 3 — face match capture
│   │   ├── processing.tsx            # Step 4 — animated AI pipeline
│   │   ├── result.tsx                # Step 5 — Trust Badge reveal
│   │   ├── store/
│   │   │   └── onboardingStore.ts    # Zustand — onboarding step + collected data
│   │   ├── lib/
│   │   │   ├── api.ts                # Simulated API calls (swap for real axios)
│   │   │   └── validators.ts         # Zod schemas for all onboarding forms
│   │   ├── hooks/
│   │   │   └── useOnboardingMutations.ts  # React Query mutations
│   │   └── components/
│   │       └── ui.tsx                # Shared primitives: Button, Input, Card, etc.
│   │
│   └── (tabs)/                       # Main authenticated app
│       ├── _layout.tsx               # Tab navigator with custom floating tab bar
│       ├── index.tsx                 # Home — Trust Score card, charts, activity
│       ├── badge.tsx                 # Trust Badge — QR code, share, verif checks
│       ├── transactions.tsx          # Activity — feed, filters, volume chart
│       ├── profile.tsx               # Vendor profile, score breakdown, stats
│       ├── settings.tsx              # Preferences, security, notifications
│       ├── components/
│       │   └── TabBar.tsx            # Custom Reanimated floating tab bar
│       └── data.ts                   # Mock data + types (replace with API calls)
│
├── assets/
│   ├── fonts/
│   │   └── DMSans-VariableFont_opsz,wght.ttf
│   └── images/
│
├── global.css                        # NativeWind base styles + Tailwind directives
├── tailwind.config.js                # Full color token system (see Design System)
├── app.json                          # Expo app config
├── eas.json                          # EAS Build profiles
├── tsconfig.json
└── package.json
```

---

## App Flows

### Boot & Auth Guard

Every app open runs through `app/_layout.tsx` before any screen renders:

```
App opens
  ↓
Root layout mounts → reads expo-secure-store
  │
  ├── No tokens stored
  │     → navigate to /(auth)/login
  │
  ├── Tokens found + biometric enabled
  │     → LocalAuthentication.authenticateAsync()
  │       ├── Success  → restore Zustand session → /(tabs)
  │       └── Cancelled/Failed → navigate to /(auth)/login
  │
  └── Tokens found, biometric not enabled
        → restore Zustand session silently → /(tabs)
```

The auth guard hook (`useAuthGuard`) runs on every navigation event. If `isAuthenticated` is false and the user is not in `(auth)` or `(onboarding)`, they are immediately redirected to login.

---

### Authentication

**Login screen (`(auth)/login.tsx`):**

- Single phone number input with `+234` country code prefix baked in
- Validates against Nigerian phone regex before sending
- Calls `sendOTP` mutation → Termii SMS dispatched from backend
- On success, navigates to verify screen passing `phone`, `sessionId`, and `expiresIn` as params

**Verify screen (`(auth)/verify.tsx`):**

- Six individual OTP digit boxes — each animates in with `ZoomIn` stagger
- Single hidden `TextInput` captures the keyboard; tapping any box focuses it
- Auto-submits the moment the 6th digit is entered
- Countdown ring changes color at 20s (amber) and 10s (red); resend available on expiry
- On success: tokens written to `expo-secure-store`, Zustand updated, biometric enrollment offered via `Alert`, then navigates to `/(tabs)`

**Biometric on subsequent opens:**

- `expo-local-authentication` runs silently on boot if the flag is set in secure store
- User sees only the Face ID / fingerprint system prompt — no login screen

---

### Onboarding & Verification

Onboarding is a **one-time** flow for new vendors. After completion, the JWT issued at the end of the flow is stored in `expo-secure-store` — the user goes directly to `/(tabs)` on next open without hitting the login screen.

| Step | Screen           | What happens                                                                                                                                                        |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `register.tsx`   | React Hook Form + Zod validates full name, phone, business name, category. Calls `registerVendor` mutation.                                                         |
| 2    | `document.tsx`   | Camera or gallery capture. `expo-image-manipulator` compresses. Calls `verifyDocument` mutation → Claude API analyses doc on backend. Shows extracted name + score. |
| 3    | `selfie.tsx`     | Front camera selfie. Liveness check steps shown. Calls `verifySelfie` mutation → face-api.js biometric match on backend. Shows confidence score.                    |
| 4    | `processing.tsx` | Animated 4-step pipeline display while `computeTrustScore` runs. Auto-navigates to result when done.                                                                |
| 5    | `result.tsx`     | Trust Badge revealed with animated score ring. Tier assigned. Squad payment link displayed. Share + navigate to dashboard.                                          |

---

### Main App (Tabs)

Five tabs rendered in a custom floating Reanimated tab bar:

| Tab      | Screen             | Key content                                                                                                                               |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Home     | `index.tsx`        | Trust score card with mini bars, 4-stat chip grid, weekly earnings `BarChart`, score trajectory `LineChart`, recent transactions preview  |
| Badge    | `badge.tsx`        | Animated medallion with orbit rings, verification checklist, QR code card, share actions, Squad payment link                              |
| Activity | `transactions.tsx` | Summary strip, daily volume `BarChart`, filter pills (All / Completed / Pending / Failed), full transaction feed                          |
| Profile  | `profile.tsx`      | Pulsing avatar ring, performance stats grid, layered score breakdown bars, business details, Platinum upgrade CTA                         |
| Settings | `settings.tsx`     | Custom toggle switches, notification prefs, security (biometric, 2FA, webhook sig), payments, verification, display, support, danger zone |

---

## Screens Reference

### `(auth)/login.tsx`

| Element     | Detail                                                                         |
| ----------- | ------------------------------------------------------------------------------ |
| Phone input | Animated border glow on focus via Reanimated `interpolate`. Clears on `✕` tap. |
| Validation  | `/^0?[789][01]\d{8}$/` — Nigerian numbers only                                 |
| Error state | Animates in with `FadeInDown`, icon + message                                  |
| CTA         | Disabled + dimmed until input is valid                                         |

### `(auth)/verify.tsx`

| Element          | Detail                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| OTP boxes        | 6 individual styled views. Spring scale on digit entry, shake on error |
| Keyboard capture | Single hidden `TextInput`, boxes are display-only                      |
| Auto-submit      | `useEffect` on `fullOtp.length === 6`                                  |
| Countdown        | Interval timer, visual ring, resend on expiry                          |
| Biometric prompt | `Alert` after success, writes flag to `expo-secure-store`              |

### `(tabs)/index.tsx` — Home

| Element          | Detail                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ |
| Trust score card | Live score bars for Document / Biometric / Behavioral, tier badge, glow behind score |
| Stats grid       | 4 chips: earned, orders, avg order, dispute rate                                     |
| Earnings chart   | `BarChart` from `react-native-chart-kit`, ₦ values in thousands                      |
| Score chart      | `LineChart` bezier, 7-month history                                                  |
| Activity preview | 4 most recent transactions, links to Activity tab                                    |

### `(tabs)/badge.tsx` — Badge

| Element           | Detail                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Medallion         | Dual counter-rotating orbit rings (Reanimated `withRepeat`), pulsing glow, orbit dots at 0/90/180/270° |
| Verification list | 4 checks: document, biometric, behavioral, Squad link                                                  |
| QR code           | `react-native-qrcode-svg`, white background card                                                       |
| Share actions     | Native `Share.share`, copy link, save QR                                                               |

### `(tabs)/transactions.tsx` — Activity

| Element       | Detail                                                    |
| ------------- | --------------------------------------------------------- |
| Filter pills  | `useState` filter, `FadeInRight` per row on filter change |
| Status colors | Success → teal, Pending → amber, Failed → red             |
| Volume chart  | `BarChart` with teal fill                                 |

---

## State Management

Two Zustand stores, completely independent:

### `authStore` — `(auth)/store/authStore.ts`

```ts
{
  accessToken: string | null;
  refreshToken: string | null;
  vendor: AuthVendor | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;

  setTokens(access, refresh); // called on login success
  setVendor(vendor); // called on login success
  setBiometricEnabled(val); // called when user opts in
  signOut(); // clears all state, SecureStore cleared separately
}
```

### `onboardingStore` — `(onboarding)/store/onboardingStore.ts`

```ts
{
  step: number;
  data: OnboardingData; // accumulated across all steps
  trustScore: TrustScore | null; // set after computeTrustScore resolves

  setStep(n);
  updateData(partial); // merges partial into data
  setTrustScore(score);
  reset(); // called on welcome screen mount
}
```

---

## API Integration

All API calls are in two files. Each function is **simulated by default** with a `TODO` comment showing the exact real call to replace it with. Payload types and return types are fully defined — screens and hooks require no changes when you switch to real endpoints.

### `(auth)/lib/auth.ts`

| Function                           | Endpoint (real)         | Simulated behaviour                                  |
| ---------------------------------- | ----------------------- | ---------------------------------------------------- |
| `sendOTP(phone)`                   | `POST /auth/send-otp`   | Returns `{ sessionId, expiresIn: 60 }` after 1.1s    |
| `verifyOTP(phone, otp, sessionId)` | `POST /auth/verify-otp` | OTP `123456` succeeds; any other 6-digit code throws |
| `refreshAccessToken(refreshToken)` | `POST /auth/refresh`    | Returns new access token after 0.6s                  |

### `(onboarding)/lib/api.ts`

| Function                      | Endpoint (real)               | Simulated behaviour                                         |
| ----------------------------- | ----------------------------- | ----------------------------------------------------------- |
| `registerVendor(payload)`     | `POST /vendors/register`      | Returns `vendorId` + Squad payment link after 1.2s          |
| `verifyDocument(payload)`     | `POST /verification/document` | Returns `documentScore` 78–98, extracted name, no anomalies |
| `verifySelfie(payload)`       | `POST /verification/selfie`   | Returns `biometricScore` 83–98, liveness pass               |
| `computeTrustScore(vendorId)` | `POST /vendors/trust-score`   | Weighted composite score, assigns tier                      |

### Connecting to the Real Backend

1. Create `lib/apiClient.ts` at the root of `(auth)` or a shared lib folder:

```ts
import axios, { AxiosInstance } from 'axios';
import { storage } from '../services/auth';
import { useAuthStore } from '../store/auth.store';
import env from './env';

export const publicApi: AxiosInstance = axios.create({
  baseURL: env.API_URL,
});

export const authApi: AxiosInstance = axios.create({
  baseURL: env.API_URL,
});

authApi.defaults.headers.common['Content-Type'] = 'application/json';

publicApi.interceptors.request.use(async (config) => {
  return config;
});

authApi.interceptors.request.use(async (config) => {
  const { access } = await storage.getTokens();
  if (access) config.headers['Authorization'] = `Bearer ${access}`;

  return config;
});

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        const { refresh } = await storage.getTokens();
        if (!refresh) {
          useAuthStore.getState().signOut();
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
            refreshToken: refresh,
          });
          await storage.setTokens(data.accessToken, refresh);
          error.config!.headers.Authorization = `Bearer ${data.accessToken}`;
          return authApi.request(error.config!);
        } catch {
          useAuthStore.getState().signOut();
        }
      }

      return Promise.reject(error);
    }
  }
);
```

2. Replace each simulated function body with `const { data } = await apiClient.post(...)` as shown in the `TODO` comments.

---

## Running on Device

### Physical device (recommended for camera features)

```bash
# Ensure phone and dev machine are on the same Wi-Fi
npm run start

# Android — scan QR with Expo Go
# iOS — scan QR with Camera app
```

### Android emulator

```bash
npm run android
```

### iOS simulator (macOS only)

```bash
npm run ios
```

### Tunnel mode (when local network is restricted or Squad webhooks needed)

```bash
npm run start --tunnel
```

Use tunnel mode alongside `ngrok` on the backend so Squad webhooks reach your local NestJS server during development.

---

## Building for Production

This project uses **EAS Build** for cloud-based native builds.

```bash
# Authenticate
eas login

# Configure (first time only)
eas build:configure

# Android APK — for direct install on devices (demo day)
eas build --platform android --profile preview

# Android AAB — for Play Store submission
eas build --platform android --profile production

# iOS — for App Store or TestFlight
eas build --platform ios --profile production
```

Build profiles are defined in `eas.json`. The `preview` profile produces a directly installable `.apk` — the right choice for hackathon demos.

### OTA updates (post-build patches)

```bash
eas update --branch production --message "Fix score display"
```

OTA updates work for JavaScript-only changes and are instant — no new build required.

---

## Design System

All colors, spacing, and typography are defined as Tailwind tokens in `tailwind.config.js` and used exclusively via NativeWind `className` props. Inline `style` is reserved for values that NativeWind cannot express — dynamic widths from Reanimated, chart config objects, and SVG attributes.

### Color Tokens

| Token             | Hex       | Usage                                          |
| ----------------- | --------- | ---------------------------------------------- |
| `canvas`          | `#080B12` | Screen backgrounds                             |
| `canvas-surface`  | `#0D1120` | Card surfaces                                  |
| `canvas-elevated` | `#111829` | Raised surfaces, icon backgrounds              |
| `canvas-border`   | `#1E2535` | All borders                                    |
| `canvas-muted`    | `#8892A4` | Secondary text, labels, placeholders           |
| `indigo-500`      | `#4361EE` | Primary buttons, active states, focus borders  |
| `indigo-400`      | `#7B8FF7` | Accent text, score displays                    |
| `indigo-200`      | `#A8B5FF` | Light text on dark indigo surfaces             |
| `indigo-900`      | `#1a1f3a` | Indigo surface tint                            |
| `teal-500`        | `#20C997` | Verified states, Platinum tier, success        |
| `teal-300`        | `#6EEAC5` | Teal text on dark surfaces                     |
| `teal-900`        | `#0a1a14` | Teal surface tint                              |
| `gold-500`        | `#F0A500` | Gold tier, Bronze tier, highlights             |
| `gold-300`        | `#FFD166` | Gold text on dark surfaces                     |
| `gold-900`        | `#1a1205` | Gold surface tint                              |
| `alert-500`       | `#E63946` | Error states, fraud flags, failed transactions |
| `alert-400`       | `#FF7B84` | Alert text on dark surfaces                    |
| `alert-900`       | `#1a0a08` | Alert surface tint                             |

### Trust Tier Colour Map

| Tier       | Border          | Text           | Surface          |
| ---------- | --------------- | -------------- | ---------------- |
| Unverified | `canvas-border` | `canvas-muted` | `canvas-surface` |
| Bronze     | `gold-700`      | `gold-300`     | `gold-900`       |
| Silver     | `#2a2a35`       | `#B4B2A9`      | `#1a1820`        |
| Gold       | `gold-500`      | `gold-300`     | `gold-900`       |
| Platinum   | `teal-500`      | `teal-300`     | `teal-900`       |

### Typography

- **Body / UI:** `DM Sans` — loaded via `expo-font` as a variable font
- **Monospace / code:** `DM Mono` — used for labels, IDs, scores, OTP boxes

### Animation Principles

- **Entrance:** `FadeInDown` with staggered `delay()` — every screen section has a unique delay offset
- **Interactions:** `withSpring` for scale and position — never `withTiming` for user-triggered actions
- **Loops:** `withRepeat(withSequence(...))` — pulse dots, orbit rings, floating icons
- **Charts:** Fill widths animated with `withTiming(target, { easing: Easing.out(Easing.cubic) })`
- **OTP boxes:** `ZoomIn` entrance, `withSequence` spring bounce on digit entry

---

## Contributing

### Branch naming

```
feature/short-description
fix/what-was-broken
chore/what-was-maintained
```

### Before pushing

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

### Commit style

Keep commits scoped to a single logical change. Reference the screen or module affected:

```
feat(verify): add biometric enrollment prompt after OTP success
fix(badge): correct orbit dot position on small screens
chore(deps): upgrade react-native-reanimated to 3.10
```

---

## Related

- **[VendorProof Backend](../vendorproof-api/README.md)** — NestJS API, Squad webhooks, Claude document intelligence, face-api.js biometrics
- **[Squad API Docs](https://squadinc.gitbook.io/squad-api-documentation)** — Collections, Payment Links, Transfers, Webhooks
- **[Expo Router Docs](https://docs.expo.dev/router/introduction/)** — File-based routing reference
- **[NativeWind Docs](https://www.nativewind.dev/)** — Tailwind CSS for React Native
- **[EAS Build Docs](https://docs.expo.dev/build/introduction/)** — Cloud builds and OTA updates
