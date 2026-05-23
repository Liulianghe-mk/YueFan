/** 与 stores/auth.ts 保持一致 */
export const ADMIN_TOKEN_STORAGE_KEY = 'yuefan_admin_token'

/** 避免 localStorage 里残留非 JWT 字符串导致误判已登录、并带上无效 Authorization */
export function isLikelyJwtAccessToken(value: string | null | undefined): boolean {
  if (value == null) return false
  const t = value.trim()
  if (!t) return false
  const parts = t.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}
