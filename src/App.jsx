import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { BuilderProvider } from './context/BuilderContext'
import { DemoProvider } from './context/DemoContext'
import { GhostNavProvider } from './context/GhostNavContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import SubAIWidget from './components/SubAIWidget'
import DemoMode from './components/DemoMode'
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import StoreSelectPage from './pages/StoreSelectPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import BuildPage from './pages/BuildPage'

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <BrowserRouter>
            <DemoProvider>
              <GhostNavProvider>
                <BuilderProvider>
                  <Routes>
                    <Route path="/"             element={<HomePage />} />
                    <Route path="/signin"       element={<SignInPage />} />
                    <Route path="/store-select" element={<ProtectedRoute><StoreSelectPage /></ProtectedRoute>} />
                    <Route path="/menu"         element={<MenuPage />} />
                    <Route path="/cart"         element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/build"        element={<ProtectedRoute><BuildPage /></ProtectedRoute>} />
                  </Routes>
                 
                  <SubAIWidget />
                  <DemoMode />
                </BuilderProvider>
              </GhostNavProvider>
            </DemoProvider>
          </BrowserRouter>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
    </ErrorBoundary>
  )
}
