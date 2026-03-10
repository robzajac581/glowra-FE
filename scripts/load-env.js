/**
 * Loads env from .env files and maps POSTHOG_* to REACT_APP_POSTHOG_*
 * so sensitive keys can use non-exposed variable names.
 * Run before react-scripts (start/build).
 */
const path = require('path');
const fs = require('fs');

function loadEnvFile(filePath) {
	if (fs.existsSync(filePath)) {
		require('dotenv').config({ path: filePath });
	}
}

// Load .env and env-specific file
const root = path.join(__dirname, '..');
loadEnvFile(path.join(root, '.env'));
if (process.env.NODE_ENV === 'production') {
	loadEnvFile(path.join(root, '.env.production'));
}

// Map POSTHOG_* to REACT_APP_POSTHOG_* (non-prefixed vars stay out of exposed env templates)
if (process.env.POSTHOG_KEY) {
	process.env.REACT_APP_POSTHOG_KEY = process.env.POSTHOG_KEY;
}
if (process.env.POSTHOG_HOST) {
	process.env.REACT_APP_POSTHOG_HOST = process.env.POSTHOG_HOST;
}
if (process.env.POSTHOG_DEV !== undefined) {
	process.env.REACT_APP_POSTHOG_DEV = process.env.POSTHOG_DEV;
}
