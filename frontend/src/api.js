const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

export async function apiRequest(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!response.ok) {
    const message = body?.message || body?.error || 'Não foi possível concluir a operação.'
    throw new Error(message)
  }
  return body
}

export const api = {
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: (token) => apiRequest('/users/me', {}, token),
  dashboard: (month, year, token) => apiRequest(`/dashboard?month=${month}&year=${year}`, {}, token),
  accounts: (token) => apiRequest('/accounts', {}, token),
  createAccount: (payload, token) => apiRequest('/accounts', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateAccount: (id, payload, token) => apiRequest(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteAccount: (id, token) => apiRequest(`/accounts/${id}`, { method: 'DELETE' }, token),
  categories: (token) => apiRequest('/categories', {}, token),
  transactions: (query, token) => apiRequest(`/transactions${query ? `?${query}` : ''}`, {}, token),
  createTransaction: (payload, token) => apiRequest('/transactions', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateTransaction: (id, payload, token) => apiRequest(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteTransaction: (id, token) => apiRequest(`/transactions/${id}`, { method: 'DELETE' }, token),
  budgets: (month, year, token) => apiRequest(`/budgets?month=${month}&year=${year}`, {}, token),
  createBudget: (payload, token) => apiRequest('/budgets', { method: 'POST', body: JSON.stringify(payload) }, token),
  updateBudget: (id, payload, token) => apiRequest(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),
  deleteBudget: (id, token) => apiRequest(`/budgets/${id}`, { method: 'DELETE' }, token),
}
