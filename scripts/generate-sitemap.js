#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BLOG_JSON_PATH = path.join(ROOT, "src", "generated", "blog-content.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const SITEMAP_PATH = path.join(PUBLIC_DIR, "sitemap.xml");
const ROBOTS_PATH = path.join(PUBLIC_DIR, "robots.txt");

const defaultSiteUrl = "https://www.glowra.com";
const siteUrl = (process.env.REACT_APP_SITE_URL || defaultSiteUrl).replace(/\/+$/, "");

const readBlogPosts = () => {
	if (!fs.existsSync(BLOG_JSON_PATH)) {
		return [];
	}

	return JSON.parse(fs.readFileSync(BLOG_JSON_PATH, "utf8"));
};

const toUrlEntry = ({ pathName, lastMod }) => {
	const normalizedPath = pathName.startsWith("/") ? pathName : `/${pathName}`;
	return `
  <url>
    <loc>${siteUrl}${normalizedPath}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>`;
};

const run = () => {
	const nowIso = new Date().toISOString();
	const blogPosts = readBlogPosts();

	const coreRoutes = [
		{ pathName: "/", lastMod: nowIso },
		{ pathName: "/search", lastMod: nowIso },
		{ pathName: "/blog", lastMod: nowIso },
	];

	const blogRoutes = blogPosts.map((post) => ({
		pathName: `/blog/${post.slug}`,
		lastMod: new Date(post.date).toISOString(),
	}));

	const entries = [...coreRoutes, ...blogRoutes].map(toUrlEntry).join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>
`;

	const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
Sitemap: ${siteUrl}/sitemap.xml
`;

	fs.mkdirSync(PUBLIC_DIR, { recursive: true });
	fs.writeFileSync(SITEMAP_PATH, sitemap, "utf8");
	fs.writeFileSync(ROBOTS_PATH, robots, "utf8");

	console.log(`Generated sitemap with ${coreRoutes.length + blogRoutes.length} URL(s)`);
};

run();
