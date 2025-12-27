import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { getAuthHeaders } from './hooks/useAuth';
import './admin.css';

// Status badge component
const StatusBadge = ({ status, type }) => {
  const statusClasses = {
    pending_review: 'status-badge-pending',
    approved: 'status-badge-approved',
    rejected: 'status-badge-rejected',
  };

  const typeClasses = {
    new_clinic: 'status-badge-new',
    add_to_existing: 'status-badge-adjustment',
  };

  if (type) {
    return (
      <span className={`status-badge ${typeClasses[type] || 'status-badge-new'}`}>
        {type === 'add_to_existing' ? 'Adjustment' : 'New Clinic'}
      </span>
    );
  }

  return (
    <span className={`status-badge ${statusClasses[status] || 'status-badge-pending'}`}>
      {status?.replace('_', ' ') || 'Pending'}
    </span>
  );
};

// Time ago helper
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

// Draft card component
const DraftCard = ({ draft }) => {
  // Helper to get clinic name from various possible field names
  const getClinicName = () => {
    return draft.clinicName || 
           draft.clinic_name || 
           draft.ClinicName || 
           draft.name ||
           draft.Name ||
           'Unnamed Clinic';
  };

  // Helper to get location string
  const getLocation = () => {
    const city = draft.city || draft.City || '';
    const state = draft.state || draft.State || '';
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return 'Location not provided';
  };

  // Helper to format submission date
  const getSubmittedDate = () => {
    const date = draft.submittedAt || draft.submitted_at || draft.createdAt || draft.created_at;
    if (!date) return 'Unknown date';
    return timeAgo(date);
  };

  return (
    <div className="draft-card animate-slide-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">
              {draft.submissionFlow === 'add_to_existing' ? '📝' : '🆕'}
            </span>
            <h3 className="text-lg font-semibold text-dark truncate">
              {getClinicName()}
            </h3>
          </div>
          <p className="text-sm text-text mb-3">
            {getLocation()}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge type={draft.submissionFlow} />
            <span className="text-xs text-text">
              Submitted: {getSubmittedDate()}
            </span>
          </div>
        </div>
        <Link
          to={`/admin/review/${draft.draftId || draft.id || draft.draft_id || draft.DraftID}`}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all flex-shrink-0"
        >
          Review →
        </Link>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending_review');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch drafts
  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          status: activeTab === 'all' ? '' : activeTab,
          type: typeFilter === 'all' ? '' : typeFilter,
          search: searchQuery,
          page: page.toString(),
          limit: '20',
        });

        const response = await fetch(
          `${API_BASE_URL}/api/admin/drafts?${params}`,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          // Debug: Log first draft to see structure
          if (data.drafts && data.drafts.length > 0) {
            console.log('First draft structure:', data.drafts[0]);
            console.log('Draft ID field:', data.drafts[0].draftId || data.drafts[0].id || data.drafts[0].draft_id || 'NOT FOUND');
            console.log('Clinic Name field:', data.drafts[0].clinicName || data.drafts[0].clinic_name || data.drafts[0].ClinicName || 'NOT FOUND');
            console.log('All draft keys:', Object.keys(data.drafts[0]));
          }
          setDrafts(data.drafts || []);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setError(data.error || 'Failed to fetch drafts');
        }
      } catch (err) {
        console.error('Failed to fetch drafts:', err);
        setError('Failed to load drafts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [activeTab, typeFilter, searchQuery, page]);

  const tabs = [
    { id: 'pending_review', label: 'Pending Review', count: stats.pendingCount },
    { id: 'approved', label: 'Approved', count: stats.approvedCount },
    { id: 'rejected', label: 'Rejected', count: stats.rejectedCount },
    { id: 'all', label: 'All', count: null },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark mb-2">Clinic Submissions</h1>
        <p className="text-text">Review and manage clinic listing submissions</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="admin-tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="new_clinic">New Clinics</option>
          <option value="add_to_existing">Adjustments</option>
        </select>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by clinic name or city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text"
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
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-dark mb-2">No submissions found</h3>
          <p className="text-text">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'There are no submissions matching your filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {drafts.map((draft) => (
              <DraftCard key={draft.draftId} draft={draft} />
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

export default AdminDashboard;

