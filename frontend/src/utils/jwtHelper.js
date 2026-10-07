import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT token safely.
 * @param {string} token - Raw JWT string
 * @returns {object|null} Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
    if (!token) return null;
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error('Invalid JWT Token:', error);
        return null;
    }
};

/**
 * Checks if a decoded JWT token has expired.
 * @param {string} token - Raw JWT string
 * @returns {boolean} True if token is missing or expired
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 < Date.now();
};