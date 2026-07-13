'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { BlogPost, fetchBlogPosts, approveBlogPost, rejectBlogPost } from '../../../lib/admin-api';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

export default function VerificationPage() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchBlogPosts(filter === 'all' ? undefined : filter);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load verification queue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filter]);

  async function handleApprove(id: string) {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await approveBlogPost(id);
      setMessage('Article approved and AI content generated!');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    setError('');
    setMessage('');
    try {
      await rejectBlogPost(id);
      setMessage('Article rejected.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return articles.filter(article => {
      return !value || article.title.toLowerCase().includes(value);
    });
  }, [articles, search]);

  const pendingCount = articles.filter(a => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-800">Verification Queue</h1>
          <p className="mt-1 text-sm text-forest-500">
            {pendingCount} articles awaiting review
          </p>
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

      {/* Message */}
      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="mr-2 inline h-4 w-4" />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-forest-400 w-64 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(value => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-forest-700 text-white'
                  : 'bg-white text-forest-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-forest-400 shadow-sm">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading articles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="font-serif text-lg text-gray-600">No articles found</p>
          <p className="mt-1 text-sm text-gray-400">Change your filters or collect RSS articles</p>
          <Link
            to="/admin/rss"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest-700 px-4 py-2 text-xs font-semibold text-white hover:bg-forest-800"
          >
            Go to RSS Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(article => (
            <div
              key={article.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                article.status === 'approved'
                  ? 'border-green-200'
                  : article.status === 'rejected'
                  ? 'border-red-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-forest-50 px-2 py-0.5 text-xs font-medium text-forest-700">
                        <Globe className="h-3 w-3" />
                        {article.link ? new URL(article.link).hostname : 'RSS Feed'}
                      </span>
                      <span className="text-xs text-gray-400">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-serif text-base text-forest-800 mb-1">{article.title}</h3>
                    {article.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {article.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(article.id)}
                          disabled={busyId === article.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          {busyId === article.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(article.id)}
                          disabled={busyId === article.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          article.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {article.status}
                      </span>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === article.id ? null : article.id)}
                      className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      {expanded === article.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {expanded === article.id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                  <p className="text-sm text-forest-600 leading-relaxed">
                    {article.content || article.description || 'No detailed content available.'}
                  </p>
                  {article.link && (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-800 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View original article
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
