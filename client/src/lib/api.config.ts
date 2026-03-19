/**
 * API Configuration
 *
 * Update NEXT_PUBLIC_API_URL in .env.local to match your backend URL
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://10.30.57.64";

export const API_ENDPOINTS = {
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        GET_USER: `${API_BASE_URL}/api/auth/user`,
    },
};
