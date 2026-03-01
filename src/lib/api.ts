/**
 * SwasthAI API Client
 * Centralized fetch-based API wrapper with JWT auto-attachment
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('swasthai_token');

async function request<T = any>(
    method: string,
    endpoint: string,
    body?: object
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        const message =
            data?.message ||
            (data?.errors && data.errors[0]?.msg) ||
            'Something went wrong.';
        throw new Error(message);
    }

    return data as T;
}

export const api = {
    get: <T = any>(endpoint: string) => request<T>('GET', endpoint),
    post: <T = any>(endpoint: string, body: object) => request<T>('POST', endpoint, body),
    put: <T = any>(endpoint: string, body: object) => request<T>('PUT', endpoint, body),
    delete: <T = any>(endpoint: string) => request<T>('DELETE', endpoint),
};

export default api;
