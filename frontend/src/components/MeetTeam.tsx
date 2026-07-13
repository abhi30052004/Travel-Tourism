import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram } from 'lucide-react';
import { teamMembers } from '../data/siteData';

export default function MeetTeam() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-24 bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">Meet Our Team</h2>
          <p className="section-subtitle">
            Passionate experts dedicated to crafting your perfect European journey.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative"
            >
              <div className={`card-hover rounded-2xl overflow-hidden bg-[var(--cream)] border border-gray-100 shadow-lg transition-all duration-500 ${
                hoveredId === member.id ? 'ring-2 ring-[var(--gold)] shadow-2xl' : ''
              }`}>
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-500 ${
                    hoveredId === member.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                  <div className={`absolute bottom-4 left-4 right-4 flex justify-center gap-3 transition-all duration-500 ${
                    hoveredId === member.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} className="rounded-full bg-[var(--cream)] p-2.5 text-[var(--forest-green)] transition-all hover:bg-[var(--gold)] hover:text-[var(--charcoal)]">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a href={member.social.twitter} className="rounded-full bg-[var(--cream)] p-2.5 text-[var(--forest-green)] transition-all hover:bg-[var(--gold)] hover:text-[var(--charcoal)]">
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                    {member.social.instagram && (
                      <a href={member.social.instagram} className="rounded-full bg-[var(--cream)] p-2.5 text-[var(--forest-green)] transition-all hover:bg-[var(--gold)] hover:text-[var(--charcoal)]">
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-bold text-[var(--charcoal)]">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[var(--gold)]">
                    {member.designation}
                  </p>
                  <p className="mt-3 text-sm text-[var(--warm-gray)] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
