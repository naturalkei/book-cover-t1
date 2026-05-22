import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import NotFound from '@/components/NotFound'
import Gallery from '@/pages/Gallery'

const Reader = lazy(() => import('@/pages/Reader'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Gallery />} />
        <Route
          path="book/:id"
          element={(
            <Suspense fallback={<ReaderFallback />}>
              <Reader />
            </Suspense>
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function ReaderFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="reader-loading"
      className="mx-auto flex max-w-5xl items-center justify-center px-6 py-24 text-sm text-slate-700 dark:text-slate-300"
    >
      Loading reader…
    </div>
  )
}