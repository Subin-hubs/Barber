import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { getActiveServices } from '../../firebase/serviceService';

export const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const servicesReveal = useScrollReveal();

  const tabs = ['All', 'Haircut', 'Beard', 'Combo', 'Treatment'];

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getActiveServices();
        setServices(data);
      } catch (err) {
        console.error("Error loading services", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices = activeTab === 'All' 
    ? services 
    : services.filter(s => s.category === activeTab);

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
            <span className="text-white">Services</span>
          </div>
          <h1 className="text-white">Our Services</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-12">
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-10 gap-8 border-b border-border hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 whitespace-nowrap text-lg font-medium transition-colors relative ${
                activeTab === tab ? 'text-navy' : 'text-text-secondary hover:text-navy'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">Could not load services</div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            <p className="text-lg">No services found for this category.</p>
          </div>
        ) : (
          <div ref={servicesReveal} className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <div key={service.id} className="scroll-reveal-child" style={{ transitionDelay: `${index * 50}ms` }}>
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
