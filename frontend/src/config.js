// API Configuration
const getApiUrl = () => {
  // Check if we're in production (deployed)
  if (import.meta.env.PROD) {
    // Use environment variable if set, otherwise use deployed backend URL on Render
    return import.meta.env.VITE_API_URL || 'https://quickcart-backend-smwe.onrender.com';
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

