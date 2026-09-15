import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/routes/RequireAuth'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ForbiddenPage from '@/pages/ForbiddenPage'

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <AppShell title="Dashboard" breadcrumb="Overview">
                    <DashboardPage />
                  </AppShell>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
