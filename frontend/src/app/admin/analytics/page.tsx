'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Eye,
  Facebook,
  Heart,
  Instagram,
  Linkedin,
  Loader2,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Twitter,
} from 'lucide-react';
import { fetchPublishedPosts, PublishedPost } from '../../../lib/admin-api';

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchPublishedPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const rangeDays = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const recentPosts = posts.filter(p => new Date(p.published_at) >= startDate);

    // Platform breakdown
    const twitterPosts = recentPosts.filter(p => p.platform === 'twitter').length;
    const facebookPosts = recentPosts.filter(p => p.platform === 'facebook').length;
    const instagramPosts = recentPosts.filter(p => p.platform === 'instagram').length;
    const linkedinPosts = recentPosts.filter(p => p.platform === 'linkedin').length;
    const blogPosts = recentPosts.filter(p => p.platform === 'blog').length;

    // Simulated engagement metrics (demo)
    const totalReach = recentPosts.length * 2500;
    const totalEngagements = Math.round(totalReach * 0.05);
    const avgEngagement = recentPosts.length > 0 ? Math.round((totalEngagements / recentPosts.length) * 10) / 10 : 0;

    return {
      totalPosts: recentPosts.length,
      totalReach,
      totalEngagements,
      avgEngagement,
      platformBreakdown: {
        twitter: twitterPosts,
        facebook: facebookPosts,
        instagram: instagramPosts,
        linkedin: linkedinPosts,
        blog: blogPosts,
      },
      // Top performing (simulated for demo)
      topPosts: recentPosts.slice(0, 5).map(post => ({
        id: post.id,
        title: post.title || 'Untitled',
        platform: post.platform,
        reach: Math.floor(Math.random() * 5000) + 1000,
        engagements: Math.floor(Math.random() * 300) + 50,
        date: post.published_at,
      })),
    };
  }, [posts, dateRange]);

  const platformMetrics = useMemo(() => [
    {
      platform: 'Instagram',
      icon: Instagram,
      posts: metrics.platformBreakdown.instagram,
      reach: metrics.platformBreakdown.instagram * 3200,
      engagement: '6.2%',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      posts: metrics.platformBreakdown.linkedin,
      reach: metrics.platformBreakdown.linkedin * 1800,
      engagement: '4.1%',
      color: 'bg-sky-50 text-sky-600',
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      posts: metrics.platformBreakdown.facebook,
      reach: metrics.platformBreakdown.facebook * 2100,
      engagement: '3.8%',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      platform: 'X / Twitter',
      icon: Twitter,
      posts: metrics.platformBreakdown.twitter,
      reach: metrics.platformBreakdown.twitter * 1500,
      engagement: '2.9%',
      color: 'bg-gray-50 text-gray-600',
    },
  ], [metrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-800">Analytics</h1>
          <p className="mt-1 text-sm text-forest-500">Performance overview across all platforms</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                dateRange === range
                  ? 'bg-forest-700 text-white'
                  : 'border border-gray-200 bg-white text-forest-700 hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-forest-700 hover:bg-gray-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reach', value: metrics.totalReach.toLocaleString(), delta: '+18%', icon: Eye, trend: 'up' },
          { label: 'Total Engagements', value: metrics.totalEngagements.toLocaleString(), delta: '+12%', icon: Heart, trend: 'up' },
          { label: 'Posts Published', value: metrics.totalPosts, delta: '+5', icon: MessageSquare, trend: 'up' },
          { label: 'Avg Engagement', value: `${metrics.avgEngagement}%`, delta: '+0.3%', icon: TrendingUp, trend: 'up' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center">
                <card.icon className="w-4 h-4 text-forest-600" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {card.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {card.delta}
              </span>
            </div>
            <div className="text-2xl font-bold text-forest-800 font-serif">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : card.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Platform Performance */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-forest-800">Platform Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement Rate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reach</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {platformMetrics.map(row => (
                <tr key={row.platform} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${row.color} flex items-center justify-center`}>
                        <row.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-forest-800">{row.platform}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-forest-700">{row.posts}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-forest-600">{row.engagement}</span>
                  </td>
                  <td className="px-5 py-4 text-forest-700">{row.reach.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                      <TrendingUp className="w-3 h-3" /> Growing
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-serif text-lg font-semibold text-forest-800">Top Performing Posts</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-forest-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
          </div>
        ) : metrics.topPosts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <BarChart3 className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>No posts published yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {metrics.topPosts.map((post, idx) => (
              <div key={post.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-6 text-center text-xs font-bold text-gray-400">#{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-forest-800 truncate">{post.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 capitalize">{post.platform}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-forest-600">{post.reach.toLocaleString()} reach</div>
                  <div className="text-xs text-gray-400">{post.engagements} engagements</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Chart (placeholder) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-serif text-lg font-semibold text-forest-800 mb-4">Publishing Activity</h2>
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
          <div className="text-center text-gray-400">
            <Calendar className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">Activity chart will appear here</p>
            <p className="text-xs mt-1">Based on your published content</p>
          </div>
        </div>
      </div>
    </div>
  );
}
