import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { ReviewCard } from '../../components/ui/ReviewCard';
import { getAllReviews, approveReview, rejectReview, deleteReview } from '../../firebase/reviewService';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const AdminReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'Approved', 'Rejected', 'All'];

  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [searchTerm, setSearchTerm]   = useState('');

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, author: '' });
  const [deleting, setDeleting]         = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* ---- Filtering ---------------------------------------------------- */
  const byTab = activeTab === 'All'
    ? reviews
    : reviews.filter(r => r.status === activeTab.toLowerCase());

  const filteredReviews = byTab.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.author?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  /* ---- Actions ------------------------------------------------------ */
  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error('Error approving review:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } catch (err) {
      console.error('Error rejecting review:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const openDeleteDialog = (review) => {
    setDeleteDialog({ isOpen: true, id: review.id, author: review.author || review.name || 'Unknown' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.id) return;
    setDeleting(true);
    try {
      await deleteReview(deleteDialog.id);
      setReviews(prev => prev.filter(r => r.id !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null, author: '' });
    } catch (err) {
      console.error('Error deleting review:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveAll = async () => {
    const pending = reviews.filter(r => r.status === 'pending');
    for (const r of pending) { await handleApprove(r.id); }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Reviews</h1>
          <p className="text-sm text-text-secondary">Moderate customer reviews before they appear publicly.</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          <Button variant="ghost" onClick={loadReviews}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          {pendingCount > 0 && activeTab === 'Pending' && (
            <button
              onClick={handleApproveAll}
              className="bg-success text-white px-4 py-2 rounded-lg font-medium hover:bg-success/90 transition-colors shadow-sm text-sm"
            >
              Approve All ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-navy text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border mb-8 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3.5 whitespace-nowrap text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy'}`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="ml-2 bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full z-10" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-navy" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-error mb-4" />
          <p className="text-error">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={loadReviews}>Try Again</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div key={review.id} className="relative">
              {review.status === 'rejected' && (
                <div className="absolute top-4 right-4 z-10 bg-error/10 text-error text-xs font-bold px-2 py-1 rounded uppercase tracking-wide border border-error/20">
                  Rejected
                </div>
              )}
              {review.status === 'approved' && (
                <div className="absolute top-4 right-4 z-10 bg-success/10 text-success text-xs font-bold px-2 py-1 rounded uppercase tracking-wide border border-success/20">
                  Approved
                </div>
              )}
              <ReviewCard
                {...review}
                isAdmin={review.status === 'pending'}
                isProcessing={processingId === review.id}
                onApprove={() => handleApprove(review.id)}
                onReject={() => handleReject(review.id)}
                onDelete={() => openDeleteDialog(review)}
                className={review.status === 'rejected' ? 'opacity-75 grayscale-[50%]' : ''}
              />
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="col-span-full py-20 text-center text-text-muted">
              <p className="text-lg font-medium">
                {searchTerm ? 'No reviews match your search.' : `No ${activeTab.toLowerCase()} reviews found.`}
              </p>
              {activeTab === 'Pending' && !searchTerm && <p className="text-sm mt-1">All reviews have been moderated.</p>}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, author: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        message={`Permanently delete the review from "${deleteDialog.author}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};
