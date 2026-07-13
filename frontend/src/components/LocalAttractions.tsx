import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, ArrowRight } from 'lucide-react';
import { amsterdamAttractions, parisAttractions } from '../data/siteData';
import { Attraction } from '../types';

function AttractionCard({ attraction, index }: { attraction: Attraction; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="card-hover rounded-2xl overflow-hidden bg-[var(--cream)] border border-gray-100 shadow-lg">
        <div className="image-zoom relative h-48">
          <img
            src={attraction.image}
            alt={attraction.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="p-5">
          <h4 className="font-serif text-lg font-bold text-[var(--charcoal)]">
            {attraction.name}
          </h4>
          <p className="mt-2 text-sm text-[var(--warm-gray)] line-clamp-2">
            {attraction.description}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
              <span className="text-sm font-medium">{attraction.rating}</span>
            </div>
            <span className="text-sm text-[var(--warm-gray)]">
              {attraction.reviews.toLocaleString()} reviews
            </span>
            <div className="flex items-center gap-1 text-sm text-[var(--warm-gray)]">
              <Clock className="h-3 w-3" />
              {attraction.duration}
            </div>
          </div>
          <button className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--gold)] transition-all hover:gap-2">
            Learn More <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LocalAttractions() {
  const [activeCity, setActiveCity] = useState<'tanzania' | 'uganda'>('tanzania');
  const attractions = activeCity === 'tanzania' ? amsterdamAttractions : parisAttractions;

  return (
    <section className="py-24 bg-[#f7f2ea] text-[#3d1f17] font-sans">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Discover Sights & Attractions</h2>
          <p className="section-subtitle">
            Explore the most loved experiences and natural wonders.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCity('tanzania')}
            className={`rounded-full px-8 py-3 font-extrabold uppercase text-xs tracking-wider transition-all duration-300 ${
              activeCity === 'tanzania'
                ? 'bg-primary text-white shadow-lg'
                : 'border-2 border-primary text-primary hover:bg-[#f7f2ea]/60'
            }`}
          >
            Tanzania
          </button>
          <button
            onClick={() => setActiveCity('uganda')}
            className={`rounded-full px-8 py-3 font-extrabold uppercase text-xs tracking-wider transition-all duration-300 ${
              activeCity === 'uganda'
                ? 'bg-primary text-white shadow-lg'
                : 'border-2 border-primary text-primary hover:bg-[#f7f2ea]/60'
            }`}
          >
            Uganda
          </button>
        </div>

        <motion.div
          key={activeCity}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {attractions.map((attraction, i) => (
            <AttractionCard key={attraction.id} attraction={attraction} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
