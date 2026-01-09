/**
 * Utility functions to transform draft data to the format
 * expected by clinic page components (camelCase)
 * 
 * Backend API now returns consistent camelCase, and clinic components
 * now expect camelCase, so these functions maintain camelCase format.
 */

/**
 * Transform draft clinic info to the format expected by clinic components
 * @param {Object} draft - The draft data (camelCase from API)
 * @param {Object} options - Options for rating/photo sources
 * @param {string} options.ratingSource - 'google' or 'manual'
 * @param {string} options.manualRating - Manual rating value
 * @param {string} options.manualReviewCount - Manual review count
 * @returns {Object} - Transformed clinic info in camelCase format
 */
export const transformClinicInfo = (draft, options = {}) => {
  if (!draft) return null;

  const { ratingSource = 'google', manualRating, manualReviewCount } = options;

  // Determine rating based on source
  const rating = ratingSource === 'google'
    ? draft.googleRating || 0
    : parseFloat(manualRating) || 0;
  const reviewCount = ratingSource === 'google'
    ? draft.googleReviewCount || 0
    : parseInt(manualReviewCount, 10) || 0;

  // Check for logo in photos array (uploaded via PhotosTab)
  const photos = draft.photos || [];
  const logoPhoto = photos.find(p => p.photoType === 'logo' || p.photoType === 'icon');
  // Use photoData (base64) for newly uploaded logos, or photoUrl for existing ones
  const logoFromPhotos = logoPhoto?.photoData || logoPhoto?.photoUrl;

  return {
    clinicId: draft.draftId,
    clinicName: draft.clinicName || '',
    address: draft.address || '',
    city: draft.city || '',
    state: draft.state || '',
    zipCode: draft.zipCode || '',
    category: draft.category || '',
    website: draft.website || '',
    phone: draft.phone || '',
    email: draft.email || '',
    description: draft.description || '',
    googleRating: rating,
    googleReviewCount: reviewCount,
    googleReviewsJSON: draft.googleReviewsJSON,
    workingHours: draft.workingHours,
    // Check for logo in photos array first, then fall back to direct fields
    logo: logoFromPhotos || draft.logo || draft.iconUrl,
    photo: logoFromPhotos || draft.photo || draft.iconUrl,
    verified: false, // Drafts are not verified yet
    placeId: draft.placeId,
    reviewsLink: draft.reviewsLink,
  };
};

/**
 * Transform draft providers to the format expected by ClinicBanner
 * @param {Array} providers - Array of draft providers (camelCase)
 * @returns {Array} - Transformed providers with camelCase fields
 */
export const transformProviders = (providers) => {
  if (!providers || !Array.isArray(providers)) return [];

  return providers.map((provider, index) => {
    // Check photoUrl first, then fall back to photoData (base64 for newly uploaded photos)
    const photoUrl = provider.photoUrl || provider.photoData;
    const providerId = provider.draftProviderId || provider.providerId || `draft-provider-${index}`;

    return {
      providerId: providerId,
      providerName: provider.providerName || '',
      photoUrl: photoUrl,
      hasPhoto: !!photoUrl,
    };
  });
};

/**
 * Transform draft procedures to the categorized format expected by ClinicProcedures
 * @param {Array} procedures - Array of draft procedures (camelCase)
 * @returns {Object} - Categorized procedures object { categoryName: { procedures: [...] } }
 */
export const transformProcedures = (procedures) => {
  if (!procedures || !Array.isArray(procedures)) return {};

  // Group procedures by category
  const categorized = {};

  procedures.forEach((proc, index) => {
    const category = proc.category || 'Other';
    
    if (!categorized[category]) {
      categorized[category] = {
        procedures: [],
      };
    }

    const procedureId = proc.draftProcedureId || proc.procedureId || `draft-procedure-${index}`;

    // Calculate price - use averagePrice if available, otherwise calculate from range
    let price = proc.averagePrice;
    if (!price && proc.priceMin) {
      price = proc.priceMax 
        ? Math.round((proc.priceMin + proc.priceMax) / 2)
        : proc.priceMin;
    }
    price = price || 0;

    categorized[category].procedures.push({
      id: procedureId,
      procedureId: procedureId,
      name: proc.procedureName || '',
      procedureName: proc.procedureName || '',
      price: price,
      priceMin: proc.priceMin,
      priceMax: proc.priceMax,
      priceUnit: proc.priceUnit || '',
      category: category,
    });
  });

  return categorized;
};

/**
 * Transform draft photos to the format expected by Gallery component
 * @param {Array} photos - Array of draft photos (camelCase)
 * @param {string} photoSource - 'user', 'google', or 'both'
 * @returns {Array} - Filtered and formatted photos
 */
export const transformPhotos = (photos, photoSource = 'both') => {
  if (!photos || !Array.isArray(photos)) return [];

  // Filter photos based on source
  let filteredPhotos = photos;
  
  if (photoSource === 'user') {
    filteredPhotos = photos.filter(p => p.source === 'user');
  } else if (photoSource === 'google') {
    filteredPhotos = photos.filter(p => p.source === 'google');
  } else {
    // 'both' - user photos first, then google
    const userPhotos = photos.filter(p => p.source === 'user');
    const googlePhotos = photos.filter(p => p.source === 'google');
    filteredPhotos = [...userPhotos, ...googlePhotos];
  }

  // Transform to Gallery format
  return filteredPhotos.map((photo, index) => {
    const photoUrl = photo.photoUrl || photo.photoData || '';
    const photoId = photo.draftPhotoId || photo.photoId || `draft-photo-${index}`;

    return {
      photoId: photoId,
      url: photoUrl,
      urls: {
        medium: photoUrl,
        large: photoUrl,
      },
      width: photo.width || 400,
      height: photo.height || 300,
      isPrimary: photo.isPrimary || false,
      source: photo.source || 'user',
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

  const providers = draft.providers || [];
  const procedures = draft.procedures || [];
  const photos = draft.photos || [];

  return {
    clinicInfo: transformClinicInfo(draft, { ratingSource, manualRating, manualReviewCount }),
    providers: transformProviders(providers),
    procedures: transformProcedures(procedures),
    photos: transformPhotos(photos, photoSource),
  };
};

/**
 * Normalize draft data from API to internal format
 * With standardized camelCase API, this is now mostly a pass-through
 * but we keep it for compatibility with existing code paths
 * @param {Object} draft - The draft data from API (now always camelCase)
 * @returns {Object} - Normalized draft with camelCase fields
 */
export const normalizeDraft = (draft) => {
  if (!draft) return null;

  return {
    draftId: draft.draftId,
    requestId: draft.requestId,
    submissionId: draft.submissionId,
    clinicName: draft.clinicName || '',
    address: draft.address || '',
    city: draft.city || '',
    state: draft.state || '',
    zipCode: draft.zipCode || '',
    category: draft.category || '',
    website: draft.website || '',
    phone: draft.phone || '',
    email: draft.email || '',
    description: draft.description || '',
    placeId: draft.placeId,
    googleRating: draft.googleRating,
    googleReviewCount: draft.googleReviewCount,
    googleReviewsJSON: draft.googleReviewsJSON,
    workingHours: draft.workingHours,
    iconUrl: draft.iconUrl || draft.logo,
    reviewsLink: draft.reviewsLink,
    status: draft.status,
    source: draft.source,
    submissionFlow: draft.submissionFlow,
    submittedAt: draft.submittedAt,
    submittedBy: draft.submittedBy,
    submitterKey: draft.submitterKey,
    reviewedAt: draft.reviewedAt,
    reviewedBy: draft.reviewedBy,
    duplicateClinicId: draft.duplicateClinicId,
    createdAt: draft.createdAt,
    // Nested arrays - normalize each item
    providers: normalizeProvidersArray(draft.providers || []),
    procedures: normalizeProceduresArray(draft.procedures || []),
    photos: normalizePhotosArray(draft.photos || []),
  };
};

/**
 * Normalize providers array to consistent format
 */
const normalizeProvidersArray = (providers) => {
  if (!providers || !Array.isArray(providers)) return [];
  
  return providers.map((p, idx) => ({
    draftProviderId: p.draftProviderId || p.providerId || `provider-${idx}`,
    providerName: p.providerName || '',
    photoUrl: p.photoUrl,
    // Preserve photo upload fields (critical for newly uploaded photos)
    photoData: p.photoData,
    fileName: p.fileName,
    mimeType: p.mimeType,
    fileSize: p.fileSize,
  }));
};

/**
 * Normalize procedures array to consistent format
 */
const normalizeProceduresArray = (procedures) => {
  if (!procedures || !Array.isArray(procedures)) return [];
  
  return procedures.map((p, idx) => ({
    draftProcedureId: p.draftProcedureId || p.procedureId || `procedure-${idx}`,
    procedureName: p.procedureName || '',
    category: p.category || '',
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    priceUnit: p.priceUnit || '',
    averagePrice: p.averagePrice || p.averageCost,
    providerNames: p.providerNames || [],
  }));
};

/**
 * Normalize photos array to consistent format
 */
const normalizePhotosArray = (photos) => {
  if (!photos || !Array.isArray(photos)) return [];
  
  return photos.map((p, idx) => ({
    draftPhotoId: p.draftPhotoId || p.photoId || `photo-${idx}`,
    photoUrl: p.photoUrl,
    photoData: p.photoData,
    source: p.source || 'user',
    isPrimary: p.isPrimary || false,
    width: p.width,
    height: p.height,
    // Preserve photo type (critical for logos/icons)
    photoType: p.photoType,
    // Preserve upload metadata
    fileName: p.fileName,
    mimeType: p.mimeType,
    fileSize: p.fileSize,
    // Preserve selection state (used for Google photos)
    selected: p.selected !== undefined ? p.selected : true,
  }));
};

export default transformDraftToClinicFormat;
