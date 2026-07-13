'use client';

import { useEffect, useState } from 'react';
import {
  Compass,
  FileText,
  Gift,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Save,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  fetchDestinations,
  fetchPackages,
  fetchDiscoverPages,
  createDestination,
  updateDestination,
  deleteDestination,
  createPackage,
  updatePackage,
  deletePackage,
  createDiscoverPage,
  updateDiscoverPage,
  deleteDiscoverPage,
  Destination,
  Package,
  DiscoverPage
} from '../../../lib/admin-api';

type Tab = 'destinations' | 'packages' | 'discover';

export default function AdminWebsitePage() {
  const [activeTab, setActiveTab] = useState<Tab>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [discoverPages, setDiscoverPages] = useState<DiscoverPage[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals / Editors state
  const [activeDest, setActiveDest] = useState<Destination | null>(null);
  const [activePkg, setActivePkg] = useState<Package | null>(null);
  const [activeDisc, setActiveDisc] = useState<DiscoverPage | null>(null);
  
  const [showDestModal, setShowDestModal] = useState(false);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [showDiscModal, setShowDiscModal] = useState(false);

  // Subsections editor helper
  const [discSubsections, setDiscSubsections] = useState<Array<{ title: string; desc: string; image?: string }>>([]);
  const [discRules, setDiscRules] = useState<string[]>([]);
  const [discTips, setDiscTips] = useState<string[]>([]);

  async function loadAllData() {
    setLoading(true);
    setError('');
    try {
      const [d, p, dp] = await Promise.all([
        fetchDestinations(),
        fetchPackages(),
        fetchDiscoverPages()
      ]);
      setDestinations(d);
      setPackages(p);
      setDiscoverPages(dp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load website configuration data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  // Save actions
  async function handleSaveDestination(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDest) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (destinations.some(d => d.id === activeDest.id) && !showDestModal) {
        // Edit mode (we use id to detect edit/create, if creating and ID exists we block, but if editing we hit PUT)
        await updateDestination(activeDest.id, activeDest);
        setSuccess('Destination updated successfully!');
      } else {
        // Create mode
        await createDestination(activeDest);
        setSuccess('Destination created successfully!');
      }
      setShowDestModal(false);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving destination.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    if (!activePkg) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (activePkg.id) {
        await updatePackage(activePkg.id, activePkg);
        setSuccess('Package updated successfully!');
      } else {
        await createPackage(activePkg);
        setSuccess('Package created successfully!');
      }
      setShowPkgModal(false);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving package.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDiscoverPage(e: React.FormEvent) {
    e.preventDefault();
    if (!activeDisc) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const updated = {
        ...activeDisc,
        subSections: JSON.stringify(discSubsections),
        rules: JSON.stringify(discRules),
        tips: JSON.stringify(discTips)
      };

      if (discoverPages.some(dp => dp.id === activeDisc.id) && !showDiscModal) {
        await updateDiscoverPage(activeDisc.id, updated);
        setSuccess('Guide page updated successfully!');
      } else {
        await createDiscoverPage(updated);
        setSuccess('Guide page created successfully!');
      }
      setShowDiscModal(false);
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving guide.');
    } finally {
      setSubmitting(false);
    }
  }

  // Delete actions
  async function handleDeleteDest(id: string) {
    if (!confirm('Are you sure you want to delete this destination? All associated packages will also be deleted.')) return;
    setLoading(true);
    try {
      await deleteDestination(id);
      setSuccess('Destination deleted successfully.');
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting destination.');
      setLoading(false);
    }
  }

  async function handleDeletePkg(id: number) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    setLoading(true);
    try {
      await deletePackage(id);
      setSuccess('Package deleted successfully.');
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting package.');
      setLoading(false);
    }
  }

  async function handleDeleteDisc(id: string) {
    if (!confirm('Are you sure you want to delete this discover guide?')) return;
    setLoading(true);
    try {
      await deleteDiscoverPage(id);
      setSuccess('Guide deleted successfully.');
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting guide.');
      setLoading(false);
    }
  }

  const openEditDest = (dest: Destination) => {
    setActiveDest(dest);
    setShowDestModal(true);
  };

  const openCreateDest = () => {
    setActiveDest({ id: '', name: '', tagline: '', desc: '', image: '' });
    setShowDestModal(true);
  };

  const openEditPkg = (pkg: Package) => {
    setActivePkg(pkg);
    setShowPkgModal(true);
  };

  const openCreatePkg = () => {
    setActivePkg({ id: 0, destination_id: destinations[0]?.id || '', name: '', duration: '', price: 0, image: '', highlights: '' });
    setShowPkgModal(true);
  };

  const openEditDisc = (page: DiscoverPage) => {
    setActiveDisc(page);
    try {
      setDiscSubsections(JSON.parse(page.subSections || '[]'));
    } catch {
      setDiscSubsections([]);
    }
    try {
      setDiscRules(JSON.parse(page.rules || '[]'));
    } catch {
      setDiscRules([]);
    }
    try {
      setDiscTips(JSON.parse(page.tips || '[]'));
    } catch {
      setDiscTips([]);
    }
    setShowDiscModal(true);
  };

  const openCreateDisc = () => {
    setActiveDisc({ id: '', title: '', tagline: '', heroImage: '', content: '', subSections: '[]', rules: '[]', tips: '[]' });
    setDiscSubsections([]);
    setDiscRules([]);
    setDiscTips([]);
    setShowDiscModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-800">Website Data Editor</h1>
          <p className="mt-1 text-sm text-forest-500">Edit dynamic destinations, itinerary packages, and discovery guides</p>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-forest-700 hover:bg-gray-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reload Data'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white p-1 rounded-xl shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab('destinations')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'destinations' ? 'bg-[var(--forest-green)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Compass className="w-4 h-4" /> Destinations
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'packages' ? 'bg-[var(--forest-green)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Gift className="w-4 h-4" /> Packages
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'discover' ? 'bg-[var(--forest-green)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Guides
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-forest-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dynamic parameters...
        </div>
      ) : (
        <div className="space-y-6">
          {/* =====================================================
              DESTINATIONS TAB
              ===================================================== */}
          {activeTab === 'destinations' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-forest-800">Manage Destinations</h2>
                <button
                  onClick={openCreateDest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Destination
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {destinations.map(dest => (
                  <div key={dest.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-[#faf8f5]">
                    {dest.image && (
                      <div className="h-44 w-full overflow-hidden relative">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                          ID: {dest.id}
                        </span>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-forest-800">{dest.name}</h3>
                        <p className="text-xs text-amber-600 font-semibold mb-2">{dest.tagline}</p>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{dest.desc}</p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {dest.packages?.length || 0} Package(s)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditDest(dest)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-forest-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDest(dest.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              PACKAGES TAB
              ===================================================== */}
          {activeTab === 'packages' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-forest-800">Manage Safaris & Packages</h2>
                <button
                  onClick={openCreatePkg}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Package
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                      <th className="px-4 py-3">Package Details</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Highlights</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => (
                      <tr key={pkg.id} className="border-b border-gray-100 hover:bg-[#faf8f5] text-sm">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {pkg.image && (
                              <img src={pkg.image} alt={pkg.name} className="w-12 h-12 object-cover rounded-lg" />
                            )}
                            <div className="font-semibold text-forest-900">{pkg.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-amber-600">
                          {pkg.destination_id}
                        </td>
                        <td className="px-4 py-4 text-gray-500 font-semibold">{pkg.duration}</td>
                        <td className="px-4 py-4 font-bold text-forest-800">${pkg.price}</td>
                        <td className="px-4 py-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {pkg.highlights?.split(/,\s*/).map((h, i) => (
                              <span key={i} className="text-[10px] bg-forest-50 text-forest-700 px-2 py-0.5 rounded font-medium">
                                {h}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditPkg(pkg)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePkg(pkg.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================
              DISCOVER GUIDES TAB
              ===================================================== */}
          {activeTab === 'discover' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl font-bold text-forest-800">Manage Travel Guides</h2>
                <button
                  onClick={openCreateDisc}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Guide Page
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {discoverPages.map(page => (
                  <div key={page.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-between bg-gradient-to-tr from-[#faf8f5] to-white hover:shadow-md transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          slug: {page.id}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditDisc(page)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDisc(page.id)}
                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-forest-800 mb-1">{page.title}</h3>
                      <p className="text-xs text-forest-500 font-medium mb-3 italic">{page.tagline}</p>
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">{page.content}</p>
                    </div>
                    {page.heroImage && (
                      <div className="h-28 rounded-lg overflow-hidden relative">
                        <img src={page.heroImage} alt={page.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          DESTINATION EDIT MODAL
          ===================================================== */}
      {showDestModal && activeDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfbfa]">
              <h3 className="font-serif text-lg font-bold text-forest-800">
                {destinations.some(d => d.id === activeDest.id) ? 'Edit Destination' : 'New Destination'}
              </h3>
              <button onClick={() => setShowDestModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDestination} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug / Identifier ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. kenya"
                  value={activeDest.id}
                  disabled={destinations.some(d => d.id === activeDest.id)}
                  onChange={e => setActiveDest({ ...activeDest, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenya Safaris"
                  value={activeDest.name}
                  onChange={e => setActiveDest({ ...activeDest, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Witness the Great Migration"
                  value={activeDest.tagline || ''}
                  onChange={e => setActiveDest({ ...activeDest, tagline: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={activeDest.image || ''}
                  onChange={e => setActiveDest({ ...activeDest, image: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide rich details about what travellers can do..."
                  value={activeDest.desc || ''}
                  onChange={e => setActiveDest({ ...activeDest, desc: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDestModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" /> Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PACKAGE EDIT MODAL
          ===================================================== */}
      {showPkgModal && activePkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfbfa]">
              <h3 className="font-serif text-lg font-bold text-forest-800">
                {activePkg.id ? 'Edit Package Itinerary' : 'New Package Itinerary'}
              </h3>
              <button onClick={() => setShowPkgModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination</label>
                <select
                  value={activePkg.destination_id}
                  onChange={e => setActivePkg({ ...activePkg, destination_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-forest-500"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-Day Primates & Wilderness"
                  value={activePkg.name}
                  onChange={e => setActivePkg({ ...activePkg, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Days"
                    value={activePkg.duration || ''}
                    onChange={e => setActivePkg({ ...activePkg, duration: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3800"
                    value={activePkg.price || 0}
                    onChange={e => setActivePkg({ ...activePkg, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={activePkg.image || ''}
                  onChange={e => setActivePkg({ ...activePkg, image: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Highlights (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Gorilla Trekking, Scenic Flights, Big Five Safari"
                  value={activePkg.highlights || ''}
                  onChange={e => setActivePkg({ ...activePkg, highlights: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPkgModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" /> Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DISCOVER PAGE EDIT MODAL
          ===================================================== */}
      {showDiscModal && activeDisc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfbfa]">
              <h3 className="font-serif text-lg font-bold text-forest-800">
                {discoverPages.some(dp => dp.id === activeDisc.id) ? 'Edit Guide Page' : 'New Guide Page'}
              </h3>
              <button onClick={() => setShowDiscModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveDiscoverPage} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug / Identifier ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. gorilla-trekking"
                  value={activeDisc.id}
                  disabled={discoverPages.some(dp => dp.id === activeDisc.id)}
                  onChange={e => setActiveDisc({ ...activeDisc, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorilla Trekking Guide"
                  value={activeDisc.title}
                  onChange={e => setActiveDisc({ ...activeDisc, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Misty mountains, primeval forests, and the experience of a lifetime."
                  value={activeDisc.tagline || ''}
                  onChange={e => setActiveDisc({ ...activeDisc, tagline: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hero Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={activeDisc.heroImage || ''}
                  onChange={e => setActiveDisc({ ...activeDisc, heroImage: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Introduction Content</label>
                <textarea
                  rows={4}
                  placeholder="Write a compelling introductory paragraph..."
                  value={activeDisc.content || ''}
                  onChange={e => setActiveDisc({ ...activeDisc, content: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>

              {/* Subsections Editor */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Sub-sections</label>
                  <button
                    type="button"
                    onClick={() => setDiscSubsections([...discSubsections, { title: '', desc: '', image: '' }])}
                    className="inline-flex items-center gap-1 text-xs text-forest-600 font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>
                <div className="space-y-3">
                  {discSubsections.map((sec, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => setDiscSubsections(discSubsections.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Subsection Title"
                          value={sec.title}
                          onChange={e => {
                            const clone = [...discSubsections];
                            clone[idx].title = e.target.value;
                            setDiscSubsections(clone);
                          }}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                        <textarea
                          placeholder="Subsection Description"
                          rows={2}
                          value={sec.desc}
                          onChange={e => {
                            const clone = [...discSubsections];
                            clone[idx].desc = e.target.value;
                            setDiscSubsections(clone);
                          }}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Subsection Image URL (optional)"
                          value={sec.image || ''}
                          onChange={e => {
                            const clone = [...discSubsections];
                            clone[idx].image = e.target.value;
                            setDiscSubsections(clone);
                          }}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Guidelines */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Trekking Rules / Guidelines</label>
                  <button
                    type="button"
                    onClick={() => setDiscRules([...discRules, ''])}
                    className="inline-flex items-center gap-1 text-xs text-forest-600 font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Rule
                  </button>
                </div>
                <div className="space-y-2">
                  {discRules.map((rule, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Maintain 7m distance"
                        value={rule}
                        onChange={e => {
                          const clone = [...discRules];
                          clone[idx] = e.target.value;
                          setDiscRules(clone);
                        }}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDiscRules(discRules.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert Tips */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Expert Planning Tips</label>
                  <button
                    type="button"
                    onClick={() => setDiscTips([...discTips, ''])}
                    className="inline-flex items-center gap-1 text-xs text-forest-600 font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Tip
                  </button>
                </div>
                <div className="space-y-2">
                  {discTips.map((tip, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Book 12 months in advance"
                        value={tip}
                        onChange={e => {
                          const clone = [...discTips];
                          clone[idx] = e.target.value;
                          setDiscTips(clone);
                        }}
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setDiscTips(discTips.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDiscModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--forest-green)] px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <Save className="w-3.5 h-3.5" /> Save Guide Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
