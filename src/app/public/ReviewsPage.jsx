import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Loader2 } from 'lucide-react';
import { ReviewCard } from '../../components/ui/ReviewCard';
import { Button } from '../../components/ui/Button';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { getApprovedReviews } from '../../firebase/reviewService';

export const ReviewsPage = () => {
  const [visibleCount, setVisibleCount] = useState(9);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reviewsReveal = useScrollReveal();

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await getApprovedReviews();
        setReviews(data);
      } catch (err) {
        console.error("Error loading reviews", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const displayedReviews = reviews.slice(0, visibleCount);

  // Dynamic calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviews).toFixed(1)
    : "0.0";

  const getPercentage = (stars) => {
    if (totalReviews === 0) return 0;
    const count = reviews.filter(r => (r.rating || 5) === stars).length;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="pt-20 pb-20 min-h-screen">
      {/* Hero */}
      <div className="bg-navy py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center text-white/70 text-sm mb-4">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white">Reviews</span>
          </div>
          <h1 className="text-white">Client Reviews</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        {/* Rating Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 mb-16 flex flex-col md:flex-row items-center gap-10">
          <div className="text-center md:text-left shrink-0">
            <div className="text-[4rem] font-bold text-navy leading-none mb-2">{averageRating}</div>
            <div className="flex justify-center md:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < Math.round(parseFloat(averageRating)) ? 'fill-gold text-gold' : 'fill-muted text-muted'}`} 
                />
              ))}
            </div>
            <p className="text-text-muted text-sm font-medium">Based on {totalReviews} reviews</p>
          </div>
          
          <div className="flex-1 w-full max-w-md space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const pct = getPercentage(stars);
              return (
                <div key={stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-sm font-medium text-navy">{stars}</span>
                    <Star className="w-3 h-3 fill-gold text-gold" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs text-text-muted">
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="shrink-0">
            <Link to="/review">
              <Button variant="ghost">Write a Review</Button>
            </Link>
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Could not load reviews</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            <p className="text-lg">No reviews found.</p>
          </div>
        ) : (
          <>
            <div ref={reviewsReveal} className="scroll-reveal columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {displayedReviews.map((review, index) => (
                <div key={review.id} className="scroll-reveal-child break-inside-avoid" style={{ transitionDelay: `${index * 50}ms` }}>
                  <ReviewCard {...review} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {visibleCount < reviews.length && (
              <div className="mt-12 text-center">
                <Button 
                  variant="secondary" 
                  onClick={() => setVisibleCount(prev => prev + 9)}
                >
                  Load More Reviews
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
