import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toAbsoluteUrl } from "../config/site";

export const SITE_NAME = "Glowra";

export const DEFAULT_META = {
	title: "Glowra | Compare Cosmetic Procedure Prices, Clinics & Reviews",
	description:
		"Compare real prices for Botox, fillers and other cosmetic procedures, read reviews, and request a consultation with top-rated clinics near you.",
};

/**
 * Title/description for public routes that don't set their own <Helmet>.
 * Keep in sync with the defaults in public/index.html.
 */
const ROUTE_META = {
	"/": DEFAULT_META,
	"/search": {
		title: "Search Cosmetic Procedures & Clinics Near You | Glowra",
		description:
			"Search cosmetic procedures and clinics near you. Compare prices, ratings and reviews side by side, then request a consultation.",
	},
	"/about-us": {
		title: "About Glowra | Transparent Cosmetic Care, Made Simple",
		description:
			"Glowra brings real prices, real reviews and real access together so cosmetic care decisions feel clear, informed and confident.",
	},
	"/list-your-clinic": {
		title: "List Your Clinic on Glowra | Reach Patients Comparing Procedures",
		description:
			"Add your aesthetic or plastic surgery clinic to Glowra so patients comparing procedures, prices and reviews can find you and request consultations.",
	},
};

/**
 * Site-wide head tags: title, description, canonical, Open Graph and Twitter.
 * Rendered once inside the router. Pages that render their own <Helmet>
 * (e.g. blog articles) override these, since nested Helmets win.
 */
const SiteMeta = () => {
	const { pathname } = useLocation();
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	const meta = ROUTE_META[path] || DEFAULT_META;
	const url = toAbsoluteUrl(path);
	const isAdmin = path === "/admin" || path.startsWith("/admin/");

	return (
		<Helmet>
			<title>{meta.title}</title>
			<meta name="description" content={meta.description} />
			<link rel="canonical" href={url} />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={meta.title} />
			<meta property="og:description" content={meta.description} />
			<meta property="og:url" content={url} />
			<meta name="twitter:card" content="summary" />
			{isAdmin && <meta name="robots" content="noindex, nofollow" />}
		</Helmet>
	);
};

export default SiteMeta;
