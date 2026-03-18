const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('df_token') : null

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
})

export const api = {
  get: (url: string) => fetch(url, { headers: headers() }).then(r => r.json()),
  post: (url: string, data?: any) => fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  put: (url: string, data?: any) => fetch(url, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  patch: (url: string, data?: any) => fetch(url, { method: 'PATCH', headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),
  delete: (url: string) => fetch(url, { method: 'DELETE', headers: headers() }).then(r => r.json()),
}
