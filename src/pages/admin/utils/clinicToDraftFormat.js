/**
 * Utility functions to convert existing clinic data from API
 * into the format expected by the submissions endpoint.
 * 
 * This is used when an admin wants to edit an existing clinic -
 * we create a draft from the clinic's current data.
 */

/**
 * Helper to safely get a field from an object with either PascalCase or camelCase key
 */
const getField = (obj, pascalKey, camelKey) => {
  if (!obj) return null;
  return obj[pascalKey] ?? obj[camelKey] ?? null;
};

/**
 * Flatten grouped procedures from the /api/clinics/:id/procedures response
 * into a flat array suitable for submission.
 * 
 * Input format (from API):
 * {
 *   "Face": { procedures: [...] },
 *   "Injectables": { procedures: [...] }
 * }
 * 
 * Output format (for submission):
 * [
 *   { procedureName: "...", category: "Face", ... },
 *   { procedureName: "...", category: "Injectables", ... }
 * ]
 */
export const flattenProcedures = (groupedProcedures) => {
  if (!groupedProcedures || typeof groupedProcedures !== 'object') {
    return [];
  }

  const flattened = [];

  Object.entries(groupedProcedures).forEach(([category, data]) => {
    const procedures = data?.procedures || data || [];
    
    if (Array.isArray(procedures)) {
      procedures.forEach((proc) => {
        const procedureName = getField(proc, 'ProcedureName', 'procedureName') || 
                              getField(proc, 'Name', 'name') || '';
        const priceMin = getField(proc, 'PriceMin', 'priceMin');
        const priceMax = getField(proc, 'PriceMax', 'priceMax');
        const price = getField(proc, 'Price', 'price');
        const priceUnit = getField(proc, 'PriceUnit', 'priceUnit') || 
                          getField(proc, 'Unit', 'unit') || '';
        
        // Calculate average price if not provided
        let averagePrice = getField(proc, 'AveragePrice', 'averagePrice');
        if (!averagePrice && priceMin && priceMax) {
          averagePrice = Math.round((priceMin + priceMax) / 2);
        } else if (!averagePrice && price) {
          averagePrice = price;
        }

        flattened.push({
          procedureName,
          category,
          priceMin: priceMin || null,
          priceMax: priceMax || null,
          unit: priceUnit || null,
          averagePrice: averagePrice || null,
          providerNames: proc.providerNames || proc.ProviderNames || [],
        });
      });
    }
  });

  return flattened;
};

/**
 * Convert providers array from API format to submission format
 */
export const convertProviders = (providers) => {
  if (!providers || !Array.isArray(providers)) {
    return [];
  }

  return providers.map((p) => ({
    providerName: getField(p, 'ProviderName', 'providerName') || '',
    photoURL: getField(p, 'PhotoURL', 'photoUrl') || 
              getField(p, 'PhotoUrl', 'photoUrl') || null,
  }));
};

/**
 * Convert clinic data from API to submission payload format.
 * This creates a payload suitable for POST /api/clinic-management/submissions
 * 
 * @param {Object} clinic - Clinic data from /api/submissions/clinics/:id or /api/clinics/:id
 * @param {Array} providers - Providers array (may come from clinic.existingProviders)
 * @param {Object} groupedProcedures - Procedures grouped by category from /api/clinics/:id/procedures
 * @returns {Object} - Payload for submissions endpoint
 */
export const clinicToSubmissionPayload = (clinic, providers = [], groupedProcedures = {}) => {
  if (!clinic) {
    throw new Error('Clinic data is required');
  }

  const clinicId = getField(clinic, 'ClinicID', 'clinicId') || 
                   getField(clinic, 'Id', 'id');

  return {
    submitterKey: 'admin-edit',
    flow: 'add_to_existing',
    existingClinicId: clinicId,
    clinic: {
      clinicName: getField(clinic, 'ClinicName', 'clinicName') || '',
      address: getField(clinic, 'Address', 'address') || '',
      city: getField(clinic, 'City', 'city') || '',
      state: getField(clinic, 'State', 'state') || '',
      zipCode: getField(clinic, 'ZipCode', 'zipCode') || null,
      category: getField(clinic, 'Category', 'category') || '',
      website: getField(clinic, 'Website', 'website') || null,
      phone: getField(clinic, 'Phone', 'phone') || null,
      email: getField(clinic, 'Email', 'email') || null,
    },
    advanced: {
      latitude: getField(clinic, 'Latitude', 'latitude') || null,
      longitude: getField(clinic, 'Longitude', 'longitude') || null,
      placeID: getField(clinic, 'PlaceID', 'placeId') || null,
      description: getField(clinic, 'Description', 'description') || null,
      googleProfileLink: getField(clinic, 'GoogleProfileLink', 'googleProfileLink') || null,
      workingHours: getField(clinic, 'WorkingHours', 'workingHours') || null,
    },
    providers: convertProviders(providers),
    procedures: flattenProcedures(groupedProcedures),
    photos: [], // Photos will be loaded from existing clinic in the review page
  };
};

export default clinicToSubmissionPayload;

