import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const ClientsPage = lazy(() => import('./pages/ClientsPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const MealPlansPage = lazy(() => import('./pages/MealPlansPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

export default function App() {
  return (
    <Suspense fallback={<div className="app-loader"><div className="spinner-border text-success" /><span>Loading module…</span></div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="meal-plans" element={<MealPlansPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route element={<ProtectedRoute roles={['dietitian', 'admin']} />}>
              <Route path="clients" element={<ClientsPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
