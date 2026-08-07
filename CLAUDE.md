# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Glowra is a website platform for plastic surgery information: a landing page, a search page that
displays procedures, and clinic pages.

The project spans three repositories, normally cloned as siblings in the same parent directory:

| Repo | Role | Local port |
|---|---|---|
| `glowra-FE` | Frontend, Create React App (this repo) | 3000 |
| `glowra-search-api` | Search / clinics / blog backend | 3001 |
| `glowra-contact-request-api` | Consultation + clinic listing requests | 3002 |

**This repo and `glowra-search-api` frequently require coordinated changes.** Before implementing
against an endpoint, check whether the backend actually returns what's expected — if it doesn't,
the change likely spans both repos and should be flagged as such.

## Setup

Copy `.env.example` to `.env` and fill in real values; API keys are not in the repo. To run
against local backends, point `REACT_APP_API_URL` at `http://localhost:3001` and
`REACT_APP_CONSULTATION_REQUEST_API_URL` at `http://localhost:3002`, and start those services.

PostHog keys use `POSTHOG_*` rather than `REACT_APP_POSTHOG_*` so they stay out of exposed
configs; `scripts/load-env.js` maps them at build/start time.

## Build Commands
- Start dev server: `npm start`
- Build for production: `npm run build`
- Run tests: `npm test`
- Run single test: `npm test -- -t "test name"`

## Code Style Guidelines
- React functional components with arrow functions
- JSX files for components (.jsx extension)
- Import order: React core, third-party libraries, local components, utils, styles
- Use destructuring for props
- Use the `cn()` utility for combining Tailwind classes
- Hooks naming: use[HookName] pattern
- Components should be in PascalCase
- Detailed JSDoc comments for functions in utilities
- Error handling: try/catch with console.error and fallback options
- Use Material Tailwind React components with customization
- State management via custom hooks with URL param synchronization

## Deploys

Pushing to `main` triggers an automatic production deploy. Do not push until the change has been
reviewed running locally.

## Task tracking

Linear workspace `Glowra` (linear.app/glowra) is the primary tracker. A JIRA project `GLOW` at
`rob-zajac-glowra.atlassian.net` also exists and is mirrored.
