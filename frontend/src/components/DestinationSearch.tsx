import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const destinations = ['Kenya', 'Uganda', 'Tanzania', 'South Africa'];
const activities = ['Safari', 'Beach holiday', 'Mountain climbing', 'Gorilla trekking'];

export default function DestinationSearch() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [activity, setActivity] = useState('');
  const [travelType, setTravelType] = useState('');
  const [travelDate, setTravelDate] = useState('');

  const handleSearch = () => {
    // Navigate to SearchPage with query params
    const query = [destination, activity, travelType].filter(Boolean).join(' ');
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleBuildCustom = () => {
    navigate('/request-proposal');
  };

  return (
    <section className="relative z-20 -mt-16 mx-auto max-w-6xl px-4 font-sans text-[#3d1f17]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
      >

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Destination */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6f5a52]">
              <MapPin className="h-4 w-4 text-primary" />
              Destination
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
            >
              <option value="">Select destination</option>
              {destinations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6f5a52]">
              <Compass className="h-4 w-4 text-primary" />
              Activity
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
            >
              <option value="">Select activity</option>
              {activities.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Travel Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6f5a52]">
              <Users className="h-4 w-4 text-primary" />
              Travel Type
            </label>
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
            >
              <option value="">Select type</option>
              <option value="luxury">Luxury Lodge</option>
              <option value="adventure">Active Adventure</option>
              <option value="family">Family Safari</option>
              <option value="romantic">Honeymoon / Romantic</option>
            </select>
          </div>

          {/* Travel Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6f5a52]">
              <Calendar className="h-4 w-4 text-primary" />
              Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-xs font-bold outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <button
            onClick={handleSearch}
            className="px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow hover:shadow-lg hover:scale-103 flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search Trips
          </button>
          <button
            onClick={handleBuildCustom}
            className="px-6 py-3.5 border border-primary hover:bg-[#f7f2ea] text-primary text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center"
          >
            Build Custom Package
          </button>
        </div>
      </motion.div>
    </section>
  );
}
