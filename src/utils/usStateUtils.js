/**
 * US state mappings used for location parsing and display normalization.
 * Includes both abbreviation -> full name and lowercase full name -> abbreviation.
 */
export const US_STATES = {
  // Abbreviations
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
  // Full names (lowercase for matching)
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'district of columbia': 'DC'
};

/**
 * Get normalized state abbreviation from a state string.
 * @param {String} stateValue - State value (could be "FL" or "Florida")
 * @returns {String|null} State abbreviation in uppercase, or null if not found
 */
export const getStateAbbreviation = (stateValue) => {
  if (!stateValue) return null;

  const stateUpper = stateValue.toUpperCase().trim();
  const stateLower = stateValue.toLowerCase().trim();

  if (stateUpper.length === 2 && US_STATES[stateUpper]) {
    return stateUpper;
  }

  if (US_STATES[stateLower]) {
    return US_STATES[stateLower];
  }

  return null;
};

/**
 * Get full state name from a state string.
 * @param {String} stateValue - State value (could be "FL" or "Florida")
 * @returns {String|null} Full state name, or null if not found
 */
export const getStateFullName = (stateValue) => {
  if (!stateValue) return null;

  const abbreviation = getStateAbbreviation(stateValue);
  if (!abbreviation) return null;

  return US_STATES[abbreviation] || null;
};
