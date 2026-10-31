import { auth } from '../firebase';

export const API_BASE = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

export async function apiFetch(path, options = {}) {
  const { authenticated = true, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});
  const controller = new AbortController();
  const cancel = () => controller.abort(fetchOptions.signal?.reason);
  if (fetchOptions.signal?.aborted) cancel();
  else fetchOptions.signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(() => controller.abort(), 20000);
  const firebaseUser = auth.currentUser;

  try {
    if (authenticated && firebaseUser) headers.set('Authorization', `Bearer ${await firebaseUser.getIdToken()}`);
    return await fetch(`${API_BASE}${path}`, { ...fetchOptions, signal: controller.signal, headers, credentials: 'omit' });
  } catch (error) {
    if (fetchOptions.signal?.aborted) throw error;
    if (controller.signal.aborted) throw new Error('The server took too long to respond. Please try again.');
    throw new Error('Could not connect to EmoteModer. Check your connection and API server.');
  } finally {
    clearTimeout(timeout);
    fetchOptions.signal?.removeEventListener('abort', cancel);
  }
}

async function request(method, path, payload) {
  const response = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'The request could not be completed.');
    error.response = { data, status: response.status };
    throw error;
  }
  return { data, status: response.status };
}

export const apiClient = {
  post: (path, payload) => request('POST', path, payload)
};
