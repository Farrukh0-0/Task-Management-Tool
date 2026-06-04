import { getAuth } from './authStorage'

const baseUrl = '/api'

async function request(path, options = {}) {
  const auth = getAuth()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const text = await response.text().catch(() => null)
    let body = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }

    const normalizeError = (value) => {
      if (value == null) return null
      if (typeof value === 'string') return value
      if (Array.isArray(value)) return value.map(normalizeError).filter(Boolean).join(', ')
      if (typeof value === 'object') return Object.values(value).map(normalizeError).filter(Boolean).join(' | ')
      return String(value)
    }

    const message =
      (body && typeof body === 'object' && (body.message || body.error || body.title)) ||
      (body && body.errors ? normalizeError(body.errors) : null) ||
      (Array.isArray(body) ? normalizeError(body) : null) ||
      (body && typeof body === 'object' ? normalizeError(body) : null) ||
      text ||
      response.statusText
    throw new Error(message || 'Request failed')
  }

  return response.status === 204 ? null : response.json()
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getTasks() {
  return request('/tasks')
}

export function createTask(payload) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTask(id, payload) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

export function getUsers() {
  return request('/users')
}
