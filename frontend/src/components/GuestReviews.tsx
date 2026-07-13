import { useState, useRef, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { reviews } from '../data/siteData';

export default function GuestReviews() {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    const clamped = ((index % reviews.length) + reviews.length) % reviews.length;
    setActiveIndex(clamped);
  }, []);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    autoPlayRef.current = setInterval(next, 6000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [next]);

  const review = reviews[activeIndex];

  return (
    <section className="py-20 bg-[#4a241a] text-white font-sans" id="reviews">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-[#e4a435] mb-2">
            What Travellers Say
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white leading-tight">
            Guest Testimonials
          </h2>
          <div className="h-1 w-20 bg-[#e4a435] mx-auto mt-4" />
        </div>

        {/* Main Testimonial Slider */}
        <div className="relative max-w-4xl mx-auto p-8 md:p-12">
          {/* Quote Icon */}
          <div className="absolute top-6 left-6 text-white/10 text-7xl font-serif select-none pointer-events-none">
            “
          </div>

          <div className="relative z-10 text-center">
            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < (review?.rating || 5)
                      ? 'fill-[#e4a435] text-[#e4a435]'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-lg md:text-xl text-gray-100 leading-relaxed italic mb-8 max-w-3xl mx-auto">
              "{review?.content || 'Unbelievable safari experience. Everything was coordinated perfectly.'}"
            </p>

            {/* Author */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <img
                src={review?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                alt={review?.name}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#e4a435]"
              />
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <span className="font-extrabold text-white text-sm">{review?.name || 'Jane Doe'}</span>
                  <BadgeCheck className="h-4 w-4 text-[#e4a435]" />
                </div>
                <p className="text-xs text-gray-400">
                  Verified Safari Traveller — <span className="text-[#e4a435]">{review?.destination || 'East Africa'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3">
            <button
              onClick={prev}
              className="rounded-full bg-white/5 border border-white/10 p-2.5 text-[#e4a435] hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-3">
            <button
              onClick={next}
              className="rounded-full bg-white/5 border border-white/10 p-2.5 text-[#e4a435] hover:bg-white/10 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Badges strip */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { channel: 'Tripadvisor Reviews', rating: '4.9/5', source: 'Based on 3,500+ guests' },
            { channel: 'Google Reviews', rating: '4.8/5', source: 'Based on 2,800+ guests' },
            { channel: 'ASTA Certified', rating: 'Trusted', source: 'Verified Travel Agency' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/5 p-6 text-center border border-white/10 hover:border-[#e4a435]/30 transition-colors"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-300 mb-2">{stat.channel}</h4>
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl font-black text-[#e4a435]">{stat.rating}</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">{stat.source}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
