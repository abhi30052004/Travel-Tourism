'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Calendar,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Star,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  type Feed,
  type FeedCounts,
  type RssSource,
  approveFeed,
  createRssSource,
  deleteRssSource,
  fetchFeedCounts,
  fetchFeeds,
  fetchRssSources,
  rejectFeed,
  runRssFetch,
  updateRssSource,
} from '../../../lib/admin-api';

const CITY_IMAGES: Record<string, string> = {
  Amsterdam: 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg?auto=compress&cs=tinysrgb&w=900',
  Paris: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=900',
  default: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=900',
};

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'ai-rejected' | 'all';

const WORKFLOW_STEPS = [
  { icon: Globe, label: 'RSS Fetch', desc: 'Fetch from Paris & Amsterdam feeds', step: 1 },
  { icon: Bot, label: 'AI Scoring', desc: 'Auto-score & rank articles by relevance', step: 2 },
  { icon: CheckCircle, label: 'Admin Approve', desc: 'Review and approve top articles', step: 3 },
  { icon: Sparkles, label: 'AI Post Gen', desc: 'Generate social posts from articles', step: 4 },
  { icon: CheckCircle, label: 'Post Approve', desc: 'Admin reviews AI-generated posts', step: 5 },
  { icon: Send, label: 'Auto Publish', desc: 'Publish to all social channels', step: 6 },
];

function imageFor(feed: Feed) {
  if (feed.image_url) return feed.image_url;
  return CITY_IMAGES[feed.city ?? ''] ?? CITY_IMAGES.default;
}

function cityMatches(feed: Feed, city: string) {
  if (city === 'all') return true;
  if (city === 'Global') return feed.city !== 'Amsterdam' && feed.city !== 'Paris';
  return feed.city === city;
}

function formatDate(feed: Feed) {
  const value = feed.published_date || feed.created_at;
  if (!value) return 'No date';
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-US');
}

function scoreClass(score: number) {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-purple-50 text-purple-700 border border-purple-200';
}

function cityPillLabel(feed: Feed) {
  if (feed.city === 'Amsterdam') return 'NL Amsterdam';
  if (feed.city === 'Paris') return 'FR Paris';
  return feed.city || 'Global';
}

function WorkflowBanner() {
  return (
    <div
      className="mb-8 rounded-2xl px-7 py-7 shadow-sm"
      style={{
        background: '#123f1d',
        color: '#faf8f5',
      }}
    >
      <div className="mb-5 flex items-center gap-2">
        <Zap className="h-5 w-5" style={{ color: '#f0c443' }} />
        <h2 className="font-serif text-xl font-semibold leading-none" style={{ color: '#fff8db' }}>RSS → AI → Social Media Workflow</h2>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.step} className="relative flex min-h-[84px] flex-col items-center text-center">
            {index < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight
                className="absolute -right-5 top-[21px] hidden h-5 w-5 lg:block"
                style={{ color: 'rgba(201, 168, 76, 0.7)' }}
              />
            )}
            <div
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'rgba(201, 168, 76, 0.12)',
                border: '1px solid rgba(201, 168, 76, 0.48)',
              }}
            >
              <step.icon className="h-5 w-5" style={{ color: '#c9a84c' }} />
            </div>
            <span className="text-sm font-bold leading-4" style={{ color: '#ffffff' }}>{step.label}</span>
            <span className="mt-1 max-w-[150px] text-[11px] font-normal leading-4" style={{ color: '#fff2a8' }}>{step.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatSourceDate(value?: string | null) {
  if (!value) return 'Never';
  const parsed = new Date(value);
  return isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

type SourceForm = {
  name: string;
  url: string;
  city: string;
  category: string;
};

type RssSourceManagerProps = {
  sources: RssSource[];
  loading: boolean;
  error: string;
  form: SourceForm;
  onFormChange: (form: SourceForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggle: (source: RssSource) => void;
  onDelete: (sourceId: number) => void;
};

function RssSourceManager({
  sources,
  loading,
  error,
  form,
  onFormChange,
  onSubmit,
  onToggle,
  onDelete,
}: RssSourceManagerProps) {
  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-forest-900">RSS Source Management</h2>
          <p className="mt-1 text-sm text-gray-500">Current feeds are loaded from the database and used by Fetch RSS + AI Score.</p>
        </div>
        <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{sources.length} sources</span>
      </div>

      <form onSubmit={onSubmit} className="mb-5 grid gap-3 rounded-lg border border-gray-200 bg-[#F8FAF7] p-4 lg:grid-cols-[1fr_1.4fr_0.7fr_0.7fr_auto]">
        <input required value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} placeholder="Feed name" className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400" />
        <input required type="url" value={form.url} onChange={(event) => onFormChange({ ...form, url: event.target.value })} placeholder="https://example.com/rss" className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400" />
        <input value={form.city} onChange={(event) => onFormChange({ ...form, city: event.target.value })} placeholder="City" className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400" />
        <input value={form.category} onChange={(event) => onFormChange({ ...form, category: event.target.value })} placeholder="Category" className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400" />
        <button className="rounded-md bg-forest-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-forest-800">Add Source</button>
      </form>

      {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-forest-700"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading RSS sources...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[420px] overflow-y-auto scrollbar-hide">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#F8FAF7] text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Feed Name</th>
                <th className="px-4 py-3">Feed URL</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Fetched</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-[#F8FAF7]">
                  <td className="px-4 py-4 font-semibold text-gray-900">{source.name}</td>
                  <td className="max-w-[300px] truncate px-4 py-4 text-gray-500">{source.url}</td>
                  <td className="px-4 py-4 text-gray-600">{source.city || 'Any'}</td>
                  <td className="px-4 py-4"><span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{source.category || 'General'}</span></td>
                  <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${source.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{source.enabled ? 'Enabled' : 'Disabled'}</span></td>
                  <td className="px-4 py-4 text-gray-500">{formatSourceDate(source.last_fetched)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => onToggle(source)} className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">{source.enabled ? 'Disable' : 'Enable'}</button>
                      <button type="button" onClick={() => onDelete(source.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

type PreviewModalProps = {
  feed: Feed | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
};

function PreviewModal({
  feed,
  onClose,
  onApprove,
  onReject,
  loading,
}: PreviewModalProps) {
  if (!feed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
        <div className="relative">
          <img
            src={imageFor(feed)}
            alt={feed.title}
            className="h-64 w-full object-cover sm:h-72"
          />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-600 shadow-sm transition hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-forest-500">
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {feed.source_name || 'RSS Source'}
            </span>
            {feed.city && (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                {feed.city}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(feed)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              Score {Math.round(feed.relevance_score || 0)}
            </span>
          </div>
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-forest-700">
            <span className="rounded-full bg-forest-50 px-3 py-1">{feed.approval_status}</span>
          </div>

          <h2 className="mb-4 font-serif text-2xl font-bold text-forest-900">
            {feed.title}
          </h2>

          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {feed.summary || 'No content available'}
            </p>
          </div>

          {feed.scoring_reason && (
            <div className="mb-6 rounded-xl border border-gold-200 bg-gold-50 p-4">
              <h3 className="mb-2 font-semibold text-forest-800">
                AI Scoring Reason
              </h3>
              <p className="text-sm text-forest-700">
                {feed.scoring_reason}
              </p>
            </div>
          )}

          {feed.link && (
            <a
              href={feed.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 inline-flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800"
            >
              <ExternalLink className="h-4 w-4" />
              View Original Article
            </a>
          )}

          {feed.approval_status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={onApprove}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve & Generate
              </button>

              <button
                onClick={onReject}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RSSPage() {
    const [feeds, setFeeds] = useState<Feed[]>([]);
  const [feedCounts, setFeedCounts] = useState<FeedCounts>({
    total: 0,
    ai_approved: 0,
    ai_rejected: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [cityFilter, setCityFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSources, setShowSources] = useState(false);
  const [sources, setSources] = useState<RssSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState('');
  const [sourceForm, setSourceForm] = useState<SourceForm>({ name: '', url: '', city: 'Amsterdam', category: 'Travel' });

  async function load() {
    setError('');
    setLoading(true);
    try {
      const isAiRejected = statusFilter === 'ai-rejected';
      const [data, counts] = await Promise.all([
        fetchFeeds({
          aiStatus: isAiRejected ? 'rejected' : 'approved',
          status: statusFilter === 'all' || isAiRejected ? undefined : statusFilter,
          limit: 100,
          scoredOnly: true,
        }),
        fetchFeedCounts(),
      ]);
      setFeeds(data);
      setFeedCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load RSS articles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function loadSources() {
    setSourcesLoading(true);
    setSourcesError('');
    try {
      setSources(await fetchRssSources());
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : 'Unable to load RSS sources');
    } finally {
      setSourcesLoading(false);
    }
  }

  async function toggleSourcePanel() {
    const nextVisible = !showSources;
    setShowSources(nextVisible);

    if (nextVisible) {
      await loadSources();
    }
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourcesError('');
    try {
      await createRssSource({
        name: sourceForm.name.trim(),
        url: sourceForm.url.trim(),
        city: sourceForm.city.trim() || null,
        category: sourceForm.category.trim() || null,
        enabled: true,
      });
      setSourceForm({ name: '', url: '', city: 'Amsterdam', category: 'Travel' });
      await loadSources();
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : 'Unable to add RSS source');
    }
  }

  async function toggleSource(source: RssSource) {
    setSourcesError('');
    try {
      await updateRssSource(source.id, { enabled: !source.enabled });
      await loadSources();
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : 'Unable to update RSS source');
    }
  }

  async function removeSource(sourceId: number) {
    setSourcesError('');
    try {
      await deleteRssSource(sourceId);
      await loadSources();
    } catch (err) {
      setSourcesError(err instanceof Error ? err.message : 'Unable to remove RSS source');
    }
  }

  async function fetchNow() {
    setRunning(true);
    setMessage('');
    setError('');
    try {
      const result = await runRssFetch();
      const summary = result.result;
      const scoring = summary.scoring as { scored?: number } | undefined;
      const counts = summary.counts;
      setMessage(
        `RSS fetch complete - Total fetched ${counts?.total ?? summary.inserted ?? 0}. ` +
        `AI approved ${counts?.ai_approved ?? 0} and AI rejected ${counts?.ai_rejected ?? 0}. ` +
        `Scored ${scoring?.scored ?? 0} articles. Review below and approve for AI post generation.`
      );
      if (showSources) {
        await loadSources();
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RSS fetch failed');
    } finally {
      setRunning(false);
    }
  }

  async function setArticleStatus(feedId: number, status: 'approved' | 'rejected') {
    setBusyId(feedId);
    setMessage('');
    setError('');
    try {
      if (status === 'approved') {
        const result = await approveFeed(feedId);
        const created = result.content_generation?.created?.length ?? 0;
        const validated = result.brand_validation?.validated ?? 0;
        setMessage(
          `Article approved - AI generated ${created} social posts - ${validated} posts sent to Approval Queue.`
        );
      } else {
        await rejectFeed(feedId);
        setMessage('Article rejected and removed from queue.');
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to ${status} article`);
    } finally {
      setBusyId(null);
    }
  }
async function approveFromModal() {
  if (!selectedFeed) return;

  setModalLoading(true);

  try {
    const result = await approveFeed(selectedFeed.id);

    const created =
      result.content_generation?.created?.length ?? 0;

    const validated =
      result.brand_validation?.validated ?? 0;

    setMessage(
      `Article approved - AI generated ${created} social posts - ${validated} posts sent to Approval Queue.`
    );

    setSelectedFeed(null);

    await load();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to approve article'
    );
  } finally {
    setModalLoading(false);
  }
}

async function rejectFromModal() {
  if (!selectedFeed) return;

  setModalLoading(true);

  try {
    await rejectFeed(selectedFeed.id);

    setMessage(
      'Article rejected and removed from queue.'
    );

    setSelectedFeed(null);

    await load();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to reject article'
    );
  } finally {
    setModalLoading(false);
  }
}
  const filteredFeeds = useMemo(() =>
    feeds
      .filter((feed) => cityMatches(feed, cityFilter))
      .sort((a, b) => {
        const scoreDifference = (b.relevance_score || 0) - (a.relevance_score || 0);
        return scoreDifference !== 0
          ? scoreDifference
          : new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }),
    [feeds, cityFilter]
  );

  const visibleFeeds = filteredFeeds;
  const pendingCount = feedCounts.pending;
  const isAiRejectedView = statusFilter === 'ai-rejected';

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 font-serif text-3xl text-forest-800">RSS Intelligence Agent</h1>
          <p className="text-sm text-forest-500">
            Auto-fetch, AI-score, and approve articles from Paris & Amsterdam feeds
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={toggleSourcePanel}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-forest-700 transition-colors hover:bg-gray-50"
          >
            {showSources ? 'Hide RSS Management' : 'RSS Management'}
          </button>
          <button
            onClick={fetchNow}
            disabled={running}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors disabled:opacity-70"
            style={{ backgroundColor: '#1a4d2e' }}
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? 'Fetching & Scoring...' : 'Fetch RSS + AI Score'}
          </button>
        </div>
      </div>

      <WorkflowBanner />

      {showSources && (
        <RssSourceManager
          sources={sources}
          loading={sourcesLoading}
          error={sourcesError}
          form={sourceForm}
          onFormChange={setSourceForm}
          onSubmit={addSource}
          onToggle={toggleSource}
          onDelete={removeSource}
        />
      )}

      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-relaxed text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total fetched', value: feedCounts.total, color: 'text-forest-700' },
          { label: 'AI approved', value: feedCounts.ai_approved, color: 'text-green-600' },
          { label: 'AI rejected', value: feedCounts.ai_rejected, color: 'text-red-500' },
          { label: 'Human approval pending', value: pendingCount, color: 'text-amber-600' },
          { label: 'Human approved', value: feedCounts.approved, color: 'text-green-600' },
          { label: 'Human rejected', value: feedCounts.rejected, color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <div className={`font-serif text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="mt-0.5 text-xs text-forest-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {([
            ['pending', 'Pending'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
            ['ai-rejected', 'AI Rejected'],
            ['all', 'All'],
          ] as const).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-forest-700 text-white'
                  : 'border border-gray-200 bg-white text-forest-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {['all', 'Paris', 'Amsterdam', 'Global'].map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                cityFilter === city
                  ? 'bg-forest-700 text-white'
                  : 'border border-gray-200 bg-white text-forest-700 hover:bg-gray-50'
              }`}
            >
              {city === 'Paris' ? 'FR Paris' : city === 'Amsterdam' ? 'NL Amsterdam' : city}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl text-forest-800">
          {isAiRejectedView ? 'AI Rejected Articles' : 'Top Scored Articles'}
          <span className="ml-2 font-sans text-sm text-forest-400">({visibleFeeds.length} found)</span>
        </h2>
        {!isAiRejectedView && pendingCount > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            {pendingCount} pending review
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-forest-400">
          <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
          Loading articles...
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleFeeds.map((feed) => {
            const score = Math.round(feed.relevance_score || 0);
            const pending = feed.approval_status === 'pending';
            const isAmsterdam = feed.city === 'Amsterdam';

            return (
              <article key={feed.id} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[3/2] bg-gray-100">
                  <img
                    src={imageFor(feed)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.src = CITY_IMAGES.default; }}
                  />
                  <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 2 }}>
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
                      style={{
                        display: 'inline-flex',
                        backgroundColor: isAmsterdam
                          ? 'rgba(13, 148, 136, 0.95)'
                          : feed.city === 'Paris'
                          ? 'rgba(225, 29, 72, 0.95)'
                          : 'rgba(20, 61, 36, 0.95)',
                      }}
                    >
                      {cityPillLabel(feed)}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 2 }}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreClass(score)}`}>
                      Score {score}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs text-forest-500">
                    <Globe className="h-3 w-3" />
                    <span className="font-medium">{feed.source_name || 'RSS Source'}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(feed)}
                    </span>
                  </div>

                  <h2 className="mb-2 line-clamp-2 font-serif text-lg leading-snug text-forest-900">
                    {feed.title}
                  </h2>

                  <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {feed.summary || 'No summary available.'}
                  </p>

                  {feed.scoring_reason && (
                    <div className="mb-3 flex gap-2 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2">
                      <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                      <p className="line-clamp-2 text-xs leading-relaxed text-forest-700">
                        {feed.scoring_reason}
                      </p>
                    </div>
                  )}

                  <a
                    href={feed.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-4 inline-flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Original Article
                  </a>

                  <div className="mt-auto flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFeed(feed)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-forest-700 transition-colors hover:bg-gray-50"
                    >
                      See More
                    </button>

                    {isAiRejectedView ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 py-2 text-center text-xs font-semibold text-red-600">
                        AI rejected by scoring agent
                      </div>
                    ) : pending ? (
                      <div>
                        {/* <p className="mb-2 flex items-center gap-1 text-xs text-forest-500">
                          <Sparkles className="h-3 w-3 text-gold-500" />
                          Approve to trigger AI post generation
                        </p> */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedFeed(feed)}
                            disabled={busyId === feed.id}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                          >
                            {busyId === feed.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                            Approve & Generate
                          </button>
                          <button
                            onClick={() => setArticleStatus(feed.id, 'rejected')}
                            disabled={busyId === feed.id}
                            className="inline-flex h-full items-center justify-center rounded-lg bg-gray-100 px-3 py-2.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`rounded-lg py-2 text-center text-xs font-semibold ${
                        feed.approval_status === 'approved'
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-red-200 bg-red-50 text-red-600'
                      }`}>
                        {feed.approval_status === 'approved' ? 'Approved - posts in AI queue' : 'Rejected'}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {visibleFeeds.length === 0 && !loading && (
            <div className="py-20 text-center text-forest-400 md:col-span-2 xl:col-span-3">
              <Star className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p className="font-serif text-lg">No articles found</p>
              <p className="mb-6 mt-1 text-sm">Change filters or run a fresh RSS fetch.</p>
              <button
                onClick={fetchNow}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: '#1a4d2e' }}
              >
                <RefreshCw className="h-4 w-4" />
                Fetch RSS Now
              </button>
            </div>
          )}
        </div>
      )}
    <PreviewModal
  feed={selectedFeed}
  onClose={() => setSelectedFeed(null)}
  onApprove={approveFromModal}
  onReject={rejectFromModal}
  loading={modalLoading}
/>
    </div>
  );
}