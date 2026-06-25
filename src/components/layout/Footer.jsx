import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Left */}
          <div>
            <h3 className="font-bold text-xl text-navy mb-4">John's Barber</h3>
            <p className="text-text-secondary mb-6 max-w-sm">
              Sharp Cuts. Clean Fades. Every Time. Your premium grooming destination in Kathmandu.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-base flex items-center justify-center text-navy hover:text-gold hover:bg-gold-light transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-base flex items-center justify-center text-navy hover:text-gold hover:bg-gold-light transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Center */}
          <div>
            <h4 className="font-semibold text-navy mb-4 uppercase tracking-wide text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-text-secondary hover:text-gold transition-colors">Services</Link></li>
              <li><Link to="/barbers" className="text-text-secondary hover:text-gold transition-colors">Barbers</Link></li>
              <li><Link to="/gallery" className="text-text-secondary hover:text-gold transition-colors">Gallery</Link></li>
              <li><Link to="/reviews" className="text-text-secondary hover:text-gold transition-colors">Reviews</Link></li>
              <li><Link to="/track" className="text-text-secondary hover:text-gold transition-colors">Track Booking</Link></li>
              <li><Link to="/leave-review" className="text-text-secondary hover:text-gold transition-colors">Leave a Review</Link></li>
            </ul>
          </div>

          {/* Right */}
          <div>
            <h4 className="font-semibold text-navy mb-4 uppercase tracking-wide text-sm">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-text-secondary">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span>Thamel, Kathmandu<br/>Nepal</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span>+977-98XXXXXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-text-secondary">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span>hello@johnsbarber.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} John's Barber. All rights reserved.
          </p>
          <Link to="/staff/login" className="text-xs text-text-muted hover:text-navy transition-colors">
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};
