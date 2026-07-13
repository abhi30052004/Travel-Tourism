import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroCarousel() {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [arrivalDate, setArrivalDate] = useState('');

  const handleStartCustomizing = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/request-proposal');
  };

  return (
    <section className="relative min-h-[95vh] md:h-screen w-full overflow-hidden flex items-center pt-20 font-sans">
      {/* Dynamic Shifting Sunset Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
          alt="Safari Adventure"
          className="w-full h-full object-cover"
        />
        {/* Animated Sunset Glow overlay */}
        <div className="absolute inset-0 sunset-gradient-bg opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 text-white space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#e4a435] to-[#cc4b25] text-white text-xs uppercase font-extrabold px-4 py-1.5 rounded-full shadow-lg">
            🏆 Travelers' Choice Award 2026
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg">
            Unveil The Heart <br />Of Africa
          </h1>
          <p className="text-base md:text-lg text-gray-200 font-medium max-w-xl drop-shadow">
            Experience bespoke private safaris crafted with local expertise. Discover Bwindi gorillas, wildebeest river crossings, and Cape Town winelands.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">★★★★★</span>
              <span className="text-xs font-bold text-gray-200">4.9/5 Trustpilot Reviews</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">★★★★★</span>
              <span className="text-xs font-bold text-gray-200">4.8/5 Google Ratings</span>
            </div>
          </div>
        </motion.div>

        {/* Right side glass form card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 glass-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-black uppercase tracking-wider text-primary">
                Let's Customize Your Trip
              </h3>
              <p className="text-[10px] text-muted font-bold mt-1">
                Share details to get a free, customized itinerary within 24 hours.
              </p>
            </div>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0 shadow">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                alt="Expert Advisor"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <form onSubmit={handleStartCustomizing} className="space-y-4">
            {/* Adults & Children Counters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6f5a52] block">Adults</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="text-primary hover:scale-110 active:scale-90 transition-transform"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-onSurface">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(adults + 1)}
                    className="text-primary hover:scale-110 active:scale-90 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6f5a52] block">Children</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    className="text-primary hover:scale-110 active:scale-90 transition-transform"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold text-onSurface">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    className="text-primary hover:scale-110 active:scale-90 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Arrival Date */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6f5a52] block">Estimated Arrival Date</span>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-bold text-onSurface outline-none focus:border-primary shadow-sm"
                required
              />
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#e4a435] text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-primary/20 hover:scale-102 active:scale-98 mt-4"
            >
              Start Plan Customization
            </button>

            <p className="text-[9px] text-gray-400 text-center mt-2 leading-normal">
              No change details lock you in. Inquire now, adjust details later with no obligations or commitment.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}