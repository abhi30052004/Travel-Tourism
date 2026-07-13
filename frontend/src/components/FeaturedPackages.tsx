import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Check, ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDestinations, fetchPackages, Destination, Package } from '../lib/admin-api';

export default function FeaturedPackages() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeDestId, setActiveDestId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    Promise.all([fetchDestinations(), fetchPackages()])
      .then(([dests, pkgs]) => {
        setDestinations(dests);
        setPackages(pkgs);
        if (dests.length > 0) {
          setActiveDestId(dests[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading packages/destinations:', err);
        setLoading(false);
      });
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
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const filteredPackages = packages.filter(
    (p) => p.destination_id === activeDestId
  );

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -400 : 400,
        behavior: 'smooth',
      });
    }
  };

  const handleInquire = () => {
    navigate('/request-proposal');
  };

  return (
    <section className="py-20 bg-white text-[#3d1f17] font-sans" id="packages">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#4a241a] mb-3">
            Popular Itineraries
          </h2>
          <div className="h-1 w-20 bg-[#e4a435] mx-auto mb-4" />
          <p className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-primary max-w-2xl mx-auto">
            Experience the spectacular wildlife and breathtaking landscapes of East Africa
          </p>
        </motion.div>

        {/* Destination Toggles */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              onClick={() => setActiveDestId(dest.id)}
              className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeDestId === dest.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'border border-gray-300 text-[#6f5a52] hover:border-primary hover:text-primary'
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg border border-gray-200 text-primary hover:bg-[#f7f2ea]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg border border-gray-200 text-primary hover:bg-[#f7f2ea]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {loading ? (
              <div className="w-full text-center py-10 font-bold text-gray-400">Loading dynamic itineraries...</div>
            ) : filteredPackages.length === 0 ? (
              <div className="w-full text-center py-10 text-xs italic text-gray-400">No itineraries available for this category yet.</div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredPackages.map((pkg) => {
                  const highlights = typeof pkg.highlights === 'string'
                    ? pkg.highlights.split(/,\s*/)
                    : (pkg.highlights || []);

                  return (
                    <div
                      key={pkg.id}
                      className="min-w-full md:min-w-[48%] lg:min-w-[31.5%] flex-shrink-0 group"
                    >
                      <div className="card-hover rounded-2xl overflow-hidden bg-[#f7f2ea] border border-gray-200 shadow-md">
                        <div className="image-zoom relative h-60 overflow-hidden">
                          {pkg.image && (
                            <img
                              src={pkg.image}
                              alt={pkg.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                          
                          <button
                            onClick={() => toggleFavorite(String(pkg.id))}
                            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full text-primary shadow hover:scale-110 active:scale-90 transition-all z-10"
                          >
                            <Heart className={`h-4 w-4 ${favorites.includes(String(pkg.id)) ? 'fill-primary' : ''}`} />
                          </button>

                          <div className="absolute top-4 right-4 rounded-full bg-[#e4a435] text-[#3d1f17] px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                            {pkg.destination_id}
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="font-extrabold text-lg text-[#4a241a] group-hover:text-primary transition-colors line-clamp-1">
                              {pkg.name}
                            </h3>
                            <p className="text-xs font-bold text-primary mt-1">
                              ⏱ {pkg.duration}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-[#e4a435] text-[#e4a435]" />
                              <span className="text-xs font-black">5.0</span>
                            </div>
                            <span className="text-xs text-[#6f5a52] font-semibold">
                              Highly Rated
                            </span>
                          </div>

                          <ul className="space-y-2 border-t border-gray-200/60 pt-4">
                            {highlights.slice(0, 3).map((h, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-xs font-bold text-[#6f5a52] line-clamp-1"
                              >
                                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-black tracking-widest text-[#6f5a52]">
                                Starting From
                              </span>
                              <p className="text-xl font-black text-primary">
                                ${pkg.price}
                              </p>
                            </div>

                            <button
                              onClick={handleInquire}
                              className="flex items-center gap-1.5 bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-all shadow"
                            >
                              Inquire <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}