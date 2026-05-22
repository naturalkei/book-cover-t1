import { Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import Gallery from '@/pages/Gallery'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Gallery />} />
        <Route
          path="*"
          element={
            <div className="mx-auto max-w-md px-6 py-32 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">404</p>
              <h1 className="mt-3 text-3xl font-bold text-white">Page not found</h1>
              <p className="mt-3 text-slate-400">The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  )
}