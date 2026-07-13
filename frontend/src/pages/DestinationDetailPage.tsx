import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchDestination, Destination } from '../lib/admin-api';

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const destId = id || 'kenya';

  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    fetchDestination(destId)
      .then((data) => {
        if (!mounted) return;
        setDest(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load destination detail.');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [destId]);

  const handleInquireClick = () => {
    navigate('/request-proposal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center pt-24 font-sans text-[#3d1f17]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold">Loading Safari details...</p>
        </div>
      </div>
    );
  }

  if (error || !dest) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center pt-24 font-sans text-[#3d1f17]">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-red-600">Error loading destination details</p>
          <p className="text-sm text-gray-500">{error || 'Destination not found'}</p>
          <button onClick={() => navigate('/')} className="bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const faqs = [
    { q: `When is the best time to visit ${dest.name}?`, a: 'The dry season is generally ideal, aligning with wildlife movements and pleasant weather.' },
    { q: 'Is a visa required?', a: 'Yes, most international travellers require a visa or Electronic Travel Authorisation (eTA) prior to arrival.' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-24 font-sans text-[#3d1f17]">
      {/* Dynamic Hero Banner */}
      <div className="relative h-[50vh] min-h-[300px] w-full overflow-hidden flex items-center justify-center">
        {dest.image && <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center text-white px-4 space-y-3">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">{dest.name}</h1>
          {dest.tagline && <p className="font-accent text-2xl text-[#e4a435]">{dest.tagline}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content (List of itineraries) */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              Popular Safaris & Itineraries
            </h2>
            <div className="h-1 w-20 bg-secondary" />
            <p className="text-sm leading-relaxed text-[#6f5a52]">{dest.desc}</p>
          </div>

          <div className="space-y-6">
            {dest.packages && dest.packages.length > 0 ? (
              dest.packages.map((pkg, idx) => {
                const highlights = typeof pkg.highlights === 'string'
                  ? pkg.highlights.split(/,\s*/)
                  : (pkg.highlights || []);

                return (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                    <div className="md:w-1/3 h-52 md:h-auto overflow-hidden relative">
                      {pkg.image && <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-extrabold text-lg md:text-xl text-[#4a241a] leading-snug">
                            {pkg.name}
                          </h3>
                          <span className="bg-[#e4a435] text-[#3d1f17] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded shrink-0 ml-2">
                            {pkg.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#e4a435]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-[#6f5a52] font-semibold ml-2">5.0 Star Rating</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5">
                        {highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#6f5a52]">
                            <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#6f5a52] block">Price per Person</span>
                          <span className="text-xl font-black text-primary">${pkg.price}</span>
                        </div>
                        <button
                          onClick={handleInquireClick}
                          className="bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-colors flex items-center gap-1"
                        >
                          Book This Itinerary <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm italic text-gray-400 text-center py-6">No itineraries available for this destination.</p>
            )}
          </div>

          {/* Details / FAQs Section */}
          <div className="space-y-6 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-extrabold uppercase tracking-wide">
              Frequently Asked Questions & Tips
            </h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <p className="text-xs text-[#6f5a52] leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#4a241a] text-white p-6 rounded-2xl shadow-lg border border-white/5 space-y-4">
            <h3 className="text-lg font-black uppercase tracking-wider text-[#e4a435]">
              Let Us Design Your Safari
            </h3>
            <p className="text-xs leading-relaxed text-gray-300">
              Our travel specialists will build a fully tailored private itinerary around your preferences, group size, and budget with no obligation.
            </p>
            <button
              onClick={handleInquireClick}
              className="w-full bg-[#e4a435] hover:bg-[#d09228] text-[#3d1f17] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow"
            >
              Get a Free Proposal
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              Travel Guarantees
            </h3>
            <div className="space-y-3 text-xs font-bold text-[#6f5a52]">
              <p>✓ 100% Tailor-made Private Safaris</p>
              <p>✓ Best Price Guarantee</p>
              <p>✓ ASTA Bonded & Insured</p>
              <p>✓ 24/7 Ground Support Services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

