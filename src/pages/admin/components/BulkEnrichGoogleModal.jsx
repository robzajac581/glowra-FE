import React, { useCallback, useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../../../config/api';
import { getAuthHeaders } from '../hooks/useAuth';

const BULK_ENRICH_URL = `${API_BASE_URL}/api/admin/drafts/bulk-enrich-google`;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'updated', label: 'Updated' },
  { value: 'dry_run', label: 'Dry run' },
  { value: 'skipped_no_place', label: 'Skipped — no place' },
  { value: 'skipped_low_confidence', label: 'Skipped — low confidence' },
  { value: 'skipped_details_not_found', label: 'Skipped — details not found' },
  { value: 'error', label: 'Error' },
];

const getItemStatus = (item) => {
  const s = item?.status ?? item?.Status ?? '';
  return String(s).toLowerCase();
};

const normalizeSummary = (raw) => ({
  processed: raw?.processed ?? 0,
  updated: raw?.updated ?? 0,
  dryRun: raw?.dry_run ?? raw?.dryRun ?? 0,
  skippedNoPlace: raw?.skipped_no_place ?? raw?.skippedNoPlace ?? 0,
  skippedLowConfidence:
    raw?.skipped_low_confidence ?? raw?.skippedLowConfidence ?? 0,
  skippedDetailsNotFound:
    raw?.skipped_details_not_found ?? raw?.skippedDetailsNotFound ?? 0,
  errors: raw?.errors ?? 0,
});

/**
 * Admin modal: bulk Google Places enrichment for pending_review drafts without a Place ID.
 */
const BulkEnrichGoogleModal = ({ open, onClose, onCompleted, onLoadingChange }) => {
  const [step, setStep] = useState('form');
  const [dryRun, setDryRun] = useState(true);
  const [minConfidence, setMinConfidence] = useState('0.8');
  const [limit, setLimit] = useState('100');
  const [delayMs, setDelayMs] = useState('200');
  const [draftId, setDraftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const resetForm = useCallback(() => {
    setStep('form');
    setDryRun(true);
    setMinConfidence('0.8');
    setLimit('100');
    setDelayMs('200');
    setDraftId('');
    setSummary(null);
    setResults([]);
    setErrorMessage(null);
    setStatusFilter('all');
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const filteredResults = useMemo(() => {
    if (!results?.length) return [];
    if (statusFilter === 'all') return results;
    return results.filter((r) => getItemStatus(r) === statusFilter);
  }, [results, statusFilter]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    const limitNum = Math.min(1000, Math.max(1, parseInt(limit, 10) || 100));
    const delayNum = Math.min(5000, Math.max(0, parseInt(delayMs, 10) || 0));
    let minConfNum = parseFloat(minConfidence);
    if (Number.isNaN(minConfNum)) minConfNum = 0;
    minConfNum = Math.min(1, Math.max(0, minConfNum));

    const body = {
      dryRun,
      minConfidence: minConfNum,
      limit: limitNum,
      delayMs: delayNum,
    };
    const trimmedDraft = draftId.trim();
    if (trimmedDraft) {
      const id = parseInt(trimmedDraft, 10);
      if (Number.isNaN(id) || id < 1) {
        setErrorMessage('Draft ID must be a positive integer.');
        setLoading(false);
        return;
      }
      body.draftId = id;
    }

    onLoadingChange?.(true);
    const controller = new AbortController();
    const timeoutMs = 180000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(BULK_ENRICH_URL, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch {
        setErrorMessage('The server returned an invalid response.');
        setStep('error');
        return;
      }

      if (response.ok && data.success) {
        setSummary(normalizeSummary(data.summary));
        setResults(Array.isArray(data.results) ? data.results : []);
        setStep('success');
        if (onCompleted) onCompleted();
        return;
      }

      const msg =
        data?.message ||
        data?.error ||
        (response.status === 401
          ? 'Unauthorized. Sign in again.'
          : response.status === 403
            ? 'You do not have permission to run this action.'
            : `Request failed (${response.status})`);
      setErrorMessage(msg);
      setStep('error');
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setErrorMessage(
          `The request timed out after ${timeoutMs / 1000}s. Try a lower Max drafts limit, or run very large batches from the CLI.`
        );
      } else {
        console.error('Bulk enrich from Google failed:', err);
        setErrorMessage(
          'Network error. Check your connection. If this persists, try a lower Max drafts limit or use the CLI for huge batches.'
        );
      }
      setStep('error');
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  const handleBackdropClick = () => {
    if (!loading) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="bulk-enrich-title"
        aria-modal="true"
      >
        {step === 'form' && (
          <>
            <h2
              id="bulk-enrich-title"
              className="text-xl font-bold text-dark mb-2"
            >
              Bulk enrich from Google
            </h2>
            <p className="text-sm text-text mb-4">
              Runs the same job as the server: for{' '}
              <strong>pending review</strong> drafts that do not have a Google
              Place ID yet, this looks up the place, then saves Google rating,
              reviews JSON, and Google photos (non-Google draft photos are kept).
              Uses Google Places APIs (quota and billing apply). Some rows may be
              skipped if there is no match, confidence is below your minimum, or
              details are missing. For a safe first run, use{' '}
              <strong>Dry run</strong> or a small max drafts limit.
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                  className="mt-1 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  <span className="font-medium text-dark">Dry run</span>
                  <span className="block text-xs text-text mt-0.5">
                    When enabled, calls Google but does not write to the database.
                    Recommended for first-time use.
                  </span>
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Min confidence (0–1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.05"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                  <p className="text-xs text-text mt-1">
                    Minimum confidence to accept Find Place results (default UI:
                    0.8).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Max drafts (limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                  <p className="text-xs text-text mt-1">
                    Capped at 1000 server-side. Lower values reduce timeout risk.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Delay between drafts (ms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5000"
                    value={delayMs}
                    onChange={(e) => setDelayMs(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                  <p className="text-xs text-text mt-1">
                    Default 200; server clamps 0–5000.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    Draft ID (optional)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 42 — only this draft if it matches filters"
                    value={draftId}
                    onChange={(e) => setDraftId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Running…' : 'Run bulk enrich'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && summary && (
          <>
            <h2 className="text-xl font-bold text-dark mb-4">Results</h2>
            <div className="bg-slate-50 rounded-lg p-4 mb-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Processed</span>
                <span className="font-medium">{summary.processed}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="font-medium">{summary.updated}</span>
              </div>
              <div className="flex justify-between">
                <span>Dry run</span>
                <span className="font-medium">{summary.dryRun}</span>
              </div>
              <div className="flex justify-between">
                <span>Skipped — no place</span>
                <span className="font-medium">{summary.skippedNoPlace}</span>
              </div>
              <div className="flex justify-between">
                <span>Skipped — low confidence</span>
                <span className="font-medium">
                  {summary.skippedLowConfidence}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Skipped — details not found</span>
                <span className="font-medium">
                  {summary.skippedDetailsNotFound}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Errors</span>
                <span className="font-medium">{summary.errors}</span>
              </div>
            </div>

            {results.length > 0 && (
              <details className="mb-4 group">
                <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  Per-draft results ({results.length} rows)
                </summary>
                <div className="mt-3 space-y-2">
                  <label className="block text-xs font-medium text-text">
                    Filter by status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-border rounded-lg text-sm mb-2"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <div className="max-h-64 overflow-auto border border-border rounded-lg">
                    <table className="min-w-full text-xs text-left">
                      <thead className="bg-slate-100 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 font-semibold">Draft</th>
                          <th className="px-2 py-2 font-semibold">Status</th>
                          <th className="px-2 py-2 font-semibold">Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((row, idx) => {
                          const id =
                            row.draftId ??
                            row.draft_id ??
                            row.DraftID ??
                            '—';
                          const detail =
                            row.error ||
                            row.message ||
                            [
                              row.placeId && `place: ${row.placeId}`,
                              row.confidence != null &&
                                `conf: ${row.confidence}`,
                              row.businessName && String(row.businessName),
                              row.rating != null && `★ ${row.rating}`,
                              row.reviewCount != null &&
                                `(${row.reviewCount} reviews)`,
                            ]
                              .filter(Boolean)
                              .join(' · ') ||
                            '—';
                          return (
                            <tr
                              key={`${id}-${idx}`}
                              className="border-t border-border"
                            >
                              <td className="px-2 py-1.5 font-mono">{id}</td>
                              <td className="px-2 py-1.5">
                                {getItemStatus(row) || '—'}
                              </td>
                              <td className="px-2 py-1.5 text-text break-all">
                                {detail}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filteredResults.length === 0 && (
                      <p className="p-3 text-sm text-text text-center">
                        No rows match this filter.
                      </p>
                    )}
                  </div>
                </div>
              </details>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90"
            >
              Close
            </button>
          </>
        )}

        {step === 'error' && (
          <>
            <h2 className="text-xl font-bold text-dark mb-2">Could not complete</h2>
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-6">
              {errorMessage}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage(null);
                }}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkEnrichGoogleModal;
