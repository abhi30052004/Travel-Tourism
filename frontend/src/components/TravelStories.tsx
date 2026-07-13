import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, User } from 'lucide-react';
import { blogPosts, storyCategories } from '../data/siteData';

export default function TravelStories() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  const featured = filtered.find((p) => p.featured) || filtered[0];
  const regular = filtered.filter((p) => p.id !== featured?.id);

  return (
    <section className="py-24 bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Travel Stories</h2>
          <p className="section-subtitle">
            Stories, tips, and inspiration for your next European adventure.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {storyCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[var(--forest-green)] text-[var(--cream)] shadow-md'
                  : 'border border-gray-200 text-[var(--warm-gray)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-[var(--cream)] shadow-xl border border-gray-100">
              <div className="grid md:grid-cols-2">
                <div className="image-zoom relative h-80 md:h-auto">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-[var(--gold)] px-4 py-1.5 text-xs font-bold text-[var(--charcoal)]">
                    {featured.category}
                  </div>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[var(--charcoal)] group-hover:text-[var(--forest-green)] transition-colors">
                    {featured.title}
                  </h3>
                  <p className="mt-4 text-[var(--warm-gray)] leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-6 text-sm text-[var(--warm-gray)]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featured.author}
                    </div>
                    <span>{featured.date}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featured.readTime}
                    </div>
                  </div>
                  <button className="mt-6 flex items-center gap-2 text-[var(--gold)] font-medium transition-all hover:gap-3">
                    Read More <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {regular.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="card-hover rounded-2xl overflow-hidden bg-[var(--cream)] border border-gray-100 shadow-lg">
                <div className="image-zoom relative h-52">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold text-[var(--charcoal)]">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-serif text-lg font-bold text-[var(--charcoal)] group-hover:text-[var(--forest-green)] transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="mt-2 text-sm text-[var(--warm-gray)] line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[var(--warm-gray)]">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <button className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--gold)] transition-all hover:gap-2">
                    Read More <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
