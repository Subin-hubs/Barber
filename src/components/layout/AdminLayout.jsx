import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Scissors, Users,
  Image as ImageIcon, Star, LineChart, Settings,
  Shield, LogOut, UserPlus, Menu, X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard',        path: '/admin/dashboard',    icon: LayoutDashboard },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { name: 'All Appointments', path: '/admin/appointments', icon: CalendarDays },
      { name: 'Walk-in',          path: '/admin/walk-in',      icon: UserPlus     },
    ],
  },
  {
    label: 'Manage',
    items: [
      { name: 'Services',         path: '/admin/services',     icon: Scissors   },
      { name: 'Barbers',          path: '/admin/barbers',      icon: Users      },
      { name: 'Gallery',          path: '/admin/gallery',      icon: ImageIcon  },
      { name: 'Reviews',          path: '/admin/reviews',      icon: Star       },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'Revenue & Analytics', path: '/admin/reports',  icon: LineChart  },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Shop Settings',    path: '/admin/settings',     icon: Settings   },
    ],
  },
];

export const AdminLayout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    try { await signOut(auth); navigate('/'); }
    catch (error) { console.error('Error signing out', error); }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-navy">
          <Shield className="w-5 h-5 text-gold" />
          <span className="font-bold text-sm tracking-tight">Admin Panel</span>
        </div>
        {/* Close — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-muted hover:text-navy transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <h4 className="px-3 mb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {section.label}
            </h4>
            <div className="space-y-0.5">
              {section.items.map(item => (
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
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
            A
          </div>
          <p className="text-sm font-semibold text-navy truncate">Admin</p>
        </div>
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

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[240px] bg-white border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-[240px] bg-white flex flex-col shadow-xl z-50 animate-in slide-in-from-left duration-200">
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
            <Shield className="w-4 h-4 text-gold" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-base">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
