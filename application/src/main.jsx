import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AttendanceProvider } from './context/AttendanceContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AttendanceProvider>
        <App />
      </AttendanceProvider>
    </BrowserRouter>
  </StrictMode>,
)
