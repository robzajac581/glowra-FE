#!/usr/bin/env node
/**
 * Wrapper for react-scripts build that loads POSTHOG_* and maps to REACT_APP_POSTHOG_*
 */
const { spawnSync } = require("child_process");
const path = require("path");

process.env.NODE_ENV = 'production';
require('./load-env.js');

const generateBlogContent = spawnSync(
	process.execPath,
	[path.join(__dirname, "generate-blog-content.js")],
	{ stdio: "inherit" }
);

if (generateBlogContent.status !== 0) {
	process.exit(generateBlogContent.status ?? 1);
}

const generateSitemap = spawnSync(
	process.execPath,
	[path.join(__dirname, "generate-sitemap.js")],
	{ stdio: "inherit" }
);

if (generateSitemap.status !== 0) {
	process.exit(generateSitemap.status ?? 1);
}

require('react-scripts/scripts/build');
