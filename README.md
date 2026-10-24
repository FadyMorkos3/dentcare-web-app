# DentCare React Assignment Project

A multi-role dental care dashboard built with React, TypeScript, Vite, and Tailwind CSS utilities.

## What This Project Demonstrates

- Multi-page routing with protected role-like flows (dentist, receptionist, admin, patient)
- Functional forms with validation and clear success feedback
- Interactive scheduling, billing, treatment, and patient-management workflows
- Reusable UI primitives and structured component composition
- Responsive behavior for desktop and mobile
- Automated component testing using Vitest + Testing Library

## Tech Stack

- React 19
- TypeScript
- React Router
- Vite 8
- Tailwind CSS v4 utilities + custom CSS system
- Vitest + Testing Library

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build production bundle:

```bash
npm run build
```

4. Run tests:

```bash
npm run test
```

## Assignment-Quality Checklist

- [x] App builds without errors
- [x] All primary navigation routes are functional
- [x] Core buttons trigger real behavior (navigation, state updates, export/download, confirmations)
- [x] Key forms include required-field and UX feedback behavior
- [x] Loading/empty states are implemented for list-driven screens
- [x] UI is responsive across desktop and mobile breakpoints
- [x] Shared UI components are reusable and tested
- [x] Basic automated tests are included and executable

## Key Screens Implemented

- Login workspace
- Dashboard
- Patients list + registration
- Patient overview + dental chart + diagnosis
- Treatment plan + plan drafting
- Appointments calendar + manage appointment
- Billing and receipt flow
- Imaging gallery
- Admin user management
- Patient portal views

## Architecture Notes

- `src/components/ui.tsx` contains reusable UI primitives (buttons, fields, badges, notices).
- `src/components/Shell.tsx` provides role-aware shell navigation and topbar.
- `src/pages.tsx` contains route-level screens and local UI workflow logic.
- `src/app/routes.tsx` defines route mapping and navigation structure.

## Testing Notes

- Test setup is in `src/test/setup.ts`.
- Component tests are currently provided for `src/components/ui.tsx` via `src/components/ui.test.tsx`.
- Add more tests for route-level flows as future assignment improvements.

## Backend & deployment

- Supabase is supported via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`).
- Database schema lives in `supabase/schema.sql`.
- Vercel deployment is configured via `vercel.json` (SPA rewrite to `index.html`).
- User administration persists to the `admin_users` table when Supabase is configured,
  and falls back to local storage otherwise.

## Limitations:

- This project uses frontend/demo-state behavior and does not persist to a backend API.
- Workflow outcomes are designed to mimic real product flows for assignment demonstration.

## Future Improvements

- Add API integration and persistent data storage
- Add route-level integration tests for end-to-end user flows
- Add stricter accessibility audit and keyboard-only workflow tests
- Add analytics/event tracking for critical actions
