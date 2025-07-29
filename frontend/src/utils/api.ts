export const API_BASE =
  process.env.REACT_APP_API_URL || `${window.location.origin.replace(/\/$/, '')}/api`;

export const getApiUrl = (path: string): string => {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return `${API_BASE}/${path}`;
}; 