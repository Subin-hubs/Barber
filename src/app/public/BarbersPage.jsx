import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { BarberCard } from '../../components/ui/BarberCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { getActiveBarbers } from '../../firebase/barberService';

export const BarbersPage = () => {
  const barbersReveal = useScrollReveal();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadBarbers() {
      try {
        const data = await getActiveBarbers();
        setBarbers(data);
      } catch (err) {
        console.error("Error loading barbers", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadBarbers();
  }, []);

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
            <span className="text-white">Barbers</span>
          </div>
          <h1 className="text-white">Meet The Team</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Could not load barbers</div>
        ) : barbers.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            <p className="text-lg">No barbers found.</p>
          </div>
        ) : (
          <div ref={barbersReveal} className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {barbers.map((barber, index) => (
              <div key={barber.id} className="scroll-reveal-child" style={{ transitionDelay: `${index * 50}ms` }}>
                <BarberCard {...barber} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
