'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CalendarClock,
  Eye,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Send,
  Twitter,
  XCircle,
} from 'lucide-react';
import { PublishedPost, fetchPublishedPosts } from '../../../lib/admin-api';

const platformMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  blog: { label: 'Blog', icon: FileText, badge: 'bg-forest-50 text-forest-700 border-forest-200' },
  facebook: { label: 'Facebook', icon: Facebook, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  instagram: { label: 'Instagram', icon: Instagram, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  twitter: { label: 'X / Twitter', icon: Twitter, badge: 'bg-gray-50 text-gray-700 border-gray-200' },
};

type PostModalProps = {
  post: PublishedPost | null;
  onClose: () => void;
};

function PostModal({ post, onClose }: PostModalProps) {
  if (!post) return null;

  const meta = platformMeta[post.platform] || platformMeta.blog;
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="relative overflow-hidden">
          {post.image_url ? (
            <img src={post.image_url} alt="" className="h-80 w-full object-cover sm:h-96" />
          ) : (
            <div className="flex h-80 w-full items-center justify-center bg-gray-100 sm:h-96">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-gray-700 shadow-md transition hover:bg-white"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex max-h-[calc(100vh-24rem)] flex-col overflow-hidden">
          <div className="overflow-y-auto scrollbar-hide p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.badge}`}>
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
              <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-700">
                Published
              </span>
            </div>

            {post.title && (
              <h2 className="mb-4 font-serif text-2xl font-bold text-forest-900">{post.title}</h2>
            )}

            <div className="mb-4 rounded-xl bg-gray-50 p-4">
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <CalendarClock className="mr-2 inline h-4 w-4" />
              Published on: {new Date(post.published_at).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white p-6">
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-forest-700 px-4 py-3 text-sm font-bold text-white hover:bg-forest-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublishingPage() {
  const [posts, setPosts] = useState<PublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState<PublishedPost | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchPublishedPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load published posts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (platformFilter === 'all') return posts;
    return posts.filter(p => p.platform === platformFilter);
  }, [posts, platformFilter]);

  const stats = useMemo(() => ({
    total: posts.length,
    twitter: posts.filter(p => p.platform === 'twitter').length,
    facebook: posts.filter(p => p.platform === 'facebook').length,
    instagram: posts.filter(p => p.platform === 'instagram').length,
    linkedin: posts.filter(p => p.platform === 'linkedin').length,
    blog: posts.filter(p => p.platform === 'blog').length,
    // Posts from last 7 days
    recent: posts.filter(p => {
      const publishedDate = new Date(p.published_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return publishedDate >= weekAgo;
    }).length,
  }), [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Post Modal */}
      <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white px-3 py-1 text-xs font-semibold text-forest-700 shadow-sm">
            <Send className="h-3.5 w-3.5" /> Published Content
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest-900">Auto Publishing</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            View all posts that have been published to social media platforms.
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw className="mr-2 inline h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total Published', value: stats.total, color: 'text-forest-700' },
          { label: 'Twitter Posts', value: stats.twitter, color: 'text-gray-600' },
          { label: 'Facebook Posts', value: stats.facebook, color: 'text-blue-600' },
          { label: 'Instagram Posts', value: stats.instagram, color: 'text-rose-600' },
          { label: 'LinkedIn Posts', value: stats.linkedin, color: 'text-sky-600' },
          { label: 'Last 7 Days', value: stats.recent, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className={`font-serif text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="mt-0.5 text-xs text-forest-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Platform Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(['all', 'twitter', 'facebook', 'instagram', 'linkedin', 'blog'] as const).map(platform => {
          const meta = platformMeta[platform];
          const Icon = meta?.icon || FileText;
          return (
            <button
              key={platform}
              onClick={() => setPlatformFilter(platform)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                platformFilter === platform
                  ? 'bg-forest-700 text-white'
                  : 'border border-gray-200 bg-white text-forest-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {platform === 'all' ? 'All Platforms' : meta?.label || platform}
            </button>
          );
        })}
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-forest-700 shadow-sm">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading published posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <Send className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-serif text-lg text-gray-600">No published posts found</p>
          <p className="mt-1 text-sm text-gray-400">Approved content will appear here after publishing</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4">Platform</th>
                <th className="px-5 py-4">Post Title</th>
                <th className="px-5 py-4">Content Preview</th>
                <th className="px-5 py-4">Image</th>
                <th className="px-5 py-4">Published Date/Time</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map(post => {
                const meta = platformMeta[post.platform] || platformMeta.blog;
                const Icon = meta.icon;

                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.badge}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="max-w-[200px] px-5 py-4 font-semibold text-gray-900">
                      {post.title || 'Untitled Post'}
                    </td>
                    <td className="max-w-[300px] px-5 py-4 text-gray-500">
                      <p className="line-clamp-2">{post.content}</p>
                    </td>
                    <td className="px-5 py-4">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-forest-600" />
                        <div>
                          <div className="font-medium">
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Full Post
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Note about demo */}
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <strong>Demo Mode:</strong> No social media is integrated.
      </div>
    </div>
  );
}
