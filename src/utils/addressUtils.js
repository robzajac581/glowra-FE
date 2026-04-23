import { getStateAbbreviation, getStateFullName } from "./usStateUtils";

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

const normalizeWhitespace = (value) => (value || "").trim().replace(/\s+/g, " ");

const toTitleCase = (value) => {
	const trimmed = normalizeWhitespace(value);
	if (!trimmed) return "";

	return trimmed
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

const stripDuplicatedStateFromCity = (city, state) => {
	const normalizedCity = normalizeWhitespace(city);
	if (!normalizedCity || !state) return normalizedCity;

	const stateAbbreviation = getStateAbbreviation(state);
	const stateFullName = getStateFullName(state);

	if (!stateAbbreviation && !stateFullName) {
		return normalizedCity;
	}

	const cityLower = normalizedCity.toLowerCase();
	const fullNameLower = stateFullName ? stateFullName.toLowerCase() : null;
	const abbreviationLower = stateAbbreviation ? stateAbbreviation.toLowerCase() : null;

	if (fullNameLower && (cityLower === fullNameLower || cityLower.endsWith(` ${fullNameLower}`))) {
		return normalizeWhitespace(normalizedCity.slice(0, normalizedCity.length - fullNameLower.length));
	}

	if (abbreviationLower && (cityLower === abbreviationLower || cityLower.endsWith(` ${abbreviationLower}`))) {
		return normalizeWhitespace(normalizedCity.slice(0, normalizedCity.length - abbreviationLower.length));
	}

	return normalizedCity;
};

/**
 * Normalize city/state for consistent card display.
 * - City: title case
 * - State: 2-letter abbreviation when possible
 * - Heuristic: remove duplicated trailing state from city text
 *
 * @param {Object} location
 * @param {string} [location.city]
 * @param {string} [location.state]
 * @returns {{ city: string, state: string }}
 */
export const formatClinicLocationDisplay = ({ city, state }) => {
	const stateDisplay = getStateAbbreviation(state) || normalizeWhitespace(state);
	const cleanedCity = stripDuplicatedStateFromCity(city, stateDisplay || state);
	const cityDisplay = toTitleCase(cleanedCity);

	return {
		city: cityDisplay,
		state: stateDisplay,
	};
};
