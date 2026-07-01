import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, ListOrdered,
  Clock, User, LogOut, Scissors, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';
import { getBarberByUserId } from '../../firebase/barberService';

const NAV_ITEMS = [
  { name: 'Dashboard',    path: '/barber/dashboard',   icon: LayoutDashboard },
  { name: 'My Schedule',  path: '/barber/schedule',    icon: CalendarDays    },
  { name: 'Appointments', path: '/barber/appointments',icon: ListOrdered     },
  { name: 'Availability', path: '/barber/availability',icon: Clock           },
  { name: 'Profile',      path: '/barber/profile',     icon: User            },
];

export const BarberLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [barberName, setBarberName]   = useState('');
  const [barberPhoto, setBarberPhoto] = useState('');

  // Close sidebar on route change (mobile navigation)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Load barber name from Firestore
  useEffect(() => {
    if (!user) return;
    getBarberByUserId(user.uid)
      .then(b => {
        if (b) {
          setBarberName(b.name || '');
          setBarberPhoto(b.photoUrl || '');
        }
      })
      .catch(err => console.error('BarberLayout: failed to load barber name', err));
  }, [user]);

  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); }
    catch (error) { console.error('Error signing out', error); }
  };

  const avatarInitial =
    barberName.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() || 'B';

  const displayName =
    barberName || user?.displayName || user?.email?.split('@')[0] || 'Barber';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand + user info */}
      <div className="p-5 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-navy">
            <Scissors className="w-5 h-5 text-gold" />
            <span className="font-bold text-sm">John's Barber</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-muted hover:text-navy transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-light flex items-center justify-center overflow-hidden shrink-0 border border-gold/30">
            {barberPhoto ? (
              <img
                src={barberPhoto}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="text-gold font-bold text-sm">{avatarInitial}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-navy truncate text-sm">{displayName}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 flex flex-col gap-0.5 px-3 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold-light text-navy border-l-[3px] border-gold pl-[9px]'
                  : 'text-text-secondary hover:bg-muted hover:text-navy'
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-text-secondary hover:bg-error/10 hover:text-error transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-base overflow-hidden">

      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-[230px] bg-white border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-[230px] bg-white flex flex-col shadow-xl z-50 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:bg-muted hover:text-navy transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-navy">
            <Scissors className="w-4 h-4 text-gold" />
            <span className="font-bold text-sm">John's Barber</span>
          </div>
          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center overflow-hidden border border-gold/30">
              {barberPhoto ? (
                <img src={barberPhoto} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gold font-bold text-xs">{avatarInitial}</span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
