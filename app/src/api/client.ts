const base = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '')

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const headers = new Headers(init?.headers)
  if (init?.body != null && ['POST', 'PATCH', 'PUT'].includes(method)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
  })
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = data?.error ?? res.statusText
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return data as T
}
