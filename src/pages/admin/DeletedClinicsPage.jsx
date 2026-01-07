import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { getAuthHeaders } from './hooks/useAuth';
import './admin.css';

/**
 * DeletedClinicCard Component
 * Displays a single deleted clinic in the list with restore action
 */
const DeletedClinicCard = ({ clinic, onRestore }) => {
  const rating = clinic.rating || 0;
  const reviewCount = clinic.reviewCount || 0;
  const clinicName = clinic.clinicName || 'Unnamed Clinic';
  const address = clinic.address || '';
  const deletedAt = clinic.deletedAt ? new Date(clinic.deletedAt) : null;
  const deletedBy = clinic.deletedBy || 'Unknown';
  
  // Calculate days until permanent deletion (30 days from deletion)
  const daysRemaining = deletedAt
    ? Math.max(0, 30 - Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="clinic-card animate-slide-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🗑️</span>
            <h3 className="text-lg font-semibold text-dark truncate">
              {clinicName}
            </h3>
          </div>
          <p className="text-sm text-text mb-2">
            {address || 'Address not provided'}
          </p>
          <div className="flex items-center gap-4 flex-wrap mb-2">
            {rating > 0 && (
              <div className="clinic-card-rating">
                <span>★</span>
                <span>{rating.toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-text font-normal">({reviewCount})</span>
                )}
              </div>
            )}
            {deletedAt && (
              <span className="text-xs text-text">
                Deleted: {deletedAt.toLocaleDateString()}
              </span>
            )}
            {deletedBy && (
              <span className="text-xs text-text">
                By: {deletedBy}
              </span>
            )}
          </div>
          {daysRemaining !== null && (
            <div className="mt-2">
              {daysRemaining > 0 ? (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  daysRemaining <= 7
                    ? 'bg-red-100 text-red-700'
                    : daysRemaining <= 14
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} until permanent deletion
                </span>
              ) : (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  Will be permanently deleted soon
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onRestore(clinic.id)}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all flex-shrink-0"
        >
          Restore →
        </button>
      </div>
    </div>
  );
};

/**
 * DeletedClinicsPage Component
 * Lists all deleted clinics with search and pagination
 * Allows admins to restore deleted clinics
 */
const DeletedClinicsPage = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch deleted clinics
  useEffect(() => {
    const fetchDeletedClinics = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });
        
        if (debouncedSearch && debouncedSearch.length >= 2) {
          params.set('search', debouncedSearch);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/clinics/deleted?${params}`,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setClinics(data.clinics || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total || 0);
        } else {
          setError(data.error || 'Failed to fetch deleted clinics');
        }
      } catch (err) {
        console.error('Failed to fetch deleted clinics:', err);
        setError('Failed to load deleted clinics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedClinics();
  }, [debouncedSearch, page]);

  /**
   * Handle restore - navigate to the restore clinic page
   */
  const handleRestore = (deletedClinicId) => {
    navigate(`/admin/restore-clinic/${deletedClinicId}`);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Recently Deleted Clinics</h1>
        <p className="text-text">
          Browse and restore deleted clinic listings
          {totalCount > 0 && <span className="ml-2">({totalCount} total)</span>}
        </p>
        <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong>Note:</strong> Deleted clinics are automatically permanently deleted after 30 days. 
          Clinics can only be restored within this 30-day window.
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search deleted clinics by name, address, or deleted by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {debouncedSearch && debouncedSearch.length < 2 && (
          <p className="text-xs text-text mt-2">Enter at least 2 characters to search</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🗑️</div>
          <h3 className="text-lg font-semibold text-dark mb-2">No deleted clinics found</h3>
          <p className="text-text">
            {debouncedSearch
              ? 'Try adjusting your search terms'
              : 'No clinics have been deleted recently'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {clinics.map((clinic) => (
              <DeletedClinicCard
                key={clinic.id}
                clinic={clinic}
                onRestore={handleRestore}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                ← Previous
              </button>
              <span className="text-sm text-text">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeletedClinicsPage;

