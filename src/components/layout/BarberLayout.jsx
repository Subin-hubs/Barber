import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ListOrdered, 
  Clock, 
  User, 
  LogOut,
  Scissors
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';

export const BarberLayout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/barber/dashboard', icon: LayoutDashboard },
    { name: 'My Schedule', path: '/barber/schedule', icon: CalendarDays },
    { name: 'Appointments', path: '/barber/appointments', icon: ListOrdered },
    { name: 'Availability', path: '/barber/availability', icon: Clock },
    { name: 'Profile', path: '/barber/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-6 text-navy">
            <Scissors className="w-5 h-5 text-gold" />
            <span className="font-bold">John's Barber</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-light flex items-center justify-center text-gold font-bold">
              {currentUser?.email?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-navy truncate">
                {currentUser?.displayName || 'Barber'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gold-light text-navy border-l-[3px] border-gold"
                    : "text-text-secondary hover:bg-muted hover:text-navy"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-text-secondary hover:bg-error/10 hover:text-error transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-base">
        <Outlet />
      </main>
    </div>
  );
};
