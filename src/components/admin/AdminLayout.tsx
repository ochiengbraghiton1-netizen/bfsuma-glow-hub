import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  FileEdit,
  LogOut,
  Menu,
  X,
  Home,
  FolderTree,
  ShoppingCart,
  Percent,
  Shield,
  Bell,
  Search,
  Settings,
  BookOpen,
} from 'lucide-react';

import { Link as LinkIcon } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/promotions', icon: Percent, label: 'Promotions' },
  { to: '/admin/affiliate-links', icon: LinkIcon, label: 'Affiliate Links' },
  { to: '/admin/affiliates', icon: Users, label: 'Affiliates' },
  { to: '/admin/business-registrations', icon: Users, label: 'Business Registrations' },
  { to: '/admin/consultations', icon: Calendar, label: 'Consultations' },
  { to: '/admin/team', icon: Users, label: 'Team Members' },
  { to: '/admin/content', icon: FileEdit, label: 'Site Content' },
  { to: '/admin/blog', icon: BookOpen, label: 'Blog Posts' },
  { to: '/admin/admins', icon: Shield, label: 'Manage Admins' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'AD';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen admin-theme bg-[hsl(var(--admin-bg))]">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[hsl(var(--admin-card))] border-b border-[hsl(var(--admin-border))] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-glow))] flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-[hsl(var(--admin-text))]">BF SUMA</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[hsl(var(--admin-text))]"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-[hsl(var(--admin-card))] border-r border-[hsl(var(--admin-border))] z-40 transform transition-transform duration-300 lg:translate-x-0 backdrop-blur-xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-[hsl(var(--admin-border))]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-glow))] flex items-center justify-center shadow-lg" style={{ boxShadow: 'var(--admin-glow-accent)' }}>
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-[hsl(var(--admin-text))]">BF SUMA</span>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* User Welcome */}
          <div className="p-6 border-b border-[hsl(var(--admin-border))]">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-[hsl(var(--admin-accent))] ring-offset-2 ring-offset-[hsl(var(--admin-card))]">
                <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-glow))] text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[hsl(var(--admin-text-muted))] uppercase tracking-wider">{currentDate}</p>
                <h2 className="text-lg font-bold text-[hsl(var(--admin-text))] mt-1">Welcome back!</h2>
                <p className="text-sm text-[hsl(var(--admin-text-muted))] truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-[hsl(var(--admin-accent))] text-white shadow-lg'
                      : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-card-hover))] hover:text-[hsl(var(--admin-text))]'
                  )
                }
                style={({ isActive }) => isActive ? { boxShadow: 'var(--admin-glow-accent)' } : {}}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[hsl(var(--admin-border))] space-y-2">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-card-hover))] hover:text-[hsl(var(--admin-text))] transition-all duration-200"
            >
              <Home className="h-5 w-5" />
              Back to Website
            </NavLink>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-[hsl(var(--admin-text-muted))] hover:text-red-400 hover:bg-red-500/10 rounded-xl h-auto"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        {/* Top Bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg-secondary))]">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl text-sm text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-card))]"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[hsl(var(--admin-accent))] rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-card))]"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="h-6 w-px bg-[hsl(var(--admin-border))]" />
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-glow))] text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:block">
                <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 bg-[hsl(var(--admin-bg))]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
