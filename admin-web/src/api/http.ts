import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ADMIN_TOKEN_STORAGE_KEY, isLikelyJwtAccessToken } from '@/constants/auth-storage'

function resolvedRequestUrl(config: InternalAxiosRequestConfig): string {
  const u = String(config.url ?? '')
  if (/^https?:\/\//i.test(u)) return u
  const base = String(config.baseURL ?? '').replace(/\/$/, '')
  const path = u.startsWith('/') ? u : `/${u}`
  if (!base && typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return `${base}${path}`
}

function isAdminLoginRequest(config: InternalAxiosRequestConfig): boolean {
  return resolvedRequestUrl(config).includes('/api/admin/auth/login')
}

/** Prefer backend `ApiResponse.message` over Axios default text (e.g. HTTP 401). */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: unknown } | undefined
    const m = data?.message
    if (typeof m === 'string' && m.trim()) return m.trim()
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

const baseURL = import.meta.env.VITE_API_BASE ?? ''

export const http = axios.create({
  baseURL,
  timeout: 30000,
})

http.interceptors.request.use((config) => {
  // 登录请求绝不带旧 Token；URL 需兼容 baseURL + 相对 path 的拼接方式
  if (isAdminLoginRequest(config)) {
    return config
  }
  const auth = useAuthStore()
  const fromStore = auth.token
  const fromStorage =
    typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) : null
  const raw = (fromStore && fromStore.trim()) || (fromStorage && fromStorage.trim()) || ''
  const token = isLikelyJwtAccessToken(raw) ? raw : ''
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const cfg = err.config as InternalAxiosRequestConfig | undefined
      if (cfg && !isAdminLoginRequest(cfg)) {
        const auth = useAuthStore()
        auth.clear()
        void import('@/router').then((m) => {
          const r = m.default
          if (r.currentRoute.value.path !== '/login') {
            r.push({ path: '/login', query: { redirect: r.currentRoute.value.fullPath } })
          }
        })
      }
    }
    return Promise.reject(err)
  },
)
