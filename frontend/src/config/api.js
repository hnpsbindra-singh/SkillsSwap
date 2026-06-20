export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://skillsbarter-backend.onrender.com';

export function apiUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const WS_URL = apiUrl('/ws');
