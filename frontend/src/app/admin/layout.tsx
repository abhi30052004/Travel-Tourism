import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Home,
  LogOut,
  Rss,
  Send,
  Settings,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/rss', icon: Rss, label: 'RSS Collection' },
  { href: '/admin/approval', icon: ThumbsUp, label: 'AI Post Approval' },
  { href: '/admin/publishing', icon: Send, label: 'Auto Publishing' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white shadow-sm">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-700">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-forest-800">Travel Content</div>
              <div className="text-xs text-forest-500">AI Automation</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {navItems.map(item => {
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest-50 text-forest-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-forest-600' : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-100 px-3 py-4">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">Admin User</div>
                <div className="truncate text-xs text-gray-500">admin@travel.com</div>
              </div>
            </div>
            <Link
              to="/admin/login"
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
