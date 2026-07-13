import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, PartyPopper } from 'lucide-react';

export default function Newsletter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name.trim() && email.trim()) {
      setSubmitted(true);
    }
  };

  useEffect(() => {
    if (!submitted) return;

    const timer = setTimeout(() => {
      setSubmitted(false);
      setName('');
      setEmail('');
    }, 4000);

    return () => clearTimeout(timer);
  }, [submitted]);

  return (
    <section className="relative overflow-hidden bg-[var(--forest-green)] py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-[var(--gold)]" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[var(--gold)]" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--cream)]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Mail className="mx-auto mb-6 h-12 w-12 text-[var(--gold)]" />

          <h2 className="mb-4 font-serif text-4xl font-bold text-[var(--cream)] md:text-5xl">
            Get Travel Inspiration
          </h2>

          <p className="mb-10 text-lg text-[var(--cream)]/80">
            Subscribe for exclusive deals, destination guides, and travel tips
            delivered to your inbox.
          </p>

          <AnimatePresence>
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 sm:flex-row sm:gap-3"
              >
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-[var(--cream)]/20 bg-white px-5 py-4 text-black placeholder:text-gray-500 outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30"
                />

                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-[var(--cream)]/20 bg-white px-5 py-4 text-black placeholder:text-gray-500 outline-none transition-all focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/30"
                />

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-8 py-4 font-medium text-[var(--charcoal)] transition-all hover:scale-105 hover:bg-[var(--gold-light)] hover:shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  Subscribe
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-green-200 bg-white p-8 shadow-2xl"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <PartyPopper className="h-8 w-8 text-green-700" />
                </div>

                <h3 className="font-serif text-2xl font-bold text-green-800">
                  Thank You For Subscribing!
                </h3>

                <p className="mt-2 text-gray-600">
                  Welcome to the Virtual Holidays family,
                  <span className="font-semibold text-green-700">
                    {' '}
                    {name}
                  </span>
                  ! Check your inbox for a special welcome gift.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

