import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import RouteLoadingFallback from '@app/components/RouteLoadingFallback'
import RootLayout from '@app/layouts/RootLayout'
import RootNotFound from '@app/layouts/RootNotFound'
import VersionHub from '@app/pages/VersionHub'
import { LegacyBookRedirect } from '@app/routes/legacy-redirects'
import V1NotFound from '@v1/components/NotFound'
import V1Layout from '@v1/layouts/V1Layout'
import V1Gallery from '@v1/pages/Gallery'
import V2NotFound from '@v2/components/NotFound'
import V2Layout from '@v2/layouts/V2Layout'
import V2Gallery from '@v2/pages/Gallery'

const V1Reader = lazy(() => import('@v1/pages/Reader'))
const V2Reader = lazy(() => import('@v2/pages/Reader'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<VersionHub />} />
        <Route path="book/:id" element={<LegacyBookRedirect />} />

        <Route path="v1" element={<V1Layout />}>
          <Route index element={<V1Gallery />} />
          <Route
            path="book/:id"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <V1Reader />
              </Suspense>
            )}
          />
          <Route path="*" element={<V1NotFound />} />
        </Route>

        <Route path="v2" element={<V2Layout />}>
          <Route index element={<V2Gallery />} />
          <Route
            path="book/:id"
            element={(
              <Suspense fallback={<RouteLoadingFallback />}>
                <V2Reader />
              </Suspense>
            )}
          />
          <Route path="*" element={<V2NotFound />} />
        </Route>

        <Route path="*" element={<RootNotFound />} />
      </Route>
    </Routes>
  )
}
