#!/usr/bin/env node
/**
 * Wrapper for react-scripts build that loads POSTHOG_* and maps to REACT_APP_POSTHOG_*
 */
process.env.NODE_ENV = 'production';
require('./load-env.js');
require('react-scripts/scripts/build');
