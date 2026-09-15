import type { ReactNode } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { AppShell } from '@/components/layout/AppShell'
import { RequireAuth } from '@/routes/RequireAuth'
import { RequireRole } from '@/routes/RequireRole'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ApplicationsListPage from '@/pages/ApplicationsListPage'
import NewApplicationPage from '@/pages/NewApplicationPage'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import ApprovalQueuePage from '@/pages/ApprovalQueuePage'
import DisbursementPage from '@/pages/DisbursementPage'
import CustomersListPage from '@/pages/CustomersListPage'
import CustomerDetailPage from '@/pages/CustomerDetailPage'
import DocumentsPage from '@/pages/DocumentsPage'
import ReportsPage from '@/pages/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import ForbiddenPage from '@/pages/ForbiddenPage'
import NotFoundPage from '@/pages/NotFoundPage'

function withShell(title: string, breadcrumb: string, children: ReactNode) {
  return (
    <RequireAuth>
      <AppShell title={title} breadcrumb={breadcrumb}>
        {children}
      </AppShell>
    </RequireAuth>
  )
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            <Route path="/" element={withShell('Dashboard', 'Overview', <DashboardPage />)} />
            <Route path="/applications" element={withShell('Applications', 'Applications', <ApplicationsListPage />)} />
            <Route
              path="/applications/new"
              element={withShell(
                'New Application',
                'Applications / New',
                <RequireRole roles={['sales_dealer']}>
                  <NewApplicationPage />
                </RequireRole>,
              )}
            />
            <Route
              path="/applications/:id"
              element={withShell('Application Detail', 'Applications / Detail', <ApplicationDetailPage />)}
            />
            <Route
              path="/approvals"
              element={withShell(
                'Approval Queue',
                'Approval Queue',
                <RequireRole roles={['marketing_supervisor']}>
                  <ApprovalQueuePage />
                </RequireRole>,
              )}
            />
            <Route
              path="/disbursement"
              element={withShell(
                'Disbursement',
                'Disbursement',
                <RequireRole roles={['back_office']}>
                  <DisbursementPage />
                </RequireRole>,
              )}
            />
            <Route path="/customers" element={withShell('Customers', 'Customers', <CustomersListPage />)} />
            <Route path="/customers/:id" element={withShell('Customer Detail', 'Customers / Detail', <CustomerDetailPage />)} />
            <Route path="/documents" element={withShell('Document Center', 'Documents', <DocumentsPage />)} />
            <Route
              path="/reports"
              element={withShell(
                'Reports',
                'Reports',
                <RequireRole roles={['marketing_supervisor', 'back_office']}>
                  <ReportsPage />
                </RequireRole>,
              )}
            />
            <Route path="/settings" element={withShell('Settings', 'Settings', <SettingsPage />)} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
