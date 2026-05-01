/**
 * Common tokens to keep uppercase after normalizing shouty (all-caps) procedure strings.
 */
const PROCEDURE_DISPLAY_ACRONYMS = [
	"PRF",
	"PRP",
	"PMA",
	"EZ",
	"RF",
	"IPL",
	"CO2",
	"MICC",
];

const PROCEDURE_DISPLAY_ACRONYM_SET = new Set(PROCEDURE_DISPLAY_ACRONYMS);

/**
 * @param {string} str
 * @returns {boolean}
 */
function isAllCapsLetters(str) {
	const letters = str.replace(/[^a-zA-Z]/g, "");
	return letters.length >= 2 && letters === letters.toUpperCase();
}

/**
 * Lowercase an all-caps string, then capitalize the first letter of each word-like segment.
 *
 * @param {string} str
 * @returns {string}
 */
function titleCaseFromShouting(str) {
	const lower = str.toLowerCase();
	let out = "";
	let capitalizeNext = true;
	for (let i = 0; i < lower.length; i++) {
		const ch = lower[i];
		if (capitalizeNext && /[a-z]/.test(ch)) {
			out += ch.toUpperCase();
			capitalizeNext = false;
		} else {
			out += ch;
		}
		if (/[\s(/\-&]/.test(ch)) capitalizeNext = true;
	}
	return out;
}

/**
 * Restore known medical / brand acronyms after title-casing.
 *
 * @param {string} str
 * @returns {string}
 */
function applyProcedureAcronyms(str) {
	let result = str;
	for (const token of PROCEDURE_DISPLAY_ACRONYMS) {
		result = result.replace(new RegExp(`\\b${token}\\b`, "gi"), token);
	}
	return result;
}

/**
 * If a slash-separated segment is entirely an acronym (e.g. MICC), restore casing.
 *
 * @param {string} segment
 * @returns {string}
 */
function normalizeSlashSegment(segment) {
	const t = segment.trim();
	if (!t) return "";
	const upper = t.toUpperCase();
	if (PROCEDURE_DISPLAY_ACRONYM_SET.has(upper)) return upper;
	return applyProcedureAcronyms(t);
}

/**
 * Formats a procedure label for display when providers send ALL CAPS names.
 * Mixed-case strings are returned unchanged (aside from trim).
 *
 * @param {string | null | undefined} raw
 * @returns {string}
 */
export function formatProcedureDisplayName(raw) {
	if (raw == null || typeof raw !== "string") return "";
	const trimmed = raw.trim();
	if (!trimmed) return "";
	if (!isAllCapsLetters(trimmed)) return trimmed;
	const titled = titleCaseFromShouting(trimmed);
	return titled.split("/").map(normalizeSlashSegment).join("/");
}

/**
 * @param {{ name?: string; procedureName?: string } | null | undefined} item
 * @returns {string}
 */
export function getProcedureDisplayName(item) {
	const raw = item?.name ?? item?.procedureName ?? "";
	return formatProcedureDisplayName(raw);
}
