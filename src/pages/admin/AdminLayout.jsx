import React from 'react';
import { Navigate, useLocation, Link, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

/**
 * Protected layout wrapper for admin routes
 * Redirects to login if not authenticated
 */
const AdminLayout = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Determine which section is active
  const isExistingClinicsSection = location.pathname.startsWith('/admin/clinics') && !location.pathname.startsWith('/admin/deleted-clinics');
  const isDeletedClinicsSection = location.pathname.startsWith('/admin/deleted-clinics');
  const isReviewPage = location.pathname.startsWith('/admin/review') || location.pathname.startsWith('/admin/edit-clinic') || location.pathname.startsWith('/admin/restore-clinic');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex-shrink-0">
                <img src="/img/logo.svg" alt="Glowra" className="h-8" />
              </Link>
              <div className="hidden sm:block h-6 w-px bg-border"></div>
              <Link 
                to="/admin" 
                className="text-lg font-semibold text-dark hover:text-primary transition-colors"
              >
                Admin Dashboard
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-text hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-text hover:text-dark hover:bg-slate-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Section Navigation - hide on review pages */}
        {!isReviewPage && (
          <div className="bg-slate-50 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex gap-1">
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) =>
                    `admin-section-nav-item ${isActive && !isExistingClinicsSection && !isDeletedClinicsSection ? 'active' : ''}`
                  }
                >
                  <span className="mr-2">📋</span>
                  Submissions
                </NavLink>
                <NavLink
                  to="/admin/clinics"
                  className={({ isActive }) =>
                    `admin-section-nav-item ${isActive || isExistingClinicsSection ? 'active' : ''}`
                  }
                >
                  <span className="mr-2">🏥</span>
                  Existing Clinics
                </NavLink>
                <NavLink
                  to="/admin/deleted-clinics"
                  className={({ isActive }) =>
                    `admin-section-nav-item ${isActive || isDeletedClinicsSection ? 'active' : ''}`
                  }
                >
                  <span className="mr-2">🗑️</span>
                  Recently Deleted
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

