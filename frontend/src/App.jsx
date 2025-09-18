import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth.js';
import { AuthGuard } from './components/auth/AuthGuard.jsx';
import { Layout } from './components/layout/Layout.jsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';

// Pages
import { LoginForm } from './components/auth/LoginForm.jsx';
import { RegisterForm } from './components/auth/RegisterForm.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Ideas } from './pages/Ideas.jsx';
import { NewIdea } from './pages/NewIdea.jsx';
import { IdeaDetail } from './pages/IdeaDetail.jsx';
import { EditIdea } from './pages/EditIdea.jsx';
import { Analytics } from './pages/Analytics.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AppContent() {
  const { initializeAuth, isLoading } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <AuthGuard requireAuth={false}>
              <LoginForm />
            </AuthGuard>
          }
        />
        <Route
          path="/register"
          element={
            <AuthGuard requireAuth={false}>
              <RegisterForm />
            </AuthGuard>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <AuthGuard requireAuth={true}>
              <Layout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="ideas/:id" element={<IdeaDetail />} />
          <Route path="ideas/:id/edit" element={<EditIdea />} />
          <Route path="ideas/new" element={<NewIdea />} />
          <Route path="categories" element={<div>Categories Page - Coming Soon</div>} />
          <Route path="tags" element={<div>Tags Page - Coming Soon</div>} />
          <Route path="favorites" element={<div>Favorites Page - Coming Soon</div>} />
          <Route path="archive" element={<div>Archive Page - Coming Soon</div>} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
          <Route path="settings" element={<div>Hello CI/CD</div>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;