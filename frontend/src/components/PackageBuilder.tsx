import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Wallet, Heart, Mail, Sparkles, Check } from 'lucide-react';

export default function PackageBuilder() {
  const [formData, setFormData] = useState({
    destination: '',
    travelDate: '',
    guests: '',
    budget: '',
    interests: [] as string[],
    email: '',
  });
  const [generated, setGenerated] = useState(false);

  const interests = ['Culture', 'Food', 'Adventure', 'Relaxation', 'Nightlife', 'Shopping', 'History', 'Nature'];

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleGenerate = () => {
    setGenerated(true);
    setTimeout(() => setGenerated(false), 4000);
  };

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
          <h2 className="section-title">Build Your Custom Package</h2>
          <p className="section-subtitle">
            Tell us your preferences and let our AI craft your perfect European getaway.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-white p-8 md:p-12 shadow-xl border border-[var(--gold)]/10"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                  <MapPin className="h-4 w-4 text-[var(--gold)]" />
                  Destination
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-[var(--cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                >
                  <option value="">Select destination</option>
                  <option value="kenya">Kenya</option>
                  <option value="uganda">Uganda</option>
                  <option value="tanzania">Tanzania</option>
                  <option value="south-africa">South Africa</option>
                  <option value="rwanda">Rwanda</option>
                  <option value="zanzibar">Zanzibar</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                  <Calendar className="h-4 w-4 text-[var(--gold)]" />
                  Travel Date
                </label>
                <input
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-[var(--cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                  <Users className="h-4 w-4 text-[var(--gold)]" />
                  Number of Guests
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-[var(--cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                >
                  <option value="">Select guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3-4">3-4 Guests</option>
                  <option value="5+">5+ Guests</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                  <Wallet className="h-4 w-4 text-[var(--gold)]" />
                  Budget Range
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-[var(--cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                >
                  <option value="">Select budget</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                <Heart className="h-4 w-4 text-[var(--gold)]" />
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      formData.interests.includes(interest)
                        ? 'bg-[var(--forest-green)] text-[var(--cream)] shadow-md'
                        : 'border border-gray-200 text-[var(--warm-gray)] hover:border-[var(--gold)] hover:text-[var(--gold)]'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--warm-gray)]">
                <Mail className="h-4 w-4 text-[var(--gold)]" />
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-[var(--cream)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerate}
                className="btn-gold flex items-center gap-2 text-lg"
              >
                <Sparkles className="h-5 w-5" />
                Generate My Package
              </button>
            </div>

            {generated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 rounded-xl bg-[var(--forest-green)]/10 p-6 text-center border border-[var(--forest-green)]/20"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--forest-green)]">
                  <Check className="h-6 w-6 text-[var(--cream)]" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[var(--forest-green)]">
                  Package Generated!
                </h3>
                <p className="mt-2 text-sm text-[var(--warm-gray)]">
                  We've crafted a personalized itinerary for {formData.destination || 'your destination'}.
                  Check your email at {formData.email || 'your inbox'} for the full details.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
