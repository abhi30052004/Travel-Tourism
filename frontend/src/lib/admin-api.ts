// Admin API mock data and functions for Virtual Holidays content automation
 
export interface Feed {
  id: number;
  title: string;
  summary: string | null;
  link: string;
  image_url: string | null;
  city: string | null;
  source_name: string | null;
  published_date: string | null;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  relevance_score: number | null;
  scoring_reason: string | null;
}
 
export interface FeedCounts {
  total: number;
  ai_approved: number;
  ai_rejected: number;
  pending: number;
  approved: number;
  rejected: number;
}
 
export interface RssSource {
  id: number;
  name: string;
  url: string;
  city: string | null;
  category: string | null;
  enabled: boolean;
  last_fetched: string | null;
  created_at: string;
  updated_at: string;
}
 
export interface GeneratedContent {
  id: number;
  feed_id: number;
  platform: string;
  headline: string;
  slug?: string | null;
  content: string;
  excerpt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  keywords?: string | null;
  hashtags: string | null;
  featured_image_prompt?: string | null;
  featured_image_url?: string | null;
  source_image_url?: string | null;
  photography_direction?: string | null;
  source_url?: string | null;
  suggested_post_time?: string | null;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';
  validation_status: 'not_checked' | 'passed' | 'failed' | 'needs_human_attention';
  validation_score?: number | null;
  validation_issues: string | null;
  revision_count?: number | null;
  scheduled_publish_time: string | null;
  created_at: string;
}
 
export interface PublishLog {
  id: number;
  content_id: number;
  platform: string;
  status: 'queued' | 'published' | 'failed' | 'manual_publish_required';
  scheduled_publish_time: string | null;
  post_url: string | null;
  response_message: string | null;
  created_at: string;
}
 
export interface AgentRun {
  id: number;
  agent_name: string;
  action: string;
  status: 'running' | 'completed' | 'failed';
  message: string | null;
  created_at: string;
}
 
export interface DashboardStats {
  totalArticles: number;
  pendingArticles: number;
  approvedArticles: number;
  generatedContent: number;
  pendingContent: number;
  publishedPosts: number;
}
 
export interface BlogPost {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  link: string;
  image_url: string | null;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}
 
export interface AiPost {
  id: string;
  platform: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  image_url?: string | null;
}
 
export interface PublishedPost {
  id: string;
  platform: string;
  title: string | null;
  content: string;
  image_url: string | null;
  published_at: string;
}
 
export interface AdminSetting {
  key: string;
  value: string | null;
}
 
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const DEV_ADMIN_TOKEN = import.meta.env.VITE_ADMIN_API_TOKEN || 'dev-admin-token';
 
function backendToken() {
  const token = getAdminToken();
 
  if (!token || token.startsWith('mock_')) {
    return DEV_ADMIN_TOKEN;
  }
 
  return token;
}
 
async function apiRequest<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
 
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
 
  if (auth) {
    headers.set('Authorization', `Bearer ${backendToken()}`);
  }
 
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
 
  if (!response.ok) {
    let message = response.statusText || 'Request failed';
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }
    throw new Error(message);
  }
 
  if (response.status === 204) {
    return undefined as T;
  }
 
  return response.json();
}
 
// ─── Mock Data ─────────────────────────────────────────────
 
let rssSourcesDB: RssSource[] = [
  { id: 1, name: 'I Amsterdam', url: 'https://www.iamsterdam.com/en/whats-on/rss', city: 'Amsterdam', category: 'Culture', enabled: true, last_fetched: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, name: 'Rijksmuseum', url: 'https://www.rijksmuseum.nl/en/whats-on/feed', city: 'Amsterdam', category: 'Art', enabled: true, last_fetched: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, name: 'DutchNews', url: 'https://www.dutchnews.nl/feed/', city: 'Amsterdam', category: 'Travel', enabled: true, last_fetched: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, name: 'Time Out Paris', url: 'https://www.timeout.fr/paris/rss', city: 'Paris', category: 'Events', enabled: true, last_fetched: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, name: 'Louvre', url: 'https://www.louvre.fr/en/rss.xml', city: 'Paris', category: 'Art', enabled: true, last_fetched: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];
 
let feedsDB: Feed[] = [
  {
    id: 1,
    title: 'Hidden Canals of Amsterdam: A Local\'s Secret Guide',
    summary: 'Discover the enchanting secret waterways of Amsterdam that most tourists never see. From the quiet Jordaan canals to the historic Grachtengordel.',
    link: 'https://example.com/amsterdam-canals',
    image_url: 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=600',
    city: 'Amsterdam',
    source_name: 'I Amsterdam',
    published_date: '2024-12-15',
    created_at: '2024-12-15T10:00:00Z',
    approval_status: 'pending',
    relevance_score: 92,
    scoring_reason: 'High relevance: canal tourism, local secrets, Amsterdam specific',
  },
  {
    id: 2,
    title: 'Paris Christmas Markets 2024: Complete Guide',
    summary: 'The best Christmas markets in Paris this season, from Champs-Élysées to Montmartre. Includes dates, locations, and must-try treats.',
    link: 'https://example.com/paris-christmas',
    image_url: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=600',
    city: 'Paris',
    source_name: 'Sortiraparis',
    published_date: '2024-12-14',
    created_at: '2024-12-14T09:30:00Z',
    approval_status: 'approved',
    relevance_score: 88,
    scoring_reason: 'Seasonal content, Paris tourism, strong engagement potential',
  },
  {
    id: 3,
    title: 'Swiss Alps Winter Wonderland: Ski & Spa Guide',
    summary: 'Experience the magic of Swiss Alps this winter. Top ski resorts, thermal spas, and chocolate tastings in Zermatt and St. Moritz.',
    link: 'https://example.com/swiss-alps',
    image_url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=600',
    city: 'Global',
    source_name: 'Lonely Planet',
    published_date: '2024-12-13',
    created_at: '2024-12-13T14:00:00Z',
    approval_status: 'pending',
    relevance_score: 85,
    scoring_reason: 'Luxury travel, winter sports, high-value audience',
  },
  {
    id: 4,
    title: 'Venice Luxury Hotels: Palazzo Stays Under €500',
    summary: 'The most opulent Venetian palazzo hotels that won\'t break the bank. Canal views, frescoed ceilings, and private water taxis.',
    link: 'https://example.com/venice-hotels',
    image_url: 'https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=600',
    city: 'Global',
    source_name: 'Time Out',
    published_date: '2024-12-12',
    created_at: '2024-12-12T11:00:00Z',
    approval_status: 'rejected',
    relevance_score: 45,
    scoring_reason: 'Low relevance: price-focused, not aligned with luxury brand',
  },
  {
    id: 5,
    title: 'Barcelona Food Tour: Tapas & Wine Trail',
    summary: 'Best tapas bars and wine cellars in Barcelona\'s Gothic Quarter and El Born. A culinary journey through Catalan flavors.',
    link: 'https://example.com/barcelona-food',
    image_url: 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=600',
    city: 'Global',
    source_name: 'DutchNews.nl',
    published_date: '2024-12-11',
    created_at: '2024-12-11T08:00:00Z',
    approval_status: 'pending',
    relevance_score: 78,
    scoring_reason: 'Food tourism, cultural experience, moderate engagement',
  },
];
 
let contentDB: GeneratedContent[] = [
  {
    id: 101,
    feed_id: 2,
    platform: 'instagram',
    headline: 'Paris is glowing ✨ Christmas markets are now open!',
    content: `✨ Paris is glowing!
 
The Christmas markets are now open across the city. From the Champs-Élysées to Montmartre, there's magic around every corner.
 
🍷 Mulled wine
🧀 Raclette
🎄 Handcrafted ornaments
 
Which Paris market is on your bucket list?
 
#ParisChristmas #TravelParis #VirtualHolidays #ChristmasMarkets #ParisInWinter`,
    hashtags: '["#ParisChristmas","#TravelParis","#VirtualHolidays"]',
    status: 'draft',
    validation_status: 'passed',
    validation_issues: null,
    scheduled_publish_time: null,
    created_at: '2024-12-14T12:00:00Z',
  },
  {
    id: 102,
    feed_id: 2,
    platform: 'linkedin',
    headline: 'Paris Christmas Markets: A Strategic Tourism Insight',
    content: `The Paris Christmas market season generates €200M+ in tourism revenue annually. For travel operators, this represents a key Q4 opportunity.
 
Key insights:
• 15+ major markets across the city
• Average visitor spend: €85/day
• Peak dates: Dec 15 - Jan 5
 
How are you positioning your European travel offerings this season?
 
#TravelIndustry #ParisTourism #BusinessTravel`,
    hashtags: null,
    status: 'pending_review',
    validation_status: 'needs_human_attention',
    validation_issues: 'Tone may be too corporate for brand voice. Consider softer language.',
    scheduled_publish_time: null,
    created_at: '2024-12-14T12:05:00Z',
  },
  {
    id: 103,
    feed_id: 1,
    platform: 'blog',
    headline: 'Amsterdam\'s Secret Canals: A Local\'s Guide',
    content: `## Beyond the Tourist Trail: Amsterdam\'s Hidden Canals
 
While millions flock to the Anne Frank House and Rijksmuseum, Amsterdam\'s true magic lies in its lesser-known waterways...
 
[Full blog post content would go here]`,
    hashtags: null,
    status: 'draft',
    validation_status: 'not_checked',
    validation_issues: null,
    scheduled_publish_time: null,
    created_at: '2024-12-15T11:00:00Z',
  },
];
 
let logsDB: PublishLog[] = [
  {
    id: 201,
    content_id: 101,
    platform: 'instagram',
    status: 'queued',
    scheduled_publish_time: '2024-12-20T18:00:00Z',
    post_url: null,
    response_message: null,
    created_at: '2024-12-14T12:00:00Z',
  },
  {
    id: 202,
    content_id: 102,
    platform: 'linkedin',
    status: 'manual_publish_required',
    scheduled_publish_time: null,
    post_url: null,
    response_message: 'Brand validation flagged for human review',
    created_at: '2024-12-14T12:05:00Z',
  },
];
 
let runsDB: AgentRun[] = [
  { id: 301, agent_name: 'RSS Fetcher', action: 'fetch_feeds', status: 'completed', message: 'Fetched 5 articles from 4 sources', created_at: '2024-12-15T10:00:00Z' },
  { id: 302, agent_name: 'AI Scorer', action: 'score_articles', status: 'completed', message: 'Scored 5 articles, avg score 77.6', created_at: '2024-12-15T10:05:00Z' },
  { id: 303, agent_name: 'Content Generator', action: 'generate_posts', status: 'completed', message: 'Generated 3 posts from approved articles', created_at: '2024-12-14T12:00:00Z' },
  { id: 304, agent_name: 'Brand Validator', action: 'validate_content', status: 'completed', message: '2 passed, 1 needs attention', created_at: '2024-12-14T12:10:00Z' },
];
 
let settingsDB: AdminSetting[] = [
  { key: 'auto_fetch_interval', value: '6h' },
  { key: 'min_relevance_score', value: '40' },
  { key: 'auto_advance_high_scoring', value: 'true' },
  { key: 'auto_generate_on_approve', value: 'true' },
  { key: 'claude_model', value: 'claude-sonnet-4-5' },
  { key: 'generate_blog_default', value: 'true' },
  { key: 'notify_new_articles', value: 'true' },
  { key: 'notify_content_ready', value: 'true' },
  { key: 'notify_publish_failures', value: 'true' },
  { key: 'notify_weekly_digest', value: 'true' },
];
 
// ─── Auth ──────────────────────────────────────────────────
 
const ADMIN_KEY = 'vh_admin_session';
 
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_KEY);
}
 
export function getAdminUser(): string | null {
  return localStorage.getItem(`${ADMIN_KEY}_user`);
}
 
export function setAdminSession(token: string, username: string) {
  localStorage.setItem(ADMIN_KEY, token);
  localStorage.setItem(`${ADMIN_KEY}_user`, username);
}
 
export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(`${ADMIN_KEY}_user`);
}
 
export async function verifyAdminSession(): Promise<{ username: string }> {
  const token = getAdminToken();
  if (!token) throw new Error('No session');
 
  try {
    return await apiRequest<{ username: string }>('/auth/me');
  } catch {
    return { username: getAdminUser() || 'admin' };
  }
}
 
export async function adminLogin(username: string, password: string): Promise<{ token: string; username: string }> {
  try {
    const response = await apiRequest<{ access_token: string; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }, false);
    setAdminSession(response.access_token, response.username);
    return { token: response.access_token, username: response.username };
  } catch {
    if (password.length < 4) throw new Error('Invalid credentials');
    const token = `mock_${Date.now()}`;
    setAdminSession(token, username);
    return { token, username };
  }
}
 
// ─── Feeds ─────────────────────────────────────────────────
 
export async function fetchFeeds(filters?: { status?: string; aiStatus?: 'approved' | 'rejected'; limit?: number; scoredOnly?: boolean }): Promise<Feed[]> {
  try {
    const params = new URLSearchParams({ limit: String(filters?.limit ?? 100) });
    if (filters?.status) params.set('status', filters.status);
    if (filters?.aiStatus) params.set('ai_status', filters.aiStatus);
    if (filters?.scoredOnly) params.set('scored_only', 'true');
    return await apiRequest<Feed[]>(`/rss-feeds/?${params.toString()}`);
  } catch {
    await delay(400);
    let data = [...feedsDB];
    if (filters?.status) data = data.filter((f) => f.approval_status === filters.status);
    if (filters?.aiStatus === 'approved') data = data.filter((f) => (f.relevance_score || 0) >= 60);
    if (filters?.aiStatus === 'rejected') data = data.filter((f) => (f.relevance_score || 0) < 60);
    return data
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, filters?.limit ?? 100);
  }
}
 
export async function fetchFeedCounts(): Promise<FeedCounts> {
  try {
    return await apiRequest<FeedCounts>('/rss-feeds/summary/counts');
  } catch {
    await delay(250);
    const aiApproved = feedsDB.filter((feed) => (feed.relevance_score || 0) >= 60);
    const scored = feedsDB.filter((feed) => feed.relevance_score !== null);
 
    return {
      total: feedsDB.length,
      ai_approved: aiApproved.length,
      ai_rejected: Math.max(scored.length - aiApproved.length, 0),
      pending: aiApproved.filter((feed) => feed.approval_status === 'pending').length,
      approved: aiApproved.filter((feed) => feed.approval_status === 'approved').length,
      rejected: aiApproved.filter((feed) => feed.approval_status === 'rejected').length,
    };
  }
}
 
export async function fetchRssSources(): Promise<RssSource[]> {
  try {
    return await apiRequest<RssSource[]>('/rss-feeds/sources');
  } catch {
    await delay(250);
    return [...rssSourcesDB];
  }
}
 
export async function createRssSource(payload: Pick<RssSource, 'name' | 'url' | 'city' | 'category'> & { enabled?: boolean }): Promise<RssSource> {
  try {
    return await apiRequest<RssSource>('/rss-feeds/sources', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    await delay(250);
    const now = new Date().toISOString();
    const source: RssSource = {
      id: Date.now(),
      name: payload.name,
      url: payload.url,
      city: payload.city,
      category: payload.category,
      enabled: payload.enabled ?? true,
      last_fetched: null,
      created_at: now,
      updated_at: now,
    };
    rssSourcesDB = [...rssSourcesDB, source];
    return source;
  }
}
 
export async function updateRssSource(sourceId: number, payload: Partial<Pick<RssSource, 'name' | 'url' | 'city' | 'category' | 'enabled'>>): Promise<RssSource> {
  try {
    return await apiRequest<RssSource>(`/rss-feeds/sources/${sourceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch {
    await delay(250);
    let updated = rssSourcesDB.find((source) => source.id === sourceId);
    rssSourcesDB = rssSourcesDB.map((source) => {
      if (source.id !== sourceId) return source;
      updated = { ...source, ...payload, updated_at: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error('RSS source not found');
    return updated;
  }
}
 
export async function deleteRssSource(sourceId: number): Promise<void> {
  try {
    await apiRequest<{ message: string }>(`/rss-feeds/sources/${sourceId}`, {
      method: 'DELETE',
    });
  } catch {
    await delay(250);
    rssSourcesDB = rssSourcesDB.filter((source) => source.id !== sourceId);
  }
}
 
export async function approveFeed(feedId: number): Promise<{ content_generation?: { created: number[] }; brand_validation?: { validated: number } }> {
  try {
    return await apiRequest<{ content_generation?: { created: number[] }; brand_validation?: { validated: number } }>(`/rss-feeds/${feedId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved_by: getAdminUser() || 'editor' }),
    });
  } catch {
    await delay(600);
    feedsDB = feedsDB.map((f) => (f.id === feedId ? { ...f, approval_status: 'approved' as const } : f));
    // Auto-generate content
    const feed = feedsDB.find((f) => f.id === feedId);
    if (feed) {
      const newContent: GeneratedContent = {
        id: 1000 + Date.now(),
        feed_id: feed.id,
        platform: ['instagram', 'linkedin', 'blog'][Math.floor(Math.random() * 3)],
        headline: `AI: ${feed.title.slice(0, 50)}...`,
        content: `Generated content for: ${feed.title}\n\n${feed.summary || ''}`,
        hashtags: '["#VirtualHolidays","#Travel"]',
        status: 'draft',
        validation_status: 'not_checked',
        validation_issues: null,
        scheduled_publish_time: null,
        created_at: new Date().toISOString(),
      };
      contentDB.push(newContent);
      return { content_generation: { created: [newContent.id] }, brand_validation: { validated: 1 } };
    }
    return {};
  }
}
 
export async function rejectFeed(feedId: number): Promise<void> {
  try {
    await apiRequest(`/rss-feeds/${feedId}/reject`, {
      method: 'PUT',
    });
  } catch {
    await delay(400);
    feedsDB = feedsDB.map((f) => (f.id === feedId ? { ...f, approval_status: 'rejected' as const } : f));
  }
}
 
export async function runRssFetch(): Promise<{ result: { inserted: number; skipped: number; candidate_count?: number; counts?: Record<string, number>; scoring?: { scored: number } } }> {
  try {
    return await apiRequest<{ result: { inserted: number; skipped: number; candidate_count?: number; counts?: Record<string, number>; scoring?: { scored: number } } }>('/rss-feeds/fetch', {
      method: 'POST',
    });
  } catch {
    await delay(800);
    rssSourcesDB = rssSourcesDB.map((source) => (
      source.enabled ? { ...source, last_fetched: new Date().toISOString(), updated_at: new Date().toISOString() } : source
    ));
    return { result: { inserted: 3, skipped: 2, scoring: { scored: 3 } } };
  }
}
 
export async function runScoring(): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>('/scoring/run', {
      method: 'POST',
      body: JSON.stringify({ limit: 25, only_unscored: true }),
    });
  } catch {
    await delay(600);
    return { message: 'AI scoring complete. 3 articles scored.' };
  }
}
 
// ─── Content ───────────────────────────────────────────────
 
function fixImageUrls(item: GeneratedContent): GeneratedContent {
  if (item.featured_image_url && item.featured_image_url.startsWith('/media/')) {
    item.featured_image_url = `${API_BASE_URL}${item.featured_image_url}`;
  }
  if (item.source_image_url && item.source_image_url.startsWith('/media/')) {
    item.source_image_url = `${API_BASE_URL}${item.source_image_url}`;
  }
  return item;
}

export async function fetchContent(): Promise<GeneratedContent[]> {
  const data = await apiRequest<GeneratedContent[]>('/content/');
  return data.map(fixImageUrls);
}
 
export async function generateContent(feedIds?: number[]): Promise<{ result: { created: number[] } }> {
  await delay(800);
  const created: number[] = [];
  const targets = feedIds || feedsDB.filter((f) => f.approval_status === 'approved').map((f) => f.id);
  for (const fid of targets) {
    const feed = feedsDB.find((f) => f.id === fid);
    if (!feed) continue;
    const newId = 1000 + Date.now() + Math.floor(Math.random() * 1000);
    contentDB.push({
      id: newId,
      feed_id: fid,
      platform: ['instagram', 'linkedin', 'blog', 'newsletter'][Math.floor(Math.random() * 4)],
      headline: `AI: ${feed.title.slice(0, 45)}`,
      content: `Generated for ${feed.title}\n\n${feed.summary || ''}\n\n#VirtualHolidays #Travel`,
      hashtags: '["#VirtualHolidays","#Travel","#Europe"]',
      status: 'draft',
      validation_status: 'not_checked',
      validation_issues: null,
      scheduled_publish_time: null,
      created_at: new Date().toISOString(),
    });
    created.push(newId);
  }
  return { result: { created } };
}
 
export async function runBrandValidation(ids?: number[]): Promise<{ message: string }> {
  await delay(700);
  const targets = ids ? contentDB.filter((c) => ids.includes(c.id)) : contentDB.filter((c) => c.validation_status === 'not_checked');
  for (const item of targets) {
    const passed = Math.random() > 0.3;
    item.validation_status = passed ? 'passed' : 'needs_human_attention';
    if (!passed) item.validation_issues = 'Tone may need adjustment for brand voice.';
  }
  return { message: `Brand validation complete. ${targets.filter((t) => t.validation_status === 'passed').length} passed, ${targets.filter((t) => t.validation_status === 'needs_human_attention').length} need review.` };
}
 
// ─── Approval ──────────────────────────────────────────────
 
export async function approveContent(id: number, scheduledIso?: string): Promise<void> {
  await apiRequest<GeneratedContent>(`/content/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify({
      approved_by: getAdminUser() || 'editor',
      scheduled_publish_time: scheduledIso || null,
    }),
  });
}
 
export async function rejectContent(id: number, _notes?: string): Promise<void> {
  await apiRequest<GeneratedContent>(`/content/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({
      rejected_by: getAdminUser() || 'editor',
      reason: _notes || null,
    }),
  });
}
 
// ─── Publishing ────────────────────────────────────────────
 
export async function fetchPublishLogs(): Promise<PublishLog[]> {
  await delay(400);
  return [...logsDB];
}
 
export async function schedulePublish(contentId: number, platform: string, scheduledIso: string): Promise<void> {
  await apiRequest('/publish/schedule', {
    method: 'POST',
    body: JSON.stringify({
      items: [
        {
          content_id: contentId,
          platform,
          scheduled_publish_time: scheduledIso,
        },
      ],
    }),
  });
}
 
export async function updatePublishStatus(logId: number, status: 'published' | 'failed'): Promise<void> {
  await delay(400);
  logsDB = logsDB.map((l) => (l.id === logId ? { ...l, status } : l));
}
 
// ─── Agent Runs ────────────────────────────────────────────
 
export async function fetchAgentRuns(): Promise<AgentRun[]> {
  await delay(300);
  return [...runsDB].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
 
// ─── Utils ─────────────────────────────────────────────────
 
function toNumericId(id: string | number) {
  return typeof id === 'number' ? id : Number(id);
}
 
function toBlogPost(feed: Feed): BlogPost {
  return {
    id: String(feed.id),
    title: feed.title,
    description: feed.summary,
    content: feed.summary,
    link: feed.link,
    image_url: feed.image_url,
    created_at: feed.published_date || feed.created_at,
    status: feed.approval_status,
  };
}
 
function toAiPost(item: GeneratedContent): AiPost {
  let imgUrl = item.featured_image_url || item.source_image_url || null;
  if (imgUrl && imgUrl.startsWith('/media/')) {
    imgUrl = `${API_BASE_URL}${imgUrl}`;
  }
  return {
    id: String(item.id),
    platform: item.platform,
    title: item.headline,
    content: item.content,
    status: item.status === 'draft' || item.status === 'pending_review' ? 'pending' : item.status,
    image_url: imgUrl,
  };
}
 
function toPublishedPost(item: GeneratedContent, log?: PublishLog): PublishedPost {
  let imgUrl = item.featured_image_url || item.source_image_url || (feedsDB.find((feed) => feed.id === item.feed_id)?.image_url ?? null);
  if (imgUrl && imgUrl.startsWith('/media/')) {
    imgUrl = `${API_BASE_URL}${imgUrl}`;
  }
  return {
    id: String(log?.id ?? item.id),
    platform: item.platform,
    title: item.headline,
    content: item.content,
    image_url: imgUrl,
    published_at: log?.scheduled_publish_time || item.scheduled_publish_time || item.created_at,
  };
}
 
export async function fetchBlogPosts(status?: 'pending' | 'approved' | 'rejected'): Promise<BlogPost[]> {
  const feeds = await fetchFeeds(status ? { status } : undefined);
  return feeds.map(toBlogPost);
}
 
export async function approveBlogPost(id: string | number): Promise<void> {
  await approveFeed(toNumericId(id));
}
 
export async function rejectBlogPost(id: string | number): Promise<void> {
  await rejectFeed(toNumericId(id));
}
 
export async function fetchAiPosts(): Promise<AiPost[]> {
  const content = await fetchContent();
  return content.map(toAiPost);
}
 
export async function regenerateAiPost(id: string | number, type: 'image' | 'content' | 'both' = 'content'): Promise<AiPost> {
  const numericId = toNumericId(id);
  const result = await apiRequest<{ message: string; content: GeneratedContent }>(`/content/${numericId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
  return toAiPost(result.content);
}
 
export async function fetchPublishedPosts(): Promise<PublishedPost[]> {
  const content = await fetchContent();
  return content
    .filter((item) => item.status === 'published' || item.status === 'approved' || Boolean(item.scheduled_publish_time))
    .map((item) => toPublishedPost(item));
}
 
export async function fetchSettings(): Promise<AdminSetting[]> {
  await delay(250);
  return [...settingsDB];
}
 
export async function updateSetting(key: string, value: string): Promise<AdminSetting> {
  await delay(150);
  const existing = settingsDB.find((setting) => setting.key === key);
 
  if (existing) {
    existing.value = value;
    return existing;
  }
 
  const setting = { key, value };
  settingsDB = [...settingsDB, setting];
  return setting;
}
 
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [feedCounts, content, publishedPosts] = await Promise.all([
    fetchFeedCounts(),
    fetchContent(),
    fetchPublishedPosts(),
  ]);
 
  return {
    totalArticles: feedCounts.total,
    pendingArticles: feedCounts.pending,
    approvedArticles: feedCounts.approved,
    generatedContent: content.length,
    pendingContent: content.filter((item) => item.status === 'draft' || item.status === 'pending_review').length,
    publishedPosts: publishedPosts.length,
  };
}
 
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 