import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Star, Heart, Check, ArrowRight } from 'lucide-react';
import { travelPackages, packageCategories } from '../data/siteData';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<any[]>(travelPackages);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites & initial query params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }

    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((x) => x !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlist-update')); // trigger Navbar update
  };

  useEffect(() => {
    let filtered = travelPackages.filter((pkg) => {
      const matchQuery =
        pkg.name.toLowerCase().includes(query.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(query.toLowerCase()) ||
        pkg.highlights.some((h) => h.toLowerCase().includes(query.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || pkg.category === selectedCategory;
      return matchQuery && matchCategory;
    });
    setResults(filtered);
  }, [query, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-28 pb-16 font-sans text-[#3d1f17]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        
        {/* Search Header Form */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by destination, park, animals (e.g. Gorilla, Serengeti, Kenya)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#f7f2ea]/50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6f5a52] mr-2">Filter Category:</span>
            {['All', ...packageCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow'
                    : 'border border-gray-200 bg-[#f7f2ea]/20 text-[#6f5a52] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-xs font-bold text-[#6f5a52]">
          <span>Found {results.length} Safari Packages</span>
          {query && <span>Showing results for "{query}"</span>}
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8 space-y-4">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-extrabold">No Safaris Matched Your Search</h3>
            <p className="text-xs text-[#6f5a52]">Try adjusting your search keywords or clearing the category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((pkg) => (
              <div key={pkg.id} className="card-hover rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
                
                <div className="image-zoom relative h-48 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  
                  {/* Category Chip */}
                  <div className="absolute top-3 left-3 bg-[#e4a435] text-[#3d1f17] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {pkg.category}
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    onClick={() => toggleFavorite(pkg.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-primary shadow hover:scale-110 active:scale-90 transition-all"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(pkg.id) ? 'fill-primary' : ''}`} />
                  </button>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-[#4a241a] leading-snug line-clamp-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold">
                      <span>⏱ {pkg.duration}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#e4a435] text-[#e4a435]" />
                        <span className="text-onSurface">{pkg.rating}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 border-t border-gray-100 pt-3">
                    {pkg.highlights.slice(0, 3).map((h: string) => (
                      <li key={h} className="flex items-center gap-2 text-[10px] font-semibold text-[#6f5a52]">
                        <Check className="h-3 w-3 text-primary shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-gray-400">Starting From</span>
                      <p className="text-base font-black text-primary">${pkg.startingPrice}</p>
                    </div>
                    <button
                      onClick={() => navigate('/request-proposal')}
                      className="bg-primary hover:bg-[#b83f1d] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-colors flex items-center gap-1"
                    >
                      Inquire <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
