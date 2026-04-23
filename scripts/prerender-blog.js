#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { run } = require("react-snap");

const ROOT = path.join(__dirname, "..");
const BLOG_JSON_PATH = path.join(ROOT, "src", "generated", "blog-content.json");
const isVercel = process.env.VERCEL === "1";
const isCi = process.env.CI === "true";
const shouldSkipPrerender = process.env.BLOG_PRERENDER_SKIP === "true";
const shouldSoftFail =
	process.env.BLOG_PRERENDER_SOFT_FAIL === "true" || isVercel || isCi;

const readBlogSlugs = () => {
	if (!fs.existsSync(BLOG_JSON_PATH)) {
		return [];
	}

	const posts = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, "utf8"));
	return posts.map((post) => post.slug).filter(Boolean);
};

const runPrerender = async () => {
	if (shouldSkipPrerender) {
		console.warn("Skipping blog prerender (BLOG_PRERENDER_SKIP=true).");
		return;
	}

	const slugs = readBlogSlugs();
	const includeRoutes = ["/blog", ...slugs.map((slug) => `/blog/${slug}`)];

	await run({
		include: includeRoutes,
		crawl: false,
		skipThirdPartyRequests: true,
		puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	console.log(`Prerendered ${includeRoutes.length} blog route(s)`);
};

runPrerender().catch((error) => {
	console.error("Failed to prerender blog routes:", error);
	if (shouldSoftFail) {
		console.warn(
			"Continuing build without prerendered HTML (soft-fail enabled for CI/Vercel)."
		);
		process.exit(0);
	}
	process.exit(1);
});
