/**
 * API Configuration
 * Automatically switches between development and production endpoints
 * based on the environment.
 * 
 * - Development (npm start): Uses localhost:3001
 * - Production (npm run build): Uses Render backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default API_BASE_URL;

