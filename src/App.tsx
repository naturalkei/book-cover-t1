import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        {/* 추가 라우트는 이곳에 정의 */}
        <Route path="*" element={<div className="p-20 text-center">404 Not Found</div>} />
      </Route>
    </Routes>
  )
}