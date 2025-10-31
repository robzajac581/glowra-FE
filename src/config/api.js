/**
 * API Configuration
 * Automatically switches between development and production endpoints
 * based on the environment.
 * 
 * - Development (npm start): Uses localhost:3001
 * - Production (npm run build): Uses Render backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Consultation Request API - separate service
// Uses localhost:3002 in development, production URL in production
const CONSULTATION_REQUEST_API_URL = process.env.REACT_APP_CONSULTATION_REQUEST_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3002' 
    : 'https://glowra-contact-request-api.onrender.com');

export default API_BASE_URL;
export { CONSULTATION_REQUEST_API_URL };

