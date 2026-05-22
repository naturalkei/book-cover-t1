import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Vite Config의 base 값이 자동으로 적용됩니다 */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)