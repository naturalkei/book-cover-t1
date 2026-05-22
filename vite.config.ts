import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // 현재 모드(development/production)에 맞는 환경변수를 로드합니다.
  const env = loadEnv(mode, process.cwd(), '')

  // .env의 VITE_BASE_URL을 사용하거나 기본값 '/' 적용
  const base = env.VITE_BASE_URL || '/'
  const siteUrl = `${env.VITE_SITE_URL || 'http://localhost:5173'}/${base.replace(/^\//, '')}`

  return {
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
    },
    base,
    plugins: [
      react(),
      tailwindcss(),
      tsconfigPaths(),
    ],
  }
})
