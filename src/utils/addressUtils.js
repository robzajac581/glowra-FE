/**
 * Format clinic address for display, avoiding duplication when the address field
 * already contains the full address (street + city + state + zip).
 *
 * The backend often stores the complete address in the address field while also
 * returning separate city, state, zipCode. This utility detects that case and
 * returns the address as-is to prevent "6545 N Wickham Rd, Melbourne, FL 32940, Melbourne, Florida, 32940".
 *
 * @param {Object} clinic - Clinic object with address fields
 * @param {string} [clinic.address] - Street or full address
 * @param {string} [clinic.city] - City name
 * @param {string} [clinic.state] - State (abbreviation or full name)
 * @param {string} [clinic.zipCode] - ZIP/postal code
 * @returns {string} Formatted address for display
 */
export const formatClinicAddress = ({ address, city, state, zipCode }) => {
	if (!address && !city && !state && !zipCode) return '';

	// If address already contains zipCode, it's likely a full address - use as-is to avoid duplication
	if (address && zipCode && address.includes(zipCode)) {
		return address;
	}

	// Otherwise concatenate parts (street-only address + city + state + zip)
	const parts = [address, city, state, zipCode].filter(Boolean);
	return parts.join(', ');
};
