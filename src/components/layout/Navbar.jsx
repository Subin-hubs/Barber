import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Barbers', path: '/barbers' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Track Booking', path: '/track' },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 w-full z-40 transition-all duration-200 bg-white/90 backdrop-blur-sm border-b border-border',
          isScrolled && 'shadow-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Scissors className="text-gold w-6 h-6 transition-transform group-hover:rotate-12" />
            <span className="font-bold text-xl text-navy">John's Barber</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-text-primary hover:text-gold transition-colors font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link to="/book">
                <Button className="text-gold">Book Now</Button>
              </Link>
            </div>
            
            <button
              className="md:hidden p-2 text-navy"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-navy z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 h-20 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="text-gold w-6 h-6" />
            <span className="font-bold text-xl text-white">John's Barber</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col p-6 gap-6 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-white text-2xl font-semibold hover:text-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="mt-auto p-6 border-t border-white/10">
          <Link to="/book" className="w-full">
            <Button className="w-full text-navy bg-gold hover:bg-gold-hover">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};
