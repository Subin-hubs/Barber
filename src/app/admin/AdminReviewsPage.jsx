import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { ReviewCard } from '../../components/ui/ReviewCard';
import { getAllReviews, approveReview, rejectReview } from '../../firebase/reviewService';
import { db } from '../../firebase/config';
import { doc, deleteDoc } from 'firebase/firestore';

export const AdminReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'Approved', 'Rejected', 'All'];

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadReviews = async () => {
    try {
      setError(null);
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const filteredReviews = activeTab === 'All'
    ? reviews
    : reviews.filter(r => r.status === activeTab.toLowerCase());

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveReview(id);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } catch (err) {
      console.error('Error approving review:', err);
      alert('Failed to approve review.');
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
      alert('Failed to reject review.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingReviews = reviews.filter(r => r.status === 'pending');
    for (const r of pendingReviews) {
      await handleApprove(r.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Reviews</h1>
          <p className="text-text-secondary">Moderate customer reviews before they appear publicly.</p>
        </div>
        {pendingCount > 0 && activeTab === 'Pending' && (
          <button
            onClick={handleApproveAll}
            className="bg-success text-white px-4 py-2 rounded-lg font-medium hover:bg-success/90 transition-colors shadow-sm"
          >
            Approve All Pending ({pendingCount})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border mb-8 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy'}`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="ml-2 bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
            {activeTab === tab && (
              <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full z-10"></span>
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
          <button className="mt-4 text-navy underline" onClick={loadReviews}>Try Again</button>
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
                onDelete={() => handleDelete(review.id)}
                className={review.status === 'rejected' ? 'opacity-75 grayscale-[50%]' : ''}
              />
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="col-span-full py-20 text-center text-text-muted">
              <p className="text-lg font-medium">No {activeTab.toLowerCase()} reviews found.</p>
              {activeTab === 'Pending' && <p className="text-sm mt-1">All reviews have been moderated.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
