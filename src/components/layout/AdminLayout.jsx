import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Scissors, 
  Users, 
  Image as ImageIcon,
  Star,
  LineChart,
  Settings,
  Shield,
  FileText,
  Activity,
  LogOut,
  UserPlus
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { cn } from '../../utils/cn';

export const AdminLayout = () => {
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

  const navSections = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Bookings',
      items: [
        { name: 'All Appointments', path: '/admin/appointments', icon: CalendarDays },
        { name: 'Walk-in', path: '/admin/walk-in', icon: UserPlus },
      ]
    },
    {
      label: 'Manage',
      items: [
        { name: 'Services', path: '/admin/services', icon: Scissors },
        { name: 'Barbers', path: '/admin/barbers', icon: Users },
        { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
      ]
    },
    {
      label: 'Reports',
      items: [
        { name: 'Revenue & Analytics', path: '/admin/reports', icon: LineChart },
      ]
    },
    {
      label: 'Settings',
      items: [
        { name: 'Shop Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-border flex flex-col shrink-0">
        <div className="h-20 flex items-center gap-2 px-6 border-b border-border text-navy">
          <Shield className="w-6 h-6 text-gold" />
          <span className="font-bold text-lg tracking-tight">Admin Panel</span>
        </div>

        <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <h4 className="px-4 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                {section.label}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gold-light text-navy border-l-[3px] border-gold"
                          : "text-text-secondary hover:bg-muted hover:text-navy"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-navy truncate">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-text-secondary hover:bg-error/10 hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-base p-8">
        <Outlet />
      </main>
    </div>
  );
};
