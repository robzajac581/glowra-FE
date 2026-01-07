/**
 * Validates draft field persistence by comparing sent vs received data
 * Returns validation results without logging (for debugging purposes)
 */

const DRAFT_FIELDS = {
  // Basic Info
  basic: ['clinicName', 'address', 'city', 'state', 'zipCode', 'category', 'website', 'phone', 'email', 'description'],
  // Location
  location: ['latitude', 'longitude', 'placeId'],
  // Google Data
  google: ['googleRating', 'googleReviewCount', 'googleReviewsJSON', 'reviewsLink'],
  // Metadata
  metadata: ['status', 'source', 'submissionFlow', 'duplicateClinicId', 'notes'],
  // Related arrays
  arrays: ['providers', 'procedures', 'photos'],
};

/**
 * Validates draft field persistence by comparing sent vs received data
 * @param {Object} sentDraft - The draft object sent to the backend
 * @param {Object} receivedDraft - The draft object returned from the backend
 * @param {string} operation - Description of the operation (e.g., 'PUT /api/admin/drafts/:id')
 * @returns {Object} Object containing issues, warnings, and the draft objects
 */
export const validateDraftSave = (sentDraft, receivedDraft, operation = 'save') => {
  const issues = [];
  const warnings = [];
  
  // Only validate fields that were actually sent (for partial updates)
  const sentFields = Object.keys(sentDraft || {});
  
  // Check all field categories, but only for fields that were sent
  Object.entries(DRAFT_FIELDS).forEach(([category, fields]) => {
    fields.forEach(field => {
      // Skip if this field wasn't sent in the request
      if (!sentFields.includes(field)) {
        return;
      }
      
      const sentValue = sentDraft[field];
      const receivedValue = receivedDraft?.[field];
      
      if (category === 'arrays') {
        // For arrays, only compare if they were explicitly sent
        // Skip if sentValue is undefined (partial update)
        if (sentValue !== undefined) {
          const sentLength = Array.isArray(sentValue) ? sentValue.length : 0;
          const receivedLength = Array.isArray(receivedValue) ? receivedValue.length : 0;
          
          if (sentLength !== receivedLength) {
            issues.push({
              field,
              category,
              issue: `Array length mismatch: sent ${sentLength}, received ${receivedLength}`,
              sent: sentValue,
              received: receivedValue,
            });
          }
        }
      } else {
        // For primitives, check if value matches
        if (sentValue !== undefined && sentValue !== null) {
          if (receivedValue === undefined || receivedValue === null) {
            issues.push({
              field,
              category,
              issue: 'Field sent but not returned',
              sent: sentValue,
              received: receivedValue,
            });
          } else if (sentValue !== receivedValue) {
            warnings.push({
              field,
              category,
              issue: 'Field value changed',
              sent: sentValue,
              received: receivedValue,
            });
          }
        }
      }
    });
  });
  
  return { issues, warnings, sentDraft, receivedDraft };
};

/**
 * Compares two draft objects and logs changes
 * @param {Object} before - The draft object before the operation
 * @param {Object} after - The draft object after the operation
 * @param {string} operation - Description of the operation
 * @returns {Array} Array of changed fields
 */
export const logDraftComparison = (before, after, operation = 'update') => {
  const changedFields = [];
  Object.keys(before || {}).forEach(key => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after?.[key])) {
      changedFields.push({
        field: key,
        before: before[key],
        after: after[key],
      });
    }
  });
  
  return changedFields;
};

