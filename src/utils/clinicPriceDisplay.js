/**
 * Formats a clinic procedure price for display (USD, no approximation prefix).
 * Aligns with search result cards for null/zero handling.
 *
 * @param {number|null|undefined} price
 * @returns {string}
 */
export function formatClinicPriceEstimate(price) {
	if (!price || price === 0) return 'Price on request';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price);
}

/**
 * Price unit suffix from API (e.g. "/session", "/unit").
 *
 * @param {{ priceUnit?: string, unit?: string }|null|undefined} item
 * @returns {string}
 */
export function formatProcedurePriceUnitSuffix(item) {
	const raw = item?.priceUnit ?? item?.unit;
	if (raw == null) return '';
	return String(raw).trim();
}

/**
 * Single-line price + unit (legacy). Prefer {@link import('../components/ProcedurePriceStack').default} for UI
 * so units can stack under the amount.
 *
 * @param {{ price?: number, priceUnit?: string, unit?: string }|null|undefined} item
 * @param {{ trailingPlus?: boolean }} [options]
 * @returns {string}
 */
export function formatClinicProcedureLinePrice(item, options = {}) {
	const { trailingPlus = false } = options;
	const base = formatClinicPriceEstimate(item?.price);
	if (base === 'Price on request') return base;
	const unit = formatProcedurePriceUnitSuffix(item);
	return `${base}${unit}${trailingPlus ? '+' : ''}`;
}
