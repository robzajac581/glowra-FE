const normalizeSiteUrl = (url) => (url || "").trim().replace(/\/+$/, "");

const browserOrigin =
	typeof window !== "undefined" ? normalizeSiteUrl(window.location.origin) : "";

const configuredSiteUrl = normalizeSiteUrl(process.env.REACT_APP_SITE_URL || "");
const fallbackSiteUrl = "https://www.glowra.com";

export const SITE_URL = configuredSiteUrl || fallbackSiteUrl || browserOrigin;

export const toAbsoluteUrl = (path = "/") => {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${SITE_URL}${normalizedPath}`;
};
