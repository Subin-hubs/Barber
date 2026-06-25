import React, { useState } from 'react';
import { ReviewCard } from '../../components/ui/ReviewCard';

export const AdminReviewsPage = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const tabs = ['Pending', 'Approved', 'Rejected', 'All'];

  const [reviews, setReviews] = useState([
    { id: '1', customerName: 'Alex T.', date: '2 days ago', rating: 5, reviewText: 'Best fade I have ever had. John pays so much attention to detail.', barberName: 'John Doe', status: 'pending' },
    { id: '2', customerName: 'Sam R.', date: '1 week ago', rating: 5, reviewText: 'The online booking makes it so easy. Walked in and sat right in the chair.', barberName: 'Mike Smith', status: 'approved' },
    { id: '3', customerName: 'Jordan P.', date: '2 weeks ago', rating: 5, reviewText: 'Great atmosphere and professional service. Highly recommend the combo.', barberName: 'David Lee', status: 'pending' },
    { id: '4', customerName: 'Chris Evans', date: '3 weeks ago', rating: 2, reviewText: 'Waited too long despite having an appointment.', barberName: 'John Doe', status: 'rejected' },
  ]);

  const filteredReviews = activeTab === 'All' 
    ? reviews 
    : reviews.filter(r => r.status === activeTab.toLowerCase());

  const handleApprove = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy mb-2">Reviews</h1>
          <p className="text-text-secondary">Moderate customer reviews before they appear publicly.</p>
        </div>
        {pendingCount > 0 && activeTab === 'Pending' && (
          <button className="bg-success text-white px-4 py-2 rounded-lg font-medium hover:bg-success/90 transition-colors shadow-sm">
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
            className={`px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors relative ${
              activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy'
            }`}
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
              onApprove={() => handleApprove(review.id)}
              onReject={() => handleReject(review.id)}
              className={review.status === 'rejected' ? 'opacity-75 grayscale-[50%]' : ''}
            />
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div className="col-span-full py-20 text-center text-text-muted">
            No reviews found for this status.
          </div>
        )}
      </div>
    </div>
  );
};
