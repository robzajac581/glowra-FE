import imageCompression from 'browser-image-compression';

/**
 * Convert a file to base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Compress an image file
 */
export const compressImage = async (file) => {
  const options = {
    maxSizeMB: 2,           // Compress to max 2MB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
};

/**
 * Validate image file type
 */
export const isValidImageType = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

/**
 * Validate image file size (max 10MB)
 */
export const isValidImageSize = (file, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

/**
 * Process and prepare image for upload
 * Returns object with photoData, fileName, mimeType, fileSize
 */
export const processImage = async (file) => {
  // Validate
  if (!isValidImageType(file)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
  }
  
  if (!isValidImageSize(file)) {
    throw new Error('File size exceeds 10MB limit.');
  }
  
  // Compress
  const compressedFile = await compressImage(file);
  
  // Convert to base64
  const photoData = await fileToBase64(compressedFile);
  
  return {
    photoData,
    fileName: file.name,
    mimeType: file.type,
    fileSize: compressedFile.size
  };
};

