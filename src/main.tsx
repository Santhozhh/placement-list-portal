import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HOME from './HOME.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HOME />
  </StrictMode>,
)
