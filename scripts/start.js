#!/usr/bin/env node
/**
 * Wrapper for react-scripts start that loads POSTHOG_* and maps to REACT_APP_POSTHOG_*
 */
require('./load-env.js');
require('react-scripts/scripts/start');
