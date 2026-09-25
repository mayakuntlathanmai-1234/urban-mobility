const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('urm_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'API Request failed');
  }

  return data as T;
}
