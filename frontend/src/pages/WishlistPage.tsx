import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, Calendar, ArrowRight, Eye } from 'lucide-react';
import { travelPackages } from '../data/siteData';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        const ids = JSON.parse(saved) as string[];
        const items = travelPackages.filter((pkg) => ids.includes(pkg.id));
        setWishlist(items);
      } catch (e) {
        console.error('Error loading wishlist:', e);
      }
    }
  }, []);

  const removeItem = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    const updatedIds = updated.map((item) => item.id);
    localStorage.setItem('wishlist', JSON.stringify(updatedIds));
    window.dispatchEvent(new Event('wishlist-update')); // trigger Navbar update
  };

  const handleInquireAll = () => {
    navigate('/request-proposal');
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-28 pb-16 font-sans text-[#3d1f17]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-primary">Your Favourites</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-[#4a241a]">My Wishlist</h1>
          <div className="h-1 w-20 bg-secondary mx-auto" />
          <p className="text-sm text-[#6f5a52] leading-relaxed">
            Keep track of your dream African itineraries. Review your choices and request a personalized safari proposal based on your favorited trips.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-12 space-y-6 bg-white/70 backdrop-blur border border-gray-200 rounded-3xl p-8">
            <span className="text-5xl">🦓</span>
            <h3 className="text-xl font-extrabold text-onSurface">Your Wishlist is Empty</h3>
            <p className="text-xs text-[#6f5a52] leading-relaxed">
              Explore our custom safari packages and click the heart icon to save your favourites here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow"
            >
              Browse Safaris
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Wishlist Cards */}
            <div className="lg:col-span-8 space-y-6">
              {wishlist.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col sm:flex-row items-stretch hover:shadow-md transition-all">
                  <div className="sm:w-1/3 h-44 sm:h-auto overflow-hidden relative">
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="sm:w-2/3 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-extrabold text-base md:text-lg text-[#4a241a] leading-snug">
                          {pkg.name}
                        </h3>
                        <button
                          onClick={() => removeItem(pkg.id)}
                          className="text-[#6f5a52] hover:text-primary transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                          title="Remove item"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      <p className="text-xs text-primary font-bold">⏱ {pkg.duration}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#6f5a52]">Starting Price</span>
                        <p className="text-lg font-black text-primary">${pkg.startingPrice}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/request-proposal')}
                          className="bg-primary hover:bg-[#b83f1d] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-full transition-colors"
                        >
                          Inquire
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Inquire Sidebar */}
            <div className="lg:col-span-4 bg-[#4a241a] text-white p-6 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-secondary">
                Request Joint Proposal
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Ready to take the next step? Send your wishlist items to our safari specialists. We will build a customized itinerary combining your favorite spots.
              </p>

              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2.5">
                    <span className="text-xs font-bold truncate flex-1">{item.name}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleInquireAll}
                className="w-full bg-secondary hover:bg-[#d09228] text-[#3d1f17] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow"
              >
                Inquire For All Items <ArrowRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
