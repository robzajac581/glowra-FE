#!/usr/bin/env node
/**
 * Writes static HTML for /blog and /blog/:slug into build/, so crawlers
 * (Google, Bing, AI bots) get real content without running JavaScript.
 *
 * No headless browser: it fills build/index.html with the generated blog
 * content (src/generated/blog-content.json). The app mounts with createRoot,
 * which replaces #root, and react-helmet-async replaces the head tags marked
 * data-rh, so the user-facing page is unchanged.
 *
 * Any failure fails the build. (The previous react-snap step soft-failed on
 * Vercel, where its bundled Chromium cannot launch, so prod had no prerender.)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "build");
const TEMPLATE_PATH = path.join(BUILD_DIR, "index.html");
const BLOG_JSON_PATH = path.join(ROOT, "src", "generated", "blog-content.json");
const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://www.glowra.com")
	.trim()
	.replace(/\/+$/, "");

const BLOG_INDEX_TITLE = "Glowra Blog | Procedure Guides, Pricing, and Provider Insights";
const BLOG_INDEX_DESCRIPTION =
	"Explore Glowra blog guides on cosmetic procedure costs, treatment options, and provider research to help you make informed decisions.";

const escapeHtml = (value = "") =>
	String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

// JSON inside <script> must not be able to close the tag.
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const formatDate = (iso) =>
	new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});

const fail = (message) => {
	console.error(`Blog prerender failed: ${message}`);
	process.exit(1);
};

const headTags = ({ title, description, url, ogType, extra = [] }) =>
	[
		`<title>${escapeHtml(title)}</title>`,
		`<meta data-rh="true" name="description" content="${escapeHtml(description)}"/>`,
		`<link data-rh="true" rel="canonical" href="${escapeHtml(url)}"/>`,
		`<meta data-rh="true" property="og:type" content="${ogType}"/>`,
		`<meta data-rh="true" property="og:title" content="${escapeHtml(title)}"/>`,
		`<meta data-rh="true" property="og:description" content="${escapeHtml(description)}"/>`,
		`<meta data-rh="true" property="og:url" content="${escapeHtml(url)}"/>`,
		`<meta data-rh="true" property="og:site_name" content="Glowra"/>`,
		`<meta data-rh="true" name="twitter:card" content="summary"/>`,
		...extra,
	].join("");

const renderPage = (template, { head, body }) => {
	let html = template;

	// Drop the template's site-wide defaults (title + data-rh tags); ours replace them.
	html = html.replace(/<title>[\s\S]*?<\/title>/, "");
	html = html.replace(/<(?:meta|link)\b[^>]*\bdata-rh="true"[^>]*>/g, "");
	if (/data-rh="true"/.test(html)) fail("template still has data-rh tags after stripping");
	if (!html.includes("</head>")) fail("template has no </head>");
	html = html.replace("</head>", `${head}</head>`);

	const rootTag = '<div id="root"></div>';
	if (!html.includes(rootTag)) fail(`template has no empty ${rootTag}`);
	html = html.replace(rootTag, `<div id="root">${body}</div>`);

	return html;
};

const writePage = (routePath, html) => {
	const outDir = path.join(BUILD_DIR, routePath);
	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
};

const blogIndexPage = (posts) => {
	const url = `${SITE_URL}/blog`;
	const items = posts
		.map(
			(post) =>
				`<article><p>${formatDate(post.date)}</p>` +
				`<h2><a href="/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>` +
				`<p>${escapeHtml(post.description)}</p></article>`
		)
		.join("");

	return {
		head: headTags({
			title: BLOG_INDEX_TITLE,
			description: BLOG_INDEX_DESCRIPTION,
			url,
			ogType: "website",
		}),
		body:
			`<main><h1>Glowra Blog</h1>` +
			`<p>Actionable cosmetic procedure guides to help you research options, understand costs, and choose the right provider.</p>` +
			`${items}</main>`,
	};
};

const blogArticlePage = (post) => {
	const url = `${SITE_URL}/blog/${post.slug}`;
	// Mirrors the Article schema in src/pages/blog/BlogArticle.jsx.
	const schema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.description,
		datePublished: post.date,
		dateModified: post.date,
		mainEntityOfPage: url,
		author: { "@type": "Organization", name: "Glowra" },
		publisher: { "@type": "Organization", name: "Glowra" },
	};

	return {
		head: headTags({
			title: `${post.title} | Glowra Blog`,
			description: post.description,
			url,
			ogType: "article",
			extra: [
				`<meta data-rh="true" property="article:published_time" content="${escapeHtml(post.date)}"/>`,
				`<script data-rh="true" type="application/ld+json">${safeJson(schema)}</script>`,
			],
		}),
		body:
			`<main><article>` +
			`<p>${formatDate(post.date)}</p>` +
			`<h1>${escapeHtml(post.title)}</h1>` +
			`<p>${escapeHtml(post.description)}</p>` +
			`${post.html}` +
			`</article><p><a href="/blog">More articles on the Glowra Blog</a></p></main>`,
	};
};

const run = () => {
	if (!fs.existsSync(TEMPLATE_PATH)) fail(`missing ${TEMPLATE_PATH} (run the build first)`);
	if (!fs.existsSync(BLOG_JSON_PATH)) fail(`missing ${BLOG_JSON_PATH}`);

	const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
	const posts = JSON.parse(fs.readFileSync(BLOG_JSON_PATH, "utf8"));

	if (!Array.isArray(posts)) fail("blog-content.json is not an array");
	for (const post of posts) {
		if (!post.slug || !post.title || !post.html || !post.date) {
			fail(`post is missing slug/title/html/date: ${JSON.stringify(post.slug || post.title)}`);
		}
		if (!/^[a-z0-9-]+$/.test(post.slug)) fail(`unsafe slug: ${post.slug}`);
	}

	writePage("blog", renderPage(template, blogIndexPage(posts)));
	for (const post of posts) {
		writePage(`blog/${post.slug}`, renderPage(template, blogArticlePage(post)));
	}

	console.log(`Prerendered ${posts.length + 1} blog route(s) (index + ${posts.length} article(s))`);
};

run();
