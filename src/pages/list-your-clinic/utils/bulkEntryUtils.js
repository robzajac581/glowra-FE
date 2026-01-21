/**
 * Normalize provider/procedure names to proper capitalization
 * 
 * Rules:
 * - Capitalize first letter of each word
 * - Handle common titles (Dr., Dr) - normalize to "Dr. "
 * - Keep credentials uppercase (NP, RN, BSN, LE, etc.)
 * - Preserve separators like | and -
 * - Trim whitespace
 * 
 * Examples:
 * "anna ulyannov (NP)" → "Anna Ulyannov (NP)"
 * "DR. JOHN SMITH" → "Dr. John Smith"
 * "anne yeaton, RN | BSN | LE" → "Anne Yeaton, RN | BSN | LE"
 * "heather lancaster - medical assistant" → "Heather Lancaster - Medical Assistant"
 */
export const normalizeName = (name) => {
  if (!name || typeof name !== 'string') {
    return name;
  }

  // Trim leading/trailing whitespace
  let normalized = name.trim();
  
  // Normalize "Dr." prefix (handle Dr., Dr, DR., dr., etc.)
  normalized = normalized.replace(/^(dr\.?)\s*/i, 'Dr. ');
  
  // Common credentials that should stay uppercase
  const credentials = ['NP', 'RN', 'BSN', 'LE', 'MD', 'DO', 'PA', 'APRN', 'FNP', 'DNP', 'MSN', 'CNP'];
  
  // Split by separators while preserving them - use lookahead/lookbehind to keep separators
  const parts = normalized.split(/(\s*[|,\-]\s*|[()])/);
  
  // Process each part
  const processedParts = parts.map(part => {
    const trimmedPart = part.trim();
    
    // If it's a separator (contains |, -, ,, (, or )), normalize spacing
    if (/^[|,\-()]$/.test(trimmedPart)) {
      return trimmedPart;
    }
    
    // Skip empty parts
    if (!trimmedPart) {
      return '';
    }
    
    // Split into words
    const words = trimmedPart.split(/\s+/);
    
    // Capitalize each word, but keep credentials uppercase
    const capitalizedWords = words.map(word => {
      if (!word) return '';
      
      // Check if word contains parentheses (like "(NP)")
      if (word.includes('(') && word.includes(')')) {
        const match = word.match(/^([^(]*)(\(.*\))$/);
        if (match) {
          const beforeParen = match[1];
          const inParen = match[2].toUpperCase(); // Keep credentials in parens uppercase
          const beforeCapitalized = beforeParen 
            ? (beforeParen.charAt(0).toUpperCase() + beforeParen.slice(1).toLowerCase())
            : '';
          return beforeCapitalized + inParen;
        }
      }
      
      // Check if it's a credential (case-insensitive, exact match)
      const upperWord = word.toUpperCase();
      if (credentials.includes(upperWord)) {
        return upperWord;
      }
      
      // Regular word - capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    
    return capitalizedWords.join(' ');
  });
  
  // Join all parts
  let result = processedParts.join('');
  
  // Clean up spacing around separators
  result = result.replace(/\s*\|\s*/g, ' | ');
  result = result.replace(/\s*-\s*/g, ' - ');
  result = result.replace(/\s*,\s*/g, ', ');
  result = result.replace(/\s*\(\s*/g, ' (');
  result = result.replace(/\s*\)\s*/g, ') ');
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ');
  
  return result.trim();
};

/**
 * Parse semicolon-separated input into an array of normalized names
 * 
 * @param {string} input - Semicolon-separated string
 * @returns {string[]} - Array of normalized names
 */
export const parseBulkInput = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // Split by semicolon
  const entries = input.split(';');
  
  // Trim, normalize, and filter out empty entries
  return entries
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)
    .map(entry => normalizeName(entry));
};

