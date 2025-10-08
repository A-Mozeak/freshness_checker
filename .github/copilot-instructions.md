# Copilot Instructions for Freshness Checker

## Project Overview
- **Freshness Checker** is a full-stack app for analyzing food freshness from images, providing spoilage advice, and surfacing recent FDA recalls. It uses React (frontend), Express (backend), Gemini AI, Firebase Auth, and FDA APIs.
- The frontend is in the root directory; the backend server is in `server/`.
- Key services: `geminiService.ts` (AI image analysis), `fdaService.ts` (recall lookup), `firebase.ts` (auth), and localStorage-based notifications.

## Architecture & Data Flow
- **User uploads image** → `ImageUploader` → `geminiService.analyzeImage` (Gemini API via backend proxy) → `ResultDisplay`.
- **Recall info**: `fdaService.fetchRecalls` fetches recent FDA recalls for detected food.
- **Notifications**: `useNotifications` stores food spoilage reminders in localStorage.
- **Auth**: `AuthContext` and `Login` use Firebase Auth (Google provider).
- **Backend**: Express server proxies Gemini API requests, rate-limits, and serves static assets from `/dist`.

## Developer Workflows
- **Local dev**: `npm install` then `npm run dev` (frontend only). Backend runs with `node server/server.js`.
- **Build**: `npm run build` (Vite). Docker builds both frontend and backend; see `Dockerfile`.
- **Environment**: Set `GEMINI_API_KEY` in `.env.local` for frontend, or `.env` for Docker/server. Firebase config via env vars in `firebase.ts`.
- **Testing**: No test scripts found; add tests in `__tests__/` or similar if needed.

## Patterns & Conventions
- **TypeScript throughout**; types in `types.ts`.
- **React hooks** for state and effects; custom hooks in `hooks/`.
- **Service files** encapsulate API logic (`services/`).
- **Error handling**: Console errors, user-facing errors via `NotificationBanner`.
- **Food freshness logic**: See `geminiService.ts` for prompt and schema.
- **Recalls**: Only first word of food name used for FDA search.
- **LocalStorage**: Used for notification persistence.

## Integration Points
- **Gemini API**: All AI calls proxied through backend for security/rate-limiting.
- **FDA API**: Direct fetch from frontend.
- **Firebase Auth**: Google provider only; config via env vars.

## Key Files & Directories
- `App.tsx`: Main app logic and data flow.
- `components/`: UI components.
- `services/`: API/service logic.
- `server/server.js`: Express backend and Gemini proxy.
- `hooks/useNotifications.ts`: LocalStorage notification logic.
- `contexts/AuthContext.tsx`: Auth state management.
- `Dockerfile`: Full-stack build and deployment.

## Example: Adding a New Food Analysis Feature
- Add logic to `geminiService.ts` and update `types.ts`.
- Update UI in `ResultDisplay.tsx` and `App.tsx`.
- If backend changes needed, update `server/server.js`.

---
For unclear workflows, missing conventions, or new integrations, ask for clarification or review recent PRs for examples.
