'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  CheckSquare,
  Clock,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Rss,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  Twitter,
  Zap,
} from 'lucide-react';
import { fetchDashboardStats } from '../../lib/admin-api';

const WORKFLOW_STEPS = [
  { step: 1, label: 'RSS Collection', desc: 'Fetch articles', icon: Rss, href: '/admin/rss' },
  { step: 2, label: 'AI Scoring', desc: 'Score & rank', icon: Star, href: '/admin/rss' },
  { step: 3, label: 'Human Verify', desc: 'Review articles', icon: CheckSquare, href: '/admin/rss' },
  { step: 4, label: 'AI Generate', desc: 'Create content', icon: Sparkles, href: '/admin/approval' },
  { step: 5, label: 'Post Approval', desc: 'Review posts', icon: ThumbsUp, href: '/admin/approval' },
  { step: 6, label: 'Auto Publish', desc: 'Go live', icon: Send, href: '/admin/publishing' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalArticles: 0,
    pendingArticles: 0,
    approvedArticles: 0,
    generatedContent: 0,
    pendingContent: 0,
    publishedPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const statCards = useMemo(() => [
    { label: 'Articles Collected', value: stats.totalArticles, delta: 'RSS items', icon: Rss, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Verification', value: stats.pendingArticles, delta: 'Awaiting review', icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Content Generated', value: stats.generatedContent, delta: 'All platforms', icon: FileText, color: 'bg-forest-50 text-forest-600' },
    { label: 'Pending Approval', value: stats.pendingContent, delta: 'Needs approval', icon: ThumbsUp, color: 'bg-gold-50 text-gold-700' },
    { label: 'Published Posts', value: stats.publishedPosts, delta: 'Live on social', icon: Send, color: 'bg-green-50 text-green-600' },
    { label: 'All Approved', value: stats.approvedArticles, delta: 'Articles approved', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
  ], [stats]);

  const workflowStatus = useMemo(() => {
    const needsAttention = stats.pendingArticles > 0 || stats.pendingContent > 0;
    return {
      step: needsAttention ? (stats.pendingArticles > 0 ? 2 : 5) : 6,
      status: needsAttention ? 'attention' : 'active',
      message: needsAttention
        ? stats.pendingArticles > 0
          ? `${stats.pendingArticles} articles need verification`
          : `${stats.pendingContent} posts need approval`
        : 'All workflows running smoothly',
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest-800">Dashboard</h1>
            <p className="mt-1 text-sm text-forest-500">Travel Content Automation Platform</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-forest-700 hover:bg-gray-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-forest-800 font-serif">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
            </div>
            <div className="text-xs font-medium text-forest-700 mt-0.5">{stat.label}</div>
            <div className="text-xs text-forest-400 mt-0.5">{stat.delta}</div>
          </div>
        ))}
      </div>

      {/* Workflow Pipeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-forest-800">Content Pipeline</h2>
          {/* {workflowStatus.status === 'attention' && (
            // <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
            //   <AlertCircle className="h-3.5 w-3.5" />
            //   Action needed
            // </span>
          )} */}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isAttention = workflowStatus.status === 'attention' && step.step === workflowStatus.step;

            return (
              <Link key={step.step} to={step.href}>
                <div className={`relative flex h-full min-h-[170px] flex-col justify-between rounded-xl border border-forest-300 bg-white p-4 transition-all hover:shadow-md ${
                  isAttention ? 'border-amber-300' : ''
                }`}>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2">
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  <div className="">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-forest-700">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-semibold text-forest-800">{step.label}</div>
                    <div className="text-xs text-forest-500 mt-1 leading-snug">{step.desc}</div>
                  </div>
                  {isAttention && (
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
  
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-serif text-xl text-forest-800 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: '/admin/rss',
              label: 'Collect RSS',
              desc: `${stats.pendingArticles} articles waiting`,
              icon: Rss,
              color: 'border-gray-300 hover:bg-gray-50',
            },
            {
              href: '/admin/approval',
              label: 'Approve Posts',
              desc: `${stats.pendingContent} posts ready`,
              icon: ThumbsUp,
              color: 'border-blue-300 hover:bg-blue-50',
            },
            {
              href: '/admin/publishing',
              label: 'View Published',
              desc: `${stats.publishedPosts} posts live`,
              icon: Send,
              color: 'border-green-300 hover:bg-green-50',
            },
            {
              href: '/admin/analytics',
              label: 'Analytics',
              desc: 'View performance',
              icon: BarChart3,
              color: 'border-purple-300 hover:bg-purple-50',
            },
          ].map(action => (
            <Link
              key={action.href}
              to={action.href}
              className={`bg-white border-2 ${action.color} rounded-xl p-5 transition-colors group`}
            >
              <action.icon className="w-5 h-5 text-forest-600 mb-3" />
              <div className="text-sm font-semibold text-forest-800">{action.label}</div>
              <div className="text-xs text-forest-500 mt-1">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-serif text-xl text-forest-800 mb-4">Connected Platforms</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Twitter / X', icon: Twitter, connected: false, posts: 0 },
            { name: 'Facebook', icon: Facebook, connected: false, posts: 0 },
            { name: 'Instagram', icon: Instagram, connected: false, posts: 0 },
            { name: 'LinkedIn', icon: Linkedin, connected: false, posts: 0 },
          ].map(platform => (
            <div
              key={platform.name}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <platform.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">{platform.name}</div>
                <div className="text-xs text-gray-500">
                  {platform.connected ? `${platform.posts} posts` : 'Not connected'}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      {workflowStatus.status === 'attention' && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Zap className="mr-2 inline h-4 w-4" />
          <strong>Workflow Update:</strong> {workflowStatus.message}. Take action to keep your content pipeline moving.
        </div>
      )}
    </div>
  );
}
