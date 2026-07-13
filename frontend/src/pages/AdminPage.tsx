import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  ChevronRight,
  Leaf,
  LayoutDashboard,
  LogOut,
  Rss,
  Send,
  Settings,
  ThumbsUp,
  Plane,
} from 'lucide-react';
import { clearAdminSession, getAdminToken, getAdminUser, verifyAdminSession } from '../lib/admin-api';
import AdminDashboard from '../app/admin/page';
import RSSPage from '../app/admin/rss/page';
import VerificationPage from '../app/admin/verification/page';
import ApprovalPage from '../app/admin/approval/page';
import PublishingPage from '../app/admin/publishing/page';
import AnalyticsPage from '../app/admin/analytics/page';
import SettingsPage from '../app/admin/settings/page';
import AdminLoginPage from '../app/admin/login/page';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true, group: 'main' },
  { href: '/admin/rss', label: 'RSS Agent', icon: Rss, group: 'workflow', badge: '1', badgeTitle: 'Step 1–2: Fetch & AI Score' },
  { href: '/admin/approval', label: 'AI Post Approval', icon: ThumbsUp, group: 'workflow', badge: '2', badgeTitle: 'Generated Content Preview & Approval' },
  { href: '/admin/publishing', label: 'Auto Publishing', icon: Send, group: 'workflow', badge: '3', badgeTitle: 'Step 6: Social Media' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, group: 'main' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, group: 'main' },
];

function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="w-64 bg-[var(--cream)] border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--forest-green)] rounded-md flex items-center justify-center">
            <Plane className="w-4 h-4 text-[var(--cream)]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--charcoal)] font-serif">Virtual Holidays</div>
            <div className="text-xs text-[var(--warm-gray)]">Admin Dashboard</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
            <Bot className="w-3 h-3 text-[var(--gold)]" />
            <span className="text-[10px] font-bold text-[var(--warm-gray)] uppercase tracking-widest">AI Workflow</span>
          </div>
          {navItems.filter((i) => i.group === 'workflow').map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                title={item.badgeTitle}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
                  active
                    ? 'bg-[var(--forest-green)] text-[var(--cream)] shadow-sm'
                    : 'text-[var(--charcoal)] hover:bg-gray-50 hover:text-[var(--forest-green)]'
                }`}
              >
                {item.badge && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    active
                      ? 'bg-[var(--gold)] text-[var(--charcoal)]'
                      : 'bg-[var(--gold)]/20 text-[var(--forest-green)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />}
              </Link>
            );
          })}
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
            <span className="text-[10px] font-bold text-[var(--warm-gray)] uppercase tracking-widest">Platform</span>
          </div>
          {navItems.filter((i) => i.group === 'main').map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
                  active ? 'bg-[var(--forest-green)] text-[var(--cream)] shadow-sm' : 'text-[var(--charcoal)] hover:bg-gray-50 hover:text-[var(--forest-green)]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="text-xs text-[var(--warm-gray)]">
          Signed in as <span className="font-medium text-[var(--charcoal)]">{getAdminUser() || 'admin'}</span>
        </div>
        <button
          onClick={() => { clearAdminSession(); window.location.href = '/admin/login'; }}
          className="flex w-full items-center gap-2 text-xs text-[var(--warm-gray)] hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
        <Link to="/" className="flex items-center gap-2 text-xs text-[var(--warm-gray)] hover:text-[var(--forest-green)] transition-colors">
          <ChevronRight className="w-3 h-3 rotate-180" />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const isLoginPage = location.pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) { setChecking(false); setAuthorized(false); return; }
    let mounted = true;
    setChecking(true);
    setAuthorized(false);
    if (!getAdminToken()) { clearAdminSession(); navigate('/admin/login'); setChecking(false); return; }
    verifyAdminSession()
      .then((admin) => { if (!mounted) return; void admin; setAuthorized(true); setChecking(false); })
      .catch(() => { if (!mounted) return; setAuthorized(false); setChecking(false); navigate('/admin/login'); });
    return () => { mounted = false; };
  }, [isLoginPage, navigate]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminLoginPage />
      </div>
    );
  }

  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-[var(--forest-green)]">{checking ? 'Checking admin access…' : 'Redirecting…'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/rss" element={<RSSPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/approval" element={<ApprovalPage />} />
              <Route path="/publishing" element={<PublishingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
