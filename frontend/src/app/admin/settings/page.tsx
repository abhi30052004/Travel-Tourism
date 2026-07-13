'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  Twitter,
} from 'lucide-react';
import { fetchSettings, updateSetting } from '../../../lib/admin-api';

type SettingsState = {
  autoFetchInterval: string;
  minRelevanceScore: number;
  autoAdvanceHighScoring: boolean;
  autoGenerateOnApprove: boolean;
  claudeModel: string;
  generateBlogDefault: boolean;
  notifyNewArticles: boolean;
  notifyContentReady: boolean;
  notifyPublishFailures: boolean;
  notifyWeeklyDigest: boolean;
};

const defaultSettings: SettingsState = {
  autoFetchInterval: '6h',
  minRelevanceScore: 40,
  autoAdvanceHighScoring: true,
  autoGenerateOnApprove: true,
  claudeModel: 'claude-sonnet-4-5',
  generateBlogDefault: true,
  notifyNewArticles: true,
  notifyContentReady: true,
  notifyPublishFailures: true,
  notifyWeeklyDigest: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    setError('');
    setLoading(true);
    try {
      const data = await fetchSettings();
      // Map database settings to local state
      const mapped = { ...defaultSettings };
      data.forEach((s: { key: string; value: string | null }) => {
        if (s.key === 'auto_fetch_interval') mapped.autoFetchInterval = s.value || '6h';
        if (s.key === 'min_relevance_score') mapped.minRelevanceScore = parseInt(s.value || '40');
        if (s.key === 'auto_advance_high_scoring') mapped.autoAdvanceHighScoring = s.value === 'true';
        if (s.key === 'auto_generate_on_approve') mapped.autoGenerateOnApprove = s.value === 'true';
        if (s.key === 'claude_model') mapped.claudeModel = s.value || 'claude-sonnet-4-5';
        if (s.key === 'generate_blog_default') mapped.generateBlogDefault = s.value === 'true';
        if (s.key === 'notify_new_articles') mapped.notifyNewArticles = s.value === 'true';
        if (s.key === 'notify_content_ready') mapped.notifyContentReady = s.value === 'true';
        if (s.key === 'notify_publish_failures') mapped.notifyPublishFailures = s.value === 'true';
        if (s.key === 'notify_weekly_digest') mapped.notifyWeeklyDigest = s.value === 'true';
      });
      setSettings(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updates: Array<{ key: string; value: string }> = [
        { key: 'auto_fetch_interval', value: settings.autoFetchInterval },
        { key: 'min_relevance_score', value: settings.minRelevanceScore.toString() },
        { key: 'auto_advance_high_scoring', value: settings.autoAdvanceHighScoring.toString() },
        { key: 'auto_generate_on_approve', value: settings.autoGenerateOnApprove.toString() },
        { key: 'claude_model', value: settings.claudeModel },
        { key: 'generate_blog_default', value: settings.generateBlogDefault.toString() },
        { key: 'notify_new_articles', value: settings.notifyNewArticles.toString() },
        { key: 'notify_content_ready', value: settings.notifyContentReady.toString() },
        { key: 'notify_publish_failures', value: settings.notifyPublishFailures.toString() },
        { key: 'notify_weekly_digest', value: settings.notifyWeeklyDigest.toString() },
      ];

      for (const update of updates) {
        await updateSetting(update.key, update.value);
      }

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const updateSettingLocal = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-800">Settings</h1>
          <p className="mt-1 text-sm text-forest-500">Configure your content automation platform</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-forest-700 hover:bg-gray-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Reset
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="mr-2 inline h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-forest-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings...
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {/* RSS Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-forest-50 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-forest-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold text-forest-800">RSS Agent Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-forest-800">Auto-fetch interval</div>
                  <div className="text-xs text-gray-500">How often the RSS agent runs automatically</div>
                </div>
                <select
                  value={settings.autoFetchInterval}
                  onChange={e => updateSettingLocal('autoFetchInterval', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-forest-500"
                >
                  <option value="4h">Every 4 hours</option>
                  <option value="6h">Every 6 hours</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Daily</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-forest-800">Minimum relevance score</div>
                  <div className="text-xs text-gray-500">Articles below this score are filtered out</div>
                </div>
                <input
                  type="number"
                  value={settings.minRelevanceScore}
                  onChange={e => updateSettingLocal('minRelevanceScore', parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                  className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:border-forest-500"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-forest-800">Auto-advance high-scoring articles</div>
                  <div className="text-xs text-gray-500">Articles scoring 80+ skip verification queue</div>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoAdvanceHighScoring}
                    onChange={e => updateSettingLocal('autoAdvanceHighScoring', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Content Generation */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center">
                <Settings className="w-4 h-4 text-gold-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold text-forest-800">Content Generation</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-forest-800">Auto-generate on article approval</div>
                  <div className="text-xs text-gray-500">Automatically trigger AI when article is approved</div>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoGenerateOnApprove}
                    onChange={e => updateSettingLocal('autoGenerateOnApprove', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-sm font-medium text-forest-800">AI Model</div>
                  <div className="text-xs text-gray-500">AI model used for content generation</div>
                </div>
                <select
                  value={settings.claudeModel}
                  onChange={e => updateSettingLocal('claudeModel', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-forest-500"
                >
                  <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Recommended)</option>
                  <option value="claude-opus-4-5">Claude Opus 4.5 (Higher quality)</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-forest-800">Generate blog post by default</div>
                  <div className="text-xs text-gray-500">Include full blog article in every content batch</div>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.generateBlogDefault}
                    onChange={e => updateSettingLocal('generateBlogDefault', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell className="w-4 w-4 text-blue-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold text-forest-800">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: 'notifyNewArticles', label: 'New articles in verification queue', sub: 'Notify when articles need review' },
                { key: 'notifyContentReady', label: 'Content ready for approval', sub: 'Notify when AI finishes generating' },
                { key: 'notifyPublishFailures', label: 'Publishing failures', sub: 'Alert when a post fails to publish' },
                { key: 'notifyWeeklyDigest', label: 'Weekly digest', sub: 'Summary of all platform performance' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-forest-800">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.sub}</div>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof SettingsState] as boolean}
                      onChange={e => updateSettingLocal(item.key as keyof SettingsState, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Social Connections */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="font-serif text-lg font-semibold text-forest-800">Social Platform Connections</h2>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Twitter / X', icon: Twitter, connected: false, desc: 'Connect via Twitter OAuth' },
                { name: 'Instagram', icon: Instagram, connected: false, desc: 'Connect via Facebook Business Account' },
                { name: 'LinkedIn', icon: Linkedin, connected: false, desc: 'Connect via LinkedIn OAuth' },
                { name: 'Facebook', icon: Facebook, connected: false, desc: 'Connect via Facebook Graph API' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-forest-800">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      item.connected
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-forest-600 text-white hover:bg-forest-700'
                    }`}
                  >
                    {item.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700">
              <strong>Demo Mode:</strong> Social media connections are simulated. No actual API integration is configured.
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-forest-700 px-6 py-3 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
