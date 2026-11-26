#!/usr/bin/env node
/**
 * Writes static HTML for /clinic/:id into build/ for every clinic that meets
 * the complete-data bar, so crawlers that don't run JavaScript (GPTBot,
 * ClaudeBot, PerplexityBot) see the clinic's name, address, procedures and
 * prices (GLO-98).
 *
 * Same approach as prerender-blog.js: fill build/index.html, no headless
 * browser. The app mounts with createRoot, which replaces #root.
 *
 * Data: ONE read-only request to GET {REACT_APP_API_URL}/api/clinics/indexable.
 * That endpoint is DB only (no Google calls). This script never fetches photo
 * URLs: they go into the JSON-LD as text only, because each proxied photo can
 * be a paid Google call.
 *
 * Unlike the blog prerender, a failure here does NOT fail the build: if the
 * API is down, slow (Render cold start), or doesn't have the endpoint yet,
 * the build logs a warning and the clinic pages stay client-rendered, as they
 * were before. Set PRERENDER_CLINICS=false to skip it on purpose.
 */
const fs = require("fs");
const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
require("./load-env.js");

const { isValidClinic, renderClinic, fillTemplate } = require("./lib/clinic-prerender");

const ROOT = path.join(__dirname, "..");
const BUILD_DIR = path.join(ROOT, "build");
const TEMPLATE_PATH = path.join(BUILD_DIR, "index.html");
const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://www.glowra.com").trim().replace(/\/+$/, "");
const API_BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:3001").trim().replace(/\/+$/, "");
const ENDPOINT = `${API_BASE_URL}/api/clinics/indexable`;
// Render's free tier can take ~a minute to wake up.
const TIMEOUT_MS = Number(process.env.PRERENDER_CLINICS_TIMEOUT_MS) || 90000;

const skip = (reason) => {
	console.warn(`WARNING: clinic prerender skipped: ${reason}. /clinic/:id stays client-rendered.`);
	process.exit(0);
};

const fetchClinics = async () => {
	let response;
	try {
		response = await fetch(ENDPOINT, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
	} catch (error) {
		skip(`could not reach ${ENDPOINT} (${error.name}: ${error.message})`);
	}
	if (!response.ok) skip(`${ENDPOINT} returned HTTP ${response.status}`);
	let data;
	try {
		data = await response.json();
	} catch {
		skip(`${ENDPOINT} did not return JSON`);
	}
	if (!data || !Array.isArray(data.clinics)) skip(`${ENDPOINT} returned no clinics array`);
	return data.clinics;
};

const run = async () => {
	if (String(process.env.PRERENDER_CLINICS).toLowerCase() === "false") skip("PRERENDER_CLINICS=false");
	if (!fs.existsSync(TEMPLATE_PATH)) skip(`missing ${TEMPLATE_PATH} (run the build first)`);

	const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
	const clinics = await fetchClinics();

	let written = 0;
	let invalid = 0;
	for (const clinic of clinics) {
		if (!isValidClinic(clinic)) {
			invalid += 1;
			continue;
		}
		let html;
		try {
			html = fillTemplate(template, renderClinic(clinic, SITE_URL));
		} catch (error) {
			// A template problem affects every page; stop rather than half-write.
			skip(`template error: ${error.message}`);
		}
		// clinicId is a validated positive integer, so this path is safe.
		const outDir = path.join(BUILD_DIR, "clinic", String(clinic.clinicId));
		fs.mkdirSync(outDir, { recursive: true });
		fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
		written += 1;
	}

	if (invalid) console.warn(`WARNING: clinic prerender skipped ${invalid} malformed clinic record(s)`);
	console.log(`Prerendered ${written} clinic page(s) from ${ENDPOINT}`);
};

run().catch((error) => skip(`unexpected error: ${error.message}`));
