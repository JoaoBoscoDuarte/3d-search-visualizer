import { API_BASE } from './config.js';

export async function runSearch(mazePayload, algorithm, dlsLimit) {
  const res = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...mazePayload,
      algorithm,
      dls_limit: dlsLimit,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    if (res.status === 501) {
      throw new Error(`Algoritmo ainda não implementado: ${detail}`);
    }
    throw new Error(detail || res.statusText);
  }

  return res.json();
}
