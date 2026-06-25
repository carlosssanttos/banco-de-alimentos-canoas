import axios from 'axios'

const TOKEN_KEY = '@foodbank:token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('@foodbank:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const TOKEN_STORAGE_KEY = TOKEN_KEY
export const USER_STORAGE_KEY = '@foodbank:user'
