import { Routes, Route, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Alimentos } from '@/pages/Alimentos'
import { Lotes } from '@/pages/Lotes'
import { Distribuicoes } from '@/pages/Distribuicoes'
import { Parceiros } from '@/pages/Parceiros'
import { Entidades } from '@/pages/Entidades'
import { Vencendo } from '@/pages/Vencendo'
import { Usuarios } from '@/pages/Usuarios'
import { Notifications } from '@/pages/Notifications'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="alimentos"     element={<Alimentos />} />
          <Route path="lotes"         element={<Lotes />} />
          <Route path="distribuicoes" element={<Distribuicoes />} />
          <Route path="parceiros"     element={<Parceiros />} />
          <Route path="entidades"     element={<Entidades />} />
          <Route path="vencendo"      element={<Vencendo />} />
          <Route path="notifications" element={<Notifications />} />
          <Route
            path="usuarios"
            element={
              <AdminRoute>
                <Usuarios />
              </AdminRoute>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
