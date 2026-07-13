'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Copy,
  Eye,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Sparkles,
  Twitter,
} from 'lucide-react';
import { AiPost, fetchAiPosts, regenerateAiPost } from '../../../lib/admin-api';

const platformMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  blog: { label: 'Blog Post', icon: FileText, badge: 'bg-forest-50 text-forest-700 border-forest-200' },
  facebook: { label: 'Facebook', icon: Facebook, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  instagram: { label: 'Instagram', icon: Instagram, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  twitter: { label: 'X / Twitter', icon: Twitter, badge: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function ContentPage() {
  const [items, setItems] = useState<AiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchAiPosts();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load content');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleRegenerate(post: AiPost) {
    setBusyId(post.id);
    try {
      await regenerateAiPost(post.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setBusyId(null);
    }
  }

  async function copyText(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    published: items.filter(i => i.status === 'published').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white px-3 py-1 text-xs font-semibold text-forest-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> AI Generated
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest-800">Content Manager</h1>
          <p className="mt-1 text-sm text-forest-500">View and manage all AI-generated content</p>
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

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Content', value: stats.total, color: 'text-forest-700' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600' },
          { label: 'Published', value: stats.published, color: 'text-blue-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className={`text-2xl font-bold font-serif ${stat.color}`}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stat.value}
            </div>
            <div className="text-xs text-forest-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Link to approval page */}
      <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-800">Ready to approve or schedule posts?</p>
          <p className="text-xs text-blue-600 mt-0.5">Go to the AI Post Approval page to review and publish content</p>
        </div>
        <Link
          to="/admin/approval"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Go to Approval <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-forest-700 shadow-sm">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading content...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-serif text-lg text-gray-600">No content generated yet</p>
          <p className="mt-1 text-sm text-gray-400">Approve RSS articles to generate AI content</p>
          <Link
            to="/admin/rss"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800"
          >
            Go to RSS Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map(post => {
            const meta = platformMeta[post.platform] || platformMeta.blog;
            const Icon = meta.icon;
            const isExpanded = expanded === post.id;

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.badge}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500">{meta.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : post.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : post.status === 'approved'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-forest-800 truncate">
                        {post.title || 'Untitled Post'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : post.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Content</span>
                      <button
                        onClick={() => copyText(post.content, post.id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-forest-600"
                      >
                        {copied === post.id ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="rounded-lg bg-white p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {post.content}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleRegenerate(post)}
                        disabled={busyId === post.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                      >
                        {busyId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Regenerate
                      </button>
                      <Link
                        to="/admin/approval"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-3 py-2 text-xs font-semibold text-white hover:bg-forest-800"
                      >
                        Go to Approval <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
