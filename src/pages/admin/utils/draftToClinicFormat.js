/**
 * Utility functions to transform draft data to the format
 * expected by clinic page components (PascalCase)
 * 
 * Note: Draft API may return PascalCase or camelCase fields depending on context.
 * These functions handle both formats for robustness.
 */

/**
 * Helper to get a field from draft with either PascalCase or camelCase key
 */
const getField = (draft, pascalKey, camelKey) => {
  return draft[pascalKey] ?? draft[camelKey] ?? null;
};

/**
 * Transform draft clinic info to the format expected by clinic components
 * @param {Object} draft - The draft data (supports both PascalCase and camelCase)
 * @param {Object} options - Options for rating/photo sources
 * @param {string} options.ratingSource - 'google' or 'manual'
 * @param {string} options.manualRating - Manual rating value
 * @param {string} options.manualReviewCount - Manual review count
 * @returns {Object} - Transformed clinic info in PascalCase format
 */
export const transformClinicInfo = (draft, options = {}) => {
  if (!draft) return null;

  const { ratingSource = 'google', manualRating, manualReviewCount } = options;

  // Get rating - check both PascalCase and camelCase field names
  const googleRating = getField(draft, 'GoogleRating', 'googleRating');
  const googleReviewCount = getField(draft, 'GoogleReviewCount', 'googleReviewCount');

  // Determine rating based on source
  const rating = ratingSource === 'google'
    ? googleRating || 0
    : parseFloat(manualRating) || 0;
  const reviewCount = ratingSource === 'google'
    ? googleReviewCount || 0
    : parseInt(manualReviewCount, 10) || 0;

  // Get clinic name and address - handle both formats
  const clinicName = getField(draft, 'ClinicName', 'clinicName') || '';
  const address = getField(draft, 'Address', 'address') || '';
  const city = getField(draft, 'City', 'city') || '';
  const state = getField(draft, 'State', 'state') || '';
  const zipCode = getField(draft, 'ZipCode', 'zipCode') || '';

  // Check for logo in photos array (uploaded via PhotosTab)
  const photos = draft.photos || draft.Photos || [];
  const logoPhoto = photos.find(p => 
    (p.photoType === 'logo' || p.photoType === 'icon' || 
     p.PhotoType === 'logo' || p.PhotoType === 'icon')
  );
  // Use photoData (base64) for newly uploaded logos, or photoUrl for existing ones
  const logoFromPhotos = logoPhoto?.photoData || logoPhoto?.photoUrl || logoPhoto?.PhotoData || logoPhoto?.PhotoUrl;

  return {
    ClinicID: getField(draft, 'DraftID', 'draftId') || draft.draftId,
    ClinicName: clinicName,
    Address: address,
    City: city,
    State: state,
    ZipCode: zipCode,
    Category: getField(draft, 'Category', 'category') || '',
    Website: getField(draft, 'Website', 'website') || '',
    Phone: getField(draft, 'Phone', 'phone') || '',
    Email: getField(draft, 'Email', 'email') || '',
    Description: getField(draft, 'Description', 'description') || '',
    GoogleRating: rating,
    GoogleReviewCount: reviewCount,
    GoogleReviewsJSON: getField(draft, 'GoogleReviewsJSON', 'googleReviewsJSON'),
    WorkingHours: getField(draft, 'WorkingHours', 'workingHours'),
    // Check for logo in photos array first, then fall back to direct fields
    Logo: logoFromPhotos || getField(draft, 'Logo', 'logo') || getField(draft, 'IconUrl', 'iconUrl'),
    Photo: logoFromPhotos || getField(draft, 'Photo', 'photo') || getField(draft, 'IconUrl', 'iconUrl'),
    Verified: false, // Drafts are not verified yet
    PlaceID: getField(draft, 'PlaceID', 'placeId'),
    ReviewsLink: getField(draft, 'ReviewsLink', 'reviewsLink'),
  };
};

/**
 * Transform draft providers to the format expected by ClinicBanner
 * @param {Array} providers - Array of draft providers (supports both PascalCase and camelCase)
 * @returns {Array} - Transformed providers with PascalCase fields
 */
export const transformProviders = (providers) => {
  if (!providers || !Array.isArray(providers)) return [];

  return providers.map((provider, index) => {
    const providerName = getField(provider, 'ProviderName', 'providerName') || '';
    // Check photoUrl first, then fall back to photoData (base64 for newly uploaded photos)
    const photoUrl = getField(provider, 'PhotoURL', 'photoUrl') || 
                     getField(provider, 'PhotoUrl', 'photoUrl') || 
                     provider.photoURL ||
                     getField(provider, 'PhotoData', 'photoData');
    const providerId = getField(provider, 'DraftProviderID', 'draftProviderId') || 
                       getField(provider, 'ProviderID', 'providerId') || 
                       `draft-provider-${index}`;

    return {
      ProviderID: providerId,
      ProviderName: providerName,
      PhotoURL: photoUrl,
      hasPhoto: !!photoUrl,
    };
  });
};

/**
 * Transform draft procedures to the categorized format expected by ClinicProcedures
 * @param {Array} procedures - Array of draft procedures (supports both PascalCase and camelCase)
 * @returns {Object} - Categorized procedures object { categoryName: { procedures: [...] } }
 */
export const transformProcedures = (procedures) => {
  if (!procedures || !Array.isArray(procedures)) return {};

  // Group procedures by category
  const categorized = {};

  procedures.forEach((proc, index) => {
    const category = getField(proc, 'Category', 'category') || 'Other';
    
    if (!categorized[category]) {
      categorized[category] = {
        procedures: [],
      };
    }

    // Get price fields - handle both formats
    const priceMin = getField(proc, 'PriceMin', 'priceMin');
    const priceMax = getField(proc, 'PriceMax', 'priceMax');
    const averagePrice = getField(proc, 'AveragePrice', 'averagePrice');
    const priceUnit = getField(proc, 'PriceUnit', 'priceUnit') || '';
    const procedureName = getField(proc, 'ProcedureName', 'procedureName') || '';
    const procedureId = getField(proc, 'DraftProcedureID', 'draftProcedureId') || 
                        getField(proc, 'ProcedureID', 'procedureId') ||
                        `draft-procedure-${index}`;

    // Calculate price - use averagePrice if available, otherwise calculate from range
    let price = averagePrice;
    if (!price && priceMin) {
      price = priceMax 
        ? Math.round((priceMin + priceMax) / 2)
        : priceMin;
    }
    price = price || 0;

    categorized[category].procedures.push({
      id: procedureId,
      procedureId: procedureId,
      name: procedureName,
      procedureName: procedureName,
      price: price,
      priceMin: priceMin,
      priceMax: priceMax,
      priceUnit: priceUnit,
      category: category,
    });
  });

  return categorized;
};

/**
 * Transform draft photos to the format expected by Gallery component
 * @param {Array} photos - Array of draft photos (supports both PascalCase and camelCase)
 * @param {string} photoSource - 'user', 'google', or 'both'
 * @returns {Array} - Filtered and formatted photos
 */
export const transformPhotos = (photos, photoSource = 'both') => {
  if (!photos || !Array.isArray(photos)) return [];

  // Helper to get photo source
  const getPhotoSource = (p) => getField(p, 'Source', 'source') || 'user';

  // Filter photos based on source
  let filteredPhotos = photos;
  
  if (photoSource === 'user') {
    filteredPhotos = photos.filter(p => getPhotoSource(p) === 'user');
  } else if (photoSource === 'google') {
    filteredPhotos = photos.filter(p => getPhotoSource(p) === 'google');
  } else {
    // 'both' - user photos first, then google
    const userPhotos = photos.filter(p => getPhotoSource(p) === 'user');
    const googlePhotos = photos.filter(p => getPhotoSource(p) === 'google');
    filteredPhotos = [...userPhotos, ...googlePhotos];
  }

  // Transform to Gallery format
  return filteredPhotos.map((photo, index) => {
    const photoUrl = getField(photo, 'PhotoUrl', 'photoUrl') || 
                     getField(photo, 'PhotoURL', 'photoURL') ||
                     getField(photo, 'PhotoData', 'photoData') || '';
    const photoId = getField(photo, 'DraftPhotoID', 'draftPhotoId') || 
                    getField(photo, 'PhotoID', 'photoId') ||
                    `draft-photo-${index}`;

    return {
      photoId: photoId,
      url: photoUrl,
      urls: {
        medium: photoUrl,
        large: photoUrl,
      },
      width: getField(photo, 'Width', 'width') || 400,
      height: getField(photo, 'Height', 'height') || 300,
      isPrimary: getField(photo, 'IsPrimary', 'isPrimary') || false,
      source: getPhotoSource(photo),
    };
  });
};

/**
 * Transform all draft data at once
 * @param {Object} draft - The complete draft object
 * @param {Object} options - Options for data sources
 * @returns {Object} - All transformed data
 */
export const transformDraftToClinicFormat = (draft, options = {}) => {
  const { photoSource = 'both', ratingSource = 'google', manualRating, manualReviewCount } = options;

  // Get providers and procedures - handle both formats
  const providers = draft.providers || draft.Providers || [];
  const procedures = draft.procedures || draft.Procedures || [];
  const photos = draft.photos || draft.Photos || [];

  return {
    clinicInfo: transformClinicInfo(draft, { ratingSource, manualRating, manualReviewCount }),
    providers: transformProviders(providers),
    procedures: transformProcedures(procedures),
    photos: transformPhotos(photos, photoSource),
  };
};

/**
 * Normalize providers array to camelCase
 * (Defined before normalizeDraft due to JavaScript hoisting rules)
 */
const normalizeProvidersArray = (providers) => {
  if (!providers || !Array.isArray(providers)) return [];
  
  return providers.map((p, idx) => ({
    draftProviderId: getField(p, 'DraftProviderID', 'draftProviderId') || `provider-${idx}`,
    providerName: getField(p, 'ProviderName', 'providerName') || '',
    // Handle all URL casing variations: PhotoURL, photoUrl, PhotoUrl, photoURL
    photoUrl: getField(p, 'PhotoURL', 'photoUrl') || getField(p, 'PhotoUrl', 'photoUrl') || p.photoURL,
    // Preserve photo upload fields (critical for newly uploaded photos)
    photoData: getField(p, 'PhotoData', 'photoData'),
    fileName: getField(p, 'FileName', 'fileName'),
    mimeType: getField(p, 'MimeType', 'mimeType'),
    fileSize: getField(p, 'FileSize', 'fileSize'),
  }));
};

/**
 * Normalize procedures array to camelCase
 * (Defined before normalizeDraft due to JavaScript hoisting rules)
 */
const normalizeProceduresArray = (procedures) => {
  if (!procedures || !Array.isArray(procedures)) return [];
  
  return procedures.map((p, idx) => ({
    draftProcedureId: getField(p, 'DraftProcedureID', 'draftProcedureId') || `procedure-${idx}`,
    procedureName: getField(p, 'ProcedureName', 'procedureName') || '',
    category: getField(p, 'Category', 'category') || '',
    priceMin: getField(p, 'PriceMin', 'priceMin'),
    priceMax: getField(p, 'PriceMax', 'priceMax'),
    priceUnit: getField(p, 'PriceUnit', 'priceUnit') || '',
    averagePrice: getField(p, 'AveragePrice', 'averagePrice'),
    providerNames: p.providerNames || p.ProviderNames || [],
  }));
};

/**
 * Normalize photos array to camelCase
 * (Defined before normalizeDraft due to JavaScript hoisting rules)
 */
const normalizePhotosArray = (photos) => {
  if (!photos || !Array.isArray(photos)) return [];
  
  return photos.map((p, idx) => ({
    draftPhotoId: getField(p, 'DraftPhotoID', 'draftPhotoId') || `photo-${idx}`,
    photoUrl: getField(p, 'PhotoUrl', 'photoUrl') || getField(p, 'PhotoURL', 'photoURL'),
    photoData: getField(p, 'PhotoData', 'photoData'),
    source: getField(p, 'Source', 'source') || 'user',
    isPrimary: getField(p, 'IsPrimary', 'isPrimary') || false,
    width: getField(p, 'Width', 'width'),
    height: getField(p, 'Height', 'height'),
    // Preserve photo type (critical for logos/icons)
    photoType: getField(p, 'PhotoType', 'photoType'),
    // Preserve upload metadata
    fileName: getField(p, 'FileName', 'fileName'),
    mimeType: getField(p, 'MimeType', 'mimeType'),
    fileSize: getField(p, 'FileSize', 'fileSize'),
    // Preserve selection state (used for Google photos)
    selected: p.selected !== undefined ? p.selected : true,
  }));
};

/**
 * Normalize draft data from API (PascalCase) to internal format (camelCase)
 * This ensures edit forms work correctly with the data
 * @param {Object} draft - The draft data from API (may be PascalCase or camelCase)
 * @returns {Object} - Normalized draft with camelCase fields
 */
export const normalizeDraft = (draft) => {
  if (!draft) return null;

  return {
    draftId: getField(draft, 'DraftID', 'draftId'),
    requestId: getField(draft, 'RequestID', 'requestId'),
    submissionId: getField(draft, 'SubmissionId', 'submissionId'),
    clinicName: getField(draft, 'ClinicName', 'clinicName') || '',
    address: getField(draft, 'Address', 'address') || '',
    city: getField(draft, 'City', 'city') || '',
    state: getField(draft, 'State', 'state') || '',
    zipCode: getField(draft, 'ZipCode', 'zipCode') || '',
    category: getField(draft, 'Category', 'category') || '',
    website: getField(draft, 'Website', 'website') || '',
    phone: getField(draft, 'Phone', 'phone') || '',
    email: getField(draft, 'Email', 'email') || '',
    description: getField(draft, 'Description', 'description') || '',
    placeId: getField(draft, 'PlaceID', 'placeId'),
    googleRating: getField(draft, 'GoogleRating', 'googleRating'),
    googleReviewCount: getField(draft, 'GoogleReviewCount', 'googleReviewCount'),
    googleReviewsJSON: getField(draft, 'GoogleReviewsJSON', 'googleReviewsJSON'),
    workingHours: getField(draft, 'WorkingHours', 'workingHours'),
    iconUrl: getField(draft, 'IconUrl', 'iconUrl') || getField(draft, 'Logo', 'logo'),
    reviewsLink: getField(draft, 'ReviewsLink', 'reviewsLink'),
    status: getField(draft, 'Status', 'status'),
    source: getField(draft, 'Source', 'source'),
    submissionFlow: getField(draft, 'SubmissionFlow', 'submissionFlow'),
    submittedAt: getField(draft, 'SubmittedAt', 'submittedAt'),
    submittedBy: getField(draft, 'SubmittedBy', 'submittedBy'),
    submitterKey: getField(draft, 'SubmitterKey', 'submitterKey'),
    reviewedAt: getField(draft, 'ReviewedAt', 'reviewedAt'),
    reviewedBy: getField(draft, 'ReviewedBy', 'reviewedBy'),
    duplicateClinicId: getField(draft, 'DuplicateClinicID', 'duplicateClinicId'),
    createdAt: getField(draft, 'CreatedAt', 'createdAt'),
    // Nested arrays - normalize each item
    providers: normalizeProvidersArray(draft.providers || draft.Providers || []),
    procedures: normalizeProceduresArray(draft.procedures || draft.Procedures || []),
    photos: normalizePhotosArray(draft.photos || draft.Photos || []),
  };
};

export default transformDraftToClinicFormat;

