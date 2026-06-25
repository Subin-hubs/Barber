import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Calendar, Star, MapPin, Clock, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { BarberCard } from '../../components/ui/BarberCard';
import { ReviewCard } from '../../components/ui/ReviewCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { getActiveServices } from '../../firebase/serviceService';
import { getActiveBarbers } from '../../firebase/barberService';
import { getApprovedReviews } from '../../firebase/reviewService';

export const HomePage = () => {
  const heroReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const servicesReveal = useScrollReveal();
  const barbersReveal = useScrollReveal();
  const reviewsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, barbersData, reviewsData] = await Promise.all([
          getActiveServices(),
          getActiveBarbers(),
          getApprovedReviews()
        ]);
        setServices(servicesData.slice(0, 3));
        setBarbers(barbersData);
        setReviews(reviewsData.slice(0, 6));
      } catch (err) {
        console.error("Error loading home page data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-screen min-h-[600px] flex items-center justify-center pt-20"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 40%, #FAFAFA 100%), url(https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div 
          ref={heroReveal} 
          className="scroll-reveal max-w-4xl mx-auto px-6 text-center z-10 flex flex-col items-center mt-auto pb-32"
        >
          <span className="text-gold font-semibold tracking-[0.08em] text-xs uppercase mb-6 bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-sm border border-gold/20">
            Premium Grooming · Kathmandu
          </span>
          
          <h1 className="text-navy mb-10 max-w-3xl mx-auto leading-tight">
            Sharp Cuts.<br />
            Clean Fades.<br />
            <span className="relative inline-block">
              Every Time.
              <span className="absolute bottom-1 left-0 w-full h-[10px] bg-gold rounded-[2px] -z-10"></span>
            </span>
          </h1>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border text-sm text-text-primary shadow-sm">
              <MapPin className="w-4 h-4 text-gold" /> Thamel, Kathmandu
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border text-sm text-text-primary shadow-sm">
              <Clock className="w-4 h-4 text-gold" /> Mon–Sat 9am–7pm
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-border text-sm text-text-primary shadow-sm">
              <Star className="w-4 h-4 text-gold fill-gold" /> 4.9 (200+ reviews)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link to="/book" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-8 py-4">
                Book an Appointment &rarr;
              </Button>
            </Link>
            <Link to="/services" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full text-lg px-8 py-4 bg-white/50 backdrop-blur-sm">
                View Services
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-text-muted" />
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto w-full -mt-24 relative z-20">
        <div ref={featuresReveal} className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="scroll-reveal-child bg-white rounded-2xl p-8 shadow-sm border-t-[3px] border-transparent hover:border-gold transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center mb-6">
              <Scissors className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-navy font-bold mb-3">Expert Barbers</h3>
            <p className="text-text-secondary">Hand-picked professionals with 5+ years experience.</p>
          </div>
          <div className="scroll-reveal-child bg-white rounded-2xl p-8 shadow-sm border-t-[3px] border-transparent hover:border-gold transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-navy font-bold mb-3">Easy Online Booking</h3>
            <p className="text-text-secondary">Pick your barber, time, and service in under 60 seconds.</p>
          </div>
          <div className="scroll-reveal-child bg-white rounded-2xl p-8 shadow-sm border-t-[3px] border-transparent hover:border-gold transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-gold-light flex items-center justify-center mb-6">
              <Star className="w-6 h-6 text-gold" />
            </div>
            <h3 className="text-navy font-bold mb-3">5-Star Experience</h3>
            <p className="text-text-secondary">Rated 4.9/5 by over 200 happy customers.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold tracking-[0.08em] text-xs uppercase mb-4 block">
            What We Offer
          </span>
          <h2 className="text-navy">Services Built for Every Style</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500">Could not load content</div>
        ) : (
          <div ref={servicesReveal} className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="scroll-reveal-child">
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Barbers Section */}
      <section className="py-20 md:py-28 px-6 md:px-10 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <span className="text-gold font-semibold tracking-[0.08em] text-xs uppercase mb-4 block">
              Meet The Team
            </span>
            <h2 className="text-navy">Your Next Great Cut Starts Here</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
          ) : error ? (
            <div className="text-center text-red-500">Could not load content</div>
          ) : (
            <div ref={barbersReveal} className="scroll-reveal flex overflow-x-auto lg:grid lg:grid-cols-3 gap-8 pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 snap-x">
              {barbers.map(barber => (
                <div key={barber.id} className="scroll-reveal-child min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-center">
                  <BarberCard {...barber} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 md:py-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="text-gold font-semibold tracking-[0.08em] text-xs uppercase mb-4 block">
            What Clients Say
          </span>
          <h2 className="text-navy">Real Cuts. Real Reviews.</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500">Could not load content</div>
        ) : (
          <div ref={reviewsReveal} className="scroll-reveal columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="scroll-reveal-child break-inside-avoid">
                <ReviewCard {...review} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking CTA Banner */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
        
        <div ref={ctaReveal} className="scroll-reveal max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
          <h2 className="text-white mb-4">Ready for Your Next Cut?</h2>
          <p className="text-white/70 text-lg mb-10">
            Book online in 60 seconds. No account needed.
          </p>
          <Link to="/book">
            <Button variant="secondary" size="lg" className="text-lg px-10 py-4 shadow-lg shadow-gold/20">
              Book Your Appointment &rarr;
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
