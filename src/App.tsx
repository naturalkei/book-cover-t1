import { Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import NotFound from '@/components/NotFound'
import Gallery from '@/pages/Gallery'
import Reader from '@/pages/Reader'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Gallery />} />
        <Route path="book/:id" element={<Reader />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}