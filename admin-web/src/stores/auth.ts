import { defineStore } from 'pinia'
import { apiErrorMessage, http } from '@/api/http'
import type { ApiResponse, TokenPayload } from '@/api/types'
import { ADMIN_TOKEN_STORAGE_KEY, isLikelyJwtAccessToken } from '@/constants/auth-storage'

function readStoredToken(): string {
  if (typeof localStorage === 'undefined') return ''
  const raw = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  if (!raw) return ''
  if (!isLikelyJwtAccessToken(raw)) {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
    return ''
  }
  return raw.trim()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readStoredToken(),
  }),
  getters: {
    isLoggedIn: (s) => isLikelyJwtAccessToken(s.token),
  },
  actions: {
    setToken(t: string) {
      this.token = t
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, t)
    },
    clear() {
      this.token = ''
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
    },
    async login(username: string, password: string) {
      try {
        const { data } = await http.post<ApiResponse<TokenPayload>>('/api/admin/auth/login', {
          username,
          password,
        })
        if (data.code !== 0) {
          throw new Error(data.message || '登录失败')
        }
        this.setToken(data.data.accessToken)
      } catch (e) {
        throw new Error(apiErrorMessage(e, '登录失败'))
      }
    },
  },
})
