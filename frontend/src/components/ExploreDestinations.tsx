import { motion } from 'framer-motion';

export default function ExploreDestinations() {
  const countries = [
    { name: 'Kenya', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=150&q=80' },
    { name: 'Uganda', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=150&q=80' },
    { name: 'Tanzania', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=150&q=80' },
    { name: 'South Africa', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=150&q=80' },
    { name: 'Rwanda', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=150&q=80' },
    { name: 'Botswana', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=150&q=80' },
    { name: 'Namibia', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=150&q=80' },
  ];

  return (
    <section className="py-16 bg-[#f7f2ea] text-[#3d1f17] font-sans">
      <div className="mx-auto max-w-7xl px-4 md:px-8">

        {/* Country Badges Section */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-16">
          {countries.map((country, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-primary transition-all">
                <img
                  src={country.img}
                  alt={country.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs md:text-sm font-black uppercase tracking-wider group-hover:text-primary transition-colors">
                {country.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Intro Text Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#4a241a] leading-tight">
              Your Guide To Africa's Wonders
            </h2>
            <div className="h-1 w-20 bg-secondary" />
            <p className="text-sm md:text-base leading-relaxed text-[#6f5a52]">
              City travel  is a registered and highly accredited safari organizer based in East Africa. Together with our local teams, we specialize in organizing private, tailor-made luxury and mid-range safaris in Kenya, Uganda, Tanzania, and South Africa. We pride ourselves on creating personalized travel itineraries that match your wishes, travel pace, and budget.
            </p>
            <p className="text-sm md:text-base leading-relaxed text-[#6f5a52]">
              Whether you are looking to witness the Great Wildebeest Migration in the Serengeti or Maasai Mara, track mountain gorillas in Bwindi Impenetrable Forest, or relax on the white sandy beaches of Zanzibar, we have the local expertise and passion to make it happen.
            </p>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="w-full h-80 rounded-full overflow-hidden border-8 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80"
                alt="Elephant in Savannah"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Media Logos Banner */}
        <div className="border-t border-b border-gray-200 py-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">As Seen In</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            <span className="font-extrabold text-sm md:text-base tracking-tight text-onSurface">USA TODAY</span>
            <span className="font-extrabold text-sm md:text-base tracking-tight text-onSurface">The Telegraph</span>
            <span className="font-extrabold text-sm md:text-base tracking-tight text-onSurface">travel+leisure</span>
            <span className="font-extrabold text-sm md:text-base tracking-tight text-onSurface">the guardian</span>
          </div>
        </div>

      </div>
    </section>
  );
}
