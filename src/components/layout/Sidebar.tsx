import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Megaphone,
  UserCircle,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/helpers';
import { useState, useEffect } from 'react';
import { fetchProfile } from '../../services/api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leave', label: 'Leave', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-lg">
          R
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">RPS Portal</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Employee Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden dark:bg-slate-900 dark:border dark:border-slate-800"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 rounded-lg p-1 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}

export function Header() {
  const location = useLocation();
  const currentPage = navItems.find((item) => item.to === location.pathname)?.label ?? 'Dashboard';
  const [userName, setUserName] = useState('Alex');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Alex');

  useEffect(() => {
    fetchProfile().then((profile) => {
      setUserName(profile.name.split(' ')[0] ?? 'Alex');
      setAvatar(profile.avatar);
    });
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-3 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="pl-10 lg:pl-0 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
          {currentPage}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
          Welcome back, {userName}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <img
          src={avatar}
          alt="Profile"
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-brand-200 dark:ring-brand-800"
        />
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
