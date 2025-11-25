/**
 * Normalize doctor names to ensure consistent formatting
 * 
 * Rules:
 * - Ensures there's always a space after "Dr."
 * - Handles various formats: "Dr.", "Dr", "DR.", "dr."
 * - Preserves the rest of the name as-is
 * - Handles edge cases like multiple spaces, no name after Dr., etc.
 * 
 * Examples:
 * "Dr.James Smith" → "Dr. James Smith"
 * "Dr.John" → "Dr. John"
 * "DR.MARY JONES" → "Dr. MARY JONES"
 * "Dr. Already Correct" → "Dr. Already Correct"
 * "Dr  Extra Spaces" → "Dr. Extra Spaces"
 * "Regular Name" → "Regular Name"
 */
export const normalizeDoctorName = (name) => {
	if (!name || typeof name !== 'string') {
		return name;
	}

	// Trim leading/trailing whitespace
	let normalized = name.trim();

	// Replace "Dr." or "Dr" or "DR." or "dr." (case insensitive) at the start
	// Ensure there's exactly one space after "Dr."
	normalized = normalized.replace(/^(dr\.?)\s*/i, 'Dr. ');

	// Clean up any double spaces that might have been created
	normalized = normalized.replace(/\s+/g, ' ');

	return normalized;
};

/**
 * Normalize an array of doctor names
 */
export const normalizeDoctorNames = (names) => {
	if (!Array.isArray(names)) {
		return names;
	}
	return names.map(normalizeDoctorName);
};

