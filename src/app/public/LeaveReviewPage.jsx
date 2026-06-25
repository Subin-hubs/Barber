import React, { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { submitReview } from '../../firebase/reviewService';

export const LeaveReviewPage = () => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !customerName.trim() || !reviewText.trim()) return;
    
    setIsLoading(true);
    setError('');
    try {
      await submitReview({
        customerName: customerName.trim(),
        rating,
        reviewText: reviewText.trim()
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit review. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-base flex items-start justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Thank You!</h2>
          <p className="text-text-secondary mb-6">
            Your review has been submitted and will be published shortly once approved. We appreciate your feedback!
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-base flex items-start justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-navy text-center mb-2">How was your experience?</h2>
        <p className="text-text-secondary text-center mb-8">Leave a review for John's Barber</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              className="w-full border border-border rounded-lg p-3 focus:ring-2 focus:ring-navy focus:border-navy outline-none"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star 
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoverRating || rating) >= star ? "fill-gold text-gold" : "fill-muted text-muted"
                  )} 
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Tell us about your visit *
            </label>
            <textarea
              required
              className="w-full border border-border rounded-lg p-4 focus:ring-2 focus:ring-navy focus:border-navy outline-none h-32 resize-none"
              placeholder="What did you like? How can we improve?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={rating === 0 || !reviewText.trim() || !customerName.trim()}
            isLoading={isLoading}
          >
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
};
