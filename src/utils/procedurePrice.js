/**
 * Human-readable suffix from stored unit values (e.g. "/unit" from PRICE_UNITS).
 * @param {string|undefined|null} unitRaw
 * @returns {string} e.g. "per unit", or "" if none
 */
export function getProcedureUnitLabel(unitRaw) {
  const u = typeof unitRaw === 'string' ? unitRaw.trim() : '';
  if (!u) return '';
  if (u.startsWith('/')) return `per ${u.slice(1)}`;
  return u;
}

/**
 * @param {object} item - Procedure from API (may use name or procedureName; priceUnit or unit)
 * @returns {string|undefined|null}
 */
export function getProcedurePriceUnit(item) {
  if (!item || typeof item !== 'object') return '';
  return item.priceUnit ?? item.unit ?? '';
}

/**
 * Formats a clinic procedure estimate: ~$12 or ~$12 / per unit (no trailing +).
 * @param {number} price
 * @param {object} [item]
 * @returns {string}
 */
export function formatClinicEstimatePrice(price, item) {
  const formatted =
    '~' +
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const unitLabel = getProcedureUnitLabel(getProcedurePriceUnit(item));
  if (!unitLabel) return formatted;
  return `${formatted} / ${unitLabel}`;
}
