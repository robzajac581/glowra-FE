# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Notes
We are creating a website platform for plastic surgery information. This will involve a frontend website, APIs, backend database, and necessary software development

Our goal is to have a landing page, a search page that displays procedures, and a clinic page 