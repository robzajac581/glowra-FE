#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "src", "generated");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "blog-content.json");
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const BLOG_LIST_ENDPOINT = `${API_BASE_URL}/api/blog/posts?limit=1000&page=1`;

const stripHtml = (rawHtml = "") =>
	String(rawHtml || "")
		.replace(/<[^>]+>/g, " ")
		.trim();

const buildPostFromHtml = (post) => {
	const textContent = stripHtml(post.html || "");
	const wordCount = textContent.split(/\s+/).filter(Boolean).length;
	return {
		title: String(post.title || "").trim(),
		date: String(post.date || post.publishedAt || "").trim(),
		slug: String(post.slug || "").trim(),
		description: String(post.description || "").trim(),
		html: String(post.html || ""),
		wordCount,
		readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
	};
};

const run = async () => {
	const response = await fetch(BLOG_LIST_ENDPOINT, {
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch blog summaries from backend (${BLOG_LIST_ENDPOINT}): HTTP ${response.status}`
		);
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(
			`Failed to fetch blog summaries from backend (${BLOG_LIST_ENDPOINT}): ${data.error || "unsuccessful response"}`
		);
	}

	const summaries = data.posts || [];
	const detailedPosts = await Promise.all(
		summaries.map(async (summary) => {
			const slug = String(summary.slug || "").trim();
			const detailResponse = await fetch(
				`${API_BASE_URL}/api/blog/posts/${encodeURIComponent(slug)}`,
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			if (!detailResponse.ok) {
				throw new Error(`Failed loading post "${slug}": HTTP ${detailResponse.status}`);
			}
			const detailData = await detailResponse.json();
			if (!detailData.success || !detailData.post) {
				throw new Error(`Failed loading post "${slug}": invalid payload`);
			}
			return detailData.post;
		})
	);
	const posts = detailedPosts.map(buildPostFromHtml);

	posts.sort((a, b) => new Date(b.date) - new Date(a.date));

	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts, null, 2), "utf8");

	console.log(`Generated ${posts.length} blog article(s) from backend: ${OUTPUT_PATH}`);
};

run().catch((error) => {
	console.error("Failed to generate blog content:", error);
	process.exit(1);
});
