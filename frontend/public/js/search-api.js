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

export async function compareAll(mazePayload, dlsLimit, selectedAlgorithms = null, limits = null) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...mazePayload,
      dls_limit: dlsLimit,
      selected_algorithms: selectedAlgorithms,
      limits,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || res.statusText);
  }

  const data = await res.json();
  return data.results || {};
}
