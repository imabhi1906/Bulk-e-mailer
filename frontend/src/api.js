import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/**
 * Sends bulk email request
 * @param {FormData} formData - Form data with CSV, attachment, subject, message
 * @returns {Promise} - API response
 */
export async function sendEmails(formData) {
  const response = await api.post('/api/send', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Gets current job progress
 * @returns {Promise} - Progress data
 */
export async function getProgress() {
  const response = await api.get('/api/progress');
  return response.data;
}

/**
 * Health check
 * @returns {Promise} - Health status
 */
export async function healthCheck() {
  const response = await api.get('/api/health');
  return response.data;
}
