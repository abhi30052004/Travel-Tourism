import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, PinIcon, Heart, Eye, Play } from 'lucide-react';
import { socialFeeds } from '../data/siteData';

export default function FollowJourney() {
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'youtube' | 'pinterest'>('instagram');

  const tabs = [
    { id: 'instagram' as const, label: 'Instagram', icon: Instagram },
    { id: 'facebook' as const, label: 'Facebook', icon: Facebook },
    { id: 'youtube' as const, label: 'YouTube', icon: Youtube },
    { id: 'pinterest' as const, label: 'Pinterest', icon: PinIcon },
  ];

  return (
    <section className="py-24 bg-[var(--charcoal)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[var(--cream)] mb-4">
            Follow Our Journey
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join our community of travelers and get inspired for your next adventure.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[var(--gold)] text-[var(--charcoal)] shadow-lg'
                  : 'border border-gray-600 text-gray-300 hover:border-[var(--gold)] hover:text-[var(--gold)]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'instagram' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {socialFeeds.instagram.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={item.image}
                    alt="Instagram"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-[var(--cream)]">
                      <Heart className="h-5 w-5 fill-[var(--gold)] text-[var(--gold)]" />
                      <span className="font-medium">{item.likes.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {socialFeeds.facebook.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="rounded-xl bg-[var(--cream)] p-6 text-center shadow-lg"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1877F2]/10">
                    <Facebook className="h-8 w-8 text-[#1877F2]" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[var(--charcoal)]">{item.title}</h4>
                  <div className="mt-4 flex justify-center gap-6 text-sm text-[var(--warm-gray)]">
                    <div>
                      <p className="font-bold text-[var(--charcoal)]">{item.likes}</p>
                      <p>Likes</p>
                    </div>
                    <div>
                      <p className="font-bold text-[var(--charcoal)]">{item.followers}</p>
                      <p>Followers</p>
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-lg bg-[#1877F2] py-2.5 text-sm font-medium text-[var(--cream)] transition-all hover:bg-[#166fe5]">
                    Follow
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'youtube' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {socialFeeds.youtube.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="group rounded-xl overflow-hidden bg-[var(--cream)] shadow-lg"
                >
                  <div className="relative h-48">
                    <img
                      src={`https://images.pexels.com/photos/${['1547813','532826','1287145'][i]}/pexels-photo-${['1547813','532826','1287145'][i]}.jpeg?auto=compress&cs=tinysrgb&w=600`}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="rounded-full bg-[#FF0000] p-3">
                        <Play className="h-6 w-6 text-[var(--cream)] fill-[var(--cream)]" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-[var(--cream)]">
                      {item.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-[var(--charcoal)] line-clamp-2">{item.title}</h4>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[var(--warm-gray)]">
                      <Eye className="h-3.5 w-3.5" />
                      {item.views} views
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'pinterest' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {socialFeeds.pinterest.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="rounded-xl bg-[var(--cream)] p-6 text-center shadow-lg border border-gray-100"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E60023]/10">
                    <PinIcon className="h-8 w-8 text-[#E60023]" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[var(--charcoal)]">{item.title}</h4>
                  <p className="mt-2 text-sm text-[var(--warm-gray)]">{item.pins} pins</p>
                  <button className="mt-4 w-full rounded-lg bg-[#E60023] py-2.5 text-sm font-medium text-[var(--cream)] transition-all hover:bg-[#cc0000]">
                    Follow Board
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
