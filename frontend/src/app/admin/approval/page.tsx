'use client';
 
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Twitter,
  XCircle,
} from 'lucide-react';
import { GeneratedContent, approveContent, fetchContent, rejectContent, regenerateAiPost, schedulePublish } from '../../../lib/admin-api';
 
type PreviewItem = GeneratedContent & {
  title: string;
  preview: string;
  image: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
};
 
const platformMeta: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; badge: string }> = {
  blog: { label: 'Blog Post', icon: FileText, badge: 'bg-forest-50 text-forest-700 border-forest-200' },
  facebook: { label: 'Facebook Post', icon: Send, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  instagram: { label: 'Instagram Caption', icon: Instagram, badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  linkedin: { label: 'LinkedIn Post', icon: Linkedin, badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  twitter: { label: 'X / Twitter Post', icon: Twitter, badge: 'bg-gray-50 text-gray-700 border-gray-200' },
  newsletter: { label: 'Newsletter', icon: Send, badge: 'bg-blue-50 text-blue-700 border-blue-200' },
};
 
function toLocalDatetimeValue(date = new Date(Date.now() + 24 * 60 * 60 * 1000)) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
 
function hashtags(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return value.split(/[ ,]+/).filter(Boolean);
  }
}
 
function statusStyle(status: string) {
  if (status === 'approved' || status === 'published') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'pending_review') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}
 
function decorate(item: GeneratedContent): PreviewItem {
  return {
    ...item,
    title: item.headline,
    preview: item.excerpt || item.content.slice(0, 120),
    image: item.featured_image_url || item.source_image_url || null,
    seoTitle: item.seo_title,
    metaDescription: item.seo_description,
  };
}
 
export default function ApprovalPage() {
  const [apiItems, setApiItems] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null);
  const [scheduleFor, setScheduleFor] = useState<PreviewItem | null>(null);
  const [scheduleAt, setScheduleAt] = useState(toLocalDatetimeValue());
  const [regenerateMenuFor, setRegenerateMenuFor] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
 
  async function load() {
    setError('');
    setLoading(true);
    try {
      setApiItems(await fetchContent());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load generated content');
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
    load();
  }, []);
 
  const items = useMemo<PreviewItem[]>(
    () => apiItems
      .filter((item) => item.status !== 'approved' && item.status !== 'rejected' && item.status !== 'published')
      .map(decorate),
    [apiItems]
  );
  const waitingCount = items.filter((item) => item.status !== 'approved' && item.status !== 'rejected' && item.status !== 'published').length;
 
  async function approveNow(item: PreviewItem) {
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      const iso = new Date().toISOString();
      await approveContent(item.id, iso);
      await schedulePublish(item.id, item.platform, iso);
      setMessage('Content approved and sent to publishing.');
      await load();
      if (selectedItem?.id === item.id) setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve content');
    } finally {
      setBusyId(null);
    }
  }
 
  async function reject(item: PreviewItem) {
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      await rejectContent(item.id, 'Rejected by admin');
      setMessage('Content rejected.');
      await load();
      if (selectedItem?.id === item.id) setSelectedItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject content');
    } finally {
      setBusyId(null);
    }
  }

  async function regenerate(item: PreviewItem, type: 'image' | 'content' | 'both') {
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      const regenerated = await regenerateAiPost(item.id, type);
      setMessage(`Content regenerated successfully (${type}).`);
      await load();
      if (selectedItem?.id === item.id) {
        setSelectedItem((prev) => prev && { ...prev, content: regenerated.content, image: regenerated.image_url || prev.image });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate content');
    } finally {
      setBusyId(null);
    }
  }
 
  async function saveSchedule() {
    if (!scheduleFor) return;
    setBusyId(scheduleFor.id);
    setError('');
    setMessage('');
    try {
      const iso = new Date(scheduleAt).toISOString();
      await approveContent(scheduleFor.id, iso);
      await schedulePublish(scheduleFor.id, scheduleFor.platform, iso);
      setScheduleFor(null);
      setMessage('Content approved and scheduled.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule content');
    } finally {
      setBusyId(null);
    }
  }
 
  return (
    <div className="min-h-screen bg-[#F8FAF7] p-6 text-gray-900 lg:p-8">
      {scheduleFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl animate-scale-in">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-forest-900">Approve & Schedule</h3>
                <p className="mt-1 text-sm text-gray-500">Choose calendar date and time for this post.</p>
              </div>
              <button onClick={() => setScheduleFor(null)} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 rounded-2xl bg-[#F8FAF7] p-4">
              <div className="text-sm font-semibold text-gray-900">{scheduleFor.title}</div>
              <div className="mt-1 text-xs text-gray-500">{platformMeta[scheduleFor.platform]?.label || scheduleFor.platform}</div>
            </div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Schedule date & time</label>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(event) => setScheduleAt(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100"
            />
            <button
              onClick={saveSchedule}
              disabled={busyId === scheduleFor.id}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-700 px-3 py-2 text-xs font-bold text-white hover:bg-forest-800 disabled:opacity-60"
            >
              {busyId === scheduleFor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
              Save Scheduled Post
            </button>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="relative">
              {selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.title} className="h-72 w-full object-cover sm:h-80" />
              ) : (
                <div className="flex h-72 w-full items-center justify-center bg-gray-100 sm:h-80">
                  <ImageIcon className="h-16 w-16 text-gray-300" />
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-gray-600 shadow-sm transition hover:bg-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex max-h-[calc(100vh-18rem)] flex-col overflow-y-auto scrollbar-hide p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-forest-500">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  {platformMeta[selectedItem.platform]?.label || selectedItem.platform}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(selectedItem.created_at).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{selectedItem.status.replace('_', ' ')}</span>
                </span>
              </div>
              <h2 className="mb-4 font-serif text-2xl font-bold text-forest-900">{selectedItem.title}</h2>
              <div className="mb-6 rounded-2xl bg-[#F8FAF7] p-4 text-sm leading-7 text-gray-700 whitespace-pre-line">
                {selectedItem.content}
              </div>
              {selectedItem.seoTitle && (
                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">SEO Title</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{selectedItem.seoTitle}</p>
                </div>
              )}
              {selectedItem.metaDescription && (
                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Meta Description</p>
                  <p className="mt-1 text-sm text-gray-600">{selectedItem.metaDescription}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {hashtags(selectedItem.hashtags).map((tag) => (
                  <span key={tag} className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{tag}</span>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRegenerateMenuFor(regenerateMenuFor === selectedItem.id ? null : selectedItem.id)}
                    disabled={busyId === selectedItem.id}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </button>
                  {regenerateMenuFor === selectedItem.id && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl z-10">
                      <button onClick={() => { regenerate(selectedItem, 'image'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Image</button>
                      <button onClick={() => { regenerate(selectedItem, 'content'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Content</button>
                      <button onClick={() => { regenerate(selectedItem, 'both'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Both</button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setScheduleFor(selectedItem); setSelectedItem(null); setScheduleAt(toLocalDatetimeValue()); }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                >
                  <CalendarClock className="h-4 w-4" /> Schedule
                </button>
                <button
                  type="button"
                  onClick={() => approveNow(selectedItem)}
                  disabled={busyId === selectedItem.id}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-forest-700 px-3 py-2 text-xs font-bold text-white hover:bg-forest-800 disabled:opacity-60"
                >
                  {busyId === selectedItem.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve & Publish
                </button>
                <button
                  type="button"
                  onClick={() => reject(selectedItem)}
                  disabled={busyId === selectedItem.id}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
 
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white px-3 py-1 text-xs font-semibold text-forest-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Generated Content Preview
          </div>
          <h1 className="font-serif text-3xl font-bold text-forest-900">AI Post Approval</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            <Clock className="mr-2 inline h-4 w-4" /> {waitingCount} waiting review
          </div>
          <button onClick={load} className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50">
            <RefreshCw className="mr-2 inline h-4 w-4" /> Refresh
          </button>
        </div>
      </div>
 
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
 
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-forest-700 shadow-sm">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading generated content...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-serif text-lg text-gray-600">No generated content found</p>
          <p className="mt-1 text-sm text-gray-400">Approve RSS articles or run content generation to populate this queue.</p>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const itemKey = `${item.id}-${item.platform}`;
            const meta = platformMeta[item.platform] || platformMeta.blog;
            const Icon = meta.icon;
            const isFinal = item.status === 'approved' || item.status === 'rejected' || item.status === 'published';
 
            return (
              <article key={itemKey} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-100">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.badge}`}>
                    <Icon className="h-3.5 w-3.5" /> {meta.label}
                  </span>
                  <span className={`absolute bottom-4 left-4 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="line-clamp-2 text-lg font-bold text-forest-900">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.preview}</p>
                    </div>
                  </div>
 
                  <button onClick={() => setSelectedItem(item)} className="mt-4 text-sm font-bold text-forest-700 hover:text-forest-900">
                    See More
                  </button>
 
                  {!isFinal && (
                    <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-4">
                      <div className="relative">
                        <button
                          onClick={() => setRegenerateMenuFor(regenerateMenuFor === item.id ? null : item.id)}
                          disabled={busyId === item.id}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                        </button>
                        {regenerateMenuFor === item.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-40 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl z-10">
                            <button onClick={() => { regenerate(item, 'image'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Image</button>
                            <button onClick={() => { regenerate(item, 'content'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Content</button>
                            <button onClick={() => { regenerate(item, 'both'); setRegenerateMenuFor(null); }} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50">Regenerate Both</button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => approveNow(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-forest-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-forest-800 disabled:opacity-60"
                      >
                        {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        Approve & Post
                      </button>
                      <button
                        onClick={() => { setScheduleFor(item); setScheduleAt(toLocalDatetimeValue()); }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                      >
                        <CalendarClock className="h-3.5 w-3.5" /> Schedule
                      </button>
                      <button
                        onClick={() => reject(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
 