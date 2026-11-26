/**
 * Pure helpers for scripts/prerender-clinics.js (GLO-98): turn one clinic
 * from GET /api/clinics/indexable into static head + body HTML.
 *
 * No network and no filesystem here, so src/prerender/clinicPrerender.test.js
 * can test it under Jest.
 *
 * Keep the visible content roughly in step with src/pages/clinic/Clinic.jsx
 * and its components (name, address, rating, procedures and prices, about).
 * The React app replaces all of it on load.
 */

const escapeHtml = (value = "") =>
	String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

// JSON inside <script> must not be able to close the tag.
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const isNonEmpty = (value) => typeof value === "string" && value.trim() !== "";

// Mirrors formatClinicPriceEstimate / formatClinicProcedureLinePrice in
// src/utils/clinicPriceDisplay.js (trailingPlus, as ClinicProcedures shows it).
const formatPrice = (procedure) => {
	const price = Number(procedure && procedure.price);
	if (!price) return "Price on request";
	const base = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
	const unit = isNonEmpty(procedure.priceUnit) ? procedure.priceUnit.trim() : "";
	return `${base}${unit}+`;
};

const isValidClinic = (clinic) =>
	Boolean(clinic) &&
	Number.isInteger(clinic.clinicId) &&
	clinic.clinicId > 0 &&
	isNonEmpty(clinic.clinicName) &&
	Array.isArray(clinic.procedures);

const locationLine = (clinic) => {
	const cityState = [clinic.city, clinic.state].filter(isNonEmpty).join(", ");
	return [cityState, clinic.zipCode].filter(isNonEmpty).join(" ");
};

const fullAddress = (clinic) =>
	[clinic.address, locationLine(clinic)].filter(isNonEmpty).join(", ");

const groupByCategory = (procedures) => {
	const groups = new Map();
	for (const p of procedures) {
		if (!p || !isNonEmpty(p.procedureName)) continue;
		const category = isNonEmpty(p.category) ? p.category.trim() : "Other";
		if (!groups.has(category)) groups.set(category, []);
		groups.get(category).push(p);
	}
	return groups;
};

const clinicTitle = (clinic) => {
	const place = [clinic.city, clinic.state].filter(isNonEmpty).join(", ");
	return place
		? `${clinic.clinicName} in ${place}: Prices & Reviews | Glowra`
		: `${clinic.clinicName}: Prices & Reviews | Glowra`;
};

const clinicDescription = (clinic) => {
	const place = [clinic.city, clinic.state].filter(isNonEmpty).join(", ");
	const names = clinic.procedures
		.filter((p) => p && isNonEmpty(p.procedureName))
		.slice(0, 3)
		.map((p) => p.procedureName.trim());
	const rating =
		typeof clinic.rating === "number" && clinic.rating > 0
			? ` Rated ${clinic.rating.toFixed(1)} on Google from ${clinic.reviewCount || 0} reviews.`
			: "";
	return (
		`Compare prices for ${clinic.procedures.length} procedures at ${clinic.clinicName}` +
		(place ? ` in ${place}` : "") +
		(names.length ? `, including ${names.join(", ")}.` : ".") +
		rating
	);
};

const clinicSchema = (clinic, url) => {
	const schema = {
		"@context": "https://schema.org",
		"@type": "MedicalBusiness",
		name: clinic.clinicName,
		url,
	};
	if (isNonEmpty(clinic.address) || isNonEmpty(clinic.city)) {
		schema.address = {
			"@type": "PostalAddress",
			...(isNonEmpty(clinic.address) && { streetAddress: clinic.address }),
			...(isNonEmpty(clinic.city) && { addressLocality: clinic.city }),
			...(isNonEmpty(clinic.state) && { addressRegion: clinic.state }),
			...(isNonEmpty(clinic.zipCode) && { postalCode: clinic.zipCode }),
			addressCountry: "US",
		};
	}
	if (isNonEmpty(clinic.phone)) schema.telephone = clinic.phone;
	// Referenced, never fetched by the build. It is a URL on the API's photo proxy.
	if (isNonEmpty(clinic.photoUrl)) schema.image = clinic.photoUrl;
	if (typeof clinic.latitude === "number" && typeof clinic.longitude === "number") {
		schema.geo = { "@type": "GeoCoordinates", latitude: clinic.latitude, longitude: clinic.longitude };
	}
	if (typeof clinic.rating === "number" && clinic.rating > 0 && clinic.reviewCount > 0) {
		schema.aggregateRating = {
			"@type": "AggregateRating",
			ratingValue: clinic.rating,
			reviewCount: clinic.reviewCount,
		};
	}
	const priced = clinic.procedures.filter((p) => p && isNonEmpty(p.procedureName) && Number(p.price) > 0);
	if (priced.length) {
		schema.makesOffer = priced.map((p) => ({
			"@type": "Offer",
			itemOffered: { "@type": "Service", name: p.procedureName },
			price: Number(p.price),
			priceCurrency: "USD",
		}));
	}
	return schema;
};

const headTags = (clinic, siteUrl) => {
	const url = `${siteUrl}/clinic/${clinic.clinicId}`;
	const title = clinicTitle(clinic);
	const description = clinicDescription(clinic);
	return [
		`<title>${escapeHtml(title)}</title>`,
		`<meta data-rh="true" name="description" content="${escapeHtml(description)}"/>`,
		`<link data-rh="true" rel="canonical" href="${escapeHtml(url)}"/>`,
		`<meta data-rh="true" property="og:type" content="website"/>`,
		`<meta data-rh="true" property="og:title" content="${escapeHtml(title)}"/>`,
		`<meta data-rh="true" property="og:description" content="${escapeHtml(description)}"/>`,
		`<meta data-rh="true" property="og:url" content="${escapeHtml(url)}"/>`,
		`<meta data-rh="true" property="og:site_name" content="Glowra"/>`,
		`<meta data-rh="true" name="twitter:card" content="summary"/>`,
		`<script data-rh="true" type="application/ld+json">${safeJson(clinicSchema(clinic, url))}</script>`,
	].join("");
};

const safeHttpUrl = (value) => {
	if (!isNonEmpty(value)) return null;
	try {
		const u = new URL(value.trim());
		return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
	} catch {
		return null;
	}
};

const bodyHtml = (clinic) => {
	const parts = [`<main><article>`, `<h1>${escapeHtml(clinic.clinicName)}</h1>`];

	const address = fullAddress(clinic);
	if (address) parts.push(`<p>${escapeHtml(address)}</p>`);
	if (isNonEmpty(clinic.category)) parts.push(`<p>${escapeHtml(clinic.category)}</p>`);
	if (typeof clinic.rating === "number" && clinic.rating > 0) {
		parts.push(
			`<p>Google rating ${escapeHtml(clinic.rating.toFixed(1))} (${escapeHtml(clinic.reviewCount || 0)} reviews)</p>`
		);
	}
	if (isNonEmpty(clinic.phone)) parts.push(`<p>Phone: ${escapeHtml(clinic.phone)}</p>`);
	const website = safeHttpUrl(clinic.website);
	if (website) {
		parts.push(`<p><a href="${escapeHtml(website)}" rel="nofollow noopener">Clinic website</a></p>`);
	}

	parts.push(`<section><h2>Procedures and prices</h2>`);
	for (const [category, procedures] of groupByCategory(clinic.procedures)) {
		parts.push(
			`<h3>${escapeHtml(category)}</h3><table><thead><tr><th scope="col">Procedure</th>` +
				`<th scope="col">Clinic Price Estimate</th></tr></thead><tbody>`
		);
		for (const p of procedures) {
			parts.push(
				`<tr><td>${escapeHtml(p.procedureName.trim())}</td><td>${escapeHtml(formatPrice(p))}</td></tr>`
			);
		}
		parts.push(`</tbody></table>`);
	}
	parts.push(`</section>`);

	if (isNonEmpty(clinic.description)) {
		parts.push(
			`<section><h2>About ${escapeHtml(clinic.clinicName)}</h2><p>${escapeHtml(clinic.description)}</p></section>`
		);
	}

	parts.push(`</article><p><a href="/search">Compare more clinics on Glowra</a></p></main>`);
	return parts.join("");
};

/** @returns {{ head: string, body: string }} */
const renderClinic = (clinic, siteUrl) => ({
	head: headTags(clinic, siteUrl),
	body: bodyHtml(clinic),
});

/**
 * Fill the CRA build/index.html template, the same way prerender-blog.js does.
 * Throws (rather than exiting) so the caller decides what a failure means.
 */
const fillTemplate = (template, { head, body }) => {
	let html = template;
	html = html.replace(/<title>[\s\S]*?<\/title>/, "");
	html = html.replace(/<(?:meta|link)\b[^>]*\bdata-rh="true"[^>]*>/g, "");
	if (/data-rh="true"/.test(html)) throw new Error("template still has data-rh tags after stripping");
	if (!html.includes("</head>")) throw new Error("template has no </head>");
	const rootTag = '<div id="root"></div>';
	if (!html.includes(rootTag)) throw new Error(`template has no empty ${rootTag}`);
	return html.replace("</head>", `${head}</head>`).replace(rootTag, `<div id="root">${body}</div>`);
};

module.exports = {
	escapeHtml,
	formatPrice,
	isValidClinic,
	renderClinic,
	fillTemplate,
};
